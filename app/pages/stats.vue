<template>
  <div class="page stats-page">
    <div class="page-header">
      <h1 class="page-title">
        <Icon name="solar:chart-bold" size="28" />
        Statistics
      </h1>
      <p class="page-subtitle">
        Your progress over the last {{ selectedDays }} days
      </p>
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

      <div class="checkins-card">
        <h3 class="checkins-title">
          <Icon
            name="solar:clipboard-check-bold"
            size="22"
            style="color: #ff6b9d"
          />
          Daily Check-ins
        </h3>
        <div class="checkins-grid">
          <div class="checkin-stat">
            <div class="checkin-icon healthy-food">
              <Icon name="solar:leaf-bold" size="24" />
            </div>
            <div class="checkin-info">
              <span class="checkin-label">Healthy Food</span>
              <div class="checkin-progress-container">
                <div
                  class="checkin-progress-bar"
                  :style="{ width: checkInRate.healthyFood + '%' }"
                ></div>
              </div>
              <span class="checkin-percentage"
                >{{ checkInRate.healthyFood }}%</span
              >
            </div>
          </div>
          <div class="checkin-stat">
            <div class="checkin-icon caffeine">
              <Icon name="solar:cup-hot-bold" size="24" />
            </div>
            <div class="checkin-info">
              <span class="checkin-label">Caffeine</span>
              <div class="checkin-progress-container">
                <div
                  class="checkin-progress-bar"
                  :style="{ width: checkInRate.caffeine + '%' }"
                ></div>
              </div>
              <span class="checkin-percentage"
                >{{ checkInRate.caffeine }}%</span
              >
            </div>
          </div>
          <div class="checkin-stat">
            <div class="checkin-icon gym">
              <Icon name="solar:dumbbell-large-bold" size="24" />
            </div>
            <div class="checkin-info">
              <span class="checkin-label">Gym</span>
              <div class="checkin-progress-container">
                <div
                  class="checkin-progress-bar"
                  :style="{ width: checkInRate.gym + '%' }"
                ></div>
              </div>
              <span class="checkin-percentage">{{ checkInRate.gym }}%</span>
            </div>
          </div>
          <div class="checkin-stat">
            <div class="checkin-icon misc">
              <Icon name="solar:star-bold" size="24" />
            </div>
            <div class="checkin-info">
              <span class="checkin-label">Misc</span>
              <div class="checkin-progress-container">
                <div
                  class="checkin-progress-bar"
                  :style="{ width: checkInRate.misc + '%' }"
                ></div>
              </div>
              <span class="checkin-percentage">{{ checkInRate.misc }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="insights-card">
        <h3 class="insights-title">
          <Icon
            name="solar:lightbulb-bolt-bold"
            size="22"
            style="color: #ffd60a"
          />
          Insights
        </h3>
        <div class="insights-list">
          <div
            v-for="insight in insights"
            :key="insight.text"
            class="insight-item"
          >
            <Icon :name="insight.icon" size="24" class="insight-icon" />
            <p class="insight-text">{{ insight.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MetricType, ChartDataPoint } from "~/types";

const {
  entries,
  metricConfigs,
  getEntriesInRange,
  getMetricAverage,
  getMetricTrend,
} = useMoodly();

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
    return { healthyFood: 0, caffeine: 0, gym: 0, misc: 0 };
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
  const miscCount = recentEntries.value.filter(
    (entry) => entry.checkboxes?.misc,
  ).length;

  return {
    healthyFood: Math.round((healthyFoodCount / totalEntries) * 100),
    caffeine: Math.round((caffeineCount / totalEntries) * 100),
    gym: Math.round((gymCount / totalEntries) * 100),
    misc: Math.round((miscCount / totalEntries) * 100),
  };
});

