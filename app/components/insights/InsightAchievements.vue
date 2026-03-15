<template>
  <section class="insight-section">
    <div class="insight-section-header">
      <Icon name="solar:medal-ribbon-star-bold" size="20" style="color: var(--gold)" />
      <h2 class="insight-section-title">Notable Achievements</h2>
    </div>
    <div class="achievements-grid">
      <div v-for="a in achievements" :key="a.key" class="achievement-card">
        <div class="achievement-icon" :style="{ background: a.iconBg }">
          <Icon :name="a.icon" size="22" :style="{ color: a.iconColor }" />
        </div>
        <div class="achievement-info">
          <span class="achievement-title">{{ a.title }}</span>
          <span class="achievement-desc">{{ a.description }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { achievements } = useInsightsData();
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

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}

.achievement-card {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1rem 1.125rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s ease;

  &:hover { box-shadow: var(--shadow-md); }
}

.achievement-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.achievement-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.achievement-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
}

.achievement-desc {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.4;
}
</style>
