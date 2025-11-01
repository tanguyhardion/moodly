<template>
  <div class="page stats-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <Icon name="solar:chart-bold" size="28" />
          Statistics
        </h1>
        <ExportButton v-if="entries.length > 0" class="export-btn-wrapper" />
      </div>
      <p class="page-subtitle">Your progress over the last {{ selectedDays }} days</p>
    </div>

    <div class="period-selector">
      <button
        v-for="period in periods"
        :key="period.days"
        @click="selectedDays = period.days"
        class="period-btn"
        :class="{ active: selectedDays === period.days }"
      >
        {{ period.label }}
      </button>
    </div>

    <div v-if="recentEntries.length === 0" class="empty-state">
      <div class="empty-icon">📊</div>
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

      <div class="insights-card">
        <h3 class="insights-title">
          <Icon name="solar:lightbulb-bolt-bold" size="22" />
          Insights
        </h3>
        <div class="insights-list">
          <div v-for="insight in insights" :key="insight.text" class="insight-item">
            <span class="insight-emoji">{{ insight.emoji }}</span>
            <p class="insight-text">{{ insight.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MetricType, ChartDataPoint } from '~/types';

const { metricConfigs, getEntriesInRange, getMetricAverage, getMetricTrend } = useMoodly();

const selectedDays = ref(7);
const periods = [
  { label: '7 Days', days: 7 },
  { label: '14 Days', days: 14 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 }
];

const recentEntries = computed(() => {
  return getEntriesInRange(selectedDays.value);
});

const getChartData = (metric: MetricType): ChartDataPoint[] => {
  const entries = recentEntries.value;
  const maxPoints = 10;
  
  // Sample entries if there are too many
  const step = Math.ceil(entries.length / maxPoints);
  const sampledEntries = entries.filter((_, index) => index % step === 0).slice(0, maxPoints);
  
  return sampledEntries.reverse().map(entry => ({
    date: entry.date,
    value: entry.metrics[metric],
    label: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));
};

const insights = computed(() => {
  if (recentEntries.value.length === 0) return [];

  const results = [];
  
  // Find best and worst metrics
  const averages = metricConfigs.map(config => ({
    name: config.name,
    average: getMetricAverage(config.key, selectedDays.value)
  }));

  const best = averages.reduce((prev, curr) => prev.average > curr.average ? prev : curr);
  const worst = averages.reduce((prev, curr) => prev.average < curr.average ? prev : curr);

  if (best.average >= 4) {
    results.push({
      emoji: '🌟',
      text: `Your ${best.name.toLowerCase()} has been excellent! Keep it up!`
    });
  }

  if (worst.average < 3) {
    results.push({
      emoji: '💭',
      text: `Consider focusing on improving your ${worst.name.toLowerCase()}.`
    });
  }

  // Check consistency
  const hasAllMetrics = recentEntries.value.length >= selectedDays.value * 0.7;
  if (hasAllMetrics) {
    results.push({
      emoji: '🔥',
      text: `Great consistency! You've checked in regularly.`
    });
  }

  // Check trends
  metricConfigs.forEach(config => {
    const trend = getMetricTrend(config.key, selectedDays.value);
    if (trend === 'up') {
      results.push({
        emoji: '📈',
        text: `Your ${config.name.toLowerCase()} is trending upward!`
      });
    }
  });

  return results.slice(0, 4);
});
</script>

<style scoped>
.stats-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.export-btn-wrapper {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.export-btn-wrapper:hover {
  opacity: 1;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.period-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.period-btn {
  padding: 0.5rem 1rem;
  border: 2px solid var(--border);
  background: var(--card-bg);
  color: var(--text-secondary);
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.period-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.period-btn.active {
  background: linear-gradient(135deg, #FF6B9D 0%, #FFA06B 100%);
  border-color: transparent;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
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
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #FF6B9D 0%, #FFA06B 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 107, 157, 0.4);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.insights-card {
  padding: 1.5rem;
  background: var(--card-bg);
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.insights-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem;
}

.insights-list {
  display: grid;
  gap: 1rem;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--note-bg);
  border-radius: 0.75rem;
}

.insight-emoji {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.insight-text {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
  padding-top: 0.25rem;
}
</style>
