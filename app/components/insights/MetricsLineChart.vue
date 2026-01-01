<template>
  <div class="metrics-line-chart">
    <div class="chart-header">
      <div class="header-title-group">
        <div class="icon-container">
          <Icon name="solar:graph-bold" size="24" class="icon-pink" />
        </div>
        <h3 class="chart-title">Metrics Over Time</h3>
      </div>
      <div class="chart-legend">
        <button
          v-for="config in metricConfigs"
          :key="config.key"
          class="legend-item"
          :class="{ active: visibleMetrics.includes(config.key) }"
          :style="{
            '--metric-color': config.color,
          }"
          @click="toggleMetric(config.key)"
        >
          <span class="legend-dot" :style="{ background: config.color }"></span>
          {{ config.name }}
        </button>
      </div>
    </div>

    <div class="chart-container">
      <LineChart
        :data="chartData"
        :categories="chartCategories"
        :height="320"
        :x-formatter="xFormatter"
        xLabel=""
        yLabel="Score"
        :yDomain="[1, 5]"
        :show-x-axis="true"
        :show-y-axis="true"
        :show-tooltip="true"
        :hideLegend="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DailyEntry, MetricConfig, MetricType } from "~/types";

interface Props {
  entries: DailyEntry[];
  metricConfigs: MetricConfig[];
}

const props = defineProps<Props>();

// Track which metrics are visible
const visibleMetrics = ref<MetricType[]>(["mood", "energy", "sleep", "focus"]);

const toggleMetric = (metric: MetricType) => {
  const index = visibleMetrics.value.indexOf(metric);
  if (index === -1) {
    visibleMetrics.value.push(metric);
  } else if (visibleMetrics.value.length > 1) {
    // Keep at least one metric visible
    visibleMetrics.value.splice(index, 1);
  }
};

// Sort entries by date (oldest first for the chart)
const sortedEntries = computed(() => {
  return [...props.entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
});

// Transform data for vue-chrts LineChart format
// Each data point needs to have a label property and one property per metric
const chartData = computed(() => {
  return sortedEntries.value.map((entry) => {
    const date = new Date(entry.date);
    const label = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const dataPoint: Record<string, any> = { label };

    // Only include visible metrics, skip null values
    props.metricConfigs.forEach((config) => {
      if (visibleMetrics.value.includes(config.key)) {
        const value = entry.metrics[config.key];
        // Only include non-null values in the chart
        if (value !== null) {
          dataPoint[config.key] = value;
        }
      }
    });

    return dataPoint;
  });
});

// Categories configuration for vue-chrts
const chartCategories = computed(() => {
  const categories: Record<string, { name: string; color: string }> = {};

  props.metricConfigs.forEach((config) => {
    if (visibleMetrics.value.includes(config.key)) {
      categories[config.key] = {
        name: config.name,
        color: config.color,
      };
    }
  });

  return categories;
});

// X-axis formatter - returns the label for each data point
const xFormatter = (index: number) => {
  return chartData.value[index]?.label ?? "";
};
</script>

<style scoped>
.metrics-line-chart {
  padding: 1.75rem;
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-xl);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.metrics-line-chart:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-light);
}

.chart-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
  .chart-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.legend-item:hover {
  border-color: var(--metric-color);
  color: var(--text-primary);
}

.legend-item.active {
  background: color-mix(in srgb, var(--metric-color) 15%, transparent);
  border-color: var(--metric-color);
  color: var(--text-primary);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-item:not(.active) .legend-dot {
  opacity: 0.4;
}

.chart-container {
  min-height: 320px;
  position: relative;
}
</style>
