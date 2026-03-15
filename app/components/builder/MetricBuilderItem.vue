<template>
  <div class="metric-item">
    <div class="metric-item-handle" title="Drag to reorder">
      <Icon name="solar:hamburger-menu-bold" size="16" />
    </div>
    <div class="metric-item-icon">
      <Icon
        :name="metric.icon || getDefaultIcon(metric.type)"
        size="20"
        :style="{ color: metric.color || 'var(--primary)' }"
      />
    </div>
    <div class="metric-item-info">
      <div class="metric-item-label-row">
        <span class="metric-item-label">{{ metric.label }}</span>
        <span v-if="metric.group" class="metric-item-group">
          <Icon name="solar:folder-bold" size="10" />
          {{ metric.group }}
        </span>
      </div>
      <span class="metric-item-type">{{ getTypeLabel(metric.type) }}</span>
    </div>
    <div class="metric-item-actions">
      <button class="action-btn" @click="emit('move-up')" :disabled="isFirst" title="Move up" type="button">
        <Icon name="solar:alt-arrow-up-bold" size="16" />
      </button>
      <button class="action-btn" @click="emit('move-down')" :disabled="isLast" title="Move down" type="button">
        <Icon name="solar:alt-arrow-down-bold" size="16" />
      </button>
      <button class="action-btn" @click="emit('edit')" title="Edit" type="button">
        <Icon name="solar:pen-bold" size="16" />
      </button>
      <button class="action-btn delete" @click="emit('delete')" title="Delete" type="button">
        <Icon name="solar:trash-bin-trash-bold" size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MetricConfig, MetricType } from '~/types';
import { METRIC_TYPE_OPTIONS } from '~/types';

defineProps<{
  metric: MetricConfig;
  isFirst: boolean;
  isLast: boolean;
}>();

const emit = defineEmits<{
  'edit': [];
  'delete': [];
  'move-up': [];
  'move-down': [];
}>();

function getTypeLabel(type: MetricType): string {
  return METRIC_TYPE_OPTIONS.find(o => o.type === type)?.label ?? type;
}

function getDefaultIcon(type: MetricType): string {
  return METRIC_TYPE_OPTIONS.find(o => o.type === type)?.icon ?? 'solar:widget-bold';
}
</script>

<style scoped lang="scss">
.metric-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 0.875rem;
  background: var(--hover-bg);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--border-hover);
  }

  .metric-item-handle {
    color: var(--text-tertiary);
    cursor: grab;
    flex-shrink: 0;
  }

  .metric-item-icon {
    flex-shrink: 0;
  }

  .metric-item-info {
    flex: 1;
    min-width: 0;

    .metric-item-label-row {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      min-width: 0;
    }

    .metric-item-label {
      display: block;
      font-weight: 600;
      font-size: 0.9375rem;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .metric-item-type {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      font-weight: 500;
    }

    .metric-item-group {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-secondary);
      background: var(--border);
      padding: 0.1rem 0.4rem;
      border-radius: var(--radius-full);
      flex-shrink: 0;
    }
  }

  .metric-item-actions {
    display: flex;
    gap: 0.25rem;
    flex-shrink: 0;

    .action-btn {
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

      &:hover:not(:disabled) {
        background: var(--primary-rgba-08);
        color: var(--primary);
      }

      &.delete:hover {
        background: rgba(239, 68, 68, 0.1);
        color: var(--error);
      }

      &:disabled {
        opacity: 0.25;
        cursor: not-allowed;
      }
    }
  }
}

@media (max-width: 640px) {
  .metric-item-actions .action-btn {
    width: 26px;
    height: 26px;
  }
}
</style>
