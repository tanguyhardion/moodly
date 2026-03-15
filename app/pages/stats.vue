<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">
        <Icon name="solar:chart-bold" size="28" class="icon-primary" />
        Stats
      </h1>
      <p class="page-subtitle">Your progress over time</p>
    </div>

    <LoadingState v-if="isLoading || isConfigLoading" message="Loading stats..." />

    <div v-else-if="entries.length === 0" class="empty-state">
      <div class="empty-state-icon">
        <Icon name="solar:chart-bold" size="48" />
      </div>
      <p class="empty-state-title">No data yet</p>
      <p class="empty-state-description">
        Start logging from the dashboard to see your stats here.
      </p>
    </div>

    <div v-else class="stats-content">
      <!-- Period Selector -->
      <div ref="periodSelectorRef">
        <PeriodSelector v-model="period" :periods="PERIODS" />
      </div>

      <!-- Sticky Period Selector -->
      <Transition name="slide-down">
        <div v-if="showStickyHeader" class="sticky-header">
          <div class="sticky-content">
            <div class="sticky-period">
              <PeriodSelector v-model="period" :periods="PERIODS" />
            </div>
          </div>
        </div>
      </Transition>

      <!-- Summary Row -->
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-icon" style="background: var(--primary-rgba-12); color: var(--primary)">
            <Icon name="solar:calendar-check-bold" size="20" />
          </div>
          <div class="summary-info">
            <span class="summary-value">{{ filteredEntries.length }}</span>
            <span class="summary-label">Entries</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon" style="background: rgba(245, 87, 108, 0.12); color: var(--fire)">
            <Icon name="solar:fire-bold" size="20" />
          </div>
          <div class="summary-info">
            <span class="summary-value">{{ overallStreak.current }}</span>
            <span class="summary-label">Day streak</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon" style="background: rgba(212, 175, 55, 0.12); color: var(--gold)">
            <Icon name="solar:medal-ribbon-star-bold" size="20" />
          </div>
          <div class="summary-info">
            <span class="summary-value">{{ overallStreak.longest }}</span>
            <span class="summary-label">Best streak</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon" style="background: rgba(16, 185, 129, 0.12); color: var(--success)">
            <Icon name="solar:target-bold" size="20" />
          </div>
          <div class="summary-info">
            <span class="summary-value">{{ overallFillRate }}%</span>
            <span class="summary-label">Avg fill rate</span>
          </div>
        </div>
      </div>

      <!-- Metric Filter -->
      <div class="filter-section">
        <div class="section-label">Metrics</div>
        <div class="metric-chips">
          <button
            v-for="m in statableMetrics"
            :key="m.id"
            class="chip-btn"
            :class="{ active: selectedMetricIds.includes(m.id) }"
            :style="selectedMetricIds.includes(m.id) ? { '--chip-color': m.color || 'var(--primary)' } : {}"
            @click="toggleMetric(m.id)"
            type="button"
          >
            <Icon v-if="m.icon" :name="m.icon" size="13" />
            {{ m.label }}
          </button>
        </div>
      </div>

      <div v-if="selectedMetricIds.length === 0" class="empty-state" style="padding: 2rem 1rem">
        <p class="empty-state-title">No metrics selected</p>
        <p class="empty-state-description">Toggle metrics above to see their stats.</p>
      </div>

      <!-- Per-metric stat cards -->
      <div v-else class="metric-cards">
        <div
          v-for="stats in metricStatsCards"
          :key="stats.metric.id"
          class="metric-stat-card"
        >
          <!-- Card header -->
          <div class="card-header">
            <div class="card-title">
              <div
                class="card-title-icon"
                :style="{ background: hexToRgba(stats.metric.color || '#1e40af', 0.12) }"
              >
                <Icon
                  v-if="stats.metric.icon"
                  :name="stats.metric.icon"
                  size="16"
                  :style="{ color: stats.metric.color || 'var(--primary)' }"
                />
                <Icon
                  v-else
                  name="solar:chart-2-bold"
                  size="16"
                  :style="{ color: stats.metric.color || 'var(--primary)' }"
                />
              </div>
              <span class="card-label">{{ stats.metric.label }}</span>
              <span class="type-badge">{{ stats.metric.type }}</span>
            </div>
            <span class="fill-indicator">
              {{ stats.fillCount }}/{{ stats.total }}
            </span>
          </div>

          <!-- Numeric (slider / number) -->
          <template v-if="stats.type === 'numeric'">
            <div class="stats-row">
              <div class="stat-item">
                <span class="stat-label">Average</span>
                <span class="stat-value">{{ stats.avg !== null ? fmtNum(stats.avg, stats.metric) : '—' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Min</span>
                <span class="stat-value">{{ stats.min !== null ? fmtNum(stats.min, stats.metric) : '—' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Max</span>
                <span class="stat-value">{{ stats.max !== null ? fmtNum(stats.max, stats.metric) : '—' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Latest</span>
                <span class="stat-value">
                  <Icon
                    v-if="stats.trend === 'up'"
                    name="solar:arrow-up-bold"
                    size="12"
                    class="icon-success"
                  />
                  <Icon
                    v-else-if="stats.trend === 'down'"
                    name="solar:arrow-down-bold"
                    size="12"
                    class="icon-error"
                  />
                  {{ stats.latest !== null ? fmtNum(stats.latest, stats.metric) : '—' }}
                </span>
              </div>
            </div>
            <div v-if="stats.chartData.length >= 2" class="chart-wrap">
              <AreaChart
                :data="stats.chartData"
                :height="180"
                :categories="{ v: { name: stats.metric.label, color: stats.metric.color || '#1e40af' } }"
                :xFormatter="(i: number) => fmtShortDate(stats.chartDates[i] ?? '')"
                :yFormatter="(v: number) => fmtNum(v, stats.metric)"
                :xNumTicks="5"
                :yNumTicks="4"
                :hideLegend="true"
                :padding="{ top: 10, right: 10, bottom: 30, left: 42 }"
                :lineWidth="2"
              />
            </div>
            <p v-else class="no-data-note">
              <Icon name="solar:info-circle-bold" size="14" />
              Need at least 2 entries to show a chart ({{ stats.chartData.length }} so far)
            </p>
          </template>

          <!-- Checkbox -->
          <template v-else-if="stats.type === 'checkbox'">
            <div class="stats-row">
              <div class="stat-item">
                <span class="stat-label">Check rate</span>
                <span class="stat-value highlight">{{ stats.rate }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Checked</span>
                <span class="stat-value">{{ stats.checkCount }} times</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Best streak</span>
                <span class="stat-value">{{ stats.longestStreak }}d</span>
              </div>
            </div>
            <div class="completion-bar-wrap">
              <div class="completion-bar">
                <div
                  class="completion-fill"
                  :style="{ width: stats.rate + '%', background: stats.metric.color || 'var(--primary)' }"
                />
              </div>
              <span class="completion-pct">{{ stats.rate }}%</span>
            </div>
            <div v-if="stats.chartData.length >= 2" class="chart-wrap">
              <BarChart
                :data="stats.chartData"
                :height="120"
                :categories="{ v: { name: stats.metric.label, color: stats.metric.color || '#1e40af' } }"
                :yAxis="['v']"
                :xFormatter="(i: number) => fmtShortDate(stats.chartDates[i] ?? '')"
                :xNumTicks="5"
                :yNumTicks="2"
                :hideLegend="true"
                :barPadding="0.3"
                :padding="{ top: 10, right: 10, bottom: 30, left: 25 }"
              />
            </div>
          </template>

          <!-- Time -->
          <template v-else-if="stats.type === 'time'">
            <div class="stats-row">
              <div class="stat-item">
                <span class="stat-label">Average</span>
                <span class="stat-value">{{ stats.avgTime || '—' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Earliest</span>
                <span class="stat-value">{{ stats.earliestTime || '—' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Latest</span>
                <span class="stat-value">{{ stats.latestTime || '—' }}</span>
              </div>
            </div>
            <div v-if="stats.chartData.length >= 2" class="chart-wrap">
              <AreaChart
                :data="stats.chartData"
                :height="180"
                :categories="{ v: { name: stats.metric.label, color: stats.metric.color || '#1e40af' } }"
                :xFormatter="(i: number) => fmtShortDate(stats.chartDates[i] ?? '')"
                :yFormatter="(v: number) => minsToTime(v)"
                :xNumTicks="5"
                :yNumTicks="4"
                :hideLegend="true"
                :padding="{ top: 10, right: 10, bottom: 30, left: 52 }"
                :lineWidth="2"
              />
            </div>
            <p v-else class="no-data-note">
              <Icon name="solar:info-circle-bold" size="14" />
              Need at least 2 entries to show a chart ({{ stats.chartData.length }} so far)
            </p>
          </template>

          <!-- Location -->
          <template v-else-if="stats.type === 'location'">
            <div class="stats-row">
              <div class="stat-item">
                <span class="stat-label">Times logged</span>
                <span class="stat-value">{{ stats.fillCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Fill rate</span>
                <span class="stat-value">{{ stats.total ? Math.round(stats.fillCount / stats.total * 100) : 0 }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Unique places</span>
                <span class="stat-value">{{ stats.topLocations.length }}</span>
              </div>
            </div>
            <div v-if="stats.topLocations.length" class="item-list">
              <div v-for="loc in stats.topLocations" :key="loc.name" class="list-item">
                <Icon name="solar:map-point-bold" size="13" :style="{ color: stats.metric.color || 'var(--primary)' }" />
                <span class="list-item-name">{{ loc.name }}</span>
                <span class="list-item-count">{{ loc.count }}×</span>
              </div>
            </div>
          </template>

          <!-- Text -->
          <template v-else-if="stats.type === 'text'">
            <div class="stats-row">
              <div class="stat-item">
                <span class="stat-label">Entries filled</span>
                <span class="stat-value">{{ stats.fillCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Fill rate</span>
                <span class="stat-value">{{ stats.total ? Math.round(stats.fillCount / stats.total * 100) : 0 }}%</span>
              </div>
            </div>
            <div v-if="stats.recent.length" class="text-entries">
              <div v-for="entry in stats.recent" :key="entry.date" class="text-entry">
                <span class="text-date">{{ fmtShortDate(entry.date) }}</span>
                <span class="text-value">{{ entry.value }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MetricConfig, DailyEntry, NumberMetricConfig, SliderMetricConfig, CalculatedMetricConfig } from '~/types';

const { entries, isLoading, isConfigLoading, metricConfigs } = useMoodly();

// ── Periods ──────────────────────────────────────────────────────────────────

const PERIODS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: 'All', days: 0 },
];

const period = ref(30);

// ── Sticky period selector ────────────────────────────────────────────────────

const periodSelectorRef = ref<HTMLElement | null>(null);
const showStickyHeader = ref(false);

onMounted(() => {
  const checkSticky = () => {
    if (!periodSelectorRef.value) return;
    const rect = periodSelectorRef.value.getBoundingClientRect();
    showStickyHeader.value = rect.bottom < 80;
  };

  window.addEventListener('scroll', checkSticky, { passive: true });
  onUnmounted(() => window.removeEventListener('scroll', checkSticky));
});

// ── Filtered entries ──────────────────────────────────────────────────────────

const filteredEntries = computed(() => {
  const sorted = [...entries.value].sort((a, b) => a.date.localeCompare(b.date));
  if (period.value === 0) return sorted;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - period.value + 1);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return sorted.filter(e => e.date >= cutoffStr);
});

// ── Metrics filter ────────────────────────────────────────────────────────────

const statableMetrics = computed(() =>
  metricConfigs.value.filter(m =>
    ['slider', 'number', 'checkbox', 'time', 'text', 'location', 'calculated'].includes(m.type)
  )
);

const selectedMetricIds = ref<string[]>([]);

watch(
  statableMetrics,
  (metrics) => {
    if (selectedMetricIds.value.length === 0 && metrics.length > 0) {
      selectedMetricIds.value = metrics
        .filter(m => ['slider', 'number', 'checkbox', 'time', 'calculated'].includes(m.type))
        .map(m => m.id);
    }
  },
  { immediate: true }
);

function toggleMetric(id: string) {
  const idx = selectedMetricIds.value.indexOf(id);
  if (idx >= 0) selectedMetricIds.value.splice(idx, 1);
  else selectedMetricIds.value.push(id);
}

// ── Overall streak ────────────────────────────────────────────────────────────

const overallStreak = computed(() => {
  const dates = filteredEntries.value.map(e => e.date).sort();
  return calcStreak(dates);
});

function calcStreak(dates: string[]): { current: number; longest: number } {
  if (!dates.length) return { current: 0, longest: 0 };
  const sorted = [...dates].sort();
  let longest = 0;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T00:00:00');
    const curr = new Date(sorted[i] + 'T00:00:00');
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    streak = diff === 1 ? streak + 1 : 1;
    longest = Math.max(longest, streak);
  }
  longest = Math.max(longest, streak);

  // Current streak: consecutive days ending today or yesterday
  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  })();
  const dateSet = new Set(sorted);
  const startFrom = dateSet.has(todayStr) ? todayStr : dateSet.has(yesterdayStr) ? yesterdayStr : null;
  let current = 0;
  if (startFrom) {
    current = 1;
    let check = new Date(startFrom + 'T00:00:00');
    while (true) {
      check.setDate(check.getDate() - 1);
      const s = check.toISOString().slice(0, 10);
      if (dateSet.has(s)) current++;
      else break;
    }
  }

  return { current, longest };
}

// ── Overall fill rate ─────────────────────────────────────────────────────────

const overallFillRate = computed(() => {
  if (!filteredEntries.value.length || !metricConfigs.value.length) return 0;
  let totalSlots = 0;
  let filledSlots = 0;
  for (const entry of filteredEntries.value) {
    for (const m of metricConfigs.value) {
      totalSlots++;
      const v = entry.data[m.id];
      if (v != null && v !== '' && v !== false) filledSlots++;
    }
  }
  return totalSlots ? Math.round((filledSlots / totalSlots) * 100) : 0;
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function timeToMins(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minsToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = Math.round(mins % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function fmtNum(v: number, metric: MetricConfig): string {
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

function hexToRgba(color: string, alpha: number): string {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

// ── Stats interfaces ──────────────────────────────────────────────────────────

interface BaseStats {
  metric: MetricConfig;
  fillCount: number;
  total: number;
}

interface NumericStats extends BaseStats {
  type: 'numeric';
  avg: number | null;
  min: number | null;
  max: number | null;
  latest: number | null;
  trend: 'up' | 'down' | 'flat';
  chartData: { v: number }[];
  chartDates: string[];
}

interface CheckboxStats extends BaseStats {
  type: 'checkbox';
  checkCount: number;
  rate: number;
  longestStreak: number;
  chartData: { v: number }[];
  chartDates: string[];
}

interface TimeStats extends BaseStats {
  type: 'time';
  avgTime: string | null;
  earliestTime: string | null;
  latestTime: string | null;
  chartData: { v: number }[];
  chartDates: string[];
}

interface LocationStats extends BaseStats {
  type: 'location';
  topLocations: { name: string; count: number }[];
  recent: { date: string; value: string }[];
}

interface TextStats extends BaseStats {
  type: 'text';
  recent: { date: string; value: string }[];
}

type MetricStats = NumericStats | CheckboxStats | TimeStats | LocationStats | TextStats;

// ── Compute stats ─────────────────────────────────────────────────────────────

function computeMetricStats(metric: MetricConfig, entries: DailyEntry[]): MetricStats {
  const base = { metric, total: entries.length };

  if (metric.type === 'slider' || metric.type === 'number') {
    const points = entries
      .map(e => ({ date: e.date, raw: e.data[metric.id] }))
      .filter(p => typeof p.raw === 'number' && !isNaN(p.raw as number));

    const vals = points.map(p => p.raw as number);
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    const min = vals.length ? Math.min(...vals) : null;
    const max = vals.length ? Math.max(...vals) : null;
    const latest = vals.length ? vals[vals.length - 1] : null;

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
      chartData: points.map((_, i) => ({ v: mins[i] })),
      chartDates: points.map(p => p.date),
    };
  }

  if (metric.type === 'location') {
    const filled = entries
      .filter(e => e.data[metric.id] != null && typeof e.data[metric.id] === 'object')
      .map(e => {
        const loc = e.data[metric.id] as { name: string };
        return { date: e.date, name: loc.name };
      });

    const counts: Record<string, number> = {};
    for (const f of filled) counts[f.name] = (counts[f.name] ?? 0) + 1;
    const topLocations = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    return {
      ...base,
      type: 'location',
      fillCount: filled.length,
      topLocations,
      recent: filled.slice(-5).reverse().map(f => ({ date: f.date, value: f.name })),
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

const metricStatsCards = computed<MetricStats[]>(() =>
  selectedMetricIds.value
    .map(id => metricConfigs.value.find(m => m.id === id))
    .filter((m): m is MetricConfig => !!m)
    .map(m => computeMetricStats(m, filteredEntries.value))
);
</script>

<style scoped lang="scss">
.page-container {
  max-width: 760px;
  margin: 0 auto;
  padding: 1.5rem;
  position: relative;
  z-index: 1;
}

.stats-content {
  animation: fadeIn 0.4s ease;
}

.sticky-period {
  padding: 0.625rem 0.75rem;

  :deep(.period-selector) {
    margin-bottom: 0;
  }
}

// ── Summary grid ──────────────────────────────────────────────────────────────

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.75rem;

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.summary-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: var(--shadow-md);
  }

  .summary-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: var(--radius-md);
    flex-shrink: 0;
  }

  .summary-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .summary-value {
    font-size: 1.375rem;
    font-weight: 800;
    color: var(--text-primary);
    line-height: 1.1;
    letter-spacing: -0.03em;
  }

  .summary-label {
    font-size: 0.75rem;
    color: var(--text-tertiary);
    font-weight: 500;
    margin-top: 0.15rem;
  }
}

// ── Filter section ────────────────────────────────────────────────────────────

.filter-section {
  margin-bottom: 1.75rem;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.625rem;
}

.metric-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border: 1.5px solid var(--border);
  background: var(--card-bg);
  color: var(--text-secondary);
  border-radius: var(--radius-full);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--border-hover);
    color: var(--text-primary);
  }

  &.active {
    background: var(--chip-color, var(--primary));
    border-color: transparent;
    color: white;
  }
}

// ── Metric stat cards ─────────────────────────────────────────────────────────

.metric-cards {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.metric-stat-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: var(--shadow-md);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    gap: 1rem;
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    flex-wrap: wrap;
    min-width: 0;
  }

  .card-title-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    flex-shrink: 0;
  }

  .card-label {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
    white-space: nowrap;
  }

  .type-badge {
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-tertiary);
    background: var(--hover-bg);
    border: 1px solid var(--border);
    padding: 0.125rem 0.5rem;
    border-radius: var(--radius-full);
  }

  .fill-indicator {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-tertiary);
    white-space: nowrap;
    flex-shrink: 0;
  }
}

// ── Stats row ─────────────────────────────────────────────────────────────────

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding: 1rem;
  background: var(--hover-bg);
  border-radius: var(--radius-lg);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  .stat-label {
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-tertiary);
  }

  .stat-value {
    font-size: 1.0625rem;
    font-weight: 700;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.25rem;

    &.highlight {
      color: var(--primary);
      font-size: 1.25rem;
    }
  }
}

// ── Chart ─────────────────────────────────────────────────────────────────────

.chart-wrap {
  margin-top: 0.5rem;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.no-data-note {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  padding: 0.5rem 0;
  font-style: italic;
}

// ── Completion bar ────────────────────────────────────────────────────────────

.completion-bar-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.completion-bar {
  flex: 1;
  height: 8px;
  background: var(--hover-bg);
  border-radius: var(--radius-full);
  overflow: hidden;
  border: 1px solid var(--border);
}

.completion-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.4s ease;
}

.completion-pct {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-secondary);
  min-width: 2.5rem;
  text-align: right;
}

// ── Lists (location / text) ───────────────────────────────────────────────────

.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--hover-bg);
  border-radius: var(--radius-md);
  font-size: 0.875rem;

  .list-item-name {
    flex: 1;
    color: var(--text-primary);
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .list-item-count {
    color: var(--text-tertiary);
    font-weight: 600;
    font-size: 0.8125rem;
  }
}

.text-entries {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.text-entry {
  display: flex;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  background: var(--hover-bg);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  align-items: baseline;

  .text-date {
    color: var(--text-tertiary);
    font-weight: 600;
    font-size: 0.75rem;
    white-space: nowrap;
    min-width: 60px;
  }

  .text-value {
    color: var(--text-primary);
    line-height: 1.5;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}
</style>
