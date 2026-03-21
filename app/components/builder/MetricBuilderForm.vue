<template>
  <Transition name="fade">
    <div v-if="modelValue" class="form-overlay" @click.self="closeForm">
      <div class="form-card">
        <h3>{{ isEditing ? 'Edit Metric' : 'Add Metric' }}</h3>

        <!-- Type selector (only for new) -->
        <div v-if="!isEditing" class="form-group">
          <label>Type</label>
          <div class="type-grid">
            <button
              v-for="opt in METRIC_TYPE_OPTIONS"
              :key="opt.type"
              class="type-option"
              :class="{ selected: formData.type === opt.type }"
              @click="formData.type = opt.type"
              type="button"
            >
              <Icon :name="opt.icon" size="22" />
              <span class="type-label">{{ opt.label }}</span>
              <span class="type-desc">{{ opt.description }}</span>
            </button>
          </div>
        </div>

        <!-- Common fields -->
        <div class="form-group">
          <label>Label <span class="required">*</span></label>
          <input v-model="formData.label" type="text" placeholder="e.g. Mood, Water Intake" class="form-input" />
        </div>

        <div class="form-group">
          <label>Icon (optional)</label>
          <div class="icon-input-row">
            <input v-model="formData.icon" type="text" placeholder="solar:heart-bold" class="form-input icon-input" />
            <div v-if="formData.icon" class="icon-preview-inline">
              <Icon :name="formData.icon" size="18" />
            </div>
          </div>
          <div class="icon-picker">
            <button
              v-for="ic in PRESET_ICONS"
              :key="ic"
              type="button"
              class="icon-chip"
              :class="{ active: formData.icon === ic }"
              :title="ic"
              @click="formData.icon = formData.icon === ic ? '' : ic"
            >
              <Icon :name="ic" size="16" />
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>Color (optional)</label>
          <div class="color-picker-row">
            <input v-model="formData.color" type="color" class="color-swatch" />
            <input v-model="formData.color" type="text" placeholder="#1e40af" class="form-input color-text" />
          </div>
        </div>

        <div class="form-group">
          <label>Group (optional)</label>
          <input v-model="formData.group" type="text" placeholder="e.g. Health, Habits" class="form-input" />
        </div>

        <!-- Type-specific fields -->
        <template v-if="formData.type === 'slider'">
          <div class="form-row">
            <div class="form-group">
              <label>Min</label>
              <input v-model.number="formData.min" type="number" class="form-input" />
            </div>
            <div class="form-group">
              <label>Max</label>
              <input v-model.number="formData.max" type="number" class="form-input" />
            </div>
            <div class="form-group">
              <label>Step</label>
              <input v-model.number="formData.step" type="number" class="form-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Min Label</label>
              <input v-model="formData.labelMin" type="text" placeholder="Terrible" class="form-input" />
            </div>
            <div class="form-group">
              <label>Max Label</label>
              <input v-model="formData.labelMax" type="text" placeholder="Amazing" class="form-input" />
            </div>
          </div>
        </template>

        <template v-if="formData.type === 'number'">
          <div class="form-row">
            <div class="form-group">
              <label>Min</label>
              <input v-model.number="formData.min" type="number" class="form-input" />
            </div>
            <div class="form-group">
              <label>Max</label>
              <input v-model.number="formData.max" type="number" class="form-input" />
            </div>
            <div class="form-group">
              <label>Step</label>
              <input v-model.number="formData.step" type="number" class="form-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Unit</label>
              <input v-model="formData.unit" type="text" placeholder="glasses, pages" class="form-input" />
            </div>
            <div class="form-group">
              <label>Placeholder</label>
              <input v-model="formData.placeholder" type="text" placeholder="0" class="form-input" />
            </div>
          </div>
        </template>

        <template v-if="formData.type === 'time'">
          <div class="form-group">
            <label>Placeholder</label>
            <input v-model="formData.placeholder" type="text" placeholder="HH:MM" class="form-input" />
          </div>
        </template>

        <template v-if="formData.type === 'location'">
          <div class="form-group">
            <label>Placeholder</label>
            <input v-model="formData.placeholder" type="text" placeholder="Search for a location..." class="form-input" />
          </div>
          <label class="toggle-row compact">
            <span>Enable weather tracking</span>
            <div class="switch">
              <input type="checkbox" v-model="formData.enableWeather" />
              <span class="slider"></span>
            </div>
          </label>
          <p v-if="formData.enableWeather" class="form-hint">
            <Icon name="solar:cloud-sun-bold" size="14" />
            Weather data will be fetched when a location is selected.
          </p>
        </template>

        <template v-if="formData.type === 'text'">
          <div class="form-row">
            <div class="form-group">
              <label>Placeholder</label>
              <input v-model="formData.placeholder" type="text" placeholder="Write something..." class="form-input" />
            </div>
            <div class="form-group">
              <label>Max Length</label>
              <input v-model.number="formData.maxLength" type="number" class="form-input" />
            </div>
          </div>
          <label class="toggle-row compact">
            <span>Multiline (textarea)</span>
            <div class="switch">
              <input type="checkbox" v-model="formData.multiline" />
              <span class="slider"></span>
            </div>
          </label>
        </template>

        <template v-if="formData.type === 'calculated'">
          <div v-if="timeMetrics.length < 2" class="form-hint-warning">
            <Icon name="solar:danger-triangle-bold" size="14" />
            You need at least 2 "Time" metrics before adding a calculated field.
          </div>
          <template v-else>
            <div class="form-row">
              <div class="form-group">
                <label>From (start) <span class="required">*</span></label>
                <select v-model="formData.calcFromMetricId" class="form-input">
                  <option value="" disabled>Select time metric…</option>
                  <option
                    v-for="m in timeMetrics"
                    :key="m.id"
                    :value="m.id"
                    :disabled="m.id === formData.calcToMetricId"
                  >{{ m.label }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>To (end) <span class="required">*</span></label>
                <select v-model="formData.calcToMetricId" class="form-input">
                  <option value="" disabled>Select time metric…</option>
                  <option
                    v-for="m in timeMetrics"
                    :key="m.id"
                    :value="m.id"
                    :disabled="m.id === formData.calcFromMetricId"
                  >{{ m.label }}</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Result unit</label>
              <div class="unit-toggle">
                <button
                  type="button"
                  class="unit-btn"
                  :class="{ active: formData.calcUnit === 'hours' }"
                  @click="formData.calcUnit = 'hours'"
                >Hours</button>
                <button
                  type="button"
                  class="unit-btn"
                  :class="{ active: formData.calcUnit === 'minutes' }"
                  @click="formData.calcUnit = 'minutes'"
                >Minutes</button>
              </div>
            </div>
          </template>
        </template>

        <div class="form-actions">
          <button class="btn btn-secondary" @click="closeForm" type="button">Cancel</button>
          <button class="btn btn-primary" @click="confirmForm" :disabled="!formData.label" type="button">
            {{ isEditing ? 'Update' : 'Add' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { MetricConfig, MetricType, CalculatedMetricConfig } from '~/types';
import { METRIC_TYPE_OPTIONS } from '~/types';
import { generateId } from '~/utils/helpers';

const props = defineProps<{
  modelValue: boolean;
  editingMetric: MetricConfig | null;
  totalMetrics: number;
  existingMetrics: MetricConfig[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'confirm': [config: MetricConfig];
}>();

const isEditing = computed(() => props.editingMetric != null);

const timeMetrics = computed(() =>
  props.existingMetrics.filter(m => m.type === 'time')
);

const PRESET_ICONS = [
  // Mood & Emotions
  'solar:heart-bold',
  'solar:smile-circle-bold',
  'solar:fire-bold',
  // Sleep & Rest
  'solar:moon-bold',
  'solar:clock-circle-bold',
  // Exercise & Activity
  'solar:running-bold',
  'solar:star-bold',
  // Nutrition & Hydration
  'solar:cup-hot-bold',
  'solar:chart-bold',
  'solar:cup-star-bold',
  // Mental & Productivity
  'solar:book-bold',
  'solar:pen-bold',
  'solar:music-note-bold',
  'solar:laptop-bold',
  // Wellness & Health
  'solar:leaf-bold',
  'solar:graph-bold',
  'solar:bed-bold',
  'solar:dumbbell-bold',
  // Energy & Time
  'solar:sun-bold',
  'solar:bolt-bold',
  // Habits & Tracking
  'solar:history-bold',
  'solar:hashtag-bold',
  'solar:target-bold',
];

interface FormState {
  type: MetricType;
  label: string;
  icon: string;
  color: string;
  group: string;
  min: number;
  max: number;
  step: number;
  labelMin: string;
  labelMax: string;
  unit: string;
  placeholder: string;
  maxLength: number | undefined;
  multiline: boolean;
  // Location metric fields
  enableWeather: boolean;
  // Calculated metric fields
  formulaType: 'time_diff';
  calcFromMetricId: string;
  calcToMetricId: string;
  calcUnit: 'hours' | 'minutes';
}

const defaultForm = (): FormState => ({
  type: 'slider',
  label: '',
  icon: '',
  color: '#1e40af',
  group: '',
  min: 1,
  max: 5,
  step: 1,
  labelMin: '',
  labelMax: '',
  unit: '',
  placeholder: '',
  maxLength: undefined,
  multiline: false,
  enableWeather: false,
  formulaType: 'time_diff',
  calcFromMetricId: '',
  calcToMetricId: '',
  calcUnit: 'hours',
});

const formData = ref<FormState>(defaultForm());

watch(
  () => [props.modelValue, props.editingMetric] as const,
  ([open, metric]) => {
    if (!open) return;
    if (metric) {
      formData.value = {
        type: metric.type,
        label: metric.label,
        icon: metric.icon ?? '',
        color: metric.color ?? '#1e40af',
        group: metric.group ?? '',
        min: (metric as any).min ?? 1,
        max: (metric as any).max ?? 5,
        step: (metric as any).step ?? 1,
        labelMin: (metric as any).labels?.[0] ?? '',
        labelMax: (metric as any).labels?.[1] ?? '',
        unit: (metric as any).unit ?? '',
        placeholder: (metric as any).placeholder ?? '',
        maxLength: (metric as any).maxLength ?? undefined,
        multiline: (metric as any).multiline ?? false,
        enableWeather: (metric as any).enableWeather ?? false,
        formulaType: (metric as CalculatedMetricConfig).formula?.formulaType ?? 'time_diff',
        calcFromMetricId: (metric as CalculatedMetricConfig).formula?.fromMetricId ?? '',
        calcToMetricId: (metric as CalculatedMetricConfig).formula?.toMetricId ?? '',
        calcUnit: (metric as CalculatedMetricConfig).formula?.unit ?? 'hours',
      };
    } else {
      formData.value = defaultForm();
    }
  },
  { immediate: true },
);

function closeForm() {
  emit('update:modelValue', false);
}

function confirmForm() {
  const f = formData.value;
  if (!f.label.trim()) return;

  if (f.type === 'calculated') {
    if (!f.calcFromMetricId || !f.calcToMetricId) return;
    if (f.calcFromMetricId === f.calcToMetricId) return;
  }

  const base: Partial<MetricConfig> = {
    type: f.type,
    label: f.label.trim(),
    icon: f.icon || undefined,
    color: f.color || undefined,
    group: f.group || undefined,
  };

  const id = props.editingMetric?.id ?? generateId();
  const order = props.editingMetric?.order ?? props.totalMetrics;

  let config: MetricConfig;

  switch (f.type) {
    case 'slider':
      config = {
        ...base,
        type: 'slider',
        id,
        order,
        min: f.min,
        max: f.max,
        step: f.step,
        labels: (f.labelMin || f.labelMax) ? [f.labelMin, f.labelMax] : undefined,
      } as MetricConfig;
      break;
    case 'checkbox':
      config = { ...base, type: 'checkbox', id, order } as MetricConfig;
      break;
    case 'number':
      config = {
        ...base,
        type: 'number',
        id,
        order,
        min: f.min,
        max: f.max,
        step: f.step,
        unit: f.unit || undefined,
        placeholder: f.placeholder || undefined,
      } as MetricConfig;
      break;
    case 'time':
      config = { ...base, type: 'time', id, order, placeholder: f.placeholder || undefined } as MetricConfig;
      break;
    case 'location':
      config = {
        ...base,
        type: 'location',
        id,
        order,
        placeholder: f.placeholder || undefined,
        enableWeather: f.enableWeather || undefined,
      } as MetricConfig;
      break;
    case 'text':
      config = {
        ...base,
        type: 'text',
        id,
        order,
        placeholder: f.placeholder || undefined,
        maxLength: f.maxLength || undefined,
        multiline: f.multiline,
      } as MetricConfig;
      break;
    case 'calculated':
      config = {
        ...base,
        type: 'calculated',
        id,
        order,
        formula: {
          formulaType: f.formulaType,
          fromMetricId: f.calcFromMetricId,
          toMetricId: f.calcToMetricId,
          unit: f.calcUnit,
        },
      } as MetricConfig;
      break;
  }

  emit('confirm', config);
  closeForm();
}
</script>

<style scoped lang="scss">
.form-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1010;
}

.form-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  width: 95%;
  max-width: 520px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: var(--shadow-2xl);
  border: 1px solid var(--border);

  &::-webkit-scrollbar-track {
    margin-top: 20px;
    margin-bottom: 20px;
  }

  h3 {
    margin: 0 0 1.25rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
  }
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;

  .type-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.75rem 0.5rem;
    border: 2px solid var(--border);
    border-radius: var(--radius-md);
    background: transparent;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-secondary);
    font-family: inherit;

    &:hover {
      border-color: var(--primary-rgba-40);
      background: var(--primary-rgba-08);
    }

    &.selected {
      border-color: var(--primary);
      background: var(--primary-rgba-12);
      color: var(--primary);
    }

    .type-label {
      font-weight: 600;
      font-size: 0.8125rem;
      color: var(--text-primary);
    }

    .type-desc {
      font-size: 0.6875rem;
      text-align: center;
      line-height: 1.3;
    }
  }
}

