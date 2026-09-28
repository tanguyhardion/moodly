<template>
  <div class="page">
    <header class="mb-6">
      <h1 class="page-title">Stats</h1>
      <p class="page-subtitle">How each metric has been going.</p>
    </header>

    <LoadingState v-if="isLoading || isConfigLoading" message="Crunching numbers…" />

    <div v-else-if="entries.length === 0" class="empty-state">
      <Icon name="solar:chart-bold" size="44" class="text-faint" />
      <p class="text-lg font-bold text-ink">No stats yet</p>
      <p class="max-w-xs text-sm">Check in on the Today tab and your numbers will show up here.</p>
    </div>

    <div v-else class="flex flex-col gap-6">
      <div ref="periodSelectorRef">
        <PeriodSelector v-model="period" :periods="PERIODS" />
      </div>

      <Transition name="slide-down">
        <div v-if="showStickyHeader" class="sticky-bar">
          <div class="p-2">
            <PeriodSelector v-model="period" :periods="PERIODS" />
          </div>
        </div>
      </Transition>

      <!-- Summary -->
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div v-for="tile in summaryTiles" :key="tile.label" class="card p-4">
          <span class="grid size-9 place-items-center rounded-full" :style="{ background: hexToRgba(tile.color, 0.16), color: tile.color }">
            <Icon :name="tile.icon" size="18" />
          </span>
          <p class="mt-3 font-display text-3xl font-extrabold tabular-nums">{{ tile.value }}</p>
          <p class="text-sm text-muted">{{ tile.label }}</p>
        </div>
      </div>

      <!-- Metric filter -->
      <div class="flex flex-col gap-2">
        <p class="eyebrow">Show</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="m in statableMetrics"
            :key="m.id"
            type="button"
            class="chip"
            :class="{ 'chip-on': selectedMetricIds.includes(m.id) }"
            :aria-pressed="selectedMetricIds.includes(m.id)"
            @click="toggleMetric(m.id)"
          >
            <Icon v-if="m.icon" :name="m.icon" size="15" />
            {{ m.label }}
          </button>
        </div>
      </div>

      <div v-if="selectedMetricIds.length === 0" class="empty-state py-8">
        <p class="font-semibold text-ink">No metrics selected</p>
        <p class="text-sm">Pick metrics above to see their stats.</p>
      </div>

      <!-- Per-metric cards -->
      <div v-else class="flex flex-col gap-4">
        <article v-for="stats in metricStatsCards" :key="stats.metric.id" class="card flex min-w-0 flex-col gap-4 overflow-hidden">
          <div class="flex items-center gap-3">
            <span
              class="grid size-10 shrink-0 place-items-center rounded-xl"
              :style="{ background: hexToRgba(stats.metric.color || '', 0.16), color: stats.metric.color || 'var(--mood-strong)' }"
            >
              <Icon :name="stats.metric.icon || 'solar:chart-2-bold'" size="18" />
            </span>
            <h2 class="min-w-0 flex-1 truncate text-lg font-extrabold">{{ stats.metric.label }}</h2>
            <span class="shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold tabular-nums text-muted" title="Days logged in this period">
              {{ stats.fillCount }}/{{ stats.total }} days
            </span>
          </div>

          <!-- Numeric (slider / number / calculated) -->
          <template v-if="stats.type === 'numeric'">
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatTile label="Average" :value="stats.avg !== null ? fmtNum(stats.avg, stats.metric) : '—'" />
              <StatTile label="Lowest" :value="stats.min !== null ? fmtNum(stats.min, stats.metric) : '—'" />
              <StatTile label="Highest" :value="stats.max !== null ? fmtNum(stats.max, stats.metric) : '—'" />
              <StatTile label="Latest" :value="stats.latest !== null ? fmtNum(stats.latest, stats.metric) : '—'">
                <Icon v-if="stats.trend === 'up'" name="solar:arrow-up-bold" size="14" class="text-success" />
                <Icon v-else-if="stats.trend === 'down'" name="solar:arrow-down-bold" size="14" class="text-danger" />
              </StatTile>
            </div>
            <DeferredMount v-if="stats.chartData.length >= 2" :height="180">
              <LazyAreaChart
                :data="stats.chartData"
                :height="180"
                :categories="{ v: { name: stats.metric.label, color: stats.metric.color || moodColor } }"
                :xFormatter="(i: number) => fmtShortDate(stats.chartDates[i] ?? '')"
                :yFormatter="(v: number) => fmtNum(v, stats.metric)"
                :xNumTicks="5"
                :yNumTicks="4"
                :hideLegend="true"
                :padding="{ top: 10, right: 10, bottom: 30, left: 42 }"
                :lineWidth="2"
              />
            </DeferredMount>
            <p v-else class="text-sm text-muted">A chart appears after 2 entries ({{ stats.chartData.length }} so far).</p>
          </template>

          <!-- Checkbox -->
          <template v-else-if="stats.type === 'checkbox'">
            <div class="flex items-center gap-3">
              <div class="h-3 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div class="h-full rounded-full transition-all" :style="{ width: stats.rate + '%', background: stats.metric.color || 'var(--mood)' }" />
              </div>
              <span class="w-12 text-right font-display text-lg font-bold tabular-nums">{{ stats.rate }}%</span>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <StatTile label="Days done" :value="stats.checkCount" />
              <StatTile label="Best streak" :value="`${stats.longestStreak} days`" />
            </div>
            <DeferredMount v-if="stats.chartData.length >= 2" :height="110">
              <LazyBarChart
                :data="stats.chartData"
                :height="110"
                :categories="{ v: { name: stats.metric.label, color: stats.metric.color || moodColor } }"
                :yAxis="['v']"
                :xFormatter="(i: number) => fmtShortDate(stats.chartDates[i] ?? '')"
                :xNumTicks="5"
                :yNumTicks="2"
                :hideLegend="true"
                :barPadding="0.3"
                :padding="{ top: 10, right: 10, bottom: 30, left: 25 }"
              />
            </DeferredMount>
          </template>

          <!-- Time -->
          <template v-else-if="stats.type === 'time'">
            <div class="grid grid-cols-3 gap-2">
              <StatTile label="Average" :value="stats.avgTime || '—'" />
              <StatTile label="Earliest" :value="stats.earliestTime || '—'" />
              <StatTile label="Latest" :value="stats.latestTime || '—'" />
            </div>
            <DeferredMount v-if="stats.chartData.length >= 2" :height="180">
              <LazyAreaChart
                :data="stats.chartData"
                :height="180"
                :categories="{ v: { name: stats.metric.label, color: stats.metric.color || moodColor } }"
                :xFormatter="(i: number) => fmtShortDate(stats.chartDates[i] ?? '')"
                :yFormatter="(v: number) => minsToTime(v)"
                :xNumTicks="5"
                :yNumTicks="4"
                :hideLegend="true"
                :padding="{ top: 10, right: 10, bottom: 30, left: 52 }"
                :lineWidth="2"
              />
            </DeferredMount>
            <p v-else class="text-sm text-muted">A chart appears after 2 entries ({{ stats.chartData.length }} so far).</p>
          </template>

          <!-- Location -->
          <template v-else-if="stats.type === 'location'">
            <div class="grid grid-cols-3 gap-2">
              <StatTile label="Logged" :value="stats.fillCount" />
              <StatTile label="Fill rate" :value="`${stats.total ? Math.round(stats.fillCount / stats.total * 100) : 0}%`" />
              <StatTile label="Places" :value="stats.topLocations.length" />
            </div>
            <ul v-if="stats.topLocations.length" class="flex flex-col">
              <li v-for="loc in stats.topLocations" :key="loc.name" class="flex items-center gap-3 rounded-xl px-2 py-2 odd:bg-surface-2">
                <Icon name="solar:map-point-bold" size="15" class="shrink-0" :style="{ color: stats.metric.color || 'var(--mood-strong)' }" />
                <span class="min-w-0 flex-1 truncate text-sm font-medium">{{ loc.name }}</span>
                <span class="text-sm tabular-nums text-muted">{{ loc.count }}×</span>
              </li>
            </ul>

            <div v-if="stats.hasWeatherData" class="flex flex-col gap-2 border-t border-line pt-4">
              <p class="eyebrow flex items-center gap-1.5">
                <Icon name="solar:cloud-sun-bold" size="14" />
                Weather on {{ stats.weatherEntryCount }} days
              </p>
              <div class="grid grid-cols-3 gap-2">
                <StatTile label="Average" :value="stats.avgTemp !== null ? Math.round(stats.avgTemp) + '°C' : '—'" />
                <StatTile label="Coldest" :value="stats.minTemp !== null ? Math.round(stats.minTemp) + '°C' : '—'" />
                <StatTile label="Warmest" :value="stats.maxTemp !== null ? Math.round(stats.maxTemp) + '°C' : '—'" />
              </div>
              <div v-if="stats.topConditions.length" class="flex flex-wrap gap-1.5">
                <span v-for="cond in stats.topConditions" :key="cond.condition" class="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-sm">
                  <Icon :name="getConditionIcon(cond.condition)" size="14" class="text-muted" />
                  {{ cond.condition }}
                  <span class="font-semibold tabular-nums">{{ cond.count }}×</span>
                </span>
              </div>
            </div>
          </template>

          <!-- Text -->
          <template v-else-if="stats.type === 'text'">
            <div class="grid grid-cols-2 gap-2">
              <StatTile label="Written" :value="stats.fillCount" />
              <StatTile label="Fill rate" :value="`${stats.total ? Math.round(stats.fillCount / stats.total * 100) : 0}%`" />
            </div>
            <ul v-if="stats.recent.length" class="flex flex-col gap-2">
              <li v-for="entry in stats.recent" :key="entry.date" class="rounded-2xl bg-surface-2 px-4 py-3">
                <p class="eyebrow">{{ fmtShortDate(entry.date) }}</p>
                <p class="mt-0.5 text-sm whitespace-pre-line">{{ entry.value }}</p>
              </li>
            </ul>
          </template>
        </article>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { MetricConfig } from '~/types';
