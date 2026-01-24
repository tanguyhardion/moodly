<script setup lang="ts">
import { getCurrentDateString, isWeekend } from "~/utils/helpers";

const {
  metricConfigs,
  saveEntry,
  getEntryByDate,
  hasEntryForDate,
  darkMode,
  isInitialized,
  isLoading,
  entries,
  getPreviousEntry,
} = useMoodly();

const { updateStreakFromEntries } = useStreak();

const metrics = ref({
  mood: 3,
  energy: 3,
  sleep: 3,
  focus: 3,
  stress: 3,
  look: 3,
});

const sleepHours = ref<number | null>(null);
const bedtime = ref<string | null>(null);
const wakeUpTime = ref<string | null>(null);

const checkboxes = ref({
  healthyFood: false,
  caffeine: false,
  gym: false,
  hardWork: false,
  dayOff: false,
  alcohol: false,
  misc: false,
});

const note = ref("");
const location = ref<{
  name: string;
  latitude: number;
  longitude: number;
} | null>(null);
const showToast = ref(false);
const isReady = ref(false);

// Selected date (defaults to today)
const selectedDate = ref<Date>(new Date());

// Max date is today, but allow tomorrow after 10pm
const maxDate = computed(() => {
  const d = new Date();
  if (d.getHours() >= 22) {
    const tomorrow = new Date(d);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  return d;
});

// Check if selected date is tomorrow
const isTomorrow = computed(() => {
  if (!selectedDate.value) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(selectedDate.value);
  selected.setHours(0, 0, 0, 0);
  return selected > today;
});

// Filter metrics to show only sleep (bedtime) for tomorrow
const filteredMetricConfigs = computed(() => {
  if (isTomorrow.value) {
    return metricConfigs.filter((c) => c.key === "sleep");
  }
  return metricConfigs;
});

// Computed property to check if entry exists for selected date
const hasEntry = computed(() =>
  hasEntryForDate(getCurrentDateString(selectedDate.value)),
);

// Function to load entry for the selected date
const loadEntry = () => {
  const entry = getEntryByDate(getCurrentDateString(selectedDate.value));
  const _isWeekend = isWeekend(selectedDate.value);

  if (entry) {
    // Load entry metrics, defaulting any null values to 3
    metrics.value = {
      mood: entry.metrics.mood ?? 3,
      energy: entry.metrics.energy ?? 3,
      sleep: entry.metrics.sleep ?? 3,
      focus: entry.metrics.focus ?? 3,
      stress: entry.metrics.stress ?? 3,
      look: entry.metrics.look ?? 3,
    };
    sleepHours.value = entry.metrics.sleepHours ?? null;
    bedtime.value = entry.metrics.bedtime ?? null;
    wakeUpTime.value = entry.metrics.wakeUpTime ?? null;
    checkboxes.value = entry.checkboxes
      ? { ...entry.checkboxes }
      : {
          healthyFood: false,
          caffeine: false,
          gym: false,
          hardWork: false,
          dayOff: _isWeekend,
          alcohol: false,
          misc: false,
        };
    note.value = entry.note || "";
    location.value = entry.location || null;
  } else {
    // Reset to defaults if no entry exists
    metrics.value = {
      mood: 3,
      energy: 3,
      sleep: 3,
      focus: 3,
      look: 3,
      stress: 3,
    };
    sleepHours.value = null;
    bedtime.value = null;
    wakeUpTime.value = null;
    checkboxes.value = {
      healthyFood: false,
      caffeine: false,
      gym: false,
      hardWork: false,
      dayOff: _isWeekend,
      alcohol: false,
      misc: false,
    };
    note.value = "";

    // Use previous entry's location as default for new entries
    const previousEntry = getPreviousEntry(
      getCurrentDateString(selectedDate.value),
    );
    location.value = previousEntry?.location || null;
  }
};

// Watch for date changes
watch(selectedDate, () => {
  if (isReady.value) {
    loadEntry();
  }
});

// Watch for data initialization
watch(isInitialized, (initialized) => {
  if (initialized && !isReady.value) {
    loadEntry();
    isReady.value = true;
  }
});

// Update streak data when entries change
watch(
  entries,
  (newEntries) => {
    if (newEntries.length > 0) {
      updateStreakFromEntries(newEntries);
    }
  },
  { immediate: true },
);

const dateSelectorRef = ref<HTMLElement | null>(null);
const showStickyHeader = ref(false);
const saveBtnRef = ref<HTMLElement | null>(null);
const showFab = ref(false);

// Intersection Observer for sticky header
onMounted(() => {
  if (isInitialized.value) {
    loadEntry();
    isReady.value = true;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry) {
        showStickyHeader.value =
          !entry.isIntersecting && entry.boundingClientRect.top < 0;
      }
    },
    { threshold: 0, rootMargin: "-80px 0px 0px 0px" }, // Adjust rootMargin based on navbar height
  );

  if (dateSelectorRef.value) {
    observer.observe(dateSelectorRef.value);
  }

  const fabObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry) {
        // Show FAB only if the save button is NOT visible 
        // AND checks if we haven't scrolled past it (though usually it's at bottom).
        // If the button is below the viewport (top > 0) and not intersecting, we show FAB.
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

  // Watch for ref changes (e.g. after loading)
  watch(dateSelectorRef, (el) => {
    if (el) observer.observe(el);
  });
});

