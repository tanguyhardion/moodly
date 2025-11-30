<template>
  <div class="mini-chart">
    <div class="chart-header">
      <h4 class="chart-title">
        <Icon :name="icon" size="18" :style="{ color: color }" />
        {{ title }}
      </h4>
      <div class="chart-trend" :class="trend">
        <Icon
          :name="
            trend === 'up'
              ? 'solar:arrow-up-bold'
              : trend === 'down'
                ? 'solar:arrow-down-bold'
                : 'solar:minus-bold'
          "
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
          background: color,
        }"
        :title="`${point.label}: ${point.value}`"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChartDataPoint } from "~/types";

interface Props {
  title: string;
  icon: string;
  color: string;
  average: number;
  trend: "up" | "down" | "neutral";
  chartData: ChartDataPoint[];
}

defineProps<Props>();
</script>

<style scoped>
.mini-chart {
  padding: 1.75rem;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.mini-chart::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    currentColor 50%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.mini-chart:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-hover);
}

.mini-chart:hover::before {
  opacity: 0.3;
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
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.mini-chart:hover .chart-trend {
  transform: scale(1.1);
}

.chart-trend.up {
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.2) 0%,
    rgba(16, 185, 129, 0.15) 100%
  );
  color: var(--success);
}

.chart-trend.down {
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.2) 0%,
    rgba(239, 68, 68, 0.15) 100%
  );
  color: var(--error);
}

.chart-trend.neutral {
  background: linear-gradient(
    135deg,
    rgba(107, 114, 128, 0.2) 0%,
    rgba(107, 114, 128, 0.15) 100%
  );
  color: var(--text-tertiary);
}

.chart-value {
  margin-bottom: 1.25rem;
}

.value {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.025em;
}

.value-label {
  font-size: 1.0625rem;
  color: var(--text-secondary);
  margin-left: 0.25rem;
  font-weight: 500;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 0.375rem;
  height: 70px;
  padding: 0.25rem;
}

.bar {
  flex: 1;
  border-radius: 6px 6px 0 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 3px;
  opacity: 0.75;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.bar::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 6px 6px 0 0;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.3) 0%,
    transparent 100%
  );
}

.bar:hover {
  opacity: 1;
  transform: scaleY(1.15) scaleX(1.1);
  box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;
}
</style>
