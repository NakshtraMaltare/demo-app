import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type { Content, GenerateContentResponse, Part } from '@google/genai';
import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('MISSING_API_KEY');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const msg = error instanceof Error ? error.message : String(error);
      const isTransient =
        msg.includes('503') ||
        msg.includes('500') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('DEADLINE_EXCEEDED');
      if (!isTransient || attempt === maxRetries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
    }
  }
  throw lastError;
}

function formatApiError(error: unknown): { status: number; message: string } {
  const raw = error instanceof Error ? error.message : String(error);

  if (raw === 'MISSING_API_KEY') {
    return {
      status: 500,
      message:
        'Gemini API key is not configured. Please check your key in Settings > Secrets.',
    };
  }
  if (raw.includes('PERMISSION_DENIED') || raw.includes('API_KEY_INVALID') || raw.includes('403')) {
    return {
      status: 403,
      message:
        'Gemini API key permission denied or invalid. Please verify your API key in Settings > Secrets.',
    };
  }
  if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429')) {
    return {
      status: 429,
      message:
        'Rate limit or quota reached for the Gemini API. Please wait a moment and try again, or check your quota in Settings > Secrets.',
    };
  }
  if (raw.includes('NOT_FOUND') || raw.includes('404')) {
    return {
      status: 404,
      message: 'Requested Gemini model was not found or is currently unavailable.',
    };
  }
  return {
    status: 500,
    message: raw || 'An unexpected error occurred while communicating with Gemini.',
  };
}

interface IdentifyRequestBody {
  imageBase64?: string;
  mimeType?: string;
  environment?: string;
  notes?: string;
}

interface ChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

interface ActivePlantContext {
  commonName?: string;
  scientificName?: string;
  family?: string;
  environmentNote?: string;
  healthStatus?: string;
  observations?: string;
  watering?: string;
  light?: string;
}

interface ChatRequestBody {
  history?: ChatHistoryItem[];
  message?: string;
  imageBase64?: string;
  mimeType?: string;
  activePlant?: ActivePlantContext | null;
  mode?: 'thorough' | 'quick';
}

