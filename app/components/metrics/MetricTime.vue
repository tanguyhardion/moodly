<template>
  <div class="metric-time">
    <div class="time-header">
      <Icon v-if="config.icon" :name="config.icon" size="20" class="metric-icon" :style="iconStyle" />
      <span class="metric-label">{{ config.label }}</span>
    </div>
    <input
      type="time"
      :value="currentValue"
      @input="handleInput"
      :placeholder="config.placeholder ?? 'HH:MM'"
      class="time-input"
    />
  </div>
</template>

<script setup lang="ts">
import type { TimeMetricConfig, MetricValue } from '~/types';

const props = defineProps<{
  config: TimeMetricConfig;
  modelValue: MetricValue;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const currentValue = computed(() => {
  const v = props.modelValue;
  return typeof v === 'string' ? v : '';
});

const accentColor = computed(() => props.config.color ?? 'var(--primary)');
const iconStyle = computed(() => ({ color: accentColor.value }));

function handleInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value);
}
</script>

<style scoped lang="scss">
.metric-time {
  .time-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;

    .metric-label {
      font-weight: 600;
      font-size: 0.9375rem;
      color: var(--text-primary);
    }
  }

  .time-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--card-bg);
    color: var(--text-primary);
    font-size: 1rem;
    font-weight: 600;
    font-family: inherit;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--focus-ring);
    }

    &::-webkit-calendar-picker-indicator {
      filter: var(--calendar-icon-filter);
      cursor: pointer;
    }
  }
}
</style>
