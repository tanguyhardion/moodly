<script setup lang="ts">
import type { DailyEntry } from "~/types";

interface Props {
  entries: DailyEntry[];
}

const props = defineProps<Props>();

// Check-in configurations with icons and colors
const checkinConfigs = [
  {
    key: "healthyFood" as const,
    name: "Healthy Food",
    icon: "solar:leaf-bold",
    color: "#4ade80",
  },
  {
    key: "caffeine" as const,
    name: "Caffeine",
    icon: "solar:cup-hot-bold",
    color: "#f59e0b",
  },
  {
    key: "gym" as const,
    name: "Gym",
    icon: "solar:dumbbell-large-bold",
    color: "#ef4444",
  },
  {
    key: "hardWork" as const,
    name: "Hard Work",
    icon: "solar:laptop-bold",
    color: "#8b5cf6",
  },
  {
    key: "alcohol" as const,
    name: "Alcohol",
    icon: "solar:cup-star-bold",
    color: "#ec4899",
  },
  {
    key: "misc" as const,
    name: "Misc",
    icon: "solar:star-bold",
    color: "#06b6d4",
  },
];

type CheckinKey = (typeof checkinConfigs)[number]["key"];

// Sort entries by date (oldest first)
const displayedEntries = computed(() => {
  return [...props.entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
});

// Format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

// Check if a habit was checked for a given entry
const isChecked = (entry: DailyEntry, habit: CheckinKey): boolean => {
  return entry.checkboxes?.[habit] ?? false;
};

// Get color for a habit
const getColor = (habit: CheckinKey): string => {
  return checkinConfigs.find((c) => c.key === habit)?.color ?? "#666";
};

// Determine which dates to show on x-axis based on number of entries
const shouldShowLabel = (index: number): boolean => {
  const total = displayedEntries.value.length;
  if (total <= 14) return true; // Show all if 14 or fewer
  if (total <= 30) return index % 2 === 0; // Show every 2nd
  if (total <= 60) return index % 3 === 0; // Show every 3rd
  if (total <= 90) return index % 5 === 0; // Show every 5th
  return index % 7 === 0; // Show every 7th for very large datasets
};
</script>

<template>
  <div class="checkins-timeline">
    <div class="chart-header">
      <h3 class="chart-title">
        <Icon
          name="solar:calendar-mark-bold"
          size="22"
          style="color: #ff6b9d"
        />
        Check-ins Timeline
      </h3>
      <p class="chart-subtitle">Daily habits at a glance</p>
    </div>

    <div v-if="displayedEntries.length === 0" class="empty-state">
      <p>No check-in data available</p>
    </div>

    <div v-else class="timeline-container">
      <!-- Timeline Grid -->
      <div class="timeline-grid">
        <!-- Y-axis labels (habits) -->
        <div class="y-axis">
          <div
            v-for="config in checkinConfigs"
            :key="config.key"
            class="y-label"
          >
            <Icon
              :name="config.icon"
              size="18"
              :style="{ color: config.color }"
            />
            <span>{{ config.name }}</span>
          </div>
        </div>

        <!-- Chart area -->
        <div class="chart-area">
          <!-- Grid rows -->
          <div class="grid-rows">
            <div
              v-for="config in checkinConfigs"
              :key="config.key"
              class="grid-row"
            >
              <div
                v-for="entry in displayedEntries"
                :key="entry.id"
                class="cell"
                :title="`${config.name} on ${formatDate(entry.date)}: ${isChecked(entry, config.key) ? 'Yes' : 'No'}`"
              >
                <span
                  v-if="isChecked(entry, config.key)"
                  class="dot"
                  :style="{ background: config.color }"
                ></span>
                <span v-else class="empty-dot"></span>
              </div>
            </div>
          </div>

          <!-- X-axis labels (dates) -->
          <div class="x-axis">
            <div
              v-for="(entry, index) in displayedEntries"
              :key="entry.id"
              class="x-label"
            >
              <span v-if="shouldShowLabel(index)">
                {{ formatDate(entry.date) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkins-timeline {
  padding: 1.75rem;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}

.checkins-timeline:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--border-hover);
}

.chart-header {
  margin-bottom: 1.5rem;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem;
}

.chart-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-tertiary);
}

.timeline-container {
  overflow-x: hidden;
  width: 100%;
}

.timeline-grid {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.y-axis {
  display: flex;
  flex-direction: column;
  gap: 0;
  flex-shrink: 0;
}

.y-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 36px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
}

.y-label span {
  display: none;
}

@media (min-width: 640px) {
  .y-label span {
    display: inline;
  }
}

.chart-area {
  flex: 1;
  min-width: 0;
}

.grid-rows {
  display: flex;
  flex-direction: column;
}

.grid-row {
  display: flex;
  height: 36px;
  border-bottom: 1px solid var(--border);
}

.grid-row:last-child {
  border-bottom: none;
}

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  flex: 1;
  cursor: default;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.cell:hover .dot {
  transform: scale(1.4);
  box-shadow: 0 0 6px currentColor;
}

.empty-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px dashed var(--border);
  opacity: 0.3;
}

.x-axis {
  display: flex;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
}

.x-label {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  flex: 1;
  font-size: 0.5rem;
  font-weight: 500;
  color: var(--text-tertiary);
  transform: rotate(-45deg);
  transform-origin: center;
  white-space: nowrap;
  height: 2rem;
}

@media (min-width: 640px) {
  .x-label {
    font-size: 0.5625rem;
  }
}
</style>