const handleSave = async () => {
  try {
    // Calculate sleep hours from bedtime and wakeUpTime
    let calculatedSleepHours = null;
    if (bedtime.value && wakeUpTime.value) {
      const [bedH, bedM] = bedtime.value.split(":").map(Number);
      const [wakeH, wakeM] = wakeUpTime.value.split(":").map(Number);

      const bedDate = new Date(2000, 0, 1, bedH, bedM);
      let wakeDate = new Date(2000, 0, 1, wakeH, wakeM);

      if (wakeDate < bedDate) {
        wakeDate.setDate(wakeDate.getDate() + 1);
      }

      // Subtract 15 minutes to account for time to fall asleep
      const diffMs = wakeDate.getTime() - bedDate.getTime() - 15 * 60 * 1000;
      calculatedSleepHours = Math.max(
        0,
        Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10,
      );
    }

    // Create metrics object with sleepHours
    // If saving for tomorrow (bedtime only), set other metrics to null
    const metricsToSave = isTomorrow.value
      ? {
          mood: null,
          energy: null,
          sleep: null,
          focus: null,
          stress: null,
          look: null,
          bedtime: bedtime.value,
          wakeUpTime: null,
          sleepHours: null,
        }
      : {
          ...metrics.value,
          bedtime: bedtime.value,
          wakeUpTime: wakeUpTime.value,
          sleepHours: calculatedSleepHours,
        };

    await saveEntry(
      metricsToSave,
      isTomorrow.value ? undefined : checkboxes.value,
      isTomorrow.value ? undefined : note.value || undefined,
      getCurrentDateString(selectedDate.value),
      isTomorrow.value ? undefined : location.value || undefined,
    );
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 3000);
  } catch (error) {
    console.error("Failed to save entry:", error);
    alert("Failed to save entry. Please try again.");
  }
};
</script>

