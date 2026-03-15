<template>
  <div class="metric-number">
    <div class="number-header">
      <Icon v-if="config.icon" :name="config.icon" size="20" class="metric-icon" :style="iconStyle" />
      <span class="metric-label">{{ config.label }}</span>
    </div>
    <div class="number-input-row">
      <button class="step-btn" @click="decrement" :disabled="atMin" type="button">
        <Icon name="solar:minus-circle-bold" size="22" />
      </button>
      <div class="value-display">
        <input
          type="number"
          :value="currentValue"
          @input="handleInput"
          :min="config.min"
          :max="config.max"
          :step="config.step ?? 1"
          :placeholder="config.placeholder ?? '0'"
          class="number-field"
        />
        <span v-if="config.unit" class="unit">{{ config.unit }}</span>
      </div>
      <button class="step-btn" @click="increment" :disabled="atMax" type="button">
        <Icon name="solar:add-circle-bold" size="22" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NumberMetricConfig, MetricValue } from '~/types';

const props = defineProps<{
  config: NumberMetricConfig;
  modelValue: MetricValue;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

const currentValue = computed(() => {
  const v = props.modelValue;
  return typeof v === 'number' ? v : (props.config.min ?? 0);
});

const step = computed(() => props.config.step ?? 1);
const atMin = computed(() => props.config.min != null && currentValue.value <= props.config.min);
const atMax = computed(() => props.config.max != null && currentValue.value >= props.config.max);

const accentColor = computed(() => props.config.color ?? 'var(--primary)');
const iconStyle = computed(() => ({ color: accentColor.value }));

function increment() {
  let next = currentValue.value + step.value;
  if (props.config.max != null) next = Math.min(next, props.config.max);
  emit('update:modelValue', next);
}

function decrement() {
  let next = currentValue.value - step.value;
  if (props.config.min != null) next = Math.max(next, props.config.min);
  emit('update:modelValue', next);
}

function handleInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value;
  let val = parseFloat(raw);
  if (isNaN(val)) val = props.config.min ?? 0;
  if (props.config.min != null) val = Math.max(val, props.config.min);
  if (props.config.max != null) val = Math.min(val, props.config.max);
  emit('update:modelValue', val);
}
</script>

<style scoped lang="scss">
.metric-number {
  .number-header {
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

  .number-input-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .step-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: var(--radius-md);
      background: var(--hover-bg);
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;

      &:hover:not(:disabled) {
        background: var(--primary-rgba-12);
        color: var(--primary);
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }

    .value-display {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.375rem;
      justify-content: center;

      .number-field {
        width: 80px;
        text-align: center;
        padding: 0.5rem;
        border: 2px solid var(--border);
        border-radius: var(--radius-md);
        background: var(--card-bg);
        color: var(--text-primary);
        font-size: 1.125rem;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        transition: border-color 0.2s ease;

        &:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--focus-ring);
        }

        /* Hide arrows */
        -moz-appearance: textfield;
        appearance: textfield;
        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      }

      .unit {
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--text-tertiary);
      }
    }
  }
}
</style>