.form-group {
  margin-bottom: 1rem;

  label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 0.375rem;

    .required {
      color: var(--error);
    }
  }
}

.form-row {
  display: flex;
  gap: 0.75rem;

  .form-group {
    flex: 1;
    min-width: 0;
  }
}

.form-input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-family: inherit;
  transition: border-color 0.2s;

  &::placeholder {
    color: var(--text-tertiary);
  }

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
}

.icon-input-row {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;

  .icon-input {
    padding-right: 2.75rem;
  }

  .icon-preview-inline {
    position: absolute;
    right: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-primary);
    pointer-events: none;

    .dim {
      color: var(--text-tertiary);
    }
  }
}

.icon-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.icon-chip {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;

  &:hover {
    border-color: var(--primary-rgba-40);
    background: var(--primary-rgba-08);
    color: var(--primary);
  }

  &.active {
    border-color: var(--primary);
    background: var(--primary-rgba-12);
    color: var(--primary);
  }
}

.color-picker-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;

  .color-swatch {
    width: 36px;
    height: 36px;
    border: none;
    cursor: pointer;
    padding: 0;
    background: none;
    flex-shrink: 0;

    &::-webkit-color-swatch-wrapper {
      padding: 2px;
    }

    &::-webkit-color-swatch {
      border: none;
      border-radius: 4px;
    }
  }

  .color-text {
    flex: 1;
    min-width: 0;
  }
}

