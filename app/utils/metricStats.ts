import type { MetricConfig, DailyEntry, NumberMetricConfig, SliderMetricConfig, CalculatedMetricConfig, LocationValue } from '~/types';
import { calcStreak, minsToTime, timeToMins } from '~/utils/statsMath';

// Per-metric statistics for the stats page.

/** Formats a metric value with its unit: "3/5", "7.5 h", "12 kg". */
export function fmtStatValue(v: number, metric: MetricConfig): string {
  const unit = (metric as NumberMetricConfig).unit;
  const max = (metric as SliderMetricConfig).max;
  if (metric.type === 'calculated') {
    const calcUnit = (metric as CalculatedMetricConfig).formula.unit === 'hours' ? 'h' : 'min';
    return `${Math.round(v * 100) / 100} ${calcUnit}`;
  }
  if (metric.type === 'slider' && max != null) return `${v}/${max}`;
  if (unit) return `${v} ${unit}`;
  return String(Math.round(v * 10) / 10);
}

// ── Stats interfaces ──────────────────────────────────────────────────────────

interface BaseStats {
  metric: MetricConfig;
  fillCount: number;
  total: number;
}

export interface NumericStats extends BaseStats {
  type: 'numeric';
  avg: number | null;
  min: number | null;
  max: number | null;
  latest: number | null;
  trend: 'up' | 'down' | 'flat';
  chartData: { v: number }[];
  chartDates: string[];
}

export interface CheckboxStats extends BaseStats {
  type: 'checkbox';
  checkCount: number;
  rate: number;
  longestStreak: number;
  chartData: { v: number }[];
  chartDates: string[];
}

export interface TimeStats extends BaseStats {
  type: 'time';
  avgTime: string | null;
  earliestTime: string | null;
  latestTime: string | null;
  chartData: { v: number }[];
  chartDates: string[];
}

export interface LocationStats extends BaseStats {
  type: 'location';
  topLocations: { name: string; count: number }[];
  recent: { date: string; value: string }[];
  hasWeatherData: boolean;
  avgTemp: number | null;
  minTemp: number | null;
  maxTemp: number | null;
  topConditions: { condition: string; count: number }[];
  weatherEntryCount: number;
}

export interface TextStats extends BaseStats {
  type: 'text';
  recent: { date: string; value: string }[];
}

export type MetricStats = NumericStats | CheckboxStats | TimeStats | LocationStats | TextStats;

// ── Compute stats ─────────────────────────────────────────────────────────────

