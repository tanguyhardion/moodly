<template>
  <div class="metric-checkbox" @click="toggle" :class="{ checked: isChecked }">
    <div class="checkbox-left">
      <Icon v-if="config.icon" :name="config.icon" size="20" class="metric-icon" :style="iconStyle" />
      <span class="metric-label">{{ config.label }}</span>
    </div>
    <div class="checkbox-toggle">
      <div class="toggle-track" :class="{ active: isChecked }" :style="trackStyle">
        <div class="toggle-thumb"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CheckboxMetricConfig, MetricValue } from '~/types';

const props = defineProps<{
  config: CheckboxMetricConfig;
  modelValue: MetricValue;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const isChecked = computed(() => props.modelValue === true);

const accentColor = computed(() => props.config.color ?? 'var(--primary)');
const iconStyle = computed(() => ({ color: isChecked.value ? accentColor.value : 'var(--text-tertiary)' }));
const trackStyle = computed(() => isChecked.value ? { background: accentColor.value } : {});

function toggle() {
  emit('update:modelValue', !isChecked.value);
}
</script>

<style scoped lang="scss">
.metric-checkbox {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--hover-bg);
  border: 1px solid transparent;
  user-select: none;

  &:hover {
    background: var(--border-light);
    border-color: var(--border-hover);
  }

  &.checked {
    background: var(--primary-rgba-08);
    border-color: var(--primary-rgba-20);
  }

  .checkbox-left {
    display: flex;
    align-items: center;
    gap: 0.625rem;

    .metric-label {
      font-weight: 600;
      font-size: 0.9375rem;
      color: var(--text-primary);
    }
  }

  .checkbox-toggle {
    .toggle-track {
      position: relative;
      width: 2.75rem;
      height: 1.5rem;
      border-radius: var(--radius-full);
      background: var(--border);
      transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      .toggle-thumb {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 1.125rem;
        height: 1.125rem;
        border-radius: 50%;
        background: white;
        box-shadow: var(--shadow-sm);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      &.active .toggle-thumb {
        transform: translateX(1.25rem);
      }
    }
  }
}
</style>
