<template>
  <div class="flex flex-col gap-1">
    <MetricHeader :config="config">
      <span class="flex items-baseline gap-1 rounded-full bg-mood-soft px-3 py-1">
        <span class="font-display text-lg font-bold tabular-nums">{{ displayValue }}</span>
        <span v-if="numericValue !== null" class="text-xs font-semibold text-muted">{{ unitLabel }}</span>
      </span>
    </MetricHeader>
    <p class="flex items-center gap-1 pl-[2.625rem] text-xs text-muted" :class="{ 'pl-0': !config.icon }">
      <Icon name="solar:calculator-bold" size="12" />
      Calculated from {{ sourceDescription }}
    </p>
  </div>
</template>
<script setup lang="ts">
import type { CalculatedMetricConfig, MetricValue } from '~/types';

const props = defineProps<{
  config: CalculatedMetricConfig;
  modelValue: MetricValue;
}>();

const { metricConfigs } = useMoodly();

const numericValue = computed((): number | null =>
  typeof props.modelValue === 'number' ? props.modelValue : null
);

const displayValue = computed((): string => {
  if (numericValue.value === null) return '—';
  return String(numericValue.value);
});

const unitLabel = computed((): string => {
  const f = props.config.formula;
  if (f.formulaType === 'time_diff') {
    return f.unit === 'hours' ? 'h' : 'min';
  }
  return '';
});

const sourceDescription = computed((): string => {
  const f = props.config.formula;
  if (f.formulaType === 'time_diff') {
    const fromLabel = metricConfigs.value.find(m => m.id === f.fromMetricId)?.label ?? f.fromMetricId;
    const toLabel   = metricConfigs.value.find(m => m.id === f.toMetricId)?.label   ?? f.toMetricId;
    return `${fromLabel} → ${toLabel}`;
  }
  return '';
});
</script>
