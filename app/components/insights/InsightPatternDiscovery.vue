<template>
  <InsightSection title="Patterns" icon="solar:graph-up-bold">
    <!-- Day of Week -->
    <div class="card flex flex-col gap-4">
      <p class="eyebrow">Best and worst days</p>
      <template v-if="dayOfWeekInfo.hasData">
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-2xl bg-success/12 p-3">
            <p class="eyebrow text-success">Best</p>
            <p class="font-display text-2xl font-extrabold">{{ dayOfWeekInfo.bestDay }}</p>
            <p class="text-sm tabular-nums text-muted">avg {{ fmtNum(dayOfWeekInfo.bestVal, primaryMetric) }}</p>
          </div>
          <div class="rounded-2xl bg-danger/12 p-3">
            <p class="eyebrow text-danger">Toughest</p>
            <p class="font-display text-2xl font-extrabold">{{ dayOfWeekInfo.worstDay }}</p>
            <p class="text-sm tabular-nums text-muted">avg {{ fmtNum(dayOfWeekInfo.worstVal, primaryMetric) }}</p>
          </div>
        </div>
        <BarChart
          :data="dayOfWeekChartData"
          :height="140"
          :categories="{ v: { name: primaryMetric!.label, color: primaryMetric!.color || moodColor } }"
          :yAxis="['v']"
          :xFormatter="(i: number) => DAY_NAMES[i] ?? ''"
          :hideLegend="true"
          :barPadding="0.3"
          :padding="{ top: 10, right: 10, bottom: 30, left: 30 }"
        />
      </template>
      <p v-else class="flex items-center gap-2 text-sm text-muted">
        <Icon name="solar:info-circle-bold" size="16" />
        Log on at least 3 different weekdays to see day patterns.
      </p>
    </div>

    <!-- Trends -->
    <div class="card flex flex-col gap-3">
      <p class="eyebrow">Trends</p>
      <div v-if="trendData.length" class="grid gap-2 sm:grid-cols-2">
        <div v-for="t in trendData" :key="t.metricId" class="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
          <span class="grid size-9 shrink-0 place-items-center rounded-xl" :style="{ background: hexToRgba(t.color, 0.16), color: t.color }">
            <Icon :name="t.icon || 'solar:chart-2-bold'" size="16" />
          </span>
          <span class="min-w-0 flex-1 truncate text-sm font-semibold">{{ t.label }}</span>
          <span
            class="flex shrink-0 items-center gap-0.5 text-[13px] font-bold tabular-nums"
            :class="toneClass(t.direction === 'up' ? 1 : t.direction === 'down' ? -1 : 0)"
          >
            <Icon :name="toneIcon(t.direction === 'up' ? 1 : t.direction === 'down' ? -1 : 0)" size="13" />
            {{ t.summary }}
          </span>
        </div>
      </div>
      <p v-else class="flex items-center gap-2 text-sm text-muted">
        <Icon name="solar:info-circle-bold" size="16" />
        Trends appear once a metric has 5 entries.
      </p>
    </div>

    <!-- Correlations -->
    <div class="card flex flex-col gap-3">
      <p class="eyebrow">Moves together</p>
      <div v-if="correlationPairs.length" class="flex flex-col gap-3">
        <div v-for="c in correlationPairs" :key="c.key" class="grid grid-cols-[minmax(0,1fr)_3.5rem] items-center gap-x-3 gap-y-1.5">
          <p class="truncate text-sm font-semibold">
            {{ c.labelA }} <span class="font-normal text-faint">and</span> {{ c.labelB }}
          </p>
          <span class="row-span-2 text-right text-sm font-bold tabular-nums" :class="toneClass(c.r)">
            {{ c.r > 0 ? '+' : '' }}{{ (c.r * 100).toFixed(0) }}%
          </span>
          <div class="h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div class="h-full rounded-full" :class="c.r > 0 ? 'bg-success' : 'bg-danger'" :style="{ width: Math.abs(c.r) * 100 + '%' }" />
          </div>
        </div>
      </div>
      <p v-else class="flex items-center gap-2 text-sm text-muted">
        <Icon name="solar:info-circle-bold" size="16" />
        Needs two numeric metrics logged together on 5 or more days.
      </p>
    </div>

    <!-- Triggers -->
    <div v-if="triggers.length" class="card flex flex-col gap-3">
      <div>
        <p class="eyebrow">Habits and {{ primaryMetric!.label }}</p>
        <p class="text-[13px] text-muted">Average on days with the habit vs without</p>
      </div>
      <div class="flex flex-col gap-2">
        <div v-for="t in triggers" :key="t.metricId" class="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
          <span class="grid size-9 shrink-0 place-items-center rounded-xl" :style="{ background: hexToRgba(t.color, 0.16), color: t.color }">
            <Icon :name="t.icon || 'solar:check-square-bold'" size="16" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold">{{ t.label }}</p>
            <p class="text-[13px] tabular-nums text-muted">
              <span class="font-semibold text-ink">{{ fmtNum(t.avgWhenChecked, primaryMetric) }}</span> with ·
              {{ fmtNum(t.avgWhenUnchecked, primaryMetric) }} without
            </p>
          </div>
          <span class="flex shrink-0 items-center gap-0.5 text-sm font-bold tabular-nums" :class="toneClass(t.delta)">
            <Icon :name="toneIcon(t.delta)" size="13" />
            {{ fmtNum(Math.abs(t.delta), primaryMetric) }}
          </span>
        </div>
      </div>
    </div>
  </InsightSection>
</template>
<script setup lang="ts">
const { primaryMetric, dayOfWeekInfo, dayOfWeekChartData, trendData, correlationPairs, triggers } = useInsightsData();
const { moodColor } = useMoodTheme();
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
</script>
