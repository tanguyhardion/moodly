<template>
  <div
    class="page"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleSwipeEnd"
    @touchcancel="resetDrag"
  >
    <!-- Date + configure -->
    <div class="mb-6 flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <p class="eyebrow">Check-in</p>
        <button class="btn btn-ghost btn-sm" type="button" title="Edit your metrics" @click="showBuilder = true">
          <Icon name="solar:widget-add-bold" size="18" />
          Metrics
        </button>
      </div>
      <div ref="dateSelectorRef">
        <DateSelector v-model="selectedDate" :maxDate="maxDate" :darkMode="darkMode" />
      </div>
    </div>

    <!-- Sticky date selector -->
    <Transition name="slide-down">
      <div v-if="showStickyHeader" class="sticky-bar">
        <div class="px-2 py-1.5">
          <DateSelector v-model="selectedDate" :maxDate="maxDate" :darkMode="darkMode" :simple="true" />
        </div>
      </div>
    </Transition>

    <LoadingState v-if="isLoading || isConfigLoading" message="Loading your day…" />

    <div v-else class="day-stage" :class="{ dragging: isDragging }" :style="dragStyle">
    <Transition :name="swipeDirection === 'left' ? 'slide-left' : 'slide-right'">
      <!-- No metrics configured -->
      <div v-if="!hasMetrics" :key="`empty-${selectedDateString}`" class="card flex flex-col items-center gap-3 px-6 py-12 text-center">
        <span class="grid size-16 place-items-center rounded-full bg-mood-soft text-mood-strong">
          <Icon name="solar:clipboard-add-bold" size="32" />
        </span>
        <h2 class="text-2xl font-extrabold">Build your daily check-in</h2>
        <p class="max-w-sm text-muted">
          Pick what to track each day: a mood scale, habits to tick, sleep times, where you were, a note.
        </p>
        <button class="btn btn-primary mt-2" type="button" @click="showBuilder = true">
          <Icon name="solar:add-circle-bold" size="20" />
          Add your first metric
        </button>
      </div>

      <!-- Entry form -->
      <div v-else :key="`entry-${selectedDateString}`" class="flex flex-col gap-4">
        <Transition name="fade">
          <div v-if="isRestoredDraft" class="flex flex-wrap items-center justify-between gap-2 rounded-card bg-surface/70 py-2 pr-2 pl-4 text-sm">
            <span class="flex items-center gap-2 font-medium">
              <Icon name="solar:document-text-bold" size="18" class="text-mood-strong" />
              Unsaved changes restored
            </span>
            <button class="btn btn-ghost btn-sm" type="button" @click="handleDiscardDraft">Discard</button>
          </div>
        </Transition>

        <template v-for="[groupName, groupMetrics] in groupedMetrics" :key="groupName">
          <section v-if="groupMetrics.length > 0" class="card flex flex-col gap-5">
            <h3 v-if="groupName" class="eyebrow -mb-1">{{ groupName }}</h3>
            <template v-for="run in metricRuns(groupMetrics)" :key="run.key">
              <div v-if="run.chips" class="flex flex-wrap gap-2">
                <MetricRenderer
                  v-for="metric in run.items"
                  :key="metric.id"
                  :config="metric"
                  :modelValue="entryData[metric.id] ?? getDefaultValueForType(metric)"
                  :date="selectedDateString"
                  @update:modelValue="updateMetricValue(metric.id, $event)"
                />
              </div>
              <MetricRenderer
                v-else
                :config="run.items[0]!"
                :modelValue="entryData[run.items[0]!.id] ?? getDefaultValueForType(run.items[0]!)"
                :date="selectedDateString"
                @update:modelValue="updateMetricValue(run.items[0]!.id, $event)"
              />
            </template>
          </section>
        </template>

        <button
          ref="saveBtnRef"
          class="btn btn-primary mt-2 h-14 w-full text-base"
          type="button"
          :disabled="isSaving"
          @click="handleSave"
        >
          <Icon :name="isSaving ? 'svg-spinners:ring-resize' : 'solar:check-circle-bold'" size="22" />
          {{ isSaving ? 'Saving…' : 'Save entry' }}
        </button>
      </div>
    </Transition>
    </div>

    <!-- Floating save, shown once the main button scrolls away -->
    <Transition name="fab">
      <button
        v-if="showFab && hasMetrics"
        class="fixed right-5 bottom-28 z-[90] grid size-14 place-items-center rounded-full bg-mood text-mood-ink shadow-pop transition hover:brightness-105 active:scale-95 disabled:opacity-60 sm:bottom-8"
        title="Save entry"
        type="button"
        :disabled="isSaving"
        @click="handleSave"
      >
        <Icon :name="isSaving ? 'svg-spinners:ring-resize' : 'solar:check-circle-bold'" size="28" />
      </button>
    </Transition>

    <MetricBuilder v-model="showBuilder" :metrics="metricConfigs" @save="handleSaveConfig" />

    <Transition name="toast">
      <div v-if="showToast" class="toast" role="status">
        <Icon name="solar:check-circle-bold" size="20" />
        {{ toastMessage }}
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

