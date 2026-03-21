<template>
  <component
    :is="widgetComponent"
    :config="config"
    :modelValue="modelValue"
    :date="date"
    @update:modelValue="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import type { MetricConfig, MetricValue } from '~/types';
import MetricSlider from './MetricSlider.vue';
import MetricCheckbox from './MetricCheckbox.vue';
import MetricNumber from './MetricNumber.vue';
import MetricTime from './MetricTime.vue';
import MetricLocation from './MetricLocation.vue';
import MetricText from './MetricText.vue';
import MetricCalculated from './MetricCalculated.vue';

const props = defineProps<{
  config: MetricConfig;
  modelValue: MetricValue;
  /** Current entry date in YYYY-MM-DD format (used by location for weather) */
  date?: string;
}>();

defineEmits<{
  'update:modelValue': [value: MetricValue];
}>();

const componentMap: Record<string, ReturnType<typeof defineComponent>> = {
  slider: MetricSlider,
  checkbox: MetricCheckbox,
  number: MetricNumber,
  time: MetricTime,
  location: MetricLocation,
  text: MetricText,
  calculated: MetricCalculated,
};

const widgetComponent = computed(() => componentMap[props.config.type] ?? null);
</script>
