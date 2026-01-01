<template>
  <div class="entry-card" @click="$emit('click')">
    <div class="entry-header">
      <div class="entry-date">
        <div class="icon-container">
          <Icon name="solar:calendar-bold" size="24" class="calendar-icon" />
        </div>
        <span>{{ formattedDate }}</span>
      </div>
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
          <span class="metric-value">{{
            entry.metrics[metric.key] !== null
              ? `${entry.metrics[metric.key]}/5`
              : "N/A"
          }}</span>
        </div>
        <div class="metric-bar">
          <div
            class="metric-fill"
            :style="{
              width:
                entry.metrics[metric.key] !== null
                  ? `${(entry.metrics[metric.key] / 5) * 100}%`
                  : '0%',
            }"
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
      >
        <Icon name="solar:sofa-bold" size="16" />
        <span>Day Off</span>
      </div>
      <div
        class="checkbox-display-item"
        :class="{ checked: entry.checkboxes.alcohol }"
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
import type { DailyEntry, MetricConfig } from "~/types";

interface Props {
  entry: DailyEntry;
  metricConfigs: MetricConfig[];
}

const props = defineProps<Props>();
defineEmits<{
  click: [];
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
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.entry-card:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-light);
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.entry-date {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.delete-btn {
  background: none;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.metrics-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  opacity: 0.4;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.checkbox-display-item.checked {
  background: linear-gradient(
    135deg,
    var(--primary-rgba-15) 0%,
    rgba(var(--color-primary-gradient-end), 0.15) 100%
  );
  border-color: var(--primary-rgba-30);
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

.calendar-icon {
  color: var(--primary);
}
</style>
