<template>
  <div class="page stats-page">
    <LoadingState v-if="!isReady" message="Loading your statistics..." />
    <div v-else class="stats-content-wrapper">
      <div class="page-header">
        <h1 class="page-title">
          <Icon name="solar:chart-bold" size="28" />
          Statistics
        </h1>
        <p class="page-subtitle">
          Your progress over the last {{ selectedDays }} days
        </p>
      </div>

      <PeriodSelector v-model="selectedDays" :periods="periods" />

      <div v-if="recentEntries.length === 0" class="empty-state">
        <Icon name="solar:graph-new-bold" size="64" class="empty-icon" />
        <h3>No data for this period</h3>
        <p>Create more entries to see your statistics</p>
        <NuxtLink to="/" class="btn btn-primary">
          <Icon name="solar:add-circle-bold" size="20" />
          Create Entry
        </NuxtLink>
      </div>

      <div v-else class="stats-content">
        <div class="charts-grid">
          <MiniChart
            v-for="config in metricConfigs"
            :key="config.key"
            :title="config.name"
            :icon="config.icon"
            :color="config.color"
            :average="getMetricAverage(config.key, selectedDays)"
            :trend="getMetricTrend(config.key, selectedDays)"
            :chart-data="getChartData(config.key)"
          />
        </div>

        <CheckinsStats :check-in-rate="checkInRate" />

        <InsightsList :insights="insights" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MetricType, ChartDataPoint, CategorizedInsights, Insight } from "~/types";

const {
  entries,
  metricConfigs,
  getEntriesInRange,
  getMetricAverage,
  getMetricTrend,
  isInitialized,
} = useMoodly();

const { generateAdvancedInsights } = useAdvancedInsights();

const isReady = ref(false);

// Watch for data initialization
watch(isInitialized, (initialized) => {
  if (initialized && !isReady.value) {
    isReady.value = true;
  }
});

// Initialize if data is already loaded
onMounted(() => {
  if (isInitialized.value) {
    isReady.value = true;
  }
});

const selectedDays = ref(7);
const periods = [
  { label: "7 Days", days: 7 },
  { label: "14 Days", days: 14 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
];

const recentEntries = computed(() => {
  return getEntriesInRange(selectedDays.value);
});

const getChartData = (metric: MetricType): ChartDataPoint[] => {
  const entries = recentEntries.value;
  const maxPoints = 10;

  // Sample entries if there are too many
  const step = Math.ceil(entries.length / maxPoints);
  const sampledEntries = entries
    .filter((_, index) => index % step === 0)
    .slice(0, maxPoints);

  return sampledEntries.reverse().map((entry) => ({
    date: entry.date,
    value: entry.metrics[metric],
    label: new Date(entry.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));
};

const checkInRate = computed(() => {
  if (recentEntries.value.length === 0) {
    return { healthyFood: 0, caffeine: 0, gym: 0, hardWork: 0, misc: 0 };
  }

  const totalEntries = recentEntries.value.length;
  const healthyFoodCount = recentEntries.value.filter(
    (entry) => entry.checkboxes?.healthyFood,
  ).length;
  const caffeineCount = recentEntries.value.filter(
    (entry) => entry.checkboxes?.caffeine,
  ).length;
  const gymCount = recentEntries.value.filter(
    (entry) => entry.checkboxes?.gym,
  ).length;
  const hardWorkCount = recentEntries.value.filter(
    (entry) => entry.checkboxes?.hardWork,
  ).length;
  const miscCount = recentEntries.value.filter(
    (entry) => entry.checkboxes?.misc,
  ).length;

  return {
    healthyFood: Math.round((healthyFoodCount / totalEntries) * 100),
    caffeine: Math.round((caffeineCount / totalEntries) * 100),
    gym: Math.round((gymCount / totalEntries) * 100),
    hardWork: Math.round((hardWorkCount / totalEntries) * 100),
    misc: Math.round((miscCount / totalEntries) * 100),
  };
});

const insights = computed((): CategorizedInsights => {
  if (recentEntries.value.length < 3) {
    return {
      patterns: [],
      correlations: [],
      predictions: [],
      achievements: [],
      recommendations: [],
    };
  }

  const allInsights = generateAdvancedInsights(
    recentEntries.value,
    metricConfigs,
    selectedDays.value
  );

  // Categorize insights
  const categorized: CategorizedInsights = {
    patterns: [],
    correlations: [],
    predictions: [],
    achievements: [],
    recommendations: [],
  };

  allInsights.forEach((insight: Insight) => {
    categorized[insight.category].push(insight);
  });

  return categorized;
});
</script>

<style scoped>
.stats-page {
  max-width: 900px;
  margin: 0 auto;
}

.stats-content-wrapper {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  color: var(--text-tertiary);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
}

.empty-state p {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0 0 1.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 1rem 2.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 1.0625rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  letter-spacing: -0.01em;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: linear-gradient(135deg, #ff6b9d 0%, #ffa06b 100%);
  color: white;
  box-shadow: var(--shadow-colored);
}

.btn-primary::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #e94a7c 0%, #ff8a52 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px -5px rgba(255, 107, 157, 0.4);
}

.btn-primary:hover::before {
  opacity: 1;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}
</style>
