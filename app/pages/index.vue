<template>
  <div class="page-container">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-top">
        <h1 class="page-title">
          <Icon name="solar:home-2-bold" size="28" class="icon-primary" />
          Dashboard
        </h1>
        <div class="header-actions">
          <button class="btn btn-ghost" @click="showBuilder = true" title="Configure metrics" type="button">
            <Icon name="solar:widget-add-bold" size="20" />
            <span class="btn-label">Configure</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Date Selector -->
    <div ref="dateSelectorRef">
      <DateSelector
        v-model="selectedDate"
        :maxDate="maxDate"
        :darkMode="darkMode"
      />
    </div>

    <!-- Sticky Date Selector -->
    <Transition name="slide-down">
      <div v-if="showStickyHeader" class="sticky-header">
        <div class="sticky-content">
          <DateSelector
            v-model="selectedDate"
            :maxDate="maxDate"
            :darkMode="darkMode"
            :simple="true"
          />
        </div>
      </div>
    </Transition>

    <!-- Loading -->
    <LoadingState v-if="isLoading || isConfigLoading" message="Loading your dashboard..." />

    <!-- Empty State: No Metrics Configured -->
    <div v-else-if="!hasMetrics" class="get-started-card">
      <div class="get-started-content">
        <div class="get-started-icon">
          <Icon name="solar:clipboard-add-bold" size="56" />
        </div>
        <h2>Design Your Tracking Routine</h2>
        <p>
          Add metrics to start tracking your daily habits, moods, and goals.
          You decide what to track — sliders, checkboxes, numbers, times, locations, or notes.
        </p>
        <button class="btn btn-primary" @click="showBuilder = true" type="button">
          <Icon name="solar:add-circle-bold" size="20" />
          Get Started
        </button>
      </div>
    </div>

    <!-- Metric Entry Form -->
    <div v-else class="metric-entry-form">
      <!-- Grouped metrics -->
      <template v-for="[groupName, groupMetrics] in groupedMetrics" :key="groupName">
        <div class="metric-group" v-if="groupMetrics.length > 0">
          <h3 v-if="groupName" class="group-title">
            {{ groupName }}
          </h3>
          <div class="metrics-grid">
            <div
              v-for="metric in groupMetrics"
              :key="metric.id"
              class="metric-card"
              :class="`metric-type-${metric.type}`"
            >
              <MetricRenderer
                :config="metric"
                :modelValue="entryData[metric.id] ?? getDefaultValueForType(metric)"
                @update:modelValue="updateMetricValue(metric.id, $event)"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- Save Button -->
      <div class="save-section">
        <button
          ref="saveBtnRef"
          class="btn btn-primary save-btn"
          @click="handleSave"
          :disabled="isSaving"
          type="button"
        >
          <Icon v-if="isSaving" name="svg-spinners:ring-resize" size="20" />
          <Icon v-else name="solar:diskette-bold" size="20" />
          {{ isSaving ? 'Saving...' : 'Save Entry' }}
        </button>
      </div>
    </div>

    <!-- Floating Action Button -->
    <Transition name="fab">
      <button
        v-if="showFab"
        @click="handleSave"
        class="fab-btn"
        :class="{ 'is-loading': isSaving }"
        title="Save Entry"
        :disabled="isSaving"
        type="button"
      >
        <Icon v-if="!isSaving" name="solar:check-circle-bold" size="28" />
        <Icon v-else name="svg-spinners:ring-resize" size="28" />
      </button>
    </Transition>

    <!-- Metric Builder Dialog -->
    <MetricBuilder
      v-model="showBuilder"
      :metrics="metricConfigs"
      @save="handleSaveConfig"
    />

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="showToast" class="toast">
        <Icon name="solar:check-circle-bold" size="20" />
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { MetricValue, MetricConfig, MetricDataMap, CalculatedMetricConfig } from '~/types';
import { getDefaultValueForType } from '~/types';
import { getCurrentDateString, parseLocalDateString } from '~/utils/helpers';
import { evaluateFormula } from '~/utils/calculationUtils';

const {
  isLoading,
  hasMetrics,
  metricConfigs,
  isConfigLoading,
  groupedMetrics,
  getEntryByDate,
  saveEntry,
  saveConfig,
  darkMode,
  isInitialized,
} = useMoodly();

// --- Date ---
const maxDate = new Date();
const selectedDate = ref(new Date());

const selectedDateString = computed(() =>
  getCurrentDateString(selectedDate.value)
);

// --- Entry data ---
const entryData = ref<MetricDataMap>({});
const isSaving = ref(false);
const showBuilder = ref(false);
const showToast = ref(false);
const toastMessage = ref('');

// Sticky header logic
const dateSelectorRef = ref<HTMLElement | null>(null);
const showStickyHeader = ref(false);

// FAB logic
const saveBtnRef = ref<HTMLElement | null>(null);
const showFab = ref(false);

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry) {
        showStickyHeader.value =
          !entry.isIntersecting && entry.boundingClientRect.top < 0;
      }
    },
    { threshold: 0, rootMargin: "-80px 0px 0px 0px" } // Adjust rootMargin based on navbar height
  );

  if (dateSelectorRef.value) {
    observer.observe(dateSelectorRef.value);
  }

  watch(dateSelectorRef, (el) => {
    if (el) observer.observe(el);
  });

  const fabObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry) {
        showFab.value = !entry.isIntersecting;
      }
    },
    { threshold: 0.1 },
  );

  if (saveBtnRef.value) {
    fabObserver.observe(saveBtnRef.value);
  }

  watch(saveBtnRef, (el) => {
    if (el) fabObserver.observe(el);
  });
});

