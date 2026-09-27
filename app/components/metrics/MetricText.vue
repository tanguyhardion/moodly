<template>
  <div class="flex flex-col gap-2">
    <MetricHeader :config="config">
      <span v-if="config.maxLength" class="text-xs font-medium tabular-nums" :class="charCountWarn ? 'text-warning' : 'text-faint'">
        {{ charCount }} / {{ config.maxLength }}
      </span>
    </MetricHeader>
    <textarea
      v-if="config.multiline"
      :value="currentValue"
      :placeholder="config.placeholder ?? 'Write something…'"
      :maxlength="config.maxLength"
      :aria-label="config.label"
      class="input min-h-24 resize-y"
      rows="3"
      @input="handleInput"
    ></textarea>
    <input
      v-else
      type="text"
      :value="currentValue"
      :placeholder="config.placeholder ?? 'Write something…'"
      :maxlength="config.maxLength"
      :aria-label="config.label"
      class="input"
      @input="handleInput"
    />
  </div>
</template>
<script setup lang="ts">
import type { TextMetricConfig, MetricValue } from '~/types';

const props = defineProps<{
  config: TextMetricConfig;
  modelValue: MetricValue;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const currentValue = computed(() => {
  const v = props.modelValue;
  return typeof v === 'string' ? v : '';
});

const charCount = computed(() => currentValue.value.length);
const charCountWarn = computed(() =>
  props.config.maxLength ? charCount.value >= props.config.maxLength * 0.9 : false
);

function handleInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement | HTMLTextAreaElement).value);
}
</script>
