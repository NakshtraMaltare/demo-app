export type ConfidenceLevel = 'High' | 'Moderate' | 'Uncertain';
export type HealthStatus = 'Thriving' | 'Needs Attention' | 'Stressed';
export type ToxicityStatus = 'Pet Safe' | 'Mildly Irritating' | 'Toxic to Pets & Humans';
export type ChatMode = 'thorough' | 'quick';

export interface CareMetric {
  headline: string;
  detail: string;
}

export interface TroubleshootingItem {
  symptom: string;
  cause: string;
  remedy: string;
}

export interface PlantCareProfile {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  origin: string;
  confidenceLevel: ConfidenceLevel;
  identificationNotes: string;
  summary: string;
  imageUrl: string;
  environmentNote?: string;
  wateringIntervalDays: number;
  careMetrics: {
    light: CareMetric;
    watering: CareMetric;
    humidityAndTemp: CareMetric;
    soilAndPh: CareMetric;
    fertilization: CareMetric;
    toxicity: {
      status: ToxicityStatus;
      detail: string;
    };
  };
  healthAssessment: {
    status: HealthStatus;
    observations: string;
    immediateActions: string[];
  };
  seasonalCare: {
    springSummer: string;
    autumnWinter: string;
  };
  troubleshooting: TroubleshootingItem[];
  propagationTips: string;
  analyzedAt: string;
}

export interface GardenPlant extends PlantCareProfile {
  savedAt: string;
  lastWateredAt: string;
  completedActions: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
  timestamp: string;
  modelLabel?: string;
}
