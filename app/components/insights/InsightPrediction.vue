<template>
  <section class="insight-section">
    <div class="insight-section-header">
      <Icon name="solar:magic-stick-3-bold" size="20" style="color: var(--secondary)" />
      <h2 class="insight-section-title">Prediction</h2>
    </div>
    <div class="insight-card prediction-card">
      <div class="prediction-main">
        <div class="prediction-left">
          <span class="prediction-label">Predicted next {{ primaryMetric!.label }}</span>
          <span class="prediction-value" :style="{ color: primaryMetric!.color || 'var(--primary)' }">
            {{ fmtNum(prediction!.value, primaryMetric) }}
          </span>
          <div class="prediction-direction" :class="prediction!.direction">
            <Icon
              :name="prediction!.direction === 'up' ? 'solar:arrow-up-bold' : prediction!.direction === 'down' ? 'solar:arrow-down-bold' : 'solar:minus-bold'"
              size="13"
            />
            {{ prediction!.direction === 'up' ? 'Trending up' : prediction!.direction === 'down' ? 'Trending down' : 'Stable' }}
          </div>
        </div>
        <div class="prediction-right">
          <span class="prediction-meta">Based on last {{ prediction!.basedOn }} entries</span>
          <span class="prediction-range">Range: {{ fmtNum(prediction!.low, primaryMetric) }} – {{ fmtNum(prediction!.high, primaryMetric) }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { prediction, primaryMetric } = useInsightsData();
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

.prediction-card {
  background: linear-gradient(135deg, var(--card-bg) 0%, var(--hover-bg) 100%);
}

.prediction-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;

  @media (max-width: 500px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

.prediction-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.prediction-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
}

.prediction-value {
  font-size: 2.25rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1;
}

.prediction-direction {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8125rem;
  font-weight: 600;
  margin-top: 0.25rem;

  &.up { color: var(--success); }
  &.down { color: var(--error); }
  &.flat { color: var(--text-tertiary); }
}

.prediction-right {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  text-align: right;

  @media (max-width: 500px) { text-align: left; }
}

.prediction-meta {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

.prediction-range {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}
</style>
