export type MetricType = "mood" | "energy" | "sleep" | "focus";

export interface DailyEntry {
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

export interface AnalyticsInsight {
  type:
    | "habit-impact"
    | "metric-connection"
    | "habit-pattern"
    | "habit-comparison"
    | "weekly-trend"
    | "trigger"
    | "long-term-trend"
    | "synergy";
  label: string;
  text: string;
  score: number;
  details?: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: string | null;
}

export interface AppSettings {
  email: string;
  dailyReminders: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
}
