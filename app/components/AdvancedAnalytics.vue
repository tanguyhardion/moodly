<template>
  <div class="advanced-analytics">
    <div class="header">
      <h3 class="insights-title">
        <Icon name="solar:chart-square-bold" size="22" style="color: #ff6b9d" />
        Advanced Insights (all entries)
      </h3>
      <button @click="refresh" class="refresh-btn" :disabled="isLoading">
        <Icon name="heroicons:arrow-path" :class="{ spin: isLoading }" />
      </button>
    </div>

    <div v-if="isLoading && !insights.length" class="loading-state">
      <LoadingState message="Analyzing your data..." />
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="refresh">Try Again</button>
    </div>

    <div v-else-if="insights.length === 0" class="empty-state">
      <Icon name="heroicons:chart-bar" class="empty-icon" />
      <p>Not enough data yet to generate insights.</p>
      <p class="sub-text">Keep tracking your mood to unlock patterns!</p>
    </div>

    <div v-else>
      <div class="insights-info">
        <Icon name="heroicons:information-circle" class="info-icon" />
        <p>
          Insights are ranked by <strong>Strength</strong>, which indicates how
          consistent or significant a pattern is in your data.
        </p>
      </div>

      <div class="insights-grid">
        <div
          v-for="(insight, index) in insights"
          :key="index"
          class="insight-card"
          :class="insight.type"
        >
          <div class="insight-header">
            <span class="category-badge">{{ insight.category }}</span>
            <div class="score-container" v-if="insight.score">
              <span class="score-label">Strength</span>
              <div class="score-indicator">
                <div
                  class="score-bar"
                  :style="{ width: Math.min(insight.score * 100, 100) + '%' }"
                ></div>
              </div>
              <span class="score-value"
                >{{ Math.round(Math.min(insight.score * 100, 100)) }}%</span
              >
            </div>
          </div>
          <p class="insight-text">{{ insight.text }}</p>
          <p v-if="insight.details" class="insight-details">
            {{ insight.details }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { insights, isLoading, error, fetchAnalytics } = useAnalytics();

onMounted(() => {
  fetchAnalytics();
});

const refresh = () => {
  fetchAnalytics();
};
</script>

<style scoped>
.advanced-analytics {
  margin-bottom: 2rem;
  padding: 1.75rem;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.advanced-analytics:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--border-hover);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.insights-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.refresh-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: var(--bg-secondary);
  color: var(--primary);
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
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border);
}

.info-icon {
  color: var(--primary);
  font-size: 1.25rem;
  flex-shrink: 0;
}

.insights-info p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.insight-card {
  padding: 1.25rem;
  border-radius: 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  box-shadow: var(--shadow-sm);
}

.insight-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.insight-card.correlation {
  border-left: 4px solid #3b82f6;
}
.insight-card.pattern {
  border-left: 4px solid #8b5cf6;
}
.insight-card.comparative {
  border-left: 4px solid #10b981;
}
.insight-card.trigger {
  border-left: 4px solid #f59e0b;
}
.insight-card.day_off {
  border-left: 4px solid #ef4444;
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.category-badge {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--text-secondary);
}

.score-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.score-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-weight: 600;
}

.score-indicator {
  width: 40px;
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  overflow: hidden;
}

.score-bar {
  height: 100%;
  background: var(--primary);
  border-radius: 2px;
}

.score-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 2rem;
  text-align: right;
}

.insight-text {
  font-size: 1rem;
  color: var(--text-primary);
  line-height: 1.5;
  margin: 0;
}

.insight-details {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.sub-text {
  font-size: 0.875rem;
  opacity: 0.8;
}

.error-state {
  text-align: center;
  color: #ef4444;
  padding: 2rem;
}
</style>
