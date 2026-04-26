<template>
  <section class="insight-section">
    <div class="insight-section-header">
      <Icon name="solar:bolt-circle-bold" size="20" style="color: var(--primary)" />
      <h2 class="insight-section-title">Habit Ripple Effects</h2>
    </div>
    <div class="insight-card">
      <p class="insight-card-subtitle">How your habits impact metrics over the next few days</p>
      <div class="effects-list">
        <div v-for="effect in habitEffects" :key="`${effect.habitId}-${effect.metricId}`" class="effect-item">
          <div class="effect-header">
            <div class="habit-metric-pair">
              <div class="icon-badge" :style="{ background: hexToRgba(effect.habitColor, 0.12) }">
                <Icon v-if="effect.habitIcon" :name="effect.habitIcon" size="16" :style="{ color: effect.habitColor }" />
                <Icon v-else name="solar:check-circle-bold" size="16" :style="{ color: effect.habitColor }" />
              </div>
              <div class="labels">
                <div class="habit-label">{{ effect.habitLabel }}</div>
                <div class="metric-label">→ {{ effect.metricLabel }}</div>
              </div>
            </div>
            <div class="effect-badge" :class="effect.strongestEffect > 0 ? 'positive' : 'negative'">
              <span v-if="effect.strongestEffect > 0">+</span>{{ fmtNum(Math.abs(effect.strongestEffect), { color: effect.metricColor, type: 'slider' }) }}
            </div>
          </div>

          <div class="days-grid">
            <div v-for="day in [1, 2, 3]" :key="day" class="day-cell">
              <div class="day-label">Day {{ day }}</div>
              <div class="day-value">{{ getDayValue(effect, day) }}</div>
              <div class="day-delta" :class="getDayDelta(effect, day) > 0 ? 'positive' : getDayDelta(effect, day) < 0 ? 'negative' : 'neutral'">
                <Icon :name="getDayDelta(effect, day) > 0 ? 'solar:arrow-up-bold' : getDayDelta(effect, day) < 0 ? 'solar:arrow-down-bold' : 'solar:minus-bold'" size="12" />
                {{ fmtNum(Math.abs(getDayDelta(effect, day)), { color: effect.metricColor, type: 'slider' }) }}
              </div>
            </div>
          </div>

          <div class="effect-summary">
            <span class="summary-text">{{ getEffectSummary(effect) }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HabitEffectItem } from '~/composables/useInsightsData';

const { habitEffects } = useInsightsData();

const getDayValue = (effect: HabitEffectItem, day: number): string => {
  if (day === 1) return effect.day1Avg > 0 ? fmtNum(effect.day1Avg, { color: effect.metricColor, type: 'slider' }) : '—';
  if (day === 2) return effect.day2Avg > 0 ? fmtNum(effect.day2Avg, { color: effect.metricColor, type: 'slider' }) : '—';
  return effect.day3Avg > 0 ? fmtNum(effect.day3Avg, { color: effect.metricColor, type: 'slider' }) : '—';
};

const getDayDelta = (effect: HabitEffectItem, day: number): number => {
  if (day === 1) return effect.day1Delta;
  if (day === 2) return effect.day2Delta;
  return effect.day3Delta;
};

const getEffectSummary = (effect: HabitEffectItem): string => {
  const direction = effect.strongestEffect > 0 ? 'higher' : 'lower';
  const magnitude = Math.abs(effect.strongestEffect);
  return `${effect.metricLabel} is ${magnitude > 1.5 ? 'significantly' : 'moderately'} ${direction} on day ${effect.strongestDay} after this habit.`;
};
</script>

<style scoped lang="scss">
.insight-section {
  margin-bottom: 2rem;
}

.insight-section-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 1rem;
}

.insight-section-title {
  font-size: 1.0625rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.insight-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 1.25rem 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: var(--shadow-md);
  }
}

.insight-card-subtitle {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin: -0.5rem 0 1rem;
}

.effects-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.effect-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--hover-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}

.effect-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.habit-metric-pair {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.icon-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.labels {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.habit-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.effect-badge {
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;

  &.positive {
    background: rgba(16, 185, 129, 0.12);
    color: var(--success);
  }

  &.negative {
    background: rgba(239, 68, 68, 0.12);
    color: var(--error);
  }
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.day-cell {
  padding: 0.625rem;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  text-align: center;
  font-size: 0.75rem;
}

.day-label {
  color: var(--text-tertiary);
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.day-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.day-delta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-weight: 600;
  font-size: 0.6875rem;

  &.positive {
    color: var(--success);
  }

  &.negative {
    color: var(--error);
  }

  &.neutral {
    color: var(--text-tertiary);
  }
}

.effect-summary {
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
}

.summary-text {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.4;
}
</style>
