<template>
  <div class="advanced-analytics-container">
    <div class="header-section">
      <button @click="refresh" class="refresh-btn" :disabled="isLoading">
        <Icon name="heroicons:arrow-path" :class="{ spin: isLoading }" />
        <span>Refresh Analysis</span>
      </button>
    </div>

    <div v-if="isLoading && !insights.length" class="loading-state">
      <LoadingState message="Analyzing your data..." />
    </div>

    <div v-else-if="error" class="error-state">
      <Icon name="solar:danger-circle-bold" size="48" class="error-icon" />
      <h3>Analysis Failed</h3>
      <p>{{ error }}</p>
      <button @click="refresh" class="retry-btn">Try Again</button>
    </div>

    <div v-else-if="insights.length === 0" class="empty-state">
      <div class="empty-content">
        <Icon name="solar:graph-new-bold" size="64" class="empty-icon" />
        <h3>No Insights Yet</h3>
        <p>
          Keep tracking your mood to unlock personalized patterns and trends.
        </p>
        <p class="sub-text">
          We need a bit more data to generate meaningful insights.
        </p>
      </div>
    </div>

    <div v-else class="insights-content">
      <div class="insights-info">
        <Icon name="heroicons:information-circle" class="info-icon" />
        <p>
          Insights are ranked by <strong>Strength</strong>, indicating the
          statistical significance of each pattern.
        </p>
      </div>

      <div class="category-grid">
        <InsightCategoryCard
          v-for="(group, type) in groupedInsights"
          :key="type"
          :title="insightConfig[type]?.title || type"
          :type="String(type)"
          :icon="insightConfig[type]?.icon || 'solar:graph-bold'"
          :description="insightConfig[type]?.description"
          :insights="group"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AnalyticsInsight } from "~/types";

const { insights, isLoading, error, fetchAnalytics } = useAnalytics();

const insightConfig: Record<
  string,
  { title: string; icon: string; description: string }
> = {
  "weekly-trend": {
    title: "Weekly Trends",
    icon: "solar:calendar-mark-bold",
    description: "Patterns detected across days of the week",
  },
  "habit-impact": {
    title: "Habit Impact",
    icon: "solar:rocket-bold",
    description: "How specific habits influence your metrics",
  },
  "metric-connection": {
    title: "Metric Connections",
    icon: "solar:link-circle-bold",
    description: "Correlations between different metrics",
  },
  "habit-pattern": {
    title: "Habit Patterns",
    icon: "solar:checklist-minimalistic-bold",
    description: "Recurring combinations of habits",
  },
  "habit-comparison": {
    title: "Habit Comparisons",
    icon: "solar:scale-bold",
    description: "Comparing the effects of different habits",
  },
  trigger: {
    title: "Triggers",
    icon: "solar:bell-bing-bold",
    description: "Potential triggers for mood changes",
  },
  "long-term-trend": {
    title: "Long-term Trends",
    icon: "solar:graph-up-bold",
    description: "Trends observed over longer periods",
  },
  synergy: {
    title: "Synergies",
    icon: "solar:stars-minimalistic-bold",
    description: "Combined effects of multiple factors",
  },
};

const groupedInsights = computed(() => {
  const groups: Record<string, AnalyticsInsight[]> = {};

  // Sort insights by score first
  const sortedInsights = [...insights.value].sort((a, b) => b.score - a.score);

  sortedInsights.forEach((insight) => {
    if (!groups[insight.type]) {
      groups[insight.type] = [];
    }
    groups[insight.type].push(insight);
  });

  return groups;
});

onMounted(() => {
  fetchAnalytics();
});

const refresh = () => {
  fetchAnalytics(true);
};
</script>

<style scoped lang="scss">
.advanced-analytics-container {
  width: 100%;
}

.header-section {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.title-icon {
  color: var(--primary);
}

.section-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--surface-ground);
  border: 1px solid var(--border);
  color: var(--text-primary);
  padding: 0.625rem 1rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: var(--bg-secondary);
    border-color: var(--border-hover);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.insights-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: var(--bg-secondary);
  border-radius: 0.75rem;
  margin-bottom: 2rem;
  border: 1px solid var(--border);

  p {
    margin: 0;
    font-size: 0.95rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }
}

.info-icon {
  color: var(--primary);
  font-size: 1.5rem;
  flex-shrink: 0;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  display: flex;
  justify-content: center;
  padding: 4rem 1rem;
}

.empty-content {
  text-align: center;
  max-width: 400px;
  padding: 3rem;
  background: var(--card-bg);
  border-radius: 1.5rem;
  border: 1px solid var(--border);

  h3 {
    margin: 0 0 0.75rem 0;
    font-size: 1.5rem;
    color: var(--text-primary);
  }

  p {
    margin: 0;
    color: var(--text-secondary);
    line-height: 1.6;
  }
}

.empty-icon {
  color: var(--text-tertiary);
  margin-bottom: 1.5rem;
}

.sub-text {
  margin-top: 0.5rem !important;
  font-size: 0.9rem;
  opacity: 0.8;
}

.error-state {
  text-align: center;
  padding: 4rem 1rem;
  background: var(--card-bg);
  border-radius: 1.5rem;
  border: 1px solid var(--border);
}

.error-icon {
  color: #ef4444;
  margin-bottom: 1rem;
}

.retry-btn {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
}

@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: 1fr;
  }

  .header-section {
    flex-direction: column;
    align-items: stretch;
  }

  .refresh-btn {
    justify-content: center;
  }
}
</style>
