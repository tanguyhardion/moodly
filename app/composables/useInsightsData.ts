import type { DailyEntry, SliderMetricConfig } from '~/types';

// ── Exported Types ─────────────────────────────────────────────────────────────

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

// ── Constants ─────────────────────────────────────────────────────────────────

export const PERIODS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: 'All', days: 0 },
] as const;

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

// ── Module-level selection state ───────────────────────────────────────────────

const period = ref(30);
const primaryMetricId = ref('');

// ── Pure helpers ───────────────────────────────────────────────────────────────

function fmtShortDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getNumericVals(metricId: string, es: DailyEntry[]): { date: string; v: number }[] {
  return [...es]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(e => ({ date: e.date, raw: e.data[metricId] }))
    .filter(p => typeof p.raw === 'number' && !isNaN(p.raw as number))
    .map(p => ({ date: p.date, v: p.raw as number }));
}

function pearson(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 5) return 0;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0);
  const den = Math.sqrt(
    xs.reduce((s, x) => s + (x - mx) ** 2, 0) *
    ys.reduce((s, y) => s + (y - my) ** 2, 0)
  );
  return den === 0 ? 0 : Math.max(-1, Math.min(1, num / den));
}

function linearSlope(vals: number[]): number {
  const n = vals.length;
  if (n < 2) return 0;
  const mx = (n - 1) / 2;
  const my = vals.reduce((a, b) => a + b, 0) / n;
  const num = vals.reduce((s, v, i) => s + (i - mx) * (v - my), 0);
  const den = vals.reduce((s, _, i) => s + (i - mx) ** 2, 0);
  return den ? num / den : 0;
}

// ── Composable ────────────────────────────────────────────────────────────────

