<template>
  <div class="entry-card" @click="$emit('click')">
    <div class="entry-header">
      <div class="entry-date">
        <Icon name="solar:calendar-bold" size="18" />
        <span>{{ formattedDate }}</span>
      </div>
      <button
        v-if="showDelete"
        @click.stop="$emit('delete')"
        class="delete-btn"
      >
        <Icon name="solar:trash-bin-trash-bold" size="18" />
      </button>
    </div>

    <div class="metrics-grid">
      <div
        v-for="metric in metricConfigs"
        :key="metric.key"
        class="metric-item"
        :style="{ '--metric-color': metric.color }"
      >
        <div class="metric-info">
          <Icon :name="metric.icon" size="20" />
          <span class="metric-value">{{ entry.metrics[metric.key] }}/5</span>
        </div>
        <div class="metric-bar">
          <div
            class="metric-fill"
            :style="{ width: `${(entry.metrics[metric.key] / 5) * 100}%` }"
          ></div>
        </div>
      </div>
    </div>

    <div v-if="entry.checkboxes" class="checkboxes-display">
      <div
        class="checkbox-display-item"
        :class="{ checked: entry.checkboxes.healthyFood }"
      >
        <Icon name="solar:leaf-bold" size="16" />
        <span>Healthy Food</span>
      </div>
      <div
        class="checkbox-display-item"
        :class="{ checked: entry.checkboxes.caffeine }"
        v-if="entry.checkboxes.caffeine !== undefined"
      >
        <Icon name="solar:cup-hot-bold" size="16" />
        <span>Caffeine</span>
      </div>
      <div
        class="checkbox-display-item"
        :class="{ checked: entry.checkboxes.gym }"
      >
        <Icon name="solar:dumbbell-large-bold" size="16" />
        <span>Gym</span>
      </div>
      <div
        class="checkbox-display-item"
        :class="{ checked: entry.checkboxes.hardWork }"
      >
        <Icon name="solar:laptop-bold" size="16" />
        <span>Hard Work</span>
      </div>
      <div
        class="checkbox-display-item"
        :class="{ checked: entry.checkboxes.dayOff }"
        v-if="entry.checkboxes.dayOff !== undefined"
      >
        <Icon name="solar:sofa-bold" size="16" />
        <span>Day Off</span>
      </div>
      <div
        class="checkbox-display-item"
        :class="{ checked: entry.checkboxes.alcohol }"
        v-if="entry.checkboxes.alcohol !== undefined"
      >
        <Icon name="solar:cup-star-bold" size="16" />
        <span>Alcohol</span>
      </div>
      <div
        class="checkbox-display-item"
        :class="{ checked: entry.checkboxes.misc }"
      >
        <Icon name="solar:star-bold" size="16" />
        <span>Misc</span>
      </div>
    </div>

    <div v-if="entry.note" class="entry-note">
      <Icon name="solar:notes-bold" size="16" />
      <p>{{ entry.note }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MoodEntry, MetricConfig } from "~/types";

interface Props {
  entry: MoodEntry;
  metricConfigs: MetricConfig[];
  showDelete?: boolean;
}

const props = defineProps<Props>();
defineEmits<{
  click: [];
  delete: [];
}>();

const formattedDate = computed(() => {
  const date = new Date(props.entry.date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (props.entry.date === today.toISOString().split("T")[0]) {
    return "Today";
  } else if (props.entry.date === yesterday.toISOString().split("T")[0]) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }
});
</script>

<style scoped>
.entry-card {
  padding: 1.75rem;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.entry-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #ff6b9d 0%, #ffa06b 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.entry-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-hover);
}

.entry-card:hover::before {
  opacity: 1;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.entry-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.delete-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.375rem;
  border-radius: var(--radius-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  transform: scale(1.1);
}

.delete-btn:active {
  transform: scale(0.95);
}

.metrics-grid {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--metric-color);
  font-size: 0.875rem;
  font-weight: 500;
}

.metric-value {
  color: var(--text-primary);
}

.metric-bar {
  height: 8px;
  background: var(--slider-track);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.metric-fill {
  height: 100%;
  background: var(--metric-color);
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.checkboxes-display {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.checkbox-display-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: var(--slider-track);
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
  opacity: 0.5;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.checkbox-display-item.checked {
  background: linear-gradient(
    135deg,
    rgba(255, 107, 157, 0.15) 0%,
    rgba(255, 160, 107, 0.15) 100%
  );
  border-color: rgba(255, 107, 157, 0.3);
  color: var(--primary);
  opacity: 1;
  transform: scale(1.02);
}

.checkbox-display-item.checked :deep(svg) {
  color: var(--primary);
}

.entry-note {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.125rem;
  background: var(--note-bg);
  border-radius: var(--radius-sm);
  border-left: 4px solid var(--primary);
  border: 1px solid var(--border-light);
  border-left: 4px solid var(--primary);
  transition: all 0.3s ease;
}

.entry-note:hover {
  box-shadow: var(--shadow-sm);
}

.entry-note p {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.6;
  flex: 1;
}
</style>
