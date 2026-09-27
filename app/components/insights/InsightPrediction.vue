<template>
  <InsightSection title="Next entry forecast" icon="solar:magic-stick-3-bold">
    <div class="flex flex-wrap items-end justify-between gap-4 rounded-card bg-mood-soft p-5">
      <div>
        <p class="eyebrow">Predicted {{ primaryMetric!.label }}</p>
        <p class="font-display text-5xl font-extrabold tabular-nums">{{ fmtNum(prediction!.value, primaryMetric) }}</p>
        <p class="mt-1 flex items-center gap-1 text-sm font-semibold" :class="toneClass(directionSign)">
          <Icon :name="toneIcon(directionSign)" size="14" />
          {{ directionSign > 0 ? 'Trending up' : directionSign < 0 ? 'Trending down' : 'Holding steady' }}
        </p>
      </div>
      <div class="text-right text-sm text-muted">
        <p class="tabular-nums">Likely {{ fmtNum(prediction!.low, primaryMetric) }} – {{ fmtNum(prediction!.high, primaryMetric) }}</p>
        <p>From your last {{ prediction!.basedOn }} entries</p>
      </div>
    </div>
  </InsightSection>
</template>
<script setup lang="ts">
const { prediction, primaryMetric } = useInsightsData();

const directionSign = computed(() =>
  prediction.value?.direction === 'up' ? 1 : prediction.value?.direction === 'down' ? -1 : 0,
);
</script>