/** Splits a group into runs so consecutive checkboxes sit together as chips. */
function metricRuns(metrics: MetricConfig[]) {
  const runs: { key: string; chips: boolean; items: MetricConfig[] }[] = [];
  for (const m of metrics) {
    const chips = m.type === 'checkbox';
    const last = runs[runs.length - 1];
    if (chips && last?.chips) last.items.push(m);
    else runs.push({ key: m.id, chips, items: [m] });
  }
  return runs;
}

// --- Swipe Gestures ---
const swipeThreshold = 50;
const swipeDirection = ref<'left' | 'right'>('left');
const touchStartX = ref(0);
const touchStartY = ref(0);
const dragX = ref(0);
const isDragging = ref(false);
// Axis is locked on the first significant movement so vertical scrolls never drag the day
let dragAxis: 'x' | 'y' | null = null;
let ignoreTouch = false;

const dragStyle = computed(() =>
  dragX.value ? { transform: `translateX(${dragX.value}px)`, opacity: 1 - Math.min(Math.abs(dragX.value) / 400, 0.3) } : undefined,
);

function resetDrag() {
  isDragging.value = false;
  dragX.value = 0;
  dragAxis = null;
}

function handleTouchStart(e: TouchEvent) {
  // Leave horizontal gestures on sliders and text fields alone
  ignoreTouch = !!(e.target as HTMLElement | null)?.closest('input[type="range"], textarea, .dp__menu');
  touchStartX.value = e.changedTouches[0]!.clientX;
  touchStartY.value = e.changedTouches[0]!.clientY;
  dragAxis = null;
}

function handleTouchMove(e: TouchEvent) {
  if (ignoreTouch || dragAxis === 'y') return;
  const dx = e.changedTouches[0]!.clientX - touchStartX.value;
  const dy = e.changedTouches[0]!.clientY - touchStartY.value;
  if (!dragAxis) {
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    dragAxis = Math.abs(dx) > Math.abs(dy) * 1.5 ? 'x' : 'y';
    if (dragAxis === 'y') return;
  }
  isDragging.value = true;
  // Resist dragging towards a day that can't be reached
  const blocked = dx < 0 && !canGoNext();
  dragX.value = blocked ? dx * 0.2 : dx * 0.6;
}

function handleSwipeEnd(e: TouchEvent) {
  const dx = e.changedTouches[0]!.clientX - touchStartX.value;
  const wasHorizontal = dragAxis === 'x';
  resetDrag();
  if (ignoreTouch || !wasHorizontal || Math.abs(dx) < swipeThreshold) return;

  if (dx < 0) {
    // Swipe left = next day
    if (canGoNext()) shiftDay(1);
  } else {
    // Swipe right = previous day
    shiftDay(-1);
  }
}

