<template>
  <MetricHeader :config="config">
    <div class="flex items-center gap-1 rounded-full bg-surface-2 p-1">
      <button class="icon-btn size-9 bg-surface" type="button" :disabled="atMin" :aria-label="`Decrease ${config.label}`" @click="decrement">
        <Icon name="mdi:minus" size="18" />
      </button>
      <label class="flex items-baseline gap-1 px-1">
        <input
          type="number"
          :value="currentValue"
          :min="config.min"
          :max="config.max"
          :step="config.step ?? 1"
          :placeholder="config.placeholder ?? '0'"
          :aria-label="config.label"
          class="w-12 appearance-none bg-transparent text-center font-display text-lg font-bold tabular-nums outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          @input="handleInput"
        />
        <span v-if="config.unit" class="text-xs font-medium text-muted">{{ config.unit }}</span>
      </label>
      <button class="icon-btn size-9 bg-surface" type="button" :disabled="atMax" :aria-label="`Increase ${config.label}`" @click="increment">
        <Icon name="mdi:plus" size="18" />
      </button>
    </div>
  </MetricHeader>
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
