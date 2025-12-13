<script setup lang="ts">
const {
  metricConfigs,
  saveEntry,
  getEntryByDate,
  hasEntryForDate,
  darkMode,
  isInitialized,
  isLoading,
} = useMoodly();

const metrics = ref({
  mood: 3,
  energy: 3,
  sleep: 3,
  focus: 3,
});

const checkboxes = ref({
  healthyFood: false,
  caffeine: false,
  gym: false,
  hardWork: false,
  misc: false,
});

const note = ref("");
const showToast = ref(false);
const isReady = ref(false);

// Selected date (defaults to today)
const selectedDate = ref<Date>(new Date());

// Max date is today
const maxDate = new Date();

// Convert date to string format
const dateToString = (date: Date): string => {
  return date.toISOString().split("T")[0]!;
};

// Computed property to check if entry exists for selected date
const hasEntry = computed(() =>
  hasEntryForDate(dateToString(selectedDate.value)),
);

// Function to load entry for the selected date
const loadEntry = () => {
  const entry = getEntryByDate(dateToString(selectedDate.value));
  if (entry) {
    metrics.value = { ...entry.metrics };
    checkboxes.value = entry.checkboxes
      ? { ...entry.checkboxes }
      : {
          healthyFood: false,
          caffeine: false,
          gym: false,
          hardWork: false,
          misc: false,
        };
    note.value = entry.note || "";
  } else {
    // Reset to defaults if no entry exists
    metrics.value = {
      mood: 3,
      energy: 3,
      sleep: 3,
      focus: 3,
    };
    checkboxes.value = {
      healthyFood: false,
      caffeine: false,
      gym: false,
      hardWork: false,
      misc: false,
    };
    note.value = "";
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

// Load entry on mount if data is already initialized
onMounted(() => {
  if (isInitialized.value) {
    loadEntry();
    isReady.value = true;
  }
});

const handleSave = async () => {
  try {
    await saveEntry(
      metrics.value,
      checkboxes.value,
      note.value || undefined,
      dateToString(selectedDate.value),
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
          <Icon name="solar:hand-heart-bold" size="32" class="wave" />
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

      <DateSelector
        v-model="selectedDate"
        :max-date="maxDate"
        :dark-mode="darkMode"
      />

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
  max-width: 600px;
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
  margin-bottom: 2.5rem;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  letter-spacing: -0.025em;
}

.wave {
  display: inline-flex;
  color: var(--primary);
  animation: wave 2.5s ease-in-out infinite;
  filter: drop-shadow(0 2px 4px rgba(255, 107, 157, 0.3));
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
  font-size: 1.05rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
  font-weight: 500;
}

.metrics-container {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  justify-content: center;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 1rem 2.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 1.0625rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: -0.01em;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: linear-gradient(135deg, #ff6b9d 0%, #ffa06b 100%);
  color: white;
  box-shadow: var(--shadow-colored);
}

.btn-primary::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #e94a7c 0%, #ff8a52 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px -5px rgba(255, 107, 157, 0.4);
}

.btn-primary:hover::before {
  opacity: 1;
}

.btn-primary:active {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px -5px rgba(255, 107, 157, 0.4);
}

.save-btn {
  width: 220px;
  justify-content: center;
}

.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 1.125rem 1.75rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.9375rem;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(1rem);
}

.empty-state-banner {
  margin-bottom: 2rem;
  padding: 1.75rem 2rem;
  background: linear-gradient(
    135deg,
    var(--primary-light),
    var(--secondary-light)
  );
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: var(--shadow-md);
  border: 2px dashed rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

:root.dark .empty-state-banner {
  background: linear-gradient(
    135deg,
    rgba(255, 141, 181, 0.15),
    rgba(110, 221, 213, 0.15)
  );
  border-color: rgba(255, 141, 181, 0.3);
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-md);
  color: var(--primary);
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

:root.dark .empty-icon {
  background: rgba(255, 255, 255, 0.1);
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