export function computeMetricStats(metric: MetricConfig, entries: DailyEntry[]): MetricStats {
  const base = { metric, total: entries.length };

  if (metric.type === 'slider' || metric.type === 'number') {
    const points = entries
      .map(e => ({ date: e.date, raw: e.data[metric.id] }))
      .filter(p => typeof p.raw === 'number' && !isNaN(p.raw as number));

    const vals = points.map(p => p.raw as number);
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    const min = vals.length ? Math.min(...vals) : null;
    const max = vals.length ? Math.max(...vals) : null;
    const latest = vals.length ? vals[vals.length - 1]! : null;

    let trend: 'up' | 'down' | 'flat' = 'flat';
    if (vals.length >= 6) {
      const mid = Math.floor(vals.length / 2);
      const firstAvg = vals.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
      const secondAvg = vals.slice(mid).reduce((a, b) => a + b, 0) / (vals.length - mid);
      const range = (max! - min!) || 1;
      if (secondAvg - firstAvg > range * 0.08) trend = 'up';
      else if (firstAvg - secondAvg > range * 0.08) trend = 'down';
    }

    return {
      ...base,
      type: 'numeric',
      avg: avg !== null ? Math.round(avg * 10) / 10 : null,
      min,
      max,
      latest,
      fillCount: vals.length,
      trend,
      chartData: points.map(p => ({ v: p.raw as number })),
      chartDates: points.map(p => p.date),
    };
  }

  if (metric.type === 'checkbox') {
    const points = entries.map(e => ({
      date: e.date,
      v: e.data[metric.id] === true ? 1 : 0,
    }));
    const checkCount = points.filter(p => p.v === 1).length;
    const checkedDates = points.filter(p => p.v === 1).map(p => p.date);
    const streak = calcStreak(checkedDates);

    return {
      ...base,
      type: 'checkbox',
      checkCount,
      fillCount: checkCount,
      rate: points.length ? Math.round((checkCount / points.length) * 100) : 0,
      longestStreak: streak.longest,
      chartData: points.map(p => ({ v: p.v })),
      chartDates: points.map(p => p.date),
    };
  }

  if (metric.type === 'time') {
    const points = entries
      .map(e => ({ date: e.date, raw: e.data[metric.id] }))
      .filter(p => typeof p.raw === 'string' && /^\d{1,2}:\d{2}$/.test(p.raw as string));

    const mins = points.map(p => timeToMins(p.raw as string));
    const avgMins = mins.length ? mins.reduce((a, b) => a + b, 0) / mins.length : null;

    return {
      ...base,
      type: 'time',
      fillCount: points.length,
      avgTime: avgMins !== null ? minsToTime(avgMins) : null,
      earliestTime: mins.length ? minsToTime(Math.min(...mins)) : null,
      latestTime: mins.length ? minsToTime(Math.max(...mins)) : null,
      chartData: mins.map(v => ({ v })),
      chartDates: points.map(p => p.date),
    };
  }

  if (metric.type === 'location') {
    const filled = entries
      .filter(e => e.data[metric.id] != null && typeof e.data[metric.id] === 'object')
      .map(e => {
        const loc = e.data[metric.id] as LocationValue;
        return { date: e.date, name: loc.name, weather: loc.weather };
      });

    const counts: Record<string, number> = {};
    for (const f of filled) counts[f.name] = (counts[f.name] ?? 0) + 1;
    const topLocations = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    // Weather statistics
    const temps: number[] = [];
    const conditionCounts: Record<string, number> = {};
    let hasWeatherData = false;

    for (const f of filled) {
      if (f.weather) {
        hasWeatherData = true;
        if (f.weather.temperature !== null) {
          temps.push(f.weather.temperature);
        }
        const condition = f.weather.condition;
        conditionCounts[condition] = (conditionCounts[condition] ?? 0) + 1;
      }
    }

    const avgTemp = temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : null;
    const minTemp = temps.length ? Math.min(...temps) : null;
    const maxTemp = temps.length ? Math.max(...temps) : null;

    const topConditions = Object.entries(conditionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([condition, count]) => ({ condition, count }));

    return {
      ...base,
      type: 'location',
      fillCount: filled.length,
      topLocations,
      recent: filled.slice(-5).reverse().map(f => ({ date: f.date, value: f.name })),
      // Weather stats
      hasWeatherData,
      avgTemp,
      minTemp,
      maxTemp,
      topConditions,
      weatherEntryCount: temps.length,
    };
  }

  if (metric.type === 'calculated') {
    const points = entries
      .map(e => ({ date: e.date, raw: e.data[metric.id] }))
      .filter(p => typeof p.raw === 'number' && !isNaN(p.raw as number));

    const vals = points.map(p => p.raw as number);
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;

    return {
      ...base,
      type: 'numeric' as const,
      avg: avg !== null ? Math.round(avg * 100) / 100 : null,
      min: vals.length ? Math.min(...vals) : null,
      max: vals.length ? Math.max(...vals) : null,
      latest: vals.length ? vals[vals.length - 1]! : null,
      fillCount: vals.length,
      trend: 'flat' as const,
      chartData: points.map(p => ({ v: p.raw as number })),
      chartDates: points.map(p => p.date),
    };
  }

  // text
  const textFilled = entries.filter(
    e => e.data[metric.id] != null && e.data[metric.id] !== ''
  );
  return {
    ...base,
    type: 'text',
    fillCount: textFilled.length,
    recent: textFilled
      .slice(-5)
      .reverse()
      .map(e => ({ date: e.date, value: String(e.data[metric.id]) })),
  };
}