// Load entry data when date changes
watch(selectedDateString, (dateStr) => {
  loadEntryForDate(dateStr);
}, { immediate: true });

// Also reload when entries are loaded or metrics config changes
watch([isInitialized, metricConfigs], ([ready]) => {
  if (ready) loadEntryForDate(selectedDateString.value);
});

// Auto-recompute calculated metric values when source metrics change.
// Self-limiting: the 2nd trigger after assignment finds no changes and exits.
watch(
  entryData,
  (data) => {
    const calcMetrics = metricConfigs.value.filter(
      (m): m is CalculatedMetricConfig => m.type === 'calculated'
    );
    if (calcMetrics.length === 0) return;

    let hasChange = false;
    const next = { ...data };

    for (const metric of calcMetrics) {
      const result = evaluateFormula(metric.formula, data);
      if (next[metric.id] !== result) {
        next[metric.id] = result;
        hasChange = true;
      }
    }

    if (hasChange) {
      entryData.value = next;
    }
  },
  { deep: true },
);

function loadEntryForDate(dateStr: string) {
  const existing = getEntryByDate(dateStr);
  if (existing) {
    entryData.value = { ...existing.data };
  } else {
    // Initialize with defaults
    const defaults: MetricDataMap = {};
    for (const m of metricConfigs.value) {
      defaults[m.id] = getDefaultValueForType(m);
    }
    entryData.value = defaults;
  }
}

function updateMetricValue(metricId: string, value: MetricValue) {
  entryData.value = { ...entryData.value, [metricId]: value };
}

async function handleSave() {
  isSaving.value = true;
  try {
    await saveEntry(selectedDateString.value, entryData.value);
    showToastNotification('Entry saved successfully!');
  } catch {
    showToastNotification('Failed to save entry');
  } finally {
    isSaving.value = false;
  }
}

async function handleSaveConfig(metrics: MetricConfig[]) {
  try {
    await saveConfig(metrics);
    showToastNotification('Configuration saved!');
    // Re-init entry data with new metrics
    loadEntryForDate(selectedDateString.value);
  } catch {
    showToastNotification('Failed to save configuration');
  }
}

function showToastNotification(message: string) {
  toastMessage.value = message;
  showToast.value = true;
  setTimeout(() => { showToast.value = false; }, 2500);
}
</script>

<style scoped lang="scss">
.page-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 1.5rem;
}

.dashboard-header {
  margin-bottom: 1.5rem;

  .header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;

    .page-title {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      font-size: 1.75rem;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;

      .btn-label {
        @media (max-width: 480px) {
          display: none;
        }
      }
    }
  }
}

/* Get Started Card */
.get-started-card {
  background: var(--card-bg);
  border: 2px dashed var(--border);
  border-radius: var(--radius-xl);
  padding: 3rem 2rem;
  text-align: center;
  animation: fadeIn 0.5s ease;

  .get-started-content {
    max-width: 400px;
    margin: 0 auto;

    .get-started-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 96px;
      height: 96px;
      border-radius: var(--radius-xl);
      background: var(--primary-rgba-08);
      color: var(--primary);
      margin-bottom: 1.5rem;
    }

    h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.75rem;
    }

    p {
      color: var(--text-secondary);
      font-size: 0.9375rem;
      line-height: 1.6;
      margin: 0 0 1.5rem;
    }

    button {
      margin: 0 auto;
    }
  }
}

/* Metric Entry Form */
.metric-entry-form {
  animation: fadeIn 0.4s ease;

  .metric-group {
    margin-bottom: 1.5rem;

    .group-title {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 0.75rem;
      padding-left: 0.25rem;
    }
  }

  .metrics-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    .metric-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      transition: all 0.2s ease;
      box-shadow: var(--shadow-sm);

      &:hover {
        box-shadow: var(--shadow-md);
        border-color: var(--border-hover);
      }

      /* Checkbox type gets compact styling */
      &.metric-type-checkbox {
        padding: 0;
        background: transparent;
        border: none;
        box-shadow: none;

        &:hover {
          box-shadow: none;
        }
      }
    }
  }

  .save-section {
    margin-top: 2rem;
    display: flex;
    justify-content: center;

    .save-btn {
      min-width: 200px;
      padding: 1rem 2rem;
      font-size: 1rem;
    }
  }
}

/* Floating Action Button */
.fab-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  
  background: var(--gradient-primary);
  overflow: hidden; 
  
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(var(--color-shadow-primary), 0.4);
  cursor: pointer;
  z-index: 99;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  -webkit-tap-highlight-color: transparent;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--gradient-primary-dark);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 25px rgba(var(--color-shadow-primary), 0.6);
    
    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: scale(0.9);
  }

  &.is-loading {
    cursor: wait;
    opacity: 0.8;
  }
}

.fab-enter-active,
.fab-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: scale(0) rotate(-90deg);
}
</style>
