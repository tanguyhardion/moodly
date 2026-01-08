<script setup lang="ts">
import type { DailyEntry } from "~/types";

interface Props {
  entries: DailyEntry[];
}

const props = defineProps<Props>();

// Calculate sleep hours statistics
const sleepStats = computed(() => {
  const entriesWithSleep = props.entries.filter(
    (entry) => entry.metrics.sleepHours !== null,
  );

  if (entriesWithSleep.length === 0) {
    return {
      average: 0,
      min: 0,
      max: 0,
      total: 0,
      hasData: false,
    };
  }

  const hours = entriesWithSleep.map((e) => e.metrics.sleepHours!);
  const total = hours.reduce((sum, h) => sum + h, 0);
  const average = total / hours.length;
  const min = Math.min(...hours);
  const max = Math.max(...hours);

  return {
    average: Math.round(average * 10) / 10,
    min,
    max,
    total: entriesWithSleep.length,
    hasData: true,
  };
});

// Distribution: group by hour ranges
const sleepDistribution = computed(() => {
  const entriesWithSleep = props.entries.filter(
    (entry) => entry.metrics.sleepHours !== null,
  );

  if (entriesWithSleep.length === 0) return [];

  const ranges = [
    { label: "< 5h", min: 0, max: 5, count: 0 },
    { label: "5-6h", min: 5, max: 6, count: 0 },
    { label: "6-7h", min: 6, max: 7, count: 0 },
    { label: "7-8h", min: 7, max: 8, count: 0 },
    { label: "8-9h", min: 8, max: 9, count: 0 },
    { label: "> 9h", min: 9, max: 24, count: 0 },
  ];

  entriesWithSleep.forEach((entry) => {
    const hours = entry.metrics.sleepHours!;
    const range = ranges.find((r) => hours >= r.min && hours < r.max);
    if (range) range.count++;
  });

  const maxCount = Math.max(...ranges.map((r) => r.count));

  return ranges.map((r) => ({
    ...r,
    percentage: maxCount > 0 ? Math.round((r.count / maxCount) * 100) : 0,
  }));
});

// Get recommendation based on average
const sleepRecommendation = computed(() => {
  if (!sleepStats.value.hasData) return null;

  const avg = sleepStats.value.average;
  if (avg < 6) {
    return {
      icon: "solar:danger-circle-bold",
      color: "#ef4444",
      text: "You're getting significantly less sleep than recommended (7-9 hours).",
    };
  } else if (avg < 7) {
    return {
      icon: "solar:info-circle-bold",
      color: "#f59e0b",
      text: "Consider getting a bit more sleep for optimal health.",
    };
  } else if (avg <= 9) {
    return {
      icon: "solar:check-circle-bold",
      color: "#10b981",
      text: "You're getting a healthy amount of sleep!",
    };
  } else {
    return {
      icon: "solar:info-circle-bold",
      color: "#f59e0b",
      text: "You're sleeping more than average. Make sure it's restful!",
    };
  }
});
</script>

<template>
  <div class="sleep-hours-card">
    <div class="sleep-header">
      <div class="icon-container">
        <Icon name="solar:moon-stars-bold" size="24" class="icon-pink" />
      </div>
      <h3 class="sleep-title">Sleep Hours</h3>
    </div>

    <div v-if="!sleepStats.hasData" class="no-data">
      <Icon name="solar:moon-sleep-bold" size="48" />
      <p>No sleep hours data for this period</p>
    </div>

    <div v-else class="sleep-content">
      <!-- Main Stats -->
      <div class="sleep-main-stats">
        <div class="stat-box primary">
          <Icon name="solar:moon-stars-bold" size="32" />
          <div class="stat-value">{{ sleepStats.average }}h</div>
          <div class="stat-label">Average</div>
        </div>
        <div class="stat-box">
          <Icon name="solar:arrow-down-bold" size="24" />
          <div class="stat-value">{{ sleepStats.min }}h</div>
          <div class="stat-label">Minimum</div>
        </div>
        <div class="stat-box">
          <Icon name="solar:arrow-up-bold" size="24" />
          <div class="stat-value">{{ sleepStats.max }}h</div>
          <div class="stat-label">Maximum</div>
        </div>
      </div>

      <!-- Distribution -->
      <div class="sleep-distribution">
        <h4 class="distribution-title">Sleep Distribution</h4>
        <div class="distribution-bars">
          <div
            v-for="range in sleepDistribution"
            :key="range.label"
            class="distribution-item"
          >
            <span class="range-label">{{ range.label }}</span>
            <div class="range-bar-container">
              <div
                class="range-bar"
                :style="{ width: range.percentage + '%' }"
              ></div>
            </div>
            <span class="range-count">{{ range.count }}</span>
          </div>
        </div>
      </div>

      <!-- Recommendation -->
      <div
        v-if="sleepRecommendation"
        class="sleep-recommendation"
        :style="{ '--rec-color': sleepRecommendation.color }"
      >
        <Icon :name="sleepRecommendation.icon" size="20" />
        <p>{{ sleepRecommendation.text }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sleep-hours-card {
  padding: 1.75rem;
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-xl);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-light);
  }
}

.sleep-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.sleep-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: var(--text-tertiary);

  :deep(svg) {
    opacity: 0.3;
    margin-bottom: 1rem;
  }

  p {
    margin: 0;
    font-size: 0.9375rem;
  }
}

.sleep-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sleep-main-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;

  .stat-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.25rem;
    background: var(--slider-track);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }

    &.primary {
      background: linear-gradient(
        135deg,
        var(--primary-rgba-15) 0%,
        rgba(var(--color-primary-gradient-end), 0.15) 100%
      );
      border-color: var(--primary-rgba-30);

      :deep(svg) {
        color: var(--primary);
      }

      .stat-value {
        color: var(--primary);
        font-size: 2rem;
      }
    }

    :deep(svg) {
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
  }
}

.sleep-distribution {
  .distribution-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 1rem;
  }

  .distribution-bars {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  .distribution-item {
    display: grid;
    grid-template-columns: 60px 1fr 40px;
    align-items: center;
    gap: 0.75rem;

    .range-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .range-bar-container {
      height: 24px;
      background: var(--slider-track);
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 1px solid var(--border);
    }

    .range-bar {
      height: 100%;
      background: linear-gradient(
        90deg,
        var(--primary) 0%,
        var(--primary-light) 100%
      );
      border-radius: var(--radius-sm);
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.2);
    }

    .range-count {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-primary);
      text-align: right;
    }
  }
}

.sleep-recommendation {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(var(--rec-color), 0.1);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(var(--rec-color), 0.2);

  :deep(svg) {
    color: var(--rec-color);
    flex-shrink: 0;
    margin-top: 2px;
  }

  p {
    margin: 0;
    font-size: 0.9375rem;
    color: var(--text-primary);
    line-height: 1.5;
  }
}
</style>
