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
        v-for="entry in sortedEntries"
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
        <div class="card-metrics">
          <template v-for="config in metricConfigs" :key="config.id">
            <div v-if="entry.data[config.id] != null" class="metric-chip">
              <Icon v-if="config.icon" :name="config.icon" size="14" :style="{ color: config.color || 'var(--primary)' }" />
              <span class="chip-label">{{ config.label }}:</span>
              <span class="chip-value">{{ formatMetricValue(entry.data[config.id] ?? null, config) }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MetricConfig, MetricValue, LocationValue } from '~/types';

const { entries, isLoading, deleteEntry, metricConfigs } = useMoodly();

const sortedEntries = computed(() =>
  [...entries.value].sort((a, b) => b.date.localeCompare(a.date))
);

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
    }
  }
}
</style>
