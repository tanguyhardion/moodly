import {
  computeAchievements,
  computeComparison,
  computeCorrelations,
  computeDayOfWeekChartData,
  computeDayOfWeekInfo,
  computeHabitEffects,
  computeImpactMetrics,
  computeLocationInsights,
  computePrediction,
  computeRecommendations,
  computeTrends,
  computeTriggers,
  computeWeatherInsights,
  computeWeatherMoodCorrelation,
} from '~/utils/insights';
import { filterEntriesByPeriod, filterPreviousPeriod } from '~/utils/statsMath';

export type {
  TrendItem,
  CorrelationPair,
  TriggerItem,
  ImpactMetric,
  AchievementItem,
  PredictionData,
  RecommendationItem,
  ComparisonDataItem,
  LocationInsightItem,
  WeatherInsightItem,
  WeatherMoodCorrelation,
  HabitEffectItem,
} from '~/utils/insights';

// ── Module-level selection state ───────────────────────────────────────────────

const period = ref(30);
const primaryMetricId = ref('');

// ── Composable ────────────────────────────────────────────────────────────────
// Reactive wiring only; the calculations live in ~/utils/insights.

// Every insight section calls this, so the computeds are built once in a detached
// scope and shared — otherwise each caller would redo the whole analysis.
let shared: ReturnType<typeof createInsightsData> | null = null;

export function useInsightsData() {
  if (!shared) shared = effectScope(true).run(createInsightsData)!;
  return shared;
}

function createInsightsData() {
  const { entries, isLoading, isConfigLoading, metricConfigs } = useMoodly();

  // ── Period & filtered entries ──────────────────────────────────────────────

  const periodLabel = computed(() => {
    if (period.value === 7) return 'week';
    if (period.value === 30) return 'month';
    if (period.value === 90) return '90 days';
    return 'period';
  });

  const filteredEntries = computed(() => filterEntriesByPeriod(entries.value, period.value));
  const previousPeriodEntries = computed(() => filterPreviousPeriod(entries.value, period.value));

  // ── Metric groups ──────────────────────────────────────────────────────────

  const numericMetrics = computed(() =>
    metricConfigs.value.filter(m => m.type === 'slider' || m.type === 'number' || m.type === 'calculated')
  );

  const checkboxMetrics = computed(() =>
    metricConfigs.value.filter(m => m.type === 'checkbox')
  );

  const locationMetrics = computed(() =>
    metricConfigs.value.filter(m => m.type === 'location')
  );

  // ── Primary metric ─────────────────────────────────────────────────────────

  watch(
    numericMetrics,
    (metrics) => {
      if (!primaryMetricId.value && metrics.length) {
        primaryMetricId.value = metrics[0]!.id;
      }
    },
    { immediate: true }
  );

  const primaryMetric = computed(() =>
    metricConfigs.value.find(m => m.id === primaryMetricId.value) ?? null
  );

  // ── Insights ───────────────────────────────────────────────────────────────

  const dayOfWeekChartData = computed(() => computeDayOfWeekChartData(filteredEntries.value, primaryMetric.value));
  const dayOfWeekInfo = computed(() => computeDayOfWeekInfo(dayOfWeekChartData.value));

  const trendData = computed(() => computeTrends(numericMetrics.value, filteredEntries.value));
  const correlationPairs = computed(() => computeCorrelations(numericMetrics.value, filteredEntries.value));
  const triggers = computed(() =>
    computeTriggers(checkboxMetrics.value, filteredEntries.value, primaryMetric.value)
  );
  const impactMetrics = computed(() =>
    computeImpactMetrics(numericMetrics.value, filteredEntries.value, primaryMetric.value)
  );
  const achievements = computed(() => computeAchievements(entries.value, primaryMetric.value));
  const prediction = computed(() => computePrediction(filteredEntries.value, primaryMetric.value));

  const comparisonData = computed(() =>
    computeComparison(numericMetrics.value, filteredEntries.value, previousPeriodEntries.value, period.value)
  );

  const locationInsights = computed(() =>
    computeLocationInsights(locationMetrics.value, filteredEntries.value, primaryMetric.value)
  );
  const weatherInsights = computed(() =>
    computeWeatherInsights(locationMetrics.value, filteredEntries.value, primaryMetric.value)
  );
  const weatherMoodCorrelation = computed(() =>
    computeWeatherMoodCorrelation(locationMetrics.value, filteredEntries.value, primaryMetric.value)
  );
  const habitEffects = computed(() =>
    computeHabitEffects(checkboxMetrics.value, numericMetrics.value, filteredEntries.value, primaryMetric.value)
  );

  const recommendations = computed(() =>
    computeRecommendations({
      pm: primaryMetric.value,
      entries: entries.value,
      filtered: filteredEntries.value,
      metrics: metricConfigs.value,
      numericMetrics: numericMetrics.value,
      checkboxMetrics: checkboxMetrics.value,
      triggers: triggers.value,
      impactMetrics: impactMetrics.value,
      trends: trendData.value,
      dayOfWeekInfo: dayOfWeekInfo.value,
      locationInsights: locationInsights.value,
      achievements: achievements.value,
    })
  );

  return {
    entries,
    isLoading,
    isConfigLoading,
    period,
    periodLabel,
    primaryMetricId,
    primaryMetric,
    numericMetrics,
    dayOfWeekInfo,
    dayOfWeekChartData,
    trendData,
    correlationPairs,
    triggers,
    impactMetrics,
    achievements,
    prediction,
    recommendations,
    comparisonData,
    locationInsights,
    weatherInsights,
    weatherMoodCorrelation,
    habitEffects,
  };
}
