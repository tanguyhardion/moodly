export type MetricType =
  | "mood"
  | "energy"
  | "sleep"
  | "focus"
  | "stress"
  | "look";

export interface DailyEntry {
  id: string;
  date: string; // ISO date string
  metrics: {
    mood: number | null;
    energy: number | null;
    sleep: number | null;
    sleepHours: number | null;
    focus: number | null;
    stress: number | null;
    look: number | null;
  };
  checkboxes?: {
    dayOff: boolean;
    healthyFood: boolean;
    caffeine: boolean;
    alcohol: boolean;
    gym: boolean;
    hardWork: boolean;
    misc: boolean;
  };
  location?: {
    name: string;
    latitude: number;
    longitude: number;
  } | null;
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