export function useInsightsData() {
  const { entries, isLoading, isConfigLoading, metricConfigs } = useMoodly();

  // ── Period & filtered entries ──────────────────────────────────────────────

  const periodLabel = computed(() => {
    if (period.value === 7) return 'week';
    if (period.value === 30) return 'month';
    if (period.value === 90) return '90 days';
    return 'period';
  });

  const filteredEntries = computed(() => {
    const sorted = [...entries.value].sort((a, b) => a.date.localeCompare(b.date));
    if (period.value === 0) return sorted;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - period.value + 1);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return sorted.filter(e => e.date >= cutoffStr);
  });

  const previousPeriodEntries = computed(() => {
    if (period.value === 0) return [];
    const now = new Date();
    const thisCutoff = new Date(now);
    thisCutoff.setDate(now.getDate() - period.value + 1);
    const prevCutoff = new Date(now);
    prevCutoff.setDate(now.getDate() - period.value * 2 + 1);
    const thisCutoffStr = thisCutoff.toISOString().slice(0, 10);
    const prevCutoffStr = prevCutoff.toISOString().slice(0, 10);
    return [...entries.value]
      .sort((a, b) => a.date.localeCompare(b.date))
      .filter(e => e.date >= prevCutoffStr && e.date < thisCutoffStr);
  });

  // ── Metric groups ──────────────────────────────────────────────────────────

  const numericMetrics = computed(() =>
    metricConfigs.value.filter(m => m.type === 'slider' || m.type === 'number')
  );

  const checkboxMetrics = computed(() =>
    metricConfigs.value.filter(m => m.type === 'checkbox')
  );

  const locationMetrics = computed(() =>
    metricConfigs.value.filter(m => m.type === 'location')
  );

  // ── Primary metric ─────────────────────────────────────────────────────────

  watch(
    numericMetrics,
    (metrics) => {
      if (!primaryMetricId.value && metrics.length) {
        primaryMetricId.value = metrics[0].id;
      }
    },
    { immediate: true }
  );

  const primaryMetric = computed(() =>
    metricConfigs.value.find(m => m.id === primaryMetricId.value) ?? null
  );

  // ── Day of Week ────────────────────────────────────────────────────────────

  const dayOfWeekChartData = computed(() => {
    if (!primaryMetric.value) return [];
    const buckets: number[][] = Array.from({ length: 7 }, () => []);
    for (const entry of filteredEntries.value) {
      const dayIdx = new Date(entry.date + 'T00:00:00').getDay();
      const v = entry.data[primaryMetricId.value];
      if (typeof v === 'number') buckets[dayIdx].push(v as number);
    }
    return DAY_NAMES.map((_, i) => ({
      v: buckets[i].length
        ? Math.round((buckets[i].reduce((a, b) => a + b, 0) / buckets[i].length) * 10) / 10
        : 0,
    }));
  });

  const dayOfWeekInfo = computed(() => {
    const data = dayOfWeekChartData.value;
    const withData = data.map((d, i) => ({ v: d.v, day: DAY_NAMES[i] })).filter(d => d.v > 0);
    if (withData.length < 3) return { hasData: false, bestDay: '', worstDay: '', bestVal: 0, worstVal: 0 };
    const best = withData.reduce((a, b) => (a.v >= b.v ? a : b));
    const worst = withData.reduce((a, b) => (a.v <= b.v ? a : b));
    return { hasData: true, bestDay: best.day, worstDay: worst.day, bestVal: best.v, worstVal: worst.v };
  });

  // ── Trends ─────────────────────────────────────────────────────────────────

  const trendData = computed<TrendItem[]>(() =>
    numericMetrics.value.flatMap(m => {
      const vals = getNumericVals(m.id, filteredEntries.value);
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
    })
  );

  // ── Correlations ───────────────────────────────────────────────────────────

  const correlationPairs = computed<CorrelationPair[]>(() => {
    const metrics = numericMetrics.value;
    if (metrics.length < 2) return [];
    const pairs: CorrelationPair[] = [];
    for (let i = 0; i < metrics.length; i++) {
      for (let j = i + 1; j < metrics.length; j++) {
        const mA = metrics[i];
        const mB = metrics[j];
        const valsA = getNumericVals(mA.id, filteredEntries.value);
        const dateMapB = new Map(getNumericVals(mB.id, filteredEntries.value).map(p => [p.date, p.v]));
        const paired = valsA.filter(p => dateMapB.has(p.date));
        if (paired.length < 5) continue;
        const r = pearson(paired.map(p => p.v), paired.map(p => dateMapB.get(p.date)!));
        if (Math.abs(r) >= 0.3) {
          pairs.push({ key: `${mA.id}-${mB.id}`, labelA: mA.label, labelB: mB.label, r: Math.round(r * 100) / 100 });
        }
      }
    }
    return pairs.sort((a, b) => Math.abs(b.r) - Math.abs(a.r)).slice(0, 5);
  });

  // ── Triggers ───────────────────────────────────────────────────────────────

  const triggers = computed<TriggerItem[]>(() => {
    if (!primaryMetric.value) return [];
    return checkboxMetrics.value
      .flatMap(m => {
        const checkedMoods: number[] = [];
        const uncheckedMoods: number[] = [];
        for (const entry of filteredEntries.value) {
          const mood = entry.data[primaryMetricId.value];
          if (typeof mood !== 'number') continue;
          if (entry.data[m.id] === true) checkedMoods.push(mood as number);
          else uncheckedMoods.push(mood as number);
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
  });

  // ── Most Impactful Metrics ─────────────────────────────────────────────────

  const impactMetrics = computed<ImpactMetric[]>(() => {
    if (!primaryMetric.value) return [];
    const primaryVals = getNumericVals(primaryMetric.value.id, filteredEntries.value);
    if (primaryVals.length < 5) return [];
    const dateMap = new Map(primaryVals.map(p => [p.date, p.v]));
    return numericMetrics.value
      .filter(m => m.id !== primaryMetricId.value)
      .flatMap(m => {
        const vals = getNumericVals(m.id, filteredEntries.value);
        const paired = vals.filter(p => dateMap.has(p.date));
        if (paired.length < 5) return [];
        const r = pearson(paired.map(p => p.v), paired.map(p => dateMap.get(p.date)!));
        if (Math.abs(r) < 0.15) return [];
        return [{ metricId: m.id, label: m.label, icon: m.icon ?? '', color: m.color ?? 'var(--primary)', r: Math.round(r * 100) / 100 }];
      })
      .sort((a, b) => Math.abs(b.r) - Math.abs(a.r))
      .slice(0, 6);
  });

  // ── Notable Achievements ───────────────────────────────────────────────────

  const achievements = computed<AchievementItem[]>(() => {
    const list: AchievementItem[] = [];
    if (!primaryMetric.value) return list;

    const pm = primaryMetric.value;
    const allVals = getNumericVals(pm.id, entries.value);
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
        if (avg > bestWeekAvg) { bestWeekAvg = avg; bestWeekStart = window[0].date; }
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
  });

  // ── Prediction ─────────────────────────────────────────────────────────────

  const prediction = computed<PredictionData | null>(() => {
    if (!primaryMetric.value) return null;
    const pm = primaryMetric.value;
    const vals = getNumericVals(pm.id, filteredEntries.value);
    if (vals.length < 7) return null;

    const recent = vals.slice(-14);
    const nums = recent.map(p => p.v);
    const slope = linearSlope(nums);
    const lastVal = nums[nums.length - 1]!;
    let predicted = lastVal + slope;

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
  });

  // ── Recommendations ────────────────────────────────────────────────────────

  const recommendations = computed<RecommendationItem[]>(() => {
    const list: RecommendationItem[] = [];
    if (!primaryMetric.value) return list;
    const pm = primaryMetric.value;

    const positiveTrigger = triggers.value.find(t => t.delta > 0.3);
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

    const topImpact = impactMetrics.value.find(m => m.r > 0.4);
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

    const primaryTrend = trendData.value.find(t => t.metricId === primaryMetricId.value);
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

    if (dayOfWeekInfo.value.hasData) {
      list.push({
        key: 'best-day',
        icon: 'solar:calendar-bold',
        iconBg: 'rgba(30, 64, 175, 0.12)',
        iconColor: 'var(--primary)',
        title: `${dayOfWeekInfo.value.bestDay}s are your best days`,
        description: `${pm.label} peaks on ${dayOfWeekInfo.value.bestDay}s and dips on ${dayOfWeekInfo.value.worstDay}s.`,
      });
    }

    // ── NEW: Negative triggers ──
    const negativeTrigger = triggers.value.find(t => t.delta < -0.3);
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
    if (checkboxMetrics.value.length >= 2) {
      const allDates = filteredEntries.value.map(e => e.date);
      const uniqueDates = Array.from(new Set(allDates));

      for (const cbA of checkboxMetrics.value) {
        for (const cbB of checkboxMetrics.value) {
          if (cbA.id === cbB.id) continue;
          if (list.find(r => r.key === `habit-stack-${cbA.id}-${cbB.id}`)) continue;

          const pairs = uniqueDates.map(date => {
            const entry = filteredEntries.value.find(e => e.date === date);
            return {
              valA: entry?.data[cbA.id] === true ? 1 : 0,
              valB: entry?.data[cbB.id] === true ? 1 : 0,
            };
          }).filter(p => p.valA !== 0 || p.valB !== 0);

          if (pairs.length < 10) continue;

          const aVals = pairs.map(p => p.valA);
          const bVals = pairs.map(p => p.valB);
          const r = pearson(aVals, bVals);

          if (r > 0.35 && list.length < 20) {
            const aCount = aVals.filter(v => v === 1).length;
            const bCount = bVals.filter(v => v === 1).length;
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
    for (const cb of checkboxMetrics.value) {
      if (list.length >= 20) break;
      const recentFilled = filteredEntries.value.filter(e => e.data[cb.id] != null).length;
      const recentFillRate = filteredEntries.value.length ? recentFilled / filteredEntries.value.length : 0;

      const allFilled = entries.value.filter(e => e.data[cb.id] != null).length;
      const allFillRate = entries.value.length ? allFilled / entries.value.length : 0;

      if (recentFillRate < 0.3 && allFillRate > 0.6 && filteredEntries.value.length >= 14) {
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
    const decliningMetric = trendData.value.find(t => t.metricId !== primaryMetricId.value && t.direction === 'down');
    if (decliningMetric && list.length < 20) {
      const metric = metricConfigs.value.find(m => m.id === decliningMetric.metricId);
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
    for (const metric of metricConfigs.value) {
      if (list.length >= 20) break;
      if (metric.id === primaryMetricId.value) continue;

      const filled = filteredEntries.value.filter(e => e.data[metric.id] != null).length;
      const fillRate = filteredEntries.value.length ? filled / filteredEntries.value.length : 0;

      if (fillRate < 0.3 && fillRate > 0 && filteredEntries.value.length >= 14) {
        list.push({
          key: `low-fill-${metric.id}`,
          icon: 'solar:question-circle-bold',
          iconBg: 'rgba(245, 158, 11, 0.12)',
          iconColor: 'var(--warning)',
          title: `Track "${metric.label}" more often`,
          description: `Only logged ${filled}/${filteredEntries.value.length} days. More data helps identify patterns.`,
        });
        break;
      }
    }

    // ── NEW: Location insights (best locations) ──
    for (const locInsight of locationInsights.value) {
      if (list.length >= 20) break;
      if (locInsight.places.length < 2) continue;

      const best = locInsight.places[0];
      const other = locInsight.places[1];

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
    const totalEntries = entries.value.length;
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
    const pbAchievement = achievements.value.find(a => a.key.startsWith('pb-'));
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
    if (dayOfWeekInfo.value.hasData && dayOfWeekInfo.value.bestVal - dayOfWeekInfo.value.worstVal > 1.5) {
      const diff = (dayOfWeekInfo.value.bestVal - dayOfWeekInfo.value.worstVal).toFixed(1);
      list.push({
        key: 'day-pattern-action',
        icon: 'solar:calendar-search-bold',
        iconBg: 'rgba(30, 64, 175, 0.12)',
        iconColor: 'var(--primary)',
        title: `Replicate ${dayOfWeekInfo.value.bestDay} patterns`,
        description: `${pm.label} is ${diff} points higher on ${dayOfWeekInfo.value.bestDay}s vs ${dayOfWeekInfo.value.worstDay}s. What do you do differently?`,
      });
    }

    // ── NEW: Improve low-performing metrics ──
    const lowMetric = numericMetrics.value.find(m => {
      if (m.id === primaryMetricId.value) return false;
      const vals = getNumericVals(m.id, filteredEntries.value);
      if (vals.length < 5) return false;
      const avg = vals.reduce((s, p) => s + p.v, 0) / vals.length;
      const range = (m.type === 'slider' && 'max' in m) ? m.max : 10;
      return avg < range * 0.5; // Below 50% of max
    });
    if (lowMetric && list.length < 20) {
      const vals = getNumericVals(lowMetric.id, filteredEntries.value);
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
  });

  // ── Comparison ─────────────────────────────────────────────────────────────

  const comparisonData = computed<ComparisonDataItem[]>(() => {
    if (period.value === 0) return [];
    return numericMetrics.value.flatMap(m => {
      const curVals = getNumericVals(m.id, filteredEntries.value);
      const prevVals = getNumericVals(m.id, previousPeriodEntries.value);
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
  });

  // ── Location Insights ──────────────────────────────────────────────────────

  const locationInsights = computed<LocationInsightItem[]>(() =>
    locationMetrics.value
      .map(m => {
        const filled = filteredEntries.value
          .filter(e => e.data[m.id] != null && typeof e.data[m.id] === 'object')
          .map(e => {
            const loc = e.data[m.id] as { name: string };
            const mood = primaryMetric.value
              ? (typeof e.data[primaryMetricId.value] === 'number' ? e.data[primaryMetricId.value] as number : null)
              : null;
            return { name: loc.name, mood };
          });

        const counts: Record<string, { count: number; moods: number[] }> = {};
        for (const entry of filled) {
          if (!counts[entry.name]) counts[entry.name] = { count: 0, moods: [] };
          counts[entry.name].count++;
          if (entry.mood !== null) counts[entry.name].moods.push(entry.mood!);
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
      .filter(l => l.places.length > 0)
  );

  return {
    entries,
    isLoading,
    isConfigLoading,
    period,
    periodLabel,
    primaryMetricId,
    primaryMetric,
    numericMetrics,
    dayOfWeekInfo,
    dayOfWeekChartData,
    trendData,
    correlationPairs,
    triggers,
    impactMetrics,
    achievements,
    prediction,
    recommendations,
    comparisonData,
    locationInsights,
  };
}
