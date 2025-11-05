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
        :class="{ checked: entry.checkboxes.gym }"
      >
        <Icon name="solar:dumbbell-large-bold" size="16" />
        <span>Gym</span>
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
  padding: 1.5rem;
  background: var(--card-bg);
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.entry-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
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
  padding: 0.25rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
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
  height: 6px;
  background: var(--slider-track);
  border-radius: 3px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  background: var(--metric-color);
  border-radius: 3px;
  transition: width 0.5s ease;
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
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: var(--slider-track);
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  opacity: 0.5;
  transition: all 0.2s ease;
}

.checkbox-display-item.checked {
  background: linear-gradient(
    135deg,
    rgba(255, 107, 157, 0.2) 0%,
    rgba(255, 160, 107, 0.2) 100%
  );
  color: var(--primary);
  opacity: 1;
}

.checkbox-display-item.checked :deep(svg) {
  color: var(--primary);
}

.entry-note {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--note-bg);
  border-radius: 0.5rem;
  border-left: 3px solid var(--primary);
}

.entry-note p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  flex: 1;
}
</style>
