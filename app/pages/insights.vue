<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">
        <Icon name="mdi:sparkles" size="28" class="icon-primary" />
        Insights
      </h1>
      <p class="page-subtitle">Patterns and discoveries from your data</p>
    </div>

    <LoadingState v-if="isLoading || isConfigLoading" message="Analyzing your data..." />

    <div v-else-if="entries.length === 0" class="empty-state">
      <div class="empty-state-icon">
        <Icon name="mdi:sparkles" size="48" />
      </div>
      <p class="empty-state-title">No data yet</p>
      <p class="empty-state-description">Start logging entries to unlock insights.</p>
    </div>

    <div v-else class="insights-content">
      <div ref="periodSelectorRef">
        <PeriodSelector v-model="period" :periods="PERIODS" />
      </div>

      <Transition name="slide-down">
        <div v-if="showStickyHeader" class="sticky-header">
          <div class="sticky-content">
            <div class="sticky-period">
              <PeriodSelector v-model="period" :periods="PERIODS" />
            </div>
            <div class="sticky-metric-selector">
              <InsightPrimaryMetricSelector />
            </div>
          </div>
        </div>
      </Transition>

      <InsightPrimaryMetricSelector />

      <InsightPatternDiscovery v-if="primaryMetric" />
      <InsightMostImpactful v-if="impactMetrics.length" />
      <InsightHabitEffect v-if="habitEffects.length" />
      <InsightAchievements v-if="achievements.length" />
      <InsightPrediction v-if="prediction && primaryMetric" />
      <InsightRecommendations v-if="recommendations.length" />
      <InsightComparison v-if="period > 0 && comparisonData.length" />
      <InsightLocationInsights v-if="locationInsights.length" />
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  entries,
  isLoading,
  isConfigLoading,
  period,
  primaryMetric,
  impactMetrics,
  achievements,
  prediction,
  recommendations,
  comparisonData,
  locationInsights,
  habitEffects,
} = useInsightsData();

const PERIODS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: 'All', days: 0 },
];

const periodSelectorRef = ref<HTMLElement | null>(null);
const showStickyHeader = ref(false);

onMounted(() => {
  const checkSticky = () => {
    if (!periodSelectorRef.value) return;
    const rect = periodSelectorRef.value.getBoundingClientRect();
    showStickyHeader.value = rect.bottom < 80;
  };

  window.addEventListener('scroll', checkSticky, { passive: true });
  onUnmounted(() => window.removeEventListener('scroll', checkSticky));
});
</script>

<style scoped lang="scss">
.page-container {
  max-width: 760px;
  margin: 0 auto;
  padding: 1.5rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }

  @media (max-width: 480px) {
    padding: 1.5rem 0.75rem;
  }
}

.insights-content {
  animation: fadeIn 0.4s ease;
}

.sticky-period {
  padding: 0.625rem 0.75rem;

  :deep(.period-selector) {
    margin-bottom: 0;
  }
}

.sticky-metric-selector {
  padding: 0.625rem 0.75rem;
  border-top: 1px solid var(--border);

  :deep(.primary-metric-section) {
    margin-bottom: 0;
  }

  :deep(.section-label) {
    margin-bottom: 0.5rem;
  }
}
</style>
