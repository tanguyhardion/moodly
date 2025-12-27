<template>
  <div class="insight-category-card" :class="type">
    <div class="card-header">
      <div class="icon-container">
        <Icon :name="icon" size="24" />
      </div>
      <div class="header-content">
        <h3>{{ title }}</h3>
        <p v-if="description" class="description">{{ description }}</p>
      </div>
    </div>

    <div class="insights-container">
      <div
        v-for="(insight, index) in insights"
        :key="index"
        class="insight-row"
      >
        <div class="insight-main">
          <div class="insight-text-content">
            <p class="insight-text">{{ insight.text }}</p>
            <p v-if="insight.details" class="insight-details">
              {{ insight.details }}
            </p>
          </div>
          
          <div v-if="insight.score" class="strength-indicator">
            <div class="strength-label">Strength</div>
            <div class="strength-track">
              <div 
                class="strength-fill" 
                :style="{ width: Math.min(insight.score * 100, 100) + '%' }"
              ></div>
            </div>
            <div class="strength-value">{{ Math.round(insight.score * 100) }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AnalyticsInsight } from "~/types";

defineProps<{
  title: string;
  type: string;
  icon: string;
  description?: string;
  insights: AnalyticsInsight[];
}>();
</script>

<style scoped>
.insight-category-card {
  background: var(--card-bg);
  border-radius: 1.5rem;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  overflow: hidden;
}

.insight-category-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-light);
}

.card-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  border-bottom: 1px solid var(--border);
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 1rem;
  background: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.18);
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.insight-category-card:hover .icon-container {
  transform: scale(1.1) rotate(-5deg);
}

/* Type-specific colors */
.insight-category-card.habit-impact .icon-container { color: #3b82f6; }
.insight-category-card.metric-connection .icon-container { color: #ec4899; }
.insight-category-card.habit-pattern .icon-container { color: #06b6d4; }
.insight-category-card.weekly-trend .icon-container { color: #8b5cf6; }
.insight-category-card.long-term-trend .icon-container { color: #10b981; }
.insight-category-card.trigger .icon-container { color: #f59e0b; }
.insight-category-card.synergy .icon-container { color: #f97316; }

.header-content h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.description {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.insights-container {
  padding: 0.5rem 0;
  flex-grow: 1;
}

.insight-row {
  padding: 1.25rem 1.5rem;
  position: relative;
}

.insight-row:last-child {
  border-bottom: none;
}

.insight-main {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.insight-text {
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-primary);
  font-weight: 600;
}

.insight-details {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  opacity: 0.9;
}

.strength-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.strength-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
  min-width: 60px;
}

.strength-track {
  flex-grow: 1;
  height: 6px;
  background: var(--border-light);
  border-radius: 10px;
  overflow: hidden;
  max-width: 120px;
}

.strength-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: 10px;
  transition: width 1s ease-out;
}

.strength-value {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
  min-width: 35px;
}

/* Dark mode overrides */
:global(.dark) .card-header {
  background: linear-gradient(to bottom right, #1f2937, #111827);
}

:global(.dark) .icon-container {
  background: #374151;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

:global(.dark) .strength-track {
  background: #374151;
}
</style>
