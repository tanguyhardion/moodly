<template>
  <div>
    <div v-if="numericMetrics.length" class="flex flex-col gap-2">
      <p class="eyebrow">Analyzing</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="m in numericMetrics"
          :key="m.id"
          type="button"
          class="chip"
          :class="{ 'chip-on': primaryMetricId === m.id }"
          :aria-pressed="primaryMetricId === m.id"
          @click="primaryMetricId = m.id"
        >
          <Icon v-if="m.icon" :name="m.icon" size="15" />
          {{ m.label }}
        </button>
      </div>
    </div>

    <p v-else class="flex items-start gap-2 rounded-card bg-surface p-4 text-sm text-muted">
      <Icon name="solar:info-circle-bold" size="18" class="mt-px shrink-0" />
      Add a slider or number metric to unlock patterns, correlations and forecasts.
    </p>
  </div>
</template>
<script setup lang="ts">
const { numericMetrics, primaryMetricId } = useInsightsData();
</script>
