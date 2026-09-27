<template>
  <Transition name="fade">
    <div v-if="isOpen" class="overlay" @click.self="close">
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="builder-title">
        <!-- Header -->
        <div class="flex items-center justify-between gap-3 px-6 pt-6 pb-4">
          <div>
            <h2 id="builder-title" class="text-2xl font-extrabold">Your metrics</h2>
            <p class="text-sm text-muted">What you track each day, in order.</p>
          </div>
          <button class="icon-btn" type="button" title="Close" @click="close">
            <Icon name="solar:close-circle-bold" size="24" />
          </button>
        </div>

        <!-- Metric List -->
        <div class="flex-1 overflow-y-auto px-6 pb-4">
          <div v-if="localMetrics.length === 0" class="empty-state py-10">
            <Icon name="solar:clipboard-list-bold" size="40" class="text-faint" />
            <p class="text-base font-semibold text-ink">No metrics yet</p>
            <p class="text-sm">Add the first thing you want to track each day.</p>
          </div>

          <TransitionGroup v-else name="list" tag="div" class="relative flex flex-col gap-2">
            <MetricBuilderItem
              v-for="(metric, index) in localMetrics"
              :key="metric.id"
              :metric="metric"
              :isFirst="index === 0"
              :isLast="index === localMetrics.length - 1"
              @edit="editMetric(index)"
              @delete="deleteMetric(index)"
              @move-up="moveUp(index)"
              @move-down="moveDown(index)"
            />
          </TransitionGroup>

          <button
            class="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line py-3.5 text-sm font-semibold text-muted transition hover:border-mood hover:text-ink"
            type="button"
            @click="openAddForm"
          >
            <Icon name="solar:add-circle-bold" size="20" />
            Add metric
          </button>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2 border-t border-line px-6 py-4">
          <button class="btn btn-secondary" type="button" @click="close">Cancel</button>
          <button class="btn btn-primary" type="button" :disabled="saving" @click="saveConfig">
            <Icon v-if="saving" name="svg-spinners:ring-resize" size="18" />
            {{ saving ? 'Saving…' : 'Save metrics' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Edit/Add Form Modal -->
  <MetricBuilderForm
    v-model="showForm"
    :editingMetric="editingMetric"
    :totalMetrics="localMetrics.length"
    :existingMetrics="localMetrics"
    @confirm="onFormConfirm"
  />
</template>

<script setup lang="ts">
import type { MetricConfig } from '~/types';

const props = defineProps<{
  modelValue: boolean;
  metrics: MetricConfig[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'save': [metrics: MetricConfig[]];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const localMetrics = ref<MetricConfig[]>([]);
const saving = ref(false);

const showForm = ref(false);
const editingIndex = ref<number | null>(null);
const editingMetric = ref<MetricConfig | null>(null);

watch(isOpen, (val) => {
  if (val) {
    localMetrics.value = JSON.parse(JSON.stringify(props.metrics));
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onUnmounted(() => {
  document.body.style.overflow = '';
});

function close() {
  isOpen.value = false;
}

function moveUp(idx: number) {
  if (idx <= 0) return;
  const arr = [...localMetrics.value];
  [arr[idx - 1], arr[idx]] = [arr[idx]!, arr[idx - 1]!];
  arr.forEach((m, i) => m.order = i);
  localMetrics.value = arr;
}

function moveDown(idx: number) {
  if (idx >= localMetrics.value.length - 1) return;
  const arr = [...localMetrics.value];
  [arr[idx], arr[idx + 1]] = [arr[idx + 1]!, arr[idx]!];
  arr.forEach((m, i) => m.order = i);
  localMetrics.value = arr;
}

function deleteMetric(idx: number) {
  localMetrics.value.splice(idx, 1);
  localMetrics.value.forEach((m, i) => m.order = i);
}

function openAddForm() {
  editingIndex.value = null;
  editingMetric.value = null;
  showForm.value = true;
}

function editMetric(idx: number) {
  editingIndex.value = idx;
  editingMetric.value = localMetrics.value[idx] ?? null;
  showForm.value = true;
}

function onFormConfirm(config: MetricConfig) {
  if (editingIndex.value != null) {
    localMetrics.value[editingIndex.value] = config;
  } else {
    localMetrics.value.push(config);
  }
  editingIndex.value = null;
  editingMetric.value = null;
}

async function saveConfig() {
  saving.value = true;
  try {
    localMetrics.value.forEach((m, i) => m.order = i);
    emit('save', [...localMetrics.value]);
    close();
  } finally {
    saving.value = false;
  }
}
</script>
