<template>
  <div class="flex flex-col gap-3">
    <MetricHeader :config="config">
      <span class="font-display text-xl font-bold tabular-nums">
        {{ currentValue }}<span class="text-sm font-medium text-faint">/{{ config.max }}</span>
      </span>
    </MetricHeader>

    <!-- Short scales: one tap target per value -->
    <div
      v-if="steps.length <= 10"
      class="grid gap-2"
      :style="{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }"
      role="radiogroup"
      :aria-label="config.label"
    >
      <button
        v-for="v in steps"
        :key="v"
        type="button"
        role="radio"
        :aria-checked="v === currentValue"
        :aria-label="`${config.label} ${v}`"
        class="h-11 rounded-full text-sm font-bold tabular-nums transition"
        :class="v === currentValue ? 'scale-105' : 'hover:brightness-95 dark:hover:brightness-125'"
        :style="stepStyle(v)"
        @click="emit('update:modelValue', v)"
      >
        {{ v }}
      </button>
    </div>

    <!-- Long scales: a range input -->
    <input
      v-else
      type="range"
      :min="config.min"
      :max="config.max"
      :step="config.step"
      :value="currentValue"
      :aria-label="config.label"
      class="range"
      :style="{ '--p': `${progress}%`, '--accent': accent }"
      @input="handleInput"
    />

    <div class="flex justify-between text-xs font-medium text-muted">
      <span>{{ config.labels?.[0] || config.min }}</span>
      <span>{{ config.labels?.[1] || config.max }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SliderMetricConfig, MetricValue } from '~/types';
import { MOOD_COLORS, moodLevel } from '~/utils/moodColors';

const props = defineProps<{
  config: SliderMetricConfig;
  modelValue: MetricValue;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

const { moodMetric } = useMoodTheme();

const currentValue = computed(() => {
  const v = props.modelValue;
  return typeof v === 'number' ? v : props.config.min;
});

const steps = computed(() => {
  const { min, max } = props.config;
  const step = props.config.step || 1;
  const values: number[] = [];
  for (let v = min; v <= max + 1e-9 && values.length <= 11; v += step) {
    values.push(Math.round(v * 1000) / 1000);
  }
  return values;
});

const progress = computed(() => {
  const range = props.config.max - props.config.min;
  if (range === 0) return 0;
  return ((currentValue.value - props.config.min) / range) * 100;
});

const isMoodMetric = computed(() => moodMetric.value?.id === props.config.id);
const accent = computed(() => props.config.color || 'var(--mood)');

/** Mood metric: each value wears its mood color. Others: the metric's accent when selected. */
function stepStyle(v: number) {
  const selected = v === currentValue.value;
  if (isMoodMetric.value) {
    const { color, ink } = MOOD_COLORS[moodLevel(v, props.config)];
    return selected
      ? { background: color, color: ink, boxShadow: `0 0 0 3px var(--surface), 0 0 0 5px ${color}` }
      : { background: `color-mix(in srgb, ${color} 26%, var(--surface))`, color: 'var(--ink)' };
  }
  return selected
    ? { background: accent.value, color: props.config.color ? '#fff' : 'var(--mood-ink)' }
    : { background: 'var(--surface-2)', color: 'var(--muted)' };
}

function handleInput(e: Event) {
  const val = Number((e.target as HTMLInputElement).value);
  emit('update:modelValue', val);
}
</script>
