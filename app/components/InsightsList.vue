<script setup lang="ts">
import type { CategorizedInsights } from "~/types";

defineProps<{
  insights: CategorizedInsights;
}>();

const categoryInfo = {
  achievements: {
    title: "🏆 Achievements",
    icon: "solar:cup-star-bold",
    color: "#ffd60a",
  },
  patterns: {
    title: "📊 Patterns Detected",
    icon: "solar:chart-2-bold",
    color: "#4cc9f0",
  },
  correlations: {
    title: "🔗 Correlations",
    icon: "solar:link-circle-bold",
    color: "#7209b7",
  },
  predictions: {
    title: "🔮 Trend Forecasts",
    icon: "solar:crystal-ball-bold",
    color: "#f72585",
  },
  recommendations: {
    title: "💡 Recommendations",
    icon: "solar:lightbulb-bolt-bold",
    color: "#4361ee",
  },
};
</script>

<template>
  <div class="insights-wrapper">
    <div class="insights-header">
      <h2 class="insights-main-title">
        <Icon name="solar:graph-up-bold" size="28" />
        Advanced Insights
      </h2>
      <p class="insights-subtitle">
        AI-powered analysis of your patterns and trends
      </p>
    </div>

    <div
      v-for="(category, key) in categoryInfo"
      :key="key"
      class="insights-card"
    >
      <template v-if="insights[key as keyof CategorizedInsights].length > 0">
        <h3 class="insights-title">
          <Icon
            :name="category.icon"
            size="22"
            :style="{ color: category.color }"
          />
          {{ category.title }}
        </h3>
        <div class="insights-list">
          <div
            v-for="insight in insights[key as keyof CategorizedInsights]"
            :key="insight.text"
            class="insight-item"
          >
            <Icon :name="insight.icon" size="24" class="insight-icon" />
            <div class="insight-content">
              <p class="insight-text">{{ insight.text }}</p>
              <div class="confidence-bar">
                <div
                  class="confidence-fill"
                  :style="{
                    width: `${insight.confidence * 100}%`,
                    backgroundColor: category.color,
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.insights-wrapper {
  display: grid;
  gap: 1.5rem;
}

.insights-header {
  text-align: center;
  margin-bottom: 0.5rem;
}

.insights-main-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
}

.insights-subtitle {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0;
}

.insights-card {
  padding: 1.75rem;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
}

.insights-card:hover {
  box-shadow: var(--shadow-xl);
  border-color: var(--border-hover);
}

.insights-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
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
  gap: 1rem;
  padding: 1.125rem 1.25rem;
  background: var(--note-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.insight-item:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-sm);
  border-color: var(--border-hover);
}

.insight-icon {
  color: var(--primary);
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.insight-content {
  flex: 1;
  min-width: 0;
}

.insight-text {
  margin: 0 0 0.5rem;
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 0.95rem;
}

.confidence-bar {
  height: 3px;
  background: var(--border-light);
  border-radius: 2px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 2px;
}
</style>
