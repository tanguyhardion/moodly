<template>
  <section class="insight-section">
    <div class="insight-section-header">
      <Icon name="solar:fire-bold" size="20" style="color: var(--fire)" />
      <h2 class="insight-section-title">Most Impactful Metrics</h2>
    </div>
    <div class="insight-card">
      <p class="insight-card-subtitle">Correlation strength with {{ primaryMetric?.label }}</p>
      <div class="impact-list">
        <div v-for="(m, i) in impactMetrics" :key="m.metricId" class="impact-item">
          <span class="impact-rank">{{ i + 1 }}</span>
          <div class="impact-icon" :style="{ background: hexToRgba(m.color, 0.12) }">
            <Icon v-if="m.icon" :name="m.icon" size="14" :style="{ color: m.color }" />
            <Icon v-else name="solar:chart-2-bold" size="14" :style="{ color: m.color }" />
          </div>
          <span class="impact-label">{{ m.label }}</span>
          <div class="impact-bar-wrap">
            <div
              class="impact-bar"
              :style="{ width: Math.abs(m.r) * 100 + '%', background: m.color || 'var(--primary)' }"
            />
          </div>
          <span class="impact-r" :class="m.r > 0 ? 'positive' : 'negative'">
            {{ m.r > 0 ? '+' : '' }}{{ (m.r * 100).toFixed(0) }}%
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { impactMetrics, primaryMetric } = useInsightsData();
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

.impact-list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.impact-item {
  display: grid;
  grid-template-columns: 18px 28px 1fr auto auto;
  align-items: center;
  gap: 0.625rem;
}

.impact-rank {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--text-tertiary);
  text-align: center;
}

.impact-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.impact-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.impact-bar-wrap {
  width: 80px;
  height: 6px;
  background: var(--hover-bg);
  border-radius: var(--radius-full);
  overflow: hidden;
  border: 1px solid var(--border);
}

.impact-bar {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.4s ease;
  opacity: 0.8;
}

.impact-r {
  font-size: 0.8125rem;
  font-weight: 700;
  min-width: 36px;
  text-align: right;

  &.positive { color: var(--success); }
  &.negative { color: var(--error); }
}
</style>
