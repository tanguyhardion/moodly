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
    gym: boolean;
    misc: boolean;
  };
  note?: string;
  createdAt: number; // timestamp
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
