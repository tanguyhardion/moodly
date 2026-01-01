<script setup lang="ts">
const {
  metricConfigs,
  saveEntry,
  getEntryByDate,
  hasEntryForDate,
  darkMode,
  isInitialized,
  isLoading,
  entries,
} = useMoodly();

const { updateStreakFromEntries } = useStreak();

const metrics = ref({
  mood: 3,
  energy: 3,
  sleep: 3,
  focus: 3,
  stress: 3,
});

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

// Max date is today
const maxDate = new Date();

// Convert date to string format
const dateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Computed property to check if entry exists for selected date
const hasEntry = computed(() =>
  hasEntryForDate(dateToString(selectedDate.value)),
);

// Function to load entry for the selected date
const loadEntry = () => {
  const entry = getEntryByDate(dateToString(selectedDate.value));
  const isWeekend =
    selectedDate.value.getDay() === 0 || selectedDate.value.getDay() === 6;

  if (entry) {
    // Load entry metrics, defaulting any null values to 3
    metrics.value = {
      mood: entry.metrics.mood ?? 3,
      energy: entry.metrics.energy ?? 3,
      sleep: entry.metrics.sleep ?? 3,
      focus: entry.metrics.focus ?? 3,
      stress: entry.metrics.stress ?? 3,
    };
    checkboxes.value = entry.checkboxes
      ? { ...entry.checkboxes }
      : {
          healthyFood: false,
          caffeine: false,
          gym: false,
          hardWork: false,
          dayOff: isWeekend,
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
      stress: 3,
    };
    checkboxes.value = {
      healthyFood: false,
      caffeine: false,
      gym: false,
      hardWork: false,
      dayOff: false,
      alcohol: false,
      misc: false,
    };
    note.value = "";
    location.value = null;
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

  // Watch for ref changes (e.g. after loading)
  watch(dateSelectorRef, (el) => {
    if (el) observer.observe(el);
  });
});

const handleSave = async () => {
  try {
    await saveEntry(
      metrics.value,
      checkboxes.value,
      note.value || undefined,
      dateToString(selectedDate.value),
      location.value || undefined,
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
          How are you feeling?
        </h1>
        <p class="page-subtitle">
          {{
            hasEntry
              ? "Update your check-in"
              : "Take a moment to check in with yourself"
          }}
        </p>
      </div>

      <!-- Streak Display -->
      <StreakDisplay />

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
        <div v-if="!hasEntry" class="empty-state-banner">
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
          v-for="config in metricConfigs"
          :key="config.key"
          v-model="metrics[config.key]"
          :config="config"
        />
      </div>

      <DailyCheckins v-model="checkboxes" />

      <LocationInput v-model="location" />

      <NoteInput v-model="note" />

      <div class="actions">
        <button
          @click="handleSave"
          class="btn btn-primary save-btn"
          :disabled="isLoading"
        >
          <Icon v-if="!isLoading" name="solar:check-circle-bold" size="20" />
          <Icon v-else name="svg-spinners:ring-resize" size="20" />
          {{
            isLoading ? "Saving..." : hasEntry ? "Update Entry" : "Save Entry"
          }}
        </button>
      </div>

      <Transition name="toast">
        <div v-if="showToast" class="toast">
          <Icon name="solar:check-circle-bold" size="20" />
          Entry saved successfully!
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  max-width: var(--max-width-sm);
  margin: 0 auto;
}

.content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  padding-top: var(--spacing-sm);
}

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
}

.wave {
  display: flex;
  align-items: center;
  color: var(--primary);
  animation: wave 2.5s ease-in-out infinite;
  filter: drop-shadow(0 2px 4px rgba(var(--color-shadow-primary), 0.3));
}

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

.page-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
  font-weight: 500;
}

.actions {
  display: flex;
  justify-content: center;
}

.metrics-container {
  display: grid;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

/* Save button - extends global .btn and .btn-primary */
.save-btn {
  width: 220px;
  padding: var(--spacing-md) var(--spacing-xl);
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
}

:root.dark .empty-state-banner {
  background: linear-gradient(
    135deg,
    var(--primary-rgba-15),
    rgba(var(--color-shadow-secondary), 0.15)
  );
  border-color: var(--primary-rgba-30);
}

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
}

:root.dark .empty-icon {
  background: var(--bg-glass-light);
  color: var(--primary-light);
}

.empty-content {
  flex: 1;
}

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

.empty-state-enter-active,
.empty-state-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.empty-state-enter-from,
.empty-state-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
