<template>
  <div class="metric-calculated">
    <div class="calc-header">
      <Icon v-if="config.icon" :name="config.icon" size="20" class="metric-icon" :style="iconStyle" />
      <span class="metric-label">{{ config.label }}</span>
      <span class="calc-badge">
        <Icon name="solar:calculator-bold" size="11" />
        auto
      </span>
    </div>

    <div class="calc-value-row">
      <span v-if="numericValue !== null" class="calc-value" :style="valueStyle">
        {{ displayValue }}
      </span>
      <span v-else class="calc-empty">—</span>
      <span v-if="numericValue !== null" class="calc-unit">{{ unitLabel }}</span>
    </div>

    <div class="calc-source">
      <Icon name="solar:link-bold" size="12" />
      <span>{{ sourceDescription }}</span>
    </div>
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

const accentColor = computed(() => props.config.color ?? 'var(--primary)');
const iconStyle = computed(() => ({ color: accentColor.value }));
const valueStyle = computed(() => ({ color: accentColor.value }));

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

<style scoped lang="scss">
.metric-calculated {
  .calc-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;

    .metric-label {
      font-weight: 600;
      font-size: 0.9375rem;
      color: var(--text-primary);
    }

    .calc-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.125rem 0.5rem;
      border-radius: var(--radius-full);
      background: var(--hover-bg);
      color: var(--text-tertiary);
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
  }

  .calc-value-row {
    display: flex;
    align-items: baseline;
    gap: 0.375rem;
    margin-bottom: 0.5rem;

    .calc-value {
      font-size: 2rem;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      line-height: 1;
    }

    .calc-empty {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-tertiary);
      line-height: 1;
    }

    .calc-unit {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
  }

  .calc-source {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.75rem;
    color: var(--text-tertiary);
  }
}
</style>
