<template>
  <div class="metric-slider">
    <div class="slider-header">
      <div class="slider-info">
        <Icon v-if="config.icon" :name="config.icon" size="20" class="metric-icon" :style="iconStyle" />
        <span class="metric-label">{{ config.label }}</span>
      </div>
      <span class="slider-value" :style="valueStyle">{{ displayValue }}</span>
    </div>

    <div class="slider-track-container">
      <input
        type="range"
        :min="config.min"
        :max="config.max"
        :step="config.step"
        :value="currentValue"
        @input="handleInput"
        class="slider-input"
        :style="sliderStyle"
      />
      <div class="slider-labels" v-if="config.labels">
        <span class="label-min">{{ config.labels[0] }}</span>
        <span class="label-max">{{ config.labels[1] }}</span>
      </div>
      <div class="slider-labels" v-else>
        <span class="label-min">{{ config.min }}</span>
        <span class="label-max">{{ config.max }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SliderMetricConfig, MetricValue } from '~/types';

const props = defineProps<{
  config: SliderMetricConfig;
  modelValue: MetricValue;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

const currentValue = computed(() => {
  const v = props.modelValue;
  return typeof v === 'number' ? v : props.config.min;
});

const displayValue = computed(() => {
  return `${currentValue.value} / ${props.config.max}`;
});

const progress = computed(() => {
  const range = props.config.max - props.config.min;
  if (range === 0) return 0;
  return ((currentValue.value - props.config.min) / range) * 100;
});

const accentColor = computed(() => props.config.color ?? 'var(--primary)');

const iconStyle = computed(() => ({ color: accentColor.value }));
const valueStyle = computed(() => ({ color: accentColor.value }));
const sliderStyle = computed(() => ({
  '--slider-progress': `${progress.value}%`,
  '--slider-accent': accentColor.value,
}));

function handleInput(e: Event) {
  const val = Number((e.target as HTMLInputElement).value);
  emit('update:modelValue', val);
}
</script>

<style scoped lang="scss">
.metric-slider {
  .slider-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;

    .slider-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .metric-icon {
        flex-shrink: 0;
      }

      .metric-label {
        font-weight: 600;
        font-size: 0.9375rem;
        color: var(--text-primary);
      }
    }

    .slider-value {
      font-weight: 800;
      font-size: 1.125rem;
      font-variant-numeric: tabular-nums;
    }
  }

  .slider-track-container {
    .slider-input {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 8px;
      border-radius: 4px;
      background: linear-gradient(
        to right,
        var(--slider-accent) 0%,
        var(--slider-accent) var(--slider-progress),
        var(--slider-track) var(--slider-progress),
        var(--slider-track) 100%
      );
      outline: none;
      cursor: pointer;
      transition: background 0.1s ease;

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: white;
        border: 3px solid var(--slider-accent);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;

        &:hover {
          transform: scale(1.15);
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        }

        &:active {
          transform: scale(1.05);
        }
      }

      &::-moz-range-thumb {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: white;
        border: 3px solid var(--slider-accent);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        cursor: pointer;
      }
    }

    .slider-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: var(--text-tertiary);
      font-weight: 500;
    }
  }
}
</style>
