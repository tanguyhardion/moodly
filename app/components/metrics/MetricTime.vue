<template>
  <MetricHeader :config="config">
    <input
      type="time"
      :value="currentValue"
      :placeholder="config.placeholder ?? 'HH:MM'"
      :aria-label="config.label"
      class="input h-10 w-[8.5rem] text-center font-display font-bold tabular-nums"
      @input="handleInput"
    />
  </MetricHeader>
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

function handleInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value);
}
</script>