import { calcStreak, filterEntriesByPeriod, fmtShortDate, minsToTime } from '~/utils/statsMath';
import { computeMetricStats, fmtStatValue as fmtNum, type MetricStats } from '~/utils/metricStats';

const { entries, isLoading, isConfigLoading, metricConfigs } = useMoodly();
const { moodColor } = useMoodTheme();

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

const filteredEntries = computed(() => filterEntriesByPeriod(entries.value, period.value));

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
        .filter(m => ['slider', 'number', 'checkbox', 'time', 'calculated', 'location', 'text'].includes(m.type))
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

// ── Per-metric stats ──────────────────────────────────────────────────────────

const metricStatsCards = computed<MetricStats[]>(() =>
  selectedMetricIds.value
    .map(id => metricConfigs.value.find(m => m.id === id))
    .filter((m): m is MetricConfig => !!m)
    .map(m => computeMetricStats(m, filteredEntries.value))
);

// ── Overall streak ────────────────────────────────────────────────────────────

const overallStreak = computed(() => {
  const dates = filteredEntries.value.map(e => e.date).sort();
  return calcStreak(dates);
});

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

// ── Summary tiles ─────────────────────────────────────────────────────────────

const summaryTiles = computed(() => [
  { label: 'Entries', value: filteredEntries.value.length, icon: 'solar:calendar-bold', color: 'var(--mood-strong)' },
  { label: 'Day streak', value: overallStreak.value.current, icon: 'solar:fire-bold', color: 'var(--fire)' },
  { label: 'Best streak', value: overallStreak.value.longest, icon: 'solar:medal-ribbon-star-bold', color: 'var(--gold)' },
  { label: 'Filled in', value: `${overallFillRate.value}%`, icon: 'solar:target-bold', color: 'var(--success)' },
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

function getConditionIcon(condition: string): string {
  const conditionLower = condition.toLowerCase();
  if (conditionLower.includes('clear') || conditionLower.includes('sunny')) return 'solar:sun-bold';
  if (conditionLower.includes('partly')) return 'solar:cloud-sun-bold';
  if (conditionLower.includes('overcast') || conditionLower.includes('cloudy')) return 'solar:cloud-bold';
  if (conditionLower.includes('fog')) return 'solar:fog-bold';
  if (conditionLower.includes('drizzle')) return 'solar:cloud-rain-bold';
  if (conditionLower.includes('rain') || conditionLower.includes('shower')) return 'solar:cloud-storm-bold';
  if (conditionLower.includes('snow')) return 'solar:snowflake-bold';
  if (conditionLower.includes('thunder') || conditionLower.includes('storm')) return 'solar:cloud-bolt-bold';
  return 'solar:cloud-bold';
}
</script>