const PLANT_IDENTIFICATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    commonName: {
      type: Type.STRING,
      description: 'Primary common English name of the plant.',
    },
    scientificName: {
      type: Type.STRING,
      description: 'Botanical Latin binomial name (Genus species).',
    },
    family: {
      type: Type.STRING,
      description: 'Botanical family name (e.g., Araceae, Lamiaceae).',
    },
    origin: {
      type: Type.STRING,
      description: 'Native geographic region or habitat.',
    },
    confidenceLevel: {
      type: Type.STRING,
      enum: ['High', 'Moderate', 'Uncertain'],
      description: 'Confidence in species identification from the submitted photograph.',
    },
    identificationNotes: {
      type: Type.STRING,
      description:
        'Visible morphological cues from the photo (leaf shape, venation, stem structure, blooms) supporting the identification.',
    },
    summary: {
      type: Type.STRING,
      description: 'Concise 2-3 sentence horticultural overview of the plant and its growth habit.',
    },
    wateringIntervalDays: {
      type: Type.INTEGER,
      description: 'Typical baseline watering interval in days as an integer (e.g., 7).',
    },
    careMetrics: {
      type: Type.OBJECT,
      properties: {
        light: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING, description: 'Short light level label with foot-candles or hours.' },
            detail: { type: Type.STRING, description: 'Practical placement and window orientation advice.' },
          },
          required: ['headline', 'detail'],
        },
        watering: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING, description: 'Short watering cadence summary.' },
            detail: { type: Type.STRING, description: 'Soil dryness check and thorough watering technique.' },
          },
          required: ['headline', 'detail'],
        },
        humidityAndTemp: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING, description: 'Ideal RH percentage and °C range.' },
            detail: { type: Type.STRING, description: 'Draft sensitivity, hardiness, and misting/airflow advice.' },
          },
          required: ['headline', 'detail'],
        },
        soilAndPh: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING, description: 'Soil blend summary and target pH range.' },
            detail: { type: Type.STRING, description: 'Exact potting media ratios, drainage, and repotting guidance.' },
          },
          required: ['headline', 'detail'],
        },
        fertilization: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING, description: 'NPK ratio and feeding frequency.' },
            detail: { type: Type.STRING, description: 'Growing season feeding schedule and winter dormancy pause.' },
          },
          required: ['headline', 'detail'],
        },
        toxicity: {
          type: Type.OBJECT,
          properties: {
            status: {
              type: Type.STRING,
              enum: ['Pet Safe', 'Mildly Irritating', 'Toxic to Pets & Humans'],
            },
            detail: { type: Type.STRING, description: 'Specific safety notes for cats, dogs, and children.' },
          },
          required: ['status', 'detail'],
        },
      },
      required: ['light', 'watering', 'humidityAndTemp', 'soilAndPh', 'fertilization', 'toxicity'],
    },
    healthAssessment: {
      type: Type.OBJECT,
      properties: {
        status: {
          type: Type.STRING,
          enum: ['Thriving', 'Needs Attention', 'Stressed'],
        },
        observations: {
          type: Type.STRING,
          description:
            'Direct visual health diagnosis from the photograph: leaf color, turgor, spots, pests, etiolation, or soil condition.',
        },
        immediateActions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '3 to 5 specific, actionable next steps tailored to the plant shown in the photo.',
        },
      },
      required: ['status', 'observations', 'immediateActions'],
    },
    seasonalCare: {
      type: Type.OBJECT,
      properties: {
        springSummer: {
          type: Type.STRING,
          description: 'Care adjustments during active spring and summer growth.',
        },
        autumnWinter: {
          type: Type.STRING,
          description: 'Care adjustments during slower autumn and winter light/temperature conditions.',
        },
      },
      required: ['springSummer', 'autumnWinter'],
    },
    troubleshooting: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          symptom: { type: Type.STRING },
          cause: { type: Type.STRING },
          remedy: { type: Type.STRING },
        },
        required: ['symptom', 'cause', 'remedy'],
      },
      description: '3 common issues for this species with cause and remedy.',
    },
    propagationTips: {
      type: Type.STRING,
      description: 'Clear step-by-step propagation method best suited to this species.',
    },
  },
  required: [
    'commonName',
    'scientificName',
    'family',
    'origin',
    'confidenceLevel',
    'identificationNotes',
    'summary',
    'wateringIntervalDays',
    'careMetrics',
    'healthAssessment',
    'seasonalCare',
    'troubleshooting',
    'propagationTips',
  ],
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/identify', async (req: Request, res: Response) => {
    try {
      const body = req.body as IdentifyRequestBody;
      const imageBase64 = body?.imageBase64?.trim();
      const mimeType = body?.mimeType?.trim() || 'image/jpeg';
      const environment = body?.environment?.trim() || 'Not specified';
      const notes = body?.notes?.trim() || 'None provided';

      if (!imageBase64) {
        res.status(400).json({ error: 'Please upload a plant photograph before running identification.' });
        return;
      }

      const ai = getAiClient();
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

      const prompt = [
        'Examine this photograph carefully as an expert botanist, horticulturist, and plant pathologist.',
        'Identify the plant species (or closest probable cultivar/genus if visual cues are partial, setting confidenceLevel accordingly).',
        'Assess visible plant health directly from the photograph (foliage color, lesions, wilting, pest damage, legginess, or pot/soil cues).',
        `User growing environment: ${environment}.`,
        `User observation or concern: ${notes}.`,
        'Provide practical, specific, accurate care guidance tailored to this specimen and growing context. If the image does not appear to contain a plant, clearly explain that in identificationNotes and set confidenceLevel to Uncertain.',
      ].join('\n');

      const response: GenerateContentResponse = await withRetry(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              { text: prompt },
            ],
          },
          config: {
            systemInstruction:
              'You are Folia, an authoritative botanical taxonomist and master horticulturist. Deliver accurate plant identifications, evidence-based care metrics, and realistic visual health diagnostics. Output strictly valid JSON matching the requested schema.',
            responseMimeType: 'application/json',
            responseSchema: PLANT_IDENTIFICATION_SCHEMA,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
          },
        })
      );

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({ error: 'Gemini returned an empty response. Please try another clear photo.' });
        return;
      }

      const parsed = JSON.parse(rawText);
      res.json({
        plant: {
          ...parsed,
          id: `plant-${Date.now()}`,
          environmentNote: environment !== 'Not specified' ? environment : undefined,
          analyzedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      const { status, message } = formatApiError(error);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const body = req.body as ChatRequestBody;
      const message = body?.message?.trim() ?? '';
      const historyItems = Array.isArray(body?.history) ? body.history : [];
      const activePlant = body?.activePlant ?? null;
      const mode = body?.mode === 'quick' ? 'quick' : 'thorough';
      const imageBase64 = body?.imageBase64?.trim();
      const mimeType = body?.mimeType?.trim() || 'image/jpeg';

      if (!message && !imageBase64) {
        res.status(400).json({ error: 'Please enter a gardening question or attach a photo.' });
        return;
      }

      const ai = getAiClient();

      const plantContextBlock = activePlant?.commonName
        ? [
            'Currently inspected plant specimen in the user workspace:',
            `- Common Name: ${activePlant.commonName}`,
            `- Scientific Name: ${activePlant.scientificName ?? 'Unknown'}`,
            `- Family: ${activePlant.family ?? 'Unknown'}`,
            `- Environment: ${activePlant.environmentNote ?? 'Not specified'}`,
            `- Health Status: ${activePlant.healthStatus ?? 'Unknown'}`,
            `- Visual Observations: ${activePlant.observations ?? 'None'}`,
            `- Baseline Light: ${activePlant.light ?? 'N/A'}`,
            `- Baseline Watering: ${activePlant.watering ?? 'N/A'}`,
            'Use this specimen context naturally when answering pronouns like "it" or "my plant", unless the user specifies another plant.',
          ].join('\n')
        : 'No specific plant specimen is currently pinned; answer general gardening, soil, pest, indoor/outdoor plant care, and pruning questions clearly.';

      const systemInstruction = [
        'You are Folia Botanist, a seasoned horticulturist, soil scientist, and plant health advisor.',
        'Give accurate, practical, step-by-step gardening guidance grounded in botany and real-world cultivation.',
        'Keep formatting clean and scannable with short paragraphs and concise bulleted action items where helpful. Never invent fake measurements or unsafe pesticide recipes.',
        plantContextBlock,
      ].join('\n\n');

      const formattedHistory: Content[] = historyItems
        .filter((item) => item && typeof item.text === 'string' && item.text.trim().length > 0)
        .slice(-20)
        .map((item) => ({
          role: item.role === 'model' ? 'model' : 'user',
          parts: [{ text: item.text }],
        }));

      const modelName = mode === 'quick' ? 'gemini-3.1-flash-lite' : 'gemini-4-hydrogen';
      const thinkingLevel = mode === 'quick' ? ThinkingLevel.MINIMAL : ThinkingLevel.HIGH;

      const chat = ai.chats.create({
        model: modelName,
        history: formattedHistory,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel },
        },
      });

      const userParts: Part[] = [];
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
        userParts.push({
          inlineData: {
            mimeType,
            data: cleanBase64,
          },
        });
      }
      userParts.push({
        text: message || 'Please inspect this plant photo and explain what you observe.',
      });

      const response: GenerateContentResponse = await withRetry(() =>
        chat.sendMessage({
          message: userParts.length === 1 ? message : userParts,
        })
      );

      const reply = (response.text ?? '').trim();
      if (!reply) {
        res.status(502).json({ error: 'Gemini returned an empty reply. Please try rephrasing your question.' });
        return;
      }

      res.json({
        reply,
        modelUsed: mode === 'quick' ? 'Fast Mode (Gemini 3.1 Flash Lite)' : 'Thorough Mode (Gemini 4 Hydrogen)',
      });
    } catch (error) {
      const { status, message } = formatApiError(error);
      res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Folia server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Folia server:', err);
  process.exit(1);
});
