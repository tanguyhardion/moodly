<template>
  <section class="insight-section">
    <div class="insight-section-header">
      <Icon name="solar:chart-2-bold" size="20" class="icon-primary" />
      <h2 class="insight-section-title">Comparison</h2>
    </div>
    <div class="insight-card">
      <p class="insight-card-subtitle">This {{ periodLabel }} vs last {{ periodLabel }}</p>
      <div class="comparison-grid">
        <div v-for="c in comparisonData" :key="c.metricId" class="comparison-item">
          <div class="comparison-header">
            <div class="comparison-icon" :style="{ background: hexToRgba(c.color, 0.12) }">
              <Icon v-if="c.icon" :name="c.icon" size="13" :style="{ color: c.color }" />
              <Icon v-else name="solar:chart-2-bold" size="13" :style="{ color: c.color }" />
            </div>
            <span class="comparison-label">{{ c.label }}</span>
          </div>
          <div class="comparison-values">
            <div class="comparison-period">
              <span class="comparison-period-label">Now</span>
              <span class="comparison-val">{{ c.currentFmt }}</span>
            </div>
            <Icon
              :name="c.delta > 0 ? 'solar:arrow-right-up-bold' : c.delta < 0 ? 'solar:arrow-right-down-bold' : 'solar:arrows-right-bold'"
              size="16"
              class="comparison-arrow"
              :class="c.deltaClass"
            />
            <div class="comparison-period">
              <span class="comparison-period-label">Before</span>
              <span class="comparison-val muted">{{ c.prevFmt }}</span>
            </div>
          </div>
          <div v-if="c.delta !== 0" class="comparison-delta" :class="c.deltaClass">
            {{ c.delta > 0 ? '+' : '' }}{{ c.deltaFmt }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { comparisonData, periodLabel } = useInsightsData();
</script>

<style scoped lang="scss">
.insight-section {
  margin-bottom: 2rem;
}

.insight-section-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 1rem;
}

.insight-section-title {
  font-size: 1.0625rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.insight-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 1.25rem 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s ease;

  &:hover { box-shadow: var(--shadow-md); }
}

.insight-card-subtitle {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin: -0.5rem 0 1rem;
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.comparison-item {
  padding: 0.875rem 1rem;
  background: var(--hover-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.comparison-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comparison-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.comparison-label {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comparison-values {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.comparison-period {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  flex: 1;
}

.comparison-period-label {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
}

.comparison-val {
  font-size: 1.0625rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;

  &.muted { color: var(--text-tertiary); font-size: 0.9375rem; font-weight: 600; }
}

.comparison-arrow {
  &.positive { color: var(--success); }
  &.negative { color: var(--error); }
  &.neutral { color: var(--text-tertiary); }
}

.comparison-delta {
  font-size: 0.8125rem;
  font-weight: 700;

  &.positive { color: var(--success); }
  &.negative { color: var(--error); }
  &.neutral { color: var(--text-tertiary); }
}
</style>
