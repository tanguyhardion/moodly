<template>
  <InsightSection title="Comparison" icon="solar:chart-2-bold" :subtitle="`This ${periodLabel} vs the previous one`">
    <div class="card grid gap-2 p-3 sm:grid-cols-2">
      <div v-for="c in comparisonData" :key="c.metricId" class="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
        <span class="grid size-9 shrink-0 place-items-center rounded-xl" :style="{ background: hexToRgba(c.color, 0.16), color: c.color }">
          <Icon :name="c.icon || 'solar:chart-2-bold'" size="16" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold">{{ c.label }}</p>
          <p class="text-[13px] tabular-nums text-muted">
            <span class="font-semibold text-ink">{{ c.currentFmt }}</span> now · {{ c.prevFmt }} before
          </p>
        </div>
        <span class="flex shrink-0 items-center gap-0.5 text-sm font-bold tabular-nums" :class="toneClass(c.delta)">
          <Icon :name="toneIcon(c.delta)" size="14" />
          <template v-if="c.delta !== 0">{{ c.delta > 0 ? '+' : '−' }}{{ c.deltaFmt }}</template>
        </span>
      </div>
    </div>
  </InsightSection>
</template>
<script setup lang="ts">
const { comparisonData, periodLabel } = useInsightsData();
</script>
