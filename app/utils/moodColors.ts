import type { MetricConfig, SliderMetricConfig } from '~/types';

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

/** Background color and readable text color for each mood level, low to high. */
export const MOOD_COLORS: Record<MoodLevel, { color: string; ink: string }> = {
  1: { color: '#5b6cd6', ink: '#ffffff' },
  2: { color: '#3fa7c9', ink: '#0f2330' },
  3: { color: '#8cbf4a', ink: '#1b2410' },
  4: { color: '#f2a93b', ink: '#2a1a05' },
  5: { color: '#f2677a', ink: '#2b0c12' },
};

/** The metric that drives the app's tint: a slider named "mood", else the first slider. */
export function findMoodMetric(metrics: MetricConfig[]): SliderMetricConfig | null {
  const sliders = metrics.filter((m): m is SliderMetricConfig => m.type === 'slider');
  return sliders.find(m => /mood/i.test(m.label)) ?? sliders[0] ?? null;
}

/** Maps a value on the metric's own range onto the 1–5 mood scale. */
export function moodLevel(value: number, metric: { min?: number; max?: number }): MoodLevel {
  const min = metric.min ?? 1;
  const max = metric.max ?? 5;
  const t = max > min ? (value - min) / (max - min) : 0.5;
  return Math.min(5, Math.max(1, Math.round(1 + t * 4))) as MoodLevel;
}
