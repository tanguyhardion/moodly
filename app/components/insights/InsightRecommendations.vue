<template>
  <section class="insight-section">
    <div class="insight-section-header">
      <Icon name="solar:lightbulb-bold" size="20" style="color: var(--accent)" />
      <h2 class="insight-section-title">Recommendations</h2>
    </div>
    <div class="recommendations-list">
      <div v-for="r in recommendations" :key="r.key" class="recommendation-card">
        <div class="recommendation-icon" :style="{ background: r.iconBg, color: r.iconColor }">
          <Icon :name="r.icon" size="16" />
        </div>
        <div class="recommendation-text">
          <span class="recommendation-title">{{ r.title }}</span>
          <span class="recommendation-desc">{{ r.description }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { recommendations } = useInsightsData();
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

.recommendations-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 0.75rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.recommendation-card {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1rem 1.25rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s ease;

  &:hover { box-shadow: var(--shadow-md); }
}

.recommendation-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.recommendation-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.recommendation-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
}

.recommendation-desc {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.45;
}
</style>
