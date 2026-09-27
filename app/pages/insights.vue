<template>
  <div class="page">
    <header class="mb-6">
      <h1 class="page-title">Insights</h1>
      <p class="page-subtitle">What your days have in common.</p>
    </header>

    <LoadingState v-if="isLoading || isConfigLoading" message="Looking for patterns…" />

    <div v-else-if="entries.length === 0" class="empty-state">
      <Icon name="mdi:sparkles" size="44" class="text-faint" />
      <p class="text-lg font-bold text-ink">Nothing to analyze yet</p>
      <p class="max-w-xs text-sm">Log a few days and patterns will start to show up here.</p>
    </div>

    <div v-else class="flex flex-col gap-8">
      <div class="flex flex-col gap-4">
        <div ref="periodSelectorRef">
          <PeriodSelector v-model="period" :periods="PERIODS" />
        </div>
        <InsightPrimaryMetricSelector />
      </div>

      <Transition name="slide-down">
        <div v-if="showStickyHeader" class="sticky-bar">
          <div class="flex flex-col gap-3 p-3">
            <PeriodSelector v-model="period" :periods="PERIODS" />
            <InsightPrimaryMetricSelector />
          </div>
        </div>
      </Transition>

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
