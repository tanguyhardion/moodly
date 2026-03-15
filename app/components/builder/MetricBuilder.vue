<template>
  <Transition name="fade">
    <div v-if="isOpen" class="builder-overlay" @click.self="close">
      <div class="builder-card">
        <!-- Header -->
        <div class="builder-header">
          <h2>
            <Icon name="solar:widget-add-bold" size="24" class="header-icon" />
            Metric Builder
          </h2>
          <button class="close-btn" @click="close" type="button">
            <Icon name="solar:close-circle-bold" size="24" />
          </button>
        </div>

        <!-- Metric List -->
        <div class="builder-content">
          <div v-if="localMetrics.length === 0" class="empty-builder">
            <Icon name="solar:clipboard-list-bold" size="48" class="empty-icon" />
            <p class="empty-title">No metrics configured yet</p>
            <p class="empty-desc">Add your first tracking metric to get started.</p>
          </div>

          <TransitionGroup v-else name="list" tag="div" class="metric-list">
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

          <!-- Add Button -->
          <button class="add-metric-btn" @click="openAddForm" type="button">
            <Icon name="solar:add-circle-bold" size="20" />
            <span>Add Metric</span>
          </button>
        </div>

        <!-- Footer -->
        <div class="builder-footer">
          <button class="btn btn-secondary" @click="close" type="button">Cancel</button>
          <button class="btn btn-primary" @click="saveConfig" :disabled="saving" type="button">
            <Icon v-if="saving" name="svg-spinners:ring-resize" size="18" />
            {{ saving ? 'Saving...' : 'Save Configuration' }}
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

<style scoped lang="scss">
.builder-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.builder-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  width: 95%;
  max-width: 640px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-2xl);
  border: 1px solid var(--border);
}

.builder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);

  h2 {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);

    .header-icon {
      color: var(--primary);
    }
  }

  .close-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: var(--radius-full);
    display: flex;
    transition: all 0.2s;

    &:hover {
      background: var(--hover-bg);
      color: var(--text-primary);
    }
  }
}

.builder-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;

  &::-webkit-scrollbar-track {
    margin-top: 8px;
    margin-bottom: 8px;
  }

  .empty-builder {
    text-align: center;
    padding: 2rem 1rem;
    color: var(--text-secondary);

    .empty-icon {
      color: var(--text-tertiary);
      margin-bottom: 0.75rem;
    }

    .empty-title {
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 0.375rem;
    }

    .empty-desc {
      font-size: 0.875rem;
      margin: 0;
    }
  }

  .metric-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .add-metric-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.875rem;
    margin-top: 0.75rem;
    border: 2px dashed var(--border);
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--text-secondary);
    font-weight: 600;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;

    &:hover {
      border-color: var(--primary);
      color: var(--primary);
      background: var(--primary-rgba-08);
    }
  }
}

.builder-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border);
}

/* List transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
.list-move {
  transition: transform 0.3s ease;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
