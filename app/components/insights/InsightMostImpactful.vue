<template>
  <InsightSection title="What moves the needle" icon="solar:fire-bold" color="var(--fire)" :subtitle="`How closely each metric tracks ${primaryMetric?.label}`">
    <div class="card flex flex-col gap-1 p-3">
      <div
        v-for="(m, i) in impactMetrics"
        :key="m.metricId"
        class="grid grid-cols-[1.25rem_2rem_minmax(0,1fr)_3.5rem] items-center gap-3 rounded-2xl px-2 py-2"
      >
        <span class="text-sm font-bold tabular-nums text-faint">{{ i + 1 }}</span>
        <span class="grid size-8 place-items-center rounded-lg" :style="{ background: hexToRgba(m.color, 0.16), color: m.color }">
          <Icon :name="m.icon || 'solar:chart-2-bold'" size="15" />
        </span>
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold">{{ m.label }}</p>
          <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div class="h-full rounded-full" :style="{ width: Math.abs(m.r) * 100 + '%', background: m.color || 'var(--mood)' }" />
          </div>
        </div>
        <span class="text-right text-sm font-bold tabular-nums" :class="toneClass(m.r)">
          {{ m.r > 0 ? '+' : '' }}{{ (m.r * 100).toFixed(0) }}%
        </span>
      </div>
    </div>
  </InsightSection>
</template>
<script setup lang="ts">
const { impactMetrics, primaryMetric } = useInsightsData();
</script>
