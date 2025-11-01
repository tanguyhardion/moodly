<template>
  <div class="mini-chart">
    <div class="chart-header">
      <h4 class="chart-title">
        <Icon :name="icon" size="18" />
        {{ title }}
      </h4>
      <div class="chart-trend" :class="trend">
        <Icon
          :name="trend === 'up' ? 'solar:arrow-up-bold' : trend === 'down' ? 'solar:arrow-down-bold' : 'solar:minus-bold'"
          size="16"
        />
      </div>
    </div>

    <div class="chart-value">
      <span class="value">{{ average.toFixed(1) }}</span>
      <span class="value-label">/ 5</span>
    </div>

    <div class="chart-bars">
      <div
        v-for="(point, index) in chartData"
        :key="index"
        class="bar"
        :style="{
          height: `${(point.value / 5) * 100}%`,
          background: color
        }"
        :title="`${point.label}: ${point.value}`"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChartDataPoint } from '~/types';

interface Props {
  title: string;
  icon: string;
  color: string;
  average: number;
  trend: 'up' | 'down' | 'neutral';
  chartData: ChartDataPoint[];
}

defineProps<Props>();
</script>

<style scoped>
.mini-chart {
  padding: 1.5rem;
  background: var(--card-bg);
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.mini-chart:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.chart-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.75rem;
}

.chart-trend.up {
  background: rgba(76, 217, 100, 0.15);
  color: #4cd964;
}

.chart-trend.down {
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
}

.chart-trend.neutral {
  background: rgba(158, 158, 158, 0.15);
  color: #9e9e9e;
}

.chart-value {
  margin-bottom: 1rem;
}

.value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.value-label {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-left: 0.25rem;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 0.25rem;
  height: 60px;
}

.bar {
  flex: 1;
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
  min-height: 2px;
  opacity: 0.8;
}

.bar:hover {
  opacity: 1;
  transform: scaleY(1.1);
}
</style>
