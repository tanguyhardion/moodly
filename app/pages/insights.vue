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
      <PeriodSelector v-model="period" :periods="PERIODS" />

      <InsightPrimaryMetricSelector />

      <InsightPatternDiscovery v-if="primaryMetric" />
      <InsightMostImpactful v-if="impactMetrics.length" />
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
} = useInsightsData();

const PERIODS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: 'All', days: 0 },
];
</script>

<style scoped lang="scss">
.page-container {
  max-width: 760px;
  margin: 0 auto;
  padding: 1.5rem;
  position: relative;
  z-index: 1;
}

.insights-content {
  animation: fadeIn 0.4s ease;
}
</style>
