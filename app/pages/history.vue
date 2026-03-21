<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">
        <Icon name="solar:history-bold" size="28" class="icon-primary" />
        History
      </h1>
      <p class="page-subtitle">Browse your past entries</p>
    </div>

    <LoadingState v-if="isLoading" message="Loading history..." />

    <div v-else-if="entries.length === 0" class="empty-state">
      <div class="empty-state-icon">
        <Icon name="solar:clipboard-list-bold" size="48" />
      </div>
      <p class="empty-state-title">No entries yet</p>
      <p class="empty-state-description">
        Start logging from the dashboard to see your history here.
      </p>
    </div>

    <div v-else class="history-list">
      <div
        v-for="entry in displayedEntries"
        :key="entry.id"
        class="history-card"
      >
        <div class="card-header">
          <span class="card-date">{{ formatDate(entry.date) }}</span>
          <button
            class="delete-btn"
            @click="handleDelete(entry.id)"
            title="Delete entry"
            type="button"
          >
            <Icon name="solar:trash-bin-trash-bold" size="16" />
          </button>
        </div>
        <div class="card-grouped-metrics">
          <template v-for="[groupName, groupMetrics] in groupedMetrics" :key="groupName">
            <div v-if="hasDataInGroup(entry, groupMetrics)" class="history-metric-group">
              <div v-if="groupName" class="history-group-title">{{ groupName }}</div>
              <div class="card-metrics">
                <template v-for="config in groupMetrics" :key="config.id">
                  <!-- Location with weather -->
                  <div
                    v-if="isValidMetricValue(entry.data[config.id] ?? null, config) && config.type === 'location'"
                    class="metric-chip metric-chip-location"
                  >
                    <Icon v-if="config.icon" :name="config.icon" size="14" :style="{ color: config.color || 'var(--primary)' }" />
                    <span class="chip-label">{{ config.label }}:</span>
                    <span class="chip-value">{{ (entry.data[config.id] as LocationValue).name }}</span>
                    <template v-if="(entry.data[config.id] as LocationValue).weather">
                      <span class="chip-divider">|</span>
                      <Icon :name="getWeatherIcon((entry.data[config.id] as LocationValue).weather!.icon)" size="13" class="weather-icon" />
                      <span class="chip-weather">{{ formatTemperature((entry.data[config.id] as LocationValue).weather!.temperature) }}</span>
                    </template>
                  </div>
                  <!-- Other metric types -->
                  <div v-else-if="isValidMetricValue(entry.data[config.id] ?? null, config)" class="metric-chip">
                    <Icon v-if="config.icon" :name="config.icon" size="14" :style="{ color: config.color || 'var(--primary)' }" />
                    <span class="chip-label">{{ config.label }}{{ config.type !== 'checkbox' ? ':' : '' }}</span>
                    <span v-if="config.type !== 'checkbox'" class="chip-value">{{ formatMetricValue(entry.data[config.id] ?? null, config) }}</span>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </div>
      </div>
      
      <div v-if="displayedCount < sortedEntries.length" ref="loadMoreSentinel" class="load-more-sentinel">
        <Icon name="svg-spinners:ring-resize" size="24" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { MetricConfig, MetricValue, LocationValue, DailyEntry } from '~/types';

const { entries, isLoading, deleteEntry, groupedMetrics } = useMoodly();

const sortedEntries = computed(() =>
  [...entries.value].sort((a, b) => b.date.localeCompare(a.date))
);

const displayedCount = ref(10);
const displayedEntries = computed(() => sortedEntries.value.slice(0, displayedCount.value));

function isValidMetricValue(value: any, config: MetricConfig): boolean {
  if (value == null) return false;
  if (config.type === 'checkbox') return value === true;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (config.type === 'location' && typeof value === 'object') {
    return 'name' in value && (value as LocationValue).name.trim() !== '';
  }
  return true;
}

function hasDataInGroup(entry: DailyEntry, groupMetrics: MetricConfig[]): boolean {
  return groupMetrics.some(config => isValidMetricValue(entry.data[config.id] ?? null, config));
}

const loadMoreSentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  observer = new IntersectionObserver((intersectEntries) => {
    if (intersectEntries[0].isIntersecting) {
      if (displayedCount.value < sortedEntries.value.length) {
        displayedCount.value += 10;
      }
    }
  }, { rootMargin: '200px' });

  watch(loadMoreSentinel, (el) => {
    if (el) {
      observer?.observe(el);
    } else {
      observer?.disconnect();
    }
  }, { immediate: true });
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatMetricValue(value: MetricValue, config: MetricConfig): string {
  if (value == null) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object' && 'name' in value) return (value as LocationValue).name;
  if (config.type === 'slider') return `${value} / ${(config as any).max}`;
  if (config.type === 'number' && (config as any).unit) return `${value} ${(config as any).unit}`;
  return String(value);
}

function getWeatherIcon(icon: string): string {
  const iconMap: Record<string, string> = {
    'sunny': 'solar:sun-bold',
    'partly-cloudy': 'solar:cloud-sun-bold',
    'cloudy': 'solar:cloud-bold',
    'foggy': 'solar:fog-bold',
    'drizzle': 'solar:cloud-rain-bold',
    'rainy': 'solar:cloud-storm-bold',
    'snowy': 'solar:snowflake-bold',
    'stormy': 'solar:cloud-bolt-bold',
  };
  return iconMap[icon] ?? 'solar:cloud-bold';
}

function formatTemperature(temp: number | null): string {
  if (temp === null) return '—';
  return `${Math.round(temp)}°C`;
}

async function handleDelete(id: string) {
  if (confirm('Delete this entry?')) {
    await deleteEntry(id);
  }
}
</script>

<style scoped lang="scss">
.page-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 1.5rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }

  @media (max-width: 480px) {
    padding: 1.5rem 0.75rem;
  }
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--border-hover);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;

    .card-date {
      font-weight: 700;
      font-size: 1rem;
      color: var(--text-primary);
    }

    .delete-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border: none;
      background: transparent;
      color: var(--text-tertiary);
      cursor: pointer;
      border-radius: var(--radius-sm);
      transition: all 0.15s ease;

      &:hover {
        background: rgba(239, 68, 68, 0.1);
        color: var(--error);
      }
    }
  }

  .card-grouped-metrics {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .history-metric-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .history-group-title {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .card-metrics {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    .metric-chip {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.375rem 0.625rem;
      background: var(--hover-bg);
      border-radius: var(--radius-sm);
      font-size: 0.8125rem;

      .chip-label {
        color: var(--text-secondary);
        font-weight: 500;
      }

      .chip-value {
        color: var(--text-primary);
        font-weight: 600;
      }

      &.metric-chip-location {
        .chip-divider {
          color: var(--text-tertiary);
          margin: 0 0.125rem;
        }

        .weather-icon {
          color: var(--primary);
        }

        .chip-weather {
          color: var(--text-secondary);
          font-weight: 500;
        }
      }
    }
  }
}

.load-more-sentinel {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  color: var(--primary);
}
</style>
