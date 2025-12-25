<template>
  <div class="advanced-analytics">
    <div class="header">
      <h2>Advanced Insights</h2>
      <button @click="refresh" class="refresh-btn" :disabled="isLoading">
        <Icon name="heroicons:arrow-path" :class="{ 'spin': isLoading }" />
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

    <div v-else class="insights-grid">
      <div
        v-for="(insight, index) in insights"
        :key="index"
        class="insight-card"
        :class="insight.type"
      >
        <div class="insight-header">
          <span class="category-badge">{{ insight.category }}</span>
          <div class="score-indicator" v-if="insight.score">
            <div class="score-bar" :style="{ width: Math.min(insight.score * 100, 100) + '%' }"></div>
          </div>
        </div>
        <p class="insight-text">{{ insight.text }}</p>
        <p v-if="insight.details" class="insight-details">{{ insight.details }}</p>
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
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--card-bg);
  border-radius: 1rem;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 1.25rem;
  font-weight: 600;
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
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: var(--shadow-sm);
}

.insight-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.insight-card.correlation { border-left: 4px solid #3b82f6; }
.insight-card.pattern { border-left: 4px solid #8b5cf6; }
.insight-card.comparative { border-left: 4px solid #10b981; }
.insight-card.trigger { border-left: 4px solid #f59e0b; }

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
