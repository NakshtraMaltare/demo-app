import type { ChatMessage, ChatMode, PlantCareProfile } from '../types/plant';

export interface IdentifyPlantPayload {
  imageBase64: string;
  mimeType: string;
  environment?: string;
  notes?: string;
  previewUrl: string;
}

export async function identifyPlantPhoto(
  payload: IdentifyPlantPayload
): Promise<PlantCareProfile> {
  const response = await fetch('/api/identify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageBase64: payload.imageBase64,
      mimeType: payload.mimeType,
      environment: payload.environment,
      notes: payload.notes,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Failed to analyze plant photo.');
  }

  return {
    ...(data.plant as PlantCareProfile),
    imageUrl: payload.previewUrl,
  };
}

export interface SendChatPayload {
  history: ChatMessage[];
  message: string;
  mode: ChatMode;
  activePlant: PlantCareProfile | null;
  imageBase64?: string;
  mimeType?: string;
}

export async function sendBotanistMessage(
  payload: SendChatPayload
): Promise<{ reply: string; modelUsed: string }> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      history: payload.history.map((m) => ({ role: m.role, text: m.text })),
      message: payload.message,
      mode: payload.mode,
      imageBase64: payload.imageBase64,
      mimeType: payload.mimeType,
      activePlant: payload.activePlant
        ? {
            commonName: payload.activePlant.commonName,
            scientificName: payload.activePlant.scientificName,
            family: payload.activePlant.family,
            environmentNote: payload.activePlant.environmentNote,
            healthStatus: payload.activePlant.healthAssessment.status,
            observations: payload.activePlant.healthAssessment.observations,
            watering: payload.activePlant.careMetrics.watering.headline,
            light: payload.activePlant.careMetrics.light.headline,
          }
        : null,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Unable to get a response from the botanist assistant.');
  }

  return {
    reply: data.reply as string,
    modelUsed: data.modelUsed as string,
  };
}
