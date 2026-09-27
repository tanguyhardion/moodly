<template>
  <Transition name="fade">
    <div v-if="modelValue" class="overlay z-[210]" @click.self="closeForm">
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="metric-form-title">
        <div class="flex-1 overflow-y-auto px-6 pt-6 pb-2">
          <h3 id="metric-form-title" class="text-2xl font-extrabold">{{ isEditing ? 'Edit metric' : 'New metric' }}</h3>

          <div class="mt-5 flex flex-col gap-5">
            <!-- Type selector (only for new) -->
            <div v-if="!isEditing">
              <span class="field-label">Type</span>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="opt in METRIC_TYPE_OPTIONS"
                  :key="opt.type"
                  type="button"
                  class="flex flex-col items-start gap-1 rounded-2xl bg-surface-2 p-3 text-left transition hover:brightness-95 dark:hover:brightness-125"
                  :class="{ 'bg-mood-soft ring-2 ring-mood': formData.type === opt.type }"
                  :aria-pressed="formData.type === opt.type"
                  @click="formData.type = opt.type"
                >
                  <Icon :name="opt.icon" size="22" class="text-mood-strong" />
                  <span class="text-sm font-semibold">{{ opt.label }}</span>
                  <span class="text-xs leading-snug text-muted">{{ opt.description }}</span>
                </button>
              </div>
            </div>

            <!-- Common fields -->
            <div>
              <label for="metric-label" class="field-label">Label <span class="text-danger">*</span></label>
              <input id="metric-label" v-model="formData.label" type="text" placeholder="e.g. Mood, Water intake" class="input" />
            </div>

            <div>
              <label for="metric-icon" class="field-label">Icon</label>
              <div class="flex items-center gap-2">
                <input id="metric-icon" v-model="formData.icon" type="text" placeholder="solar:heart-bold" class="input" />
                <div v-if="formData.icon" class="grid size-11 shrink-0 place-items-center rounded-2xl bg-mood-soft text-mood-strong">
                  <Icon :name="formData.icon" size="20" />
                </div>
              </div>
              <div class="mt-2 flex flex-wrap gap-1.5">
                <button
                  v-for="ic in PRESET_ICONS"
                  :key="ic"
                  type="button"
                  class="grid size-9 place-items-center rounded-xl bg-surface-2 text-muted transition hover:text-ink"
                  :class="{ 'bg-mood text-mood-ink hover:text-mood-ink': formData.icon === ic }"
                  :title="ic"
                  :aria-pressed="formData.icon === ic"
                  @click="formData.icon = formData.icon === ic ? '' : ic"
                >
                  <Icon :name="ic" size="17" />
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="metric-color" class="field-label">Color</label>
                <div class="flex items-center gap-2">
                  <input
                    v-model="formData.color"
                    type="color"
                    aria-label="Pick a color"
                    class="size-11 shrink-0 cursor-pointer rounded-2xl border-0 bg-surface-2 p-1.5"
                  />
                  <input id="metric-color" v-model="formData.color" type="text" placeholder="#f2a93b" class="input font-mono text-sm" />
                </div>
              </div>
              <div>
                <label for="metric-group" class="field-label">Group</label>
                <input id="metric-group" v-model="formData.group" type="text" placeholder="e.g. Health" class="input" />
              </div>
            </div>

            <!-- Type-specific fields -->
            <div v-if="formData.type === 'slider' || formData.type === 'number'" class="grid grid-cols-3 gap-3">
              <div>
                <label for="metric-min" class="field-label">Min</label>
                <input id="metric-min" v-model.number="formData.min" type="number" class="input" />
              </div>
              <div>
                <label for="metric-max" class="field-label">Max</label>
                <input id="metric-max" v-model.number="formData.max" type="number" class="input" />
              </div>
              <div>
                <label for="metric-step" class="field-label">Step</label>
                <input id="metric-step" v-model.number="formData.step" type="number" class="input" />
              </div>
            </div>

            <div v-if="formData.type === 'slider'" class="grid grid-cols-2 gap-3">
              <div>
                <label for="metric-label-min" class="field-label">Low end label</label>
                <input id="metric-label-min" v-model="formData.labelMin" type="text" placeholder="Terrible" class="input" />
              </div>
              <div>
                <label for="metric-label-max" class="field-label">High end label</label>
                <input id="metric-label-max" v-model="formData.labelMax" type="text" placeholder="Amazing" class="input" />
              </div>
            </div>

            <div v-if="formData.type === 'number'" class="grid grid-cols-2 gap-3">
              <div>
                <label for="metric-unit" class="field-label">Unit</label>
                <input id="metric-unit" v-model="formData.unit" type="text" placeholder="glasses, pages" class="input" />
              </div>
              <div>
                <label for="metric-placeholder-n" class="field-label">Placeholder</label>
                <input id="metric-placeholder-n" v-model="formData.placeholder" type="text" placeholder="0" class="input" />
              </div>
            </div>

            <div v-if="formData.type === 'time'">
              <label for="metric-placeholder-t" class="field-label">Placeholder</label>
              <input id="metric-placeholder-t" v-model="formData.placeholder" type="text" placeholder="HH:MM" class="input" />
            </div>

            <template v-if="formData.type === 'location'">
              <div>
                <label for="metric-placeholder-l" class="field-label">Placeholder</label>
                <input id="metric-placeholder-l" v-model="formData.placeholder" type="text" placeholder="Search for a place…" class="input" />
              </div>
              <ToggleSwitch v-model="formData.enableWeather">
                Track weather
                <template #description>Fetches the day's weather when you pick a place.</template>
              </ToggleSwitch>
            </template>

            <template v-if="formData.type === 'text'">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="metric-placeholder-x" class="field-label">Placeholder</label>
                  <input id="metric-placeholder-x" v-model="formData.placeholder" type="text" placeholder="Write something…" class="input" />
                </div>
                <div>
                  <label for="metric-maxlength" class="field-label">Max length</label>
                  <input id="metric-maxlength" v-model.number="formData.maxLength" type="number" class="input" />
                </div>
              </div>
              <ToggleSwitch v-model="formData.multiline">Multiple lines</ToggleSwitch>
            </template>

            <template v-if="formData.type === 'calculated'">
              <p v-if="timeMetrics.length < 2" class="flex items-start gap-2 rounded-2xl bg-warning/15 p-3 text-sm font-medium text-warning">
                <Icon name="solar:danger-triangle-bold" size="18" class="mt-px shrink-0" />
                Add at least two Time metrics first, for example bedtime and wake-up.
              </p>
              <template v-else>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label for="calc-from" class="field-label">From <span class="text-danger">*</span></label>
                    <select id="calc-from" v-model="formData.calcFromMetricId" class="input">
                      <option value="" disabled>Choose…</option>
                      <option v-for="m in timeMetrics" :key="m.id" :value="m.id" :disabled="m.id === formData.calcToMetricId">{{ m.label }}</option>
                    </select>
                  </div>
                  <div>
                    <label for="calc-to" class="field-label">To <span class="text-danger">*</span></label>
                    <select id="calc-to" v-model="formData.calcToMetricId" class="input">
                      <option value="" disabled>Choose…</option>
                      <option v-for="m in timeMetrics" :key="m.id" :value="m.id" :disabled="m.id === formData.calcFromMetricId">{{ m.label }}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <span class="field-label">Result in</span>
                  <div class="segmented shadow-none ring-1 ring-line">
                    <button type="button" :class="{ 'is-active': formData.calcUnit === 'hours' }" @click="formData.calcUnit = 'hours'">Hours</button>
                    <button type="button" :class="{ 'is-active': formData.calcUnit === 'minutes' }" @click="formData.calcUnit = 'minutes'">Minutes</button>
                  </div>
                </div>
              </template>
            </template>
          </div>
        </div>

        <div class="flex justify-end gap-2 border-t border-line px-6 py-4">
          <button class="btn btn-secondary" type="button" @click="closeForm">Cancel</button>
          <button class="btn btn-primary" type="button" :disabled="!formData.label" @click="confirmForm">
            {{ isEditing ? 'Update' : 'Add metric' }}
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
  color: '#f2a93b',
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
        color: metric.color ?? '#f2a93b',
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