const insights = computed(() => {
  if (recentEntries.value.length === 0) return [];

  const results = [];

  // Find best and worst metrics
  const averages = metricConfigs.map((config) => ({
    name: config.name,
    average: getMetricAverage(config.key, selectedDays.value),
  }));

  const best = averages.reduce((prev, curr) =>
    prev.average > curr.average ? prev : curr,
  );
  const worst = averages.reduce((prev, curr) =>
    prev.average < curr.average ? prev : curr,
  );

  if (best.average >= 4) {
    results.push({
      icon: "solar:star-bold",
      text: `Your ${best.name.toLowerCase()} has been excellent! Keep it up!`,
    });
  }

  if (worst.average < 3) {
    results.push({
      icon: "solar:chat-round-line-bold",
      text: `Consider focusing on improving your ${worst.name.toLowerCase()}.`,
    });
  }

  // Check consistency
  const hasAllMetrics = recentEntries.value.length >= selectedDays.value * 0.7;
  if (hasAllMetrics) {
    results.push({
      icon: "solar:fire-bold",
      text: `Great consistency! You've checked in regularly.`,
    });
  }

  // Check trends
  metricConfigs.forEach((config) => {
    const trend = getMetricTrend(config.key, selectedDays.value);
    if (trend === "up") {
      results.push({
        icon: "solar:graph-up-bold",
        text: `Your ${config.name.toLowerCase()} is trending upward!`,
      });
    }
  });

  // Check-in insights
  if (checkInRate.value.healthyFood >= 80) {
    results.push({
      icon: "solar:leaf-bold",
      text: `Excellent job maintaining a healthy diet!`,
    });
  }

  if (checkInRate.value.gym >= 70) {
    results.push({
      icon: "solar:dumbbell-large-bold",
      text: `You're crushing your gym goals!`,
    });
  }

  const avgCheckInRate = Math.round(
    (checkInRate.value.healthyFood +
      checkInRate.value.gym +
      checkInRate.value.misc) /
      3,
  );
  if (avgCheckInRate >= 75) {
    results.push({
      icon: "solar:star-shine-bold",
      text: `Amazing consistency with your daily check-ins!`,
    });
  } else if (avgCheckInRate < 30) {
    results.push({
      icon: "solar:target-bold",
      text: `Try to stay more consistent with your daily check-ins.`,
    });
  }

  return results.slice(0, 5);
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
  background: linear-gradient(135deg, #ff6b9d 0%, #ffa06b 100%);
  border-color: transparent;
  color: white;
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
  background: linear-gradient(135deg, #ff6b9d 0%, #ffa06b 100%);
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

.checkins-card {
  padding: 1.5rem;
  background: var(--card-bg);
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.checkins-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1.5rem;
}

.checkins-grid {
  display: grid;
  gap: 1.5rem;
}

.checkin-stat {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--note-bg);
  border-radius: 0.75rem;
  transition: transform 0.2s ease;
}

.checkin-stat:hover {
  transform: translateY(-2px);
}

.checkin-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  flex-shrink: 0;
}

.checkin-icon.healthy-food {
  background: linear-gradient(135deg, #34c759 0%, #30d158 100%);
  color: white;
}

.checkin-icon.caffeine {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
}

.checkin-icon.gym {
  background: linear-gradient(135deg, #ff453a 0%, #ff6b6b 100%);
  color: white;
}

.checkin-icon.misc {
  background: linear-gradient(135deg, #ffd60a 0%, #ffcc00 100%);
  color: white;
}

.checkin-info {
  flex: 1;
  min-width: 0;
}

.checkin-label {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.checkin-progress-container {
  width: 100%;
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.checkin-progress-bar {
  height: 100%;
  background: linear-gradient(135deg, #ff6b9d 0%, #ffa06b 100%);
  border-radius: 4px;
  transition: width 0.6s ease;
}

.checkin-percentage {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
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
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--note-bg);
  border-radius: 0.75rem;
}

.insight-icon {
  color: var(--primary);
  flex-shrink: 0;
}

.insight-text {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
}
</style>
