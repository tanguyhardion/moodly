<script setup lang="ts">
defineProps<{
  insights: { icon: string; text: string }[];
}>();
</script>

<template>
  <div class="insights-card">
    <h3 class="insights-title">
      <Icon name="solar:lightbulb-bolt-bold" size="22" style="color: #ffd60a" />
      Insights
    </h3>
    <div class="insights-list">
      <div v-for="insight in insights" :key="insight.text" class="insight-item">
        <Icon :name="insight.icon" size="24" class="insight-icon" />
        <p class="insight-text">{{ insight.text }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
}

.insight-text {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
}
</style>
