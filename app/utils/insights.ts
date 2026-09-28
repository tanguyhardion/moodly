import type { DailyEntry, MetricConfig, SliderMetricConfig, LocationValue } from '~/types';
import { fmtNum } from '~/utils/insightUtils';
import { getCurrentDateString, parseLocalDateString } from '~/utils/helpers';
import { fmtShortDate, getNumericVals, linearSlope, pearson } from '~/utils/statsMath';

// Pure insight calculations for the insights page. `useInsightsData` wires these to reactive state.
// `filtered` is always the current period's entries sorted by date ascending.

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TrendItem {
  metricId: string;
  label: string;
  icon: string;
  color: string;
  direction: 'up' | 'down' | 'flat';
  summary: string;
}

export interface CorrelationPair {
  key: string;
  labelA: string;
  labelB: string;
  r: number;
}

export interface TriggerItem {
  metricId: string;
  label: string;
  icon: string;
  color: string;
  avgWhenChecked: number;
  avgWhenUnchecked: number;
  delta: number;
}

export interface ImpactMetric {
  metricId: string;
  label: string;
  icon: string;
  color: string;
  r: number;
}

export interface AchievementItem {
  key: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

export interface PredictionData {
  value: number;
  low: number;
  high: number;
  direction: 'up' | 'down' | 'flat';
  basedOn: number;
}

export interface RecommendationItem {
  key: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

export interface ComparisonDataItem {
  metricId: string;
  label: string;
  icon: string;
  color: string;
  currentFmt: string;
  prevFmt: string;
  delta: number;
  deltaFmt: string;
  deltaClass: string;
}

export interface LocationInsightItem {
  metricId: string;
  metricLabel: string;
  icon: string;
  color: string;
  places: { name: string; count: number; avgMood: number | null }[];
}

export interface WeatherInsightItem {
  condition: string;
  icon: string;
  count: number;
  avgMood: number | null;
  avgTemp: number | null;
}

export interface WeatherMoodCorrelation {
  hasData: boolean;
  tempCorrelation: number | null;
  bestWeather: { condition: string; avgMood: number } | null;
  worstWeather: { condition: string; avgMood: number } | null;
  summary: string | null;
}

export interface HabitEffectItem {
  habitId: string;
  habitLabel: string;
  habitIcon: string;
  habitColor: string;
  metricId: string;
  metricLabel: string;
  metricIcon: string;
  metricColor: string;
  day1Avg: number;
  day2Avg: number;
  day3Avg: number;
  baselineAvg: number;
  day1Delta: number;
  day2Delta: number;
  day3Delta: number;
  strongestDay: 1 | 2 | 3;
  strongestEffect: number;
}

export interface DayOfWeekInfo {
  hasData: boolean;
  bestDay: string;
  worstDay: string;
  bestVal: number;
  worstVal: number;
}

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/** Numeric value of the primary metric on an entry, or null. */
function primaryValue(entry: DailyEntry, pm: MetricConfig | null): number | null {
  if (!pm) return null;
  const v = entry.data[pm.id];
  return typeof v === 'number' ? v : null;
}

// ── Day of Week ────────────────────────────────────────────────────────────────

export function computeDayOfWeekChartData(filtered: DailyEntry[], pm: MetricConfig | null): { v: number }[] {
  if (!pm) return [];
  const buckets: number[][] = Array.from({ length: 7 }, () => []);
  for (const entry of filtered) {
    const dayIdx = new Date(entry.date + 'T00:00:00').getDay();
    const v = entry.data[pm.id];
    if (typeof v === 'number') buckets[dayIdx]!.push(v);
  }
  return DAY_NAMES.map((_, i) => ({
    v: buckets[i]!.length
      ? Math.round((buckets[i]!.reduce((a, b) => a + b, 0) / buckets[i]!.length) * 10) / 10
      : 0,
  }));
}

export function computeDayOfWeekInfo(chartData: { v: number }[]): DayOfWeekInfo {
  const withData = chartData.map((d, i) => ({ v: d.v, day: DAY_NAMES[i]! })).filter(d => d.v > 0);
  if (withData.length < 3) return { hasData: false, bestDay: '', worstDay: '', bestVal: 0, worstVal: 0 };
  const best = withData.reduce((a, b) => (a.v >= b.v ? a : b));
  const worst = withData.reduce((a, b) => (a.v <= b.v ? a : b));
  return { hasData: true, bestDay: best.day, worstDay: worst.day, bestVal: best.v, worstVal: worst.v };
}

// ── Trends ─────────────────────────────────────────────────────────────────────

export function computeTrends(numericMetrics: MetricConfig[], filtered: DailyEntry[]): TrendItem[] {
  return numericMetrics.flatMap(m => {
    const vals = getNumericVals(m.id, filtered);
    if (vals.length < 5) return [];
    const slope = linearSlope(vals.map(p => p.v));
    const range = Math.max(...vals.map(p => p.v)) - Math.min(...vals.map(p => p.v)) || 1;
    const direction: 'up' | 'down' | 'flat' =
      slope / range > 0.02 ? 'up' : slope / range < -0.02 ? 'down' : 'flat';
    const slopeAbs = Math.round(Math.abs(slope) * 10) / 10;
    return [{
      metricId: m.id,
      label: m.label,
      icon: m.icon ?? '',
      color: m.color ?? 'var(--primary)',
      direction,
      summary: direction === 'up' ? `+${slopeAbs}/day` : direction === 'down' ? `-${slopeAbs}/day` : 'stable',
    }];
  });
}

// ── Correlations ───────────────────────────────────────────────────────────────

export function computeCorrelations(numericMetrics: MetricConfig[], filtered: DailyEntry[]): CorrelationPair[] {
  if (numericMetrics.length < 2) return [];
  const pairs: CorrelationPair[] = [];
  for (let i = 0; i < numericMetrics.length; i++) {
    for (let j = i + 1; j < numericMetrics.length; j++) {
      const mA = numericMetrics[i]!;
      const mB = numericMetrics[j]!;
      const valsA = getNumericVals(mA.id, filtered);
      const dateMapB = new Map(getNumericVals(mB.id, filtered).map(p => [p.date, p.v]));
      const paired = valsA.filter(p => dateMapB.has(p.date));
      if (paired.length < 5) continue;
      const r = pearson(paired.map(p => p.v), paired.map(p => dateMapB.get(p.date)!));
      if (Math.abs(r) >= 0.3) {
        pairs.push({ key: `${mA.id}-${mB.id}`, labelA: mA.label, labelB: mB.label, r: Math.round(r * 100) / 100 });
      }
    }
  }
  return pairs.sort((a, b) => Math.abs(b.r) - Math.abs(a.r)).slice(0, 5);
}

// ── Triggers ───────────────────────────────────────────────────────────────────

export function computeTriggers(
  checkboxMetrics: MetricConfig[],
  filtered: DailyEntry[],
  pm: MetricConfig | null,
): TriggerItem[] {
  if (!pm) return [];
  return checkboxMetrics
    .flatMap(m => {
      const checkedMoods: number[] = [];
      const uncheckedMoods: number[] = [];
      for (const entry of filtered) {
        const mood = entry.data[pm.id];
        if (typeof mood !== 'number') continue;
        if (entry.data[m.id] === true) checkedMoods.push(mood);
        else uncheckedMoods.push(mood);
      }
      if (checkedMoods.length < 2 || uncheckedMoods.length < 2) return [];
      const avgChecked = checkedMoods.reduce((a, b) => a + b, 0) / checkedMoods.length;
      const avgUnchecked = uncheckedMoods.reduce((a, b) => a + b, 0) / uncheckedMoods.length;
      return [{
        metricId: m.id,
        label: m.label,
        icon: m.icon ?? '',
        color: m.color ?? 'var(--primary)',
        avgWhenChecked: Math.round(avgChecked * 10) / 10,
        avgWhenUnchecked: Math.round(avgUnchecked * 10) / 10,
        delta: Math.round((avgChecked - avgUnchecked) * 10) / 10,
      }];
    })
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

// ── Most Impactful Metrics ─────────────────────────────────────────────────────

export function computeImpactMetrics(
  numericMetrics: MetricConfig[],
  filtered: DailyEntry[],
  pm: MetricConfig | null,
): ImpactMetric[] {
  if (!pm) return [];
  const primaryVals = getNumericVals(pm.id, filtered);
  if (primaryVals.length < 5) return [];
  const dateMap = new Map(primaryVals.map(p => [p.date, p.v]));
  return numericMetrics
    .filter(m => m.id !== pm.id)
    .flatMap(m => {
      const vals = getNumericVals(m.id, filtered);
      const paired = vals.filter(p => dateMap.has(p.date));
      if (paired.length < 5) return [];
      const r = pearson(paired.map(p => p.v), paired.map(p => dateMap.get(p.date)!));
      if (Math.abs(r) < 0.15) return [];
      return [{ metricId: m.id, label: m.label, icon: m.icon ?? '', color: m.color ?? 'var(--primary)', r: Math.round(r * 100) / 100 }];
    })
    .sort((a, b) => Math.abs(b.r) - Math.abs(a.r))
    .slice(0, 6);
}

// ── Notable Achievements ────────────────────────────────────────────────────────

export function computeAchievements(entries: DailyEntry[], pm: MetricConfig | null): AchievementItem[] {
  const list: AchievementItem[] = [];
  if (!pm) return list;

  const allVals = getNumericVals(pm.id, entries);
  if (!allVals.length) return list;

  const allNums = allVals.map(p => p.v);
  const recordHigh = Math.max(...allNums);
  const recordHighDate = allVals.find(p => p.v === recordHigh)?.date ?? '';

  list.push({
    key: 'record-high',
    icon: 'solar:cup-star-bold',
    iconBg: 'rgba(212, 175, 55, 0.12)',
    iconColor: 'var(--gold)',
    title: 'Personal Best',
    description: `${pm.label}: ${fmtNum(recordHigh, pm)}${recordHighDate ? ' on ' + fmtShortDate(recordHighDate) : ''}`,
  });

  if (allVals.length >= 7) {
    let bestWeekAvg = 0;
    let bestWeekStart = '';
    for (let i = 0; i <= allVals.length - 7; i++) {
      const window = allVals.slice(i, i + 7);
      const avg = window.reduce((a, b) => a + b.v, 0) / 7;
      if (avg > bestWeekAvg) { bestWeekAvg = avg; bestWeekStart = window[0]!.date; }
    }
    if (bestWeekAvg > 0) {
      list.push({
        key: 'best-week',
        icon: 'solar:stars-bold',
        iconBg: 'rgba(255, 159, 67, 0.12)',
        iconColor: 'var(--orange)',
        title: 'Best 7-Day Period',
        description: `Avg ${fmtNum(bestWeekAvg, pm)} starting ${fmtShortDate(bestWeekStart)}`,
      });
    }
  }

  if (allVals.length >= 20) {
    const byMonth: Record<string, number[]> = {};
    for (const p of allVals) {
      const month = p.date.slice(0, 7);
      if (!byMonth[month]) byMonth[month] = [];
      byMonth[month].push(p.v);
    }
    let bestMonthAvg = 0;
    let bestMonth = '';
    for (const [month, vals] of Object.entries(byMonth)) {
      if (vals.length < 5) continue;
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      if (avg > bestMonthAvg) { bestMonthAvg = avg; bestMonth = month; }
    }
    if (bestMonth) {
      const [y, mo] = bestMonth.split('-');
      const monthName = new Date(parseInt(y!), parseInt(mo!) - 1, 1)
        .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      list.push({
        key: 'best-month',
        icon: 'solar:calendar-mark-bold',
        iconBg: 'rgba(16, 185, 129, 0.12)',
        iconColor: 'var(--success)',
        title: 'Best Month',
        description: `${monthName}: avg ${fmtNum(bestMonthAvg, pm)}`,
      });
    }
  }

  if (allVals.length >= 5) {
    const avg = allNums.reduce((a, b) => a + b, 0) / allNums.length;
    const std = Math.sqrt(allNums.reduce((s, v) => s + (v - avg) ** 2, 0) / allNums.length);
    const max = (pm as SliderMetricConfig).max;
    const threshold = max != null ? max * 0.75 : avg + std * 0.5;
    let streak = 0;
    let maxStreak = 0;
    for (const p of allVals) {
      if (p.v >= threshold) { streak++; maxStreak = Math.max(maxStreak, streak); }
      else streak = 0;
    }
    if (maxStreak >= 3) {
      list.push({
        key: 'high-streak',
        icon: 'solar:fire-bold',
        iconBg: 'rgba(245, 87, 108, 0.12)',
        iconColor: 'var(--fire)',
        title: `${maxStreak}-Day High Streak`,
        description: `${maxStreak} consecutive days with ${pm.label} ≥ ${fmtNum(threshold, pm)}`,
      });
    }
  }

  return list;
}

// ── Prediction ──────────────────────────────────────────────────────────────────

export function computePrediction(filtered: DailyEntry[], pm: MetricConfig | null): PredictionData | null {
  if (!pm) return null;
  const vals = getNumericVals(pm.id, filtered);
  if (vals.length < 7) return null;

  const recent = vals.slice(-14);
  const nums = recent.map(p => p.v);
  const slope = linearSlope(nums);
  // Extrapolate the fitted trend line one step ahead rather than the last (noisy) value
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  let predicted = mean + slope * (nums.length - (nums.length - 1) / 2);

  const sliderMin = (pm as SliderMetricConfig).min ?? 0;
  const sliderMax = (pm as SliderMetricConfig).max;
  if (pm.type === 'slider' && sliderMax != null) {
    predicted = Math.max(sliderMin, Math.min(sliderMax, predicted));
  }

  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  const std = Math.sqrt(nums.reduce((s, v) => s + (v - avg) ** 2, 0) / nums.length);
  const low = Math.round(Math.max(sliderMin, predicted - std) * 10) / 10;
  const high = sliderMax != null
    ? Math.round(Math.min(sliderMax, predicted + std) * 10) / 10
    : Math.round((predicted + std) * 10) / 10;

  return {
    value: Math.round(predicted * 10) / 10,
    low,
    high,
    direction: slope > 0.1 ? 'up' : slope < -0.1 ? 'down' : 'flat',
    basedOn: recent.length,
  };
}

// ── Comparison ──────────────────────────────────────────────────────────────────

export function computeComparison(
  numericMetrics: MetricConfig[],
  filtered: DailyEntry[],
  previous: DailyEntry[],
  periodDays: number,
): ComparisonDataItem[] {
  if (periodDays === 0) return [];
  return numericMetrics.flatMap(m => {
    const curVals = getNumericVals(m.id, filtered);
    const prevVals = getNumericVals(m.id, previous);
    if (!curVals.length || !prevVals.length) return [];
    const curAvg = curVals.reduce((s, p) => s + p.v, 0) / curVals.length;
    const prevAvg = prevVals.reduce((s, p) => s + p.v, 0) / prevVals.length;
    const delta = Math.round((curAvg - prevAvg) * 10) / 10;
    return [{
      metricId: m.id,
      label: m.label,
      icon: m.icon ?? '',
      color: m.color ?? 'var(--primary)',
      currentFmt: fmtNum(Math.round(curAvg * 10) / 10, m),
      prevFmt: fmtNum(Math.round(prevAvg * 10) / 10, m),
      delta,
      deltaFmt: fmtNum(Math.abs(delta), m),
      deltaClass: delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral',
    }];
  });
}

// ── Location Insights ───────────────────────────────────────────────────────────

export function computeLocationInsights(
  locationMetrics: MetricConfig[],
  filtered: DailyEntry[],
  pm: MetricConfig | null,
): LocationInsightItem[] {
  return locationMetrics
    .map(m => {
      const filled = filtered
        .filter(e => e.data[m.id] != null && typeof e.data[m.id] === 'object')
        .map(e => {
          const loc = e.data[m.id] as LocationValue;
          const mood = primaryValue(e, pm);
          return { name: loc.name, mood, weather: loc.weather };
        });

      const counts: Record<string, { count: number; moods: number[] }> = {};
      for (const entry of filled) {
        if (!counts[entry.name]) counts[entry.name] = { count: 0, moods: [] };
        counts[entry.name]!.count++;
        if (entry.mood !== null) counts[entry.name]!.moods.push(entry.mood);
      }

      const places = Object.entries(counts)
        .map(([name, data]) => ({
          name,
          count: data.count,
          avgMood: data.moods.length
            ? Math.round(data.moods.reduce((a, b) => a + b, 0) / data.moods.length * 10) / 10
            : null,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      return { metricId: m.id, metricLabel: m.label, icon: m.icon ?? '', color: m.color ?? 'var(--primary)', places };
    })
    .filter(l => l.places.length > 0);
}

// ── Weather Insights ────────────────────────────────────────────────────────────

export function computeWeatherInsights(
  locationMetrics: MetricConfig[],
  filtered: DailyEntry[],
  pm: MetricConfig | null,
): WeatherInsightItem[] {
  // Collect all weather data from location metrics
  const weatherEntries: { condition: string; icon: string; temp: number | null; mood: number | null }[] = [];

  for (const m of locationMetrics) {
    for (const e of filtered) {
      const loc = e.data[m.id] as LocationValue | null;
      if (loc?.weather) {
        const mood = primaryValue(e, pm);
        weatherEntries.push({
          condition: loc.weather.condition,
          icon: loc.weather.icon,
          temp: loc.weather.temperature,
          mood,
        });
      }
    }
  }

  if (weatherEntries.length === 0) return [];

  // Group by condition
  const byCondition: Record<string, { icon: string; temps: number[]; moods: number[] }> = {};
  for (const entry of weatherEntries) {
    if (!byCondition[entry.condition]) {
      byCondition[entry.condition] = { icon: entry.icon, temps: [], moods: [] };
    }
    if (entry.temp !== null) byCondition[entry.condition]!.temps.push(entry.temp);
    if (entry.mood !== null) byCondition[entry.condition]!.moods.push(entry.mood);
  }

  return Object.entries(byCondition)
    .map(([condition, data]) => ({
      condition,
      icon: data.icon,
      count: data.temps.length || data.moods.length,
      avgMood: data.moods.length
        ? Math.round(data.moods.reduce((a, b) => a + b, 0) / data.moods.length * 10) / 10
        : null,
      avgTemp: data.temps.length
        ? Math.round(data.temps.reduce((a, b) => a + b, 0) / data.temps.length)
        : null,
    }))
    .sort((a, b) => b.count - a.count);
}

export function computeWeatherMoodCorrelation(
  locationMetrics: MetricConfig[],
  filtered: DailyEntry[],
  pm: MetricConfig | null,
): WeatherMoodCorrelation {
  // Collect all weather-mood pairs
  const pairs: { temp: number; mood: number; condition: string }[] = [];

  for (const m of locationMetrics) {
    for (const e of filtered) {
      const loc = e.data[m.id] as LocationValue | null;
      if (loc?.weather && pm) {
        const mood = typeof e.data[pm.id] === 'number'
          ? e.data[pm.id] as number
          : null;
        if (mood !== null && loc.weather.temperature !== null) {
          pairs.push({
            temp: loc.weather.temperature,
            mood,
            condition: loc.weather.condition,
          });
        }
      }
    }
  }

  if (pairs.length < 3) {
    return { hasData: false, tempCorrelation: null, bestWeather: null, worstWeather: null, summary: null };
  }

  // Temperature-mood correlation
  const temps = pairs.map(p => p.temp);
  const moods = pairs.map(p => p.mood);
  const tempCorr = pearson(temps, moods);

  // Best/worst weather by mood
  const byCondition: Record<string, number[]> = {};
  for (const p of pairs) {
    if (!byCondition[p.condition]) byCondition[p.condition] = [];
    byCondition[p.condition]!.push(p.mood);
  }

  const conditionAvgs = Object.entries(byCondition)
    .filter(([_, moods]) => moods.length >= 2)
    .map(([condition, moods]) => ({
      condition,
      avgMood: moods.reduce((a, b) => a + b, 0) / moods.length,
    }))
    .sort((a, b) => b.avgMood - a.avgMood);

  const bestWeather = conditionAvgs.length > 0
    ? { condition: conditionAvgs[0]!.condition, avgMood: Math.round(conditionAvgs[0]!.avgMood * 10) / 10 }
    : null;
  const worstWeather = conditionAvgs.length > 1
    ? { condition: conditionAvgs[conditionAvgs.length - 1]!.condition, avgMood: Math.round(conditionAvgs[conditionAvgs.length - 1]!.avgMood * 10) / 10 }
    : null;

  // Generate summary
  let summary: string | null = null;
  if (Math.abs(tempCorr) >= 0.3) {
    if (tempCorr > 0) {
      summary = `Your mood tends to be higher on warmer days (correlation: ${Math.round(tempCorr * 100)}%)`;
    } else {
      summary = `Your mood tends to be higher on cooler days (correlation: ${Math.round(Math.abs(tempCorr) * 100)}%)`;
    }
  } else if (bestWeather && worstWeather && bestWeather.avgMood - worstWeather.avgMood > 0.5) {
    summary = `You feel best during "${bestWeather.condition}" weather`;
  }

  return { hasData: true, tempCorrelation: tempCorr, bestWeather, worstWeather, summary };
}

// ── Habit Effects on Next Days ──────────────────────────────────────────────────

export function computeHabitEffects(
  checkboxMetrics: MetricConfig[],
  numericMetrics: MetricConfig[],
  filtered: DailyEntry[],
  pm: MetricConfig | null,
): HabitEffectItem[] {
  const effects: HabitEffectItem[] = [];
  if (!pm || checkboxMetrics.length === 0) return effects;

  const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date));
  const entryByDate = new Map(sorted.map(e => [e.date, e]));

  // Value of the metric `offset` calendar days after `date`; null if that day wasn't logged.
  const valueAfter = (date: string, offset: number, metricId: string): number | null => {
    const d = parseLocalDateString(date);
    d.setDate(d.getDate() + offset);
    const v = entryByDate.get(getCurrentDateString(d))?.data[metricId];
    return typeof v === 'number' && !isNaN(v) ? v : null;
  };
  const avgOf = (vals: number[]) =>
    vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10 : null;

  // Baseline: values on all days
  const allMetricVals = sorted
    .map(e => e.data[pm.id])
    .filter((v): v is number => typeof v === 'number' && !isNaN(v));
  if (allMetricVals.length < 5) return effects;
  const baselineAvg = avgOf(allMetricVals)!;

  const metric = numericMetrics.find(m => m.id === pm.id);
  if (!metric) return effects;

  for (const habit of checkboxMetrics) {
    if (metric.id === habit.id) continue;

    const checkedDates = sorted.filter(e => e.data[habit.id] === true).map(e => e.date);
    const uncheckedCount = sorted.length - checkedDates.length;
    if (checkedDates.length < 3 || uncheckedCount < 3) continue;

    // Values on days +1, +2, +3 after a checked habit day
    const after = [1, 2, 3].map(offset =>
      checkedDates.map(d => valueAfter(d, offset, metric.id)).filter((v): v is number => v !== null)
    );
    // Require enough samples per day; sparse days are reported as "no data", not as 0
    const [day1Avg, day2Avg, day3Avg] = after.map(vals => (vals.length >= 2 ? avgOf(vals) : null));
    if (day1Avg === null && day2Avg === null) continue;

    {
      const delta = (avg: number | null) => (avg === null ? 0 : Math.round((avg - baselineAvg) * 10) / 10);
      const day1Delta = delta(day1Avg);
      const day2Delta = delta(day2Avg);
      const day3Delta = delta(day3Avg);

      const deltas = [
        { day: 1 as const, delta: day1Delta },
        { day: 2 as const, delta: day2Delta },
        { day: 3 as const, delta: day3Delta },
      ];
      const strongestDayInfo = deltas.reduce((a, b) => Math.abs(b.delta) > Math.abs(a.delta) ? b : a);

      // Only include if there's a meaningful effect on at least one day
      if (Math.abs(strongestDayInfo.delta) >= 0.3) {
        effects.push({
          habitId: habit.id,
          habitLabel: habit.label,
          habitIcon: habit.icon ?? '',
          habitColor: habit.color ?? 'var(--primary)',
          metricId: metric.id,
          metricLabel: metric.label,
          metricIcon: metric.icon ?? '',
          metricColor: metric.color ?? 'var(--primary)',
          day1Avg: day1Avg ?? 0,
          day2Avg: day2Avg ?? 0,
          day3Avg: day3Avg ?? 0,
          baselineAvg,
          day1Delta,
          day2Delta,
          day3Delta,
          strongestDay: strongestDayInfo.day,
          strongestEffect: strongestDayInfo.delta,
        });
      }
    }
  }

  // Sort by absolute effect size, limit to top effects
  return effects
    .sort((a, b) => Math.abs(b.strongestEffect) - Math.abs(a.strongestEffect))
    .slice(0, 8);
}

// ── Recommendations ─────────────────────────────────────────────────────────────

export interface RecommendationContext {
  pm: MetricConfig | null;
  entries: DailyEntry[];
  filtered: DailyEntry[];
  metrics: MetricConfig[];
  numericMetrics: MetricConfig[];
  checkboxMetrics: MetricConfig[];
  triggers: TriggerItem[];
  impactMetrics: ImpactMetric[];
  trends: TrendItem[];
  dayOfWeekInfo: DayOfWeekInfo;
  locationInsights: LocationInsightItem[];
  achievements: AchievementItem[];
}

export function computeRecommendations(ctx: RecommendationContext): RecommendationItem[] {
  const {
    pm, entries, filtered, metrics, numericMetrics, checkboxMetrics,
    triggers, impactMetrics, trends, dayOfWeekInfo, locationInsights, achievements,
  } = ctx;
  const list: RecommendationItem[] = [];
  if (!pm) return list;

  const positiveTrigger = triggers.find(t => t.delta > 0.3);
  if (positiveTrigger) {
    list.push({
      key: `trigger-${positiveTrigger.metricId}`,
      icon: positiveTrigger.icon || 'solar:check-circle-bold',
      iconBg: 'rgba(16, 185, 129, 0.12)',
      iconColor: 'var(--success)',
      title: `Keep up "${positiveTrigger.label}"`,
      description: `Your ${pm.label} averages ${fmtNum(positiveTrigger.delta, pm)} higher when you do it.`,
    });
  }

  const topImpact = impactMetrics.find(m => m.r > 0.4);
  if (topImpact) {
    list.push({
      key: `impact-${topImpact.metricId}`,
      icon: topImpact.icon || 'solar:graph-up-bold',
      iconBg: 'rgba(30, 64, 175, 0.12)',
      iconColor: 'var(--primary)',
      title: `Focus on "${topImpact.label}"`,
      description: `It has a ${(topImpact.r * 100).toFixed(0)}% positive correlation with your ${pm.label}.`,
    });
  }

  const primaryTrend = trends.find(t => t.metricId === pm.id);
  if (primaryTrend?.direction === 'down') {
    list.push({
      key: 'declining',
      icon: 'solar:graph-down-bold',
      iconBg: 'rgba(239, 68, 68, 0.12)',
      iconColor: 'var(--error)',
      title: `${pm.label} is declining`,
      description: `Your ${pm.label} has been trending down. Review what might have changed recently.`,
    });
  } else if (primaryTrend?.direction === 'up') {
    list.push({
      key: 'improving',
      icon: 'solar:graph-new-up-bold',
      iconBg: 'rgba(16, 185, 129, 0.12)',
      iconColor: 'var(--success)',
      title: `${pm.label} is improving`,
      description: `You're on an upward trend — keep doing what you're doing!`,
    });
  }

  if (dayOfWeekInfo.hasData) {
    list.push({
      key: 'best-day',
      icon: 'solar:calendar-bold',
      iconBg: 'rgba(30, 64, 175, 0.12)',
      iconColor: 'var(--primary)',
      title: `${dayOfWeekInfo.bestDay}s are your best days`,
      description: `${pm.label} peaks on ${dayOfWeekInfo.bestDay}s and dips on ${dayOfWeekInfo.worstDay}s.`,
    });
  }

  // ── NEW: Negative triggers ──
  const negativeTrigger = triggers.find(t => t.delta < -0.3);
  if (negativeTrigger) {
    list.push({
      key: `negative-trigger-${negativeTrigger.metricId}`,
      icon: 'solar:danger-bold',
      iconBg: 'rgba(239, 68, 68, 0.12)',
      iconColor: 'var(--error)',
      title: `Reduce "${negativeTrigger.label}" days`,
      description: `Your ${pm.label} averages ${fmtNum(Math.abs(negativeTrigger.delta), pm)} lower when you check this habit.`,
    });
  }

  // ── NEW: Habit stacking (checkbox correlations) ──
  if (checkboxMetrics.length >= 2) {
    const entryByDate = new Map(filtered.map(e => [e.date, e]));

    for (const cbA of checkboxMetrics) {
      for (const cbB of checkboxMetrics) {
        if (cbA.id === cbB.id) continue;
        if (list.find(r => r.key === `habit-stack-${cbA.id}-${cbB.id}`)) continue;

        // Every logged day counts, including days when neither habit was done —
        // dropping those would bias the correlation downward.
        const pairs = Array.from(entryByDate.values(), entry => ({
          valA: entry.data[cbA.id] === true ? 1 : 0,
          valB: entry.data[cbB.id] === true ? 1 : 0,
        }));

        if (pairs.length < 10) continue;

        const aVals = pairs.map(p => p.valA);
        const bVals = pairs.map(p => p.valB);
        const aCount = aVals.filter(v => v === 1).length;
        const bCount = bVals.filter(v => v === 1).length;
        if (aCount < 3 || bCount < 3) continue;
        const r = pearson(aVals, bVals);

        if (r > 0.35 && list.length < 20) {
          const both = pairs.filter(p => p.valA === 1 && p.valB === 1).length;
          const pct = Math.round((both / Math.min(aCount, bCount)) * 100);

          list.push({
            key: `habit-stack-${cbA.id}-${cbB.id}`,
            icon: 'solar:link-bold',
            iconBg: 'rgba(30, 64, 175, 0.12)',
            iconColor: 'var(--primary)',
            title: `Stack: "${cbA.label}" → "${cbB.label}"`,
            description: `These habits often go together (${pct}% overlap). Try pairing them intentionally.`,
          });
          break;
        }
      }
      if (list.some(r => r.key.startsWith('habit-stack'))) break;
    }
  }

  // ── NEW: Abandoned habits (low recent fill rate) ──
  for (const cb of checkboxMetrics) {
    if (list.length >= 20) break;
    const recentFilled = filtered.filter(e => e.data[cb.id] != null).length;
    const recentFillRate = filtered.length ? recentFilled / filtered.length : 0;

    const allFilled = entries.filter(e => e.data[cb.id] != null).length;
    const allFillRate = entries.length ? allFilled / entries.length : 0;

    if (recentFillRate < 0.3 && allFillRate > 0.6 && filtered.length >= 14) {
      list.push({
        key: `abandoned-${cb.id}`,
        icon: 'solar:refresh-bold',
        iconBg: 'rgba(245, 158, 11, 0.12)',
        iconColor: 'var(--warning)',
        title: `Revive "${cb.label}"`,
        description: `You used to track this ${Math.round(allFillRate * 100)}% of days, now only ${Math.round(recentFillRate * 100)}% recently.`,
      });
      break;
    }
  }

  // ── NEW: Declining non-primary metrics ──
  const decliningMetric = trends.find(t => t.metricId !== pm.id && t.direction === 'down');
  if (decliningMetric && list.length < 20) {
    const metric = metrics.find(m => m.id === decliningMetric.metricId);
    if (metric) {
      list.push({
        key: `declining-${decliningMetric.metricId}`,
        icon: 'solar:graph-down-bold',
        iconBg: 'rgba(239, 68, 68, 0.12)',
        iconColor: 'var(--error)',
        title: `Address declining ${decliningMetric.label}`,
        description: `This metric is trending down. Consider reviewing what might have changed.`,
      });
    }
  }

  // ── NEW: Low fill rate metrics ──
  for (const metric of metrics) {
    if (list.length >= 20) break;
    if (metric.id === pm.id) continue;

    const filled = filtered.filter(e => e.data[metric.id] != null).length;
    const fillRate = filtered.length ? filled / filtered.length : 0;

    if (fillRate < 0.3 && fillRate > 0 && filtered.length >= 14) {
      list.push({
        key: `low-fill-${metric.id}`,
        icon: 'solar:question-circle-bold',
        iconBg: 'rgba(245, 158, 11, 0.12)',
        iconColor: 'var(--warning)',
        title: `Track "${metric.label}" more often`,
        description: `Only logged ${filled}/${filtered.length} days. More data helps identify patterns.`,
      });
      break;
    }
  }

  // ── NEW: Location insights (best locations) ──
  for (const locInsight of locationInsights) {
    if (list.length >= 20) break;
    if (locInsight.places.length < 2) continue;

    const best = locInsight.places[0]!;
    const other = locInsight.places[1]!;

    if (best.avgMood != null && other.avgMood != null && best.avgMood > other.avgMood + 1.0) {
      list.push({
        key: `location-${locInsight.metricId}`,
        icon: 'solar:map-point-bold',
        iconBg: 'rgba(16, 185, 129, 0.12)',
        iconColor: 'var(--success)',
        title: `Your ${pm.label} peaks at "${best.name}"`,
        description: `Avg ${fmtNum(best.avgMood, pm)} there vs ${fmtNum(other.avgMood, pm)} at "${other.name}". Consider spending more time in that location.`,
      });
      break;
    }
  }

  // ── NEW: Milestone celebrations ──
  const totalEntries = entries.length;
  const milestones = [50, 100, 250, 500, 1000];
  for (const milestone of milestones) {
    if (totalEntries >= milestone - 10 && totalEntries < milestone) {
      const remaining = milestone - totalEntries;
      list.push({
        key: `milestone-${milestone}`,
        icon: 'solar:cup-star-bold',
        iconBg: 'rgba(212, 175, 55, 0.12)',
        iconColor: 'var(--gold)',
        title: `Almost at ${milestone} entries!`,
        description: `You have ${totalEntries} entries. Just ${remaining} more to hit this milestone!`,
      });
      break;
    }
  }

  // ── NEW: Personal best challenge ──
  const pbAchievement = achievements.find(a => a.key === 'record-high');
  if (pbAchievement && list.length < 20) {
    list.push({
      key: 'challenge-personal-best',
      icon: 'solar:target-bold',
      iconBg: 'rgba(30, 64, 175, 0.12)',
      iconColor: 'var(--primary)',
      title: `Challenge: Beat your ${pm.label} record`,
      description: pbAchievement.description + ' Can you top it?',
    });
  }

  // ── NEW: Best vs worst day action ──
  if (dayOfWeekInfo.hasData && dayOfWeekInfo.bestVal - dayOfWeekInfo.worstVal > 1.5) {
    const diff = (dayOfWeekInfo.bestVal - dayOfWeekInfo.worstVal).toFixed(1);
    list.push({
      key: 'day-pattern-action',
      icon: 'solar:calendar-minimalistic-bold',
      iconBg: 'rgba(30, 64, 175, 0.12)',
      iconColor: 'var(--primary)',
      title: `Replicate ${dayOfWeekInfo.bestDay} patterns`,
      description: `${pm.label} is ${diff} points higher on ${dayOfWeekInfo.bestDay}s vs ${dayOfWeekInfo.worstDay}s. What do you do differently?`,
    });
  }

  // ── NEW: Improve low-performing metrics ──
  // Only sliders have a known scale; number/calculated metrics (e.g. hours, steps) can't be judged "low".
  const lowMetric = numericMetrics.find(m => {
    if (m.id === pm.id || m.type !== 'slider') return false;
    const vals = getNumericVals(m.id, filtered);
    if (vals.length < 5) return false;
    const avg = vals.reduce((s, p) => s + p.v, 0) / vals.length;
    return avg < m.min + (m.max - m.min) * 0.5; // Below the midpoint of the scale
  });
  if (lowMetric && list.length < 20) {
    const vals = getNumericVals(lowMetric.id, filtered);
    const avg = vals.reduce((s, p) => s + p.v, 0) / vals.length;
    list.push({
      key: `low-performing-${lowMetric.id}`,
      icon: lowMetric.icon || 'solar:arrow-up-bold',
      iconBg: 'rgba(245, 158, 11, 0.12)',
      iconColor: 'var(--warning)',
      title: `Boost your ${lowMetric.label}`,
      description: `Currently averaging ${fmtNum(avg, lowMetric)}. Small improvements here could compound over time.`,
    });
  }

  return list;
}
