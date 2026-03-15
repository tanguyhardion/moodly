<template>
  <div>
    <div v-if="numericMetrics.length" class="primary-metric-section">
      <div class="section-label">Analyzing</div>
      <div class="metric-chips">
        <button
          v-for="m in numericMetrics"
          :key="m.id"
          class="chip-btn"
          :class="{ active: primaryMetricId === m.id }"
          :style="primaryMetricId === m.id ? { '--chip-color': m.color || 'var(--primary)' } : {}"
          type="button"
          @click="primaryMetricId = m.id"
        >
          <Icon v-if="m.icon" :name="m.icon" size="13" />
          {{ m.label }}
        </button>
      </div>
    </div>

    <div v-if="!numericMetrics.length" class="insight-callout">
      <Icon name="solar:info-circle-bold" size="16" />
      Add slider or number metrics to unlock pattern analysis, correlations, and predictions.
    </div>
  </div>
</template>

<script setup lang="ts">
const { numericMetrics, primaryMetricId } = useInsightsData();
</script>

<style scoped lang="scss">
.primary-metric-section {
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

.insight-callout {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: var(--hover-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}
</style>
