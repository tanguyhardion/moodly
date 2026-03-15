<template>
  <div class="metric-text">
    <div class="text-header">
      <Icon v-if="config.icon" :name="config.icon" size="20" class="metric-icon" :style="iconStyle" />
      <span class="metric-label">{{ config.label }}</span>
      <span v-if="config.maxLength" class="char-count" :class="{ warn: charCountWarn }">
        {{ charCount }} / {{ config.maxLength }}
      </span>
    </div>
    <textarea
      v-if="config.multiline"
      :value="currentValue"
      @input="handleInput"
      :placeholder="config.placeholder ?? 'Write something...'"
      :maxlength="config.maxLength"
      class="text-area"
      rows="3"
    ></textarea>
    <input
      v-else
      type="text"
      :value="currentValue"
      @input="handleInput"
      :placeholder="config.placeholder ?? 'Write something...'"
      :maxlength="config.maxLength"
      class="text-input"
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

const accentColor = computed(() => props.config.color ?? 'var(--primary)');
const iconStyle = computed(() => ({ color: accentColor.value }));

function handleInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement | HTMLTextAreaElement).value);
}
</script>

<style scoped lang="scss">
.metric-text {
  .text-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;

    .metric-label {
      font-weight: 600;
      font-size: 0.9375rem;
      color: var(--text-primary);
    }

    .char-count {
      margin-left: auto;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-tertiary);
      font-variant-numeric: tabular-nums;

      &.warn {
        color: var(--warning);
      }
    }
  }

  .text-input,
  .text-area {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--card-bg);
    color: var(--text-primary);
    font-size: 0.9375rem;
    font-family: inherit;
    line-height: 1.6;
    transition: all 0.2s ease;

    &::placeholder {
      color: var(--text-tertiary);
    }

    &:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--focus-ring);
    }
  }

  .text-area {
    resize: vertical;
    min-height: 80px;
  }
}
</style>