function canGoNext() {
  const next = new Date(selectedDate.value);
  next.setDate(next.getDate() + 1);
  next.setHours(0, 0, 0, 0);
  const max = new Date(maxDate.value);
  max.setHours(0, 0, 0, 0);
  return next <= max;
}

function shiftDay(delta: number) {
  const d = new Date(selectedDate.value);
  d.setDate(d.getDate() + delta);
  selectedDate.value = d;
}

// --- Date ---
const maxDate = computed(() => {
  const d = new Date();
  if (d.getHours() >= 20) {
    d.setDate(d.getDate() + 1);
  }
  return d;
});
const selectedDate = ref(new Date());

const selectedDateString = computed(() =>
  getCurrentDateString(selectedDate.value)
);

// Slide direction follows the date change, whatever triggered it (swipe, arrows, picker)
watch(selectedDateString, (next, prev) => {
  if (prev) swipeDirection.value = next > prev ? 'left' : 'right';
}, { flush: 'sync' });

// --- Draft management ---
const { getDraft, saveDraft, clearDraft, cleanupOldDrafts } = useDraftEntry();
const isRestoredDraft = ref(false);
const isInitializingEntry = ref(false);

// --- Entry data ---
const entryData = ref<MetricDataMap>({});

// --- Mood tint follows the entry being edited ---
const { moodMetric, setLiveMoodValue } = useMoodTheme();
watchEffect(() => {
  const id = moodMetric.value?.id;
  const value = id ? entryData.value[id] : null;
  setLiveMoodValue(typeof value === 'number' ? value : null);
});

onUnmounted(() => setLiveMoodValue(null));
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
  cleanupOldDrafts();

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

  onUnmounted(() => {
    observer.disconnect();
    fabObserver.disconnect();
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

// Auto-recompute calculated metric values when source metrics change
// and auto-save draft to localStorage when user makes changes.
watch(
  entryData,
  (data) => {
    const calcMetrics = metricConfigs.value.filter(
      (m): m is CalculatedMetricConfig => m.type === 'calculated'
    );
    if (calcMetrics.length > 0) {
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
        return;
      }
    }

    if (!isInitializingEntry.value && isInitialized.value) {
      saveDraft(selectedDateString.value, data);
    }
  },
  { deep: true },
);

function loadEntryForDate(dateStr: string, options: { ignoreDraft?: boolean } = {}) {
  isInitializingEntry.value = true;
  const draft = !options.ignoreDraft ? getDraft(dateStr) : null;
  const existing = getEntryByDate(dateStr);

  const defaults: MetricDataMap = {};
  for (const m of metricConfigs.value) {
    defaults[m.id] = getDefaultValueForType(m);
  }

  if (draft) {
    entryData.value = { ...defaults, ...(existing?.data ?? {}), ...draft };
    isRestoredDraft.value = true;
  } else {
    isRestoredDraft.value = false;
    if (existing) {
      entryData.value = { ...defaults, ...existing.data };
    } else {
      entryData.value = defaults;
    }
  }

  nextTick(() => {
    isInitializingEntry.value = false;
  });
}

function updateMetricValue(metricId: string, value: MetricValue) {
  entryData.value = { ...entryData.value, [metricId]: value };
}

async function handleSave() {
  isSaving.value = true;
  try {
    await saveEntry(selectedDateString.value, entryData.value);
    clearDraft(selectedDateString.value);
    isRestoredDraft.value = false;
    showToastNotification('Entry saved successfully!');
  } catch {
    showToastNotification('Failed to save entry');
  } finally {
    isSaving.value = false;
  }
}

function handleDiscardDraft() {
  clearDraft(selectedDateString.value);
  isRestoredDraft.value = false;
  loadEntryForDate(selectedDateString.value, { ignoreDraft: true });
  showToastNotification('Draft discarded');
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