<template>
  <div class="page home-page">
    <LoadingState v-if="!isReady" message="Loading your check-in..." />
    <div v-else class="content">
      <div class="page-header">
        <h1 class="page-title">
          <HeartFaceIcon class="wave" />
          {{ isTomorrow ? "Going to bed?" : "How are you feeling?" }}
        </h1>
        <p class="page-subtitle">
          {{
            isTomorrow
              ? "Set your bedtime for tomorrow"
              : hasEntry
                ? "Update your check-in"
                : "Take a moment to check in with yourself"
          }}
        </p>
      </div>

      <!-- Streak Display -->
      <StreakDisplay v-if="!isTomorrow" />

      <div ref="dateSelectorRef">
        <DateSelector
          v-model="selectedDate"
          :max-date="maxDate"
          :dark-mode="darkMode"
        />
      </div>

      <!-- Sticky Date Selector -->
      <Transition name="slide-down">
        <div v-if="showStickyHeader" class="sticky-header">
          <div class="sticky-content">
            <DateSelector
              v-model="selectedDate"
              :max-date="maxDate"
              :dark-mode="darkMode"
              :simple="true"
            />
          </div>
        </div>
      </Transition>

      <!-- Empty State Banner -->
      <Transition name="empty-state">
        <div v-if="!hasEntry && !isTomorrow" class="empty-state-banner">
          <div class="empty-icon">
            <Icon name="solar:calendar-mark-broken" size="32" />
          </div>
          <div class="empty-content">
            <h3 class="empty-title">No check-in yet</h3>
            <p class="empty-description">
              Fill in your metrics below to track how you're feeling today
            </p>
          </div>
        </div>
      </Transition>

      <div class="metrics-container">
        <MetricSlider
          v-for="config in filteredMetricConfigs"
          :key="config.key"
          v-model="metrics[config.key]"
          :config="config"
          :show-hours-input="config.key === 'sleep'"
          :bedtime="bedtime"
          :wake-up-time="wakeUpTime"
          :bedtime-only="isTomorrow"
          @update:bedtime="bedtime = $event"
          @update:wake-up-time="wakeUpTime = $event"
        />
      </div>

      <DailyCheckins v-if="!isTomorrow" v-model="checkboxes" />

      <LocationInput v-if="!isTomorrow" v-model="location" />

      <NoteInput v-if="!isTomorrow" v-model="note" />

      <div class="actions">
        <button
          ref="saveBtnRef"
          @click="handleSave"
          class="btn btn-primary save-btn"
          :disabled="isLoading"
        >
          <Icon v-if="!isLoading" name="solar:check-circle-bold" size="20" />
          <Icon v-else name="svg-spinners:ring-resize" size="20" />
          {{
            isLoading
              ? "Saving..."
              : isTomorrow
                ? "Save Bedtime"
                : hasEntry
                  ? "Update Entry"
                  : "Save Entry"
          }}
        </button>
      </div>

      <Transition name="toast">
        <div v-if="showToast" class="toast">
          <Icon name="solar:check-circle-bold" size="20" />
          Entry saved successfully!
        </div>
      </Transition>

      <Transition name="fab">
        <button
          v-if="showFab && isReady"
          @click="handleSave"
          class="fab-btn"
          :class="{ 'is-loading': isLoading }"
          :aria-label="hasEntry ? 'Update Entry' : 'Save Entry'"
          :disabled="isLoading"
        >
          <Icon v-if="!isLoading" name="solar:check-circle-bold" size="28" />
          <Icon v-else name="svg-spinners:ring-resize" size="28" />
        </button>
      </Transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home-page {
  max-width: var(--max-width-sm);
  margin: 0 auto;

  .content {
    animation: fadeIn 0.3s ease;
  }

  .page-header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
    padding-top: var(--spacing-sm);

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-md);
      letter-spacing: -0.025em;

      .wave {
        display: flex;
        align-items: center;
        color: var(--primary);
        animation: wave 2.5s ease-in-out infinite;
        filter: drop-shadow(0 2px 4px rgba(var(--color-shadow-primary), 0.3));

        @keyframes wave {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
          }
          25% {
            transform: scale(1.1) rotate(10deg);
          }
          75% {
            transform: scale(1.1) rotate(-10deg);
          }
        }
      }
    }

    .page-subtitle {
      font-size: 1rem;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.6;
      font-weight: 500;
    }
  }

  .actions {
    display: flex;
    justify-content: center;

    /* Save button - extends global .btn and .btn-primary */
    .save-btn {
      width: 220px;
      padding: var(--spacing-md) var(--spacing-xl);
    }
  }

  .metrics-container {
    display: grid;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
  }

  /* Sticky header uses global .sticky-header and .sticky-content */

  /* Empty state banner - page-specific */
  .empty-state-banner {
    margin-bottom: var(--spacing-xl);
    padding: 1.75rem var(--spacing-xl);
    background: linear-gradient(
      135deg,
      var(--primary-rgba-12),
      rgba(var(--color-shadow-secondary), 0.12)
    );
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    gap: 1.25rem;
    box-shadow: var(--shadow-md);
    border: 2px dashed var(--primary-rgba-30);
    backdrop-filter: blur(10px);

    .empty-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      background: var(--bg-glass);
      border-radius: var(--radius-md);
      color: var(--primary);
      flex-shrink: 0;
      box-shadow: var(--shadow-sm);

      :root.dark & {
        background: var(--bg-glass-light);
        color: var(--primary-light);
      }
    }

    .empty-content {
      flex: 1;

      .empty-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        letter-spacing: -0.01em;
      }

      .empty-description {
        font-size: 0.9375rem;
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.5;
      }
    }
  }

  .empty-state-enter-active,
  .empty-state-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .empty-state-enter-from,
  .empty-state-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }

  /* Floating Action Button */
  .fab-btn {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    
    // Copying gradient styles from .btn-primary
    background: var(--gradient-primary);
    position: fixed; /* Re-affirm fixed since we have 'position: absolute' in ::before */
    overflow: hidden; /* Ensure pseudo-element doesn't overflow round shape */
    
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
}
</style>