.toggle-row.compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0.75rem;
  background: var(--hover-bg);
  border-radius: var(--radius-md);
  margin-bottom: 1rem;

  span {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--text-primary);
  }
}

.switch {
  position: relative;
  display: inline-block;
  width: 2.75rem;
  height: 1.5rem;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border);
  transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: var(--radius-xl);

  &::before {
    position: absolute;
    content: "";
    height: 1.125rem;
    width: 1.125rem;
    left: 0.1875rem;
    bottom: 0.1875rem;
    background-color: white;
    transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: var(--radius-full);
    box-shadow: var(--shadow-sm);
  }
}

input:checked + .slider {
  background-color: var(--primary);

  &::before {
    transform: translateX(1.25rem);
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.form-hint-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  background: color-mix(in srgb, var(--warning) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--warning) 30%, transparent);
  border-radius: var(--radius-md);
  color: var(--warning);
  font-size: 0.8125rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--primary-rgba-08);
  border-radius: var(--radius-md);
  color: var(--primary);
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 0.5rem;
}

.unit-toggle {
  display: flex;
  gap: 0.375rem;

  .unit-btn {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border: 2px solid var(--border);
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--primary-rgba-40);
      background: var(--primary-rgba-08);
    }

    &.active {
      border-color: var(--primary);
      background: var(--primary-rgba-12);
      color: var(--primary);
    }
  }
}

@media (max-width: 640px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
