<template>
  <section class="insight-section">
    <div class="insight-section-header">
      <Icon name="solar:map-point-bold" size="20" style="color: var(--pink)" />
      <h2 class="insight-section-title">Location Insights</h2>
    </div>
    <div v-for="loc in locationInsights" :key="loc.metricId" class="insight-card">
      <div class="insight-card-title">
        <Icon v-if="loc.icon" :name="loc.icon" size="16" :style="{ color: loc.color }" />
        <Icon v-else name="solar:map-point-bold" size="16" :style="{ color: loc.color }" />
        {{ loc.metricLabel }}
      </div>
      <div class="location-list">
        <div v-for="place in loc.places" :key="place.name" class="location-item">
          <Icon name="solar:map-point-bold" size="13" :style="{ color: loc.color }" />
          <span class="location-name">{{ place.name }}</span>
          <span class="location-visits">{{ place.count }}×</span>
          <div v-if="primaryMetric && place.avgMood !== null" class="location-mood">
            <span class="location-mood-label">avg {{ primaryMetric.label }}</span>
            <span class="location-mood-val" :style="{ color: loc.color }">
              {{ fmtNum(place.avgMood, primaryMetric) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { locationInsights, primaryMetric } = useInsightsData();
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
  margin-bottom: 0.875rem;
  transition: box-shadow 0.2s ease;

  &:last-child { margin-bottom: 0; }
  &:hover { box-shadow: var(--shadow-md); }
}

.insight-card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.location-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.location-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--hover-bg);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.location-name {
  flex: 1;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.location-visits {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-tertiary);
}

.location-mood {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-left: 0.5rem;
}

.location-mood-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.location-mood-val {
  font-size: 0.875rem;
  font-weight: 700;
}
</style>
