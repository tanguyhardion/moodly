<template>
  <button
    type="button"
    class="chip py-2 pl-2"
    :class="{ 'chip-on': isChecked }"
    :aria-pressed="isChecked"
    @click="toggle"
  >
    <span
      class="grid size-6 shrink-0 place-items-center rounded-full transition"
      :class="isChecked ? 'bg-mood text-mood-ink' : 'bg-surface text-muted'"
      :style="!isChecked && config.color ? { color: config.color } : undefined"
    >
      <Icon :name="isChecked ? 'mdi:check-bold' : (config.icon || 'mdi:circle-outline')" size="14" />
    </span>
    {{ config.label }}
  </button>
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

function toggle() {
  emit('update:modelValue', !isChecked.value);
}
</script>
