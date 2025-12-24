export type MetricType = "mood" | "energy" | "sleep" | "focus";

export interface MetricValue {
  value: number; // 1-5 scale
  emoji: string;
}

export interface MoodEntry {
  id: string;
  date: string; // ISO date string
  metrics: {
    mood: number;
    energy: number;
    sleep: number;
    focus: number;
  };
  checkboxes?: {
    healthyFood: boolean;
    caffeine: boolean;
    gym: boolean;
    hardWork: boolean;
    dayOff: boolean;
    alcohol: boolean;
    misc: boolean;
  };
  note?: string;
  createdAt: string; // ISO 8601 timestamp with timezone
}

export interface MetricConfig {
  name: string;
  key: MetricType;
  icon: string;
  color: string;
  emojis: string[];
  labels: string[];
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label: string;
}

export interface Insight {
  icon: string;
  text: string;
  category: "patterns" | "correlations" | "predictions" | "achievements" | "recommendations";
  confidence: number;
}

export interface CategorizedInsights {
  patterns: Insight[];
  correlations: Insight[];
  predictions: Insight[];
  achievements: Insight[];
  recommendations: Insight[];
}
