import type { MetricConfig, NumberMetricConfig, SliderMetricConfig } from '~/types';

export function fmtNum(v: number, metric: MetricConfig | null): string {
  if (!metric) return String(Math.round(v * 10) / 10);
  const unit = (metric as NumberMetricConfig).unit;
  const max = (metric as SliderMetricConfig).max;
  if (metric.type === 'slider' && max != null) return `${Math.round(v * 10) / 10}/${max}`;
  if (unit) return `${Math.round(v * 10) / 10} ${unit}`;
  return String(Math.round(v * 10) / 10);
}

export function hexToRgba(color: string, alpha: number): string {
  if (!color || !color.startsWith('#')) return `rgba(30, 64, 175, ${alpha})`;
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
