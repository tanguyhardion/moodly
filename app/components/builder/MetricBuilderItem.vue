<template>
  <div class="flex items-center gap-3 rounded-2xl bg-surface-2 p-2.5 pl-3">
    <div
      class="grid size-10 shrink-0 place-items-center rounded-xl"
      :style="{ background: hexToRgba(metric.color || '', 0.16), color: metric.color || 'var(--mood-strong)' }"
    >
      <Icon :name="metric.icon || getDefaultIcon(metric.type)" size="20" />
    </div>
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <span class="truncate font-semibold">{{ metric.label }}</span>
        <span v-if="metric.group" class="shrink-0 rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-muted">
          {{ metric.group }}
        </span>
      </div>
      <span class="text-[13px] text-muted">{{ getTypeLabel(metric.type) }}</span>
    </div>
    <div class="flex shrink-0 items-center">
      <button class="icon-btn size-8" :disabled="isFirst" title="Move up" type="button" @click="emit('move-up')">
        <Icon name="solar:alt-arrow-up-bold" size="16" />
      </button>
      <button class="icon-btn size-8" :disabled="isLast" title="Move down" type="button" @click="emit('move-down')">
        <Icon name="solar:alt-arrow-down-bold" size="16" />
      </button>
      <button class="icon-btn size-8" title="Edit" type="button" @click="emit('edit')">
        <Icon name="solar:pen-bold" size="16" />
      </button>
      <button class="icon-btn size-8 hover:bg-danger/15 hover:text-danger" title="Delete" type="button" @click="emit('delete')">
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
