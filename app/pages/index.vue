<script setup lang="ts">
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

const { metricConfigs, saveEntry, getEntryByDate, hasEntryForDate, darkMode } =
  useMoodly();

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
  loadEntry();
});

// Load entry on mount
onMounted(() => {
  loadEntry();
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

// Format date for display
const formatDateDisplay = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const entryDate = new Date(date);
  entryDate.setHours(0, 0, 0, 0);

  if (entryDate.getTime() === today.getTime()) {
    return "Today";
  } else if (entryDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
};
</script>

<template>
  <div class="page home-page">
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

    <div class="date-selector">
      <label class="date-label">
        <Icon name="solar:calendar-bold" size="18" />
        Select Date
      </label>
      <div class="date-picker-wrapper">
        <ClientOnly>
          <VueDatePicker
            v-model="selectedDate"
            :max-date="maxDate"
            :dark="darkMode"
            :enable-time-picker="false"
            auto-apply
            :clearable="false"
          >
            <template #trigger>
              <button class="date-button">
                <Icon name="solar:calendar-bold" size="20" />
                <span>{{ formatDateDisplay(selectedDate) }}</span>
                <Icon name="solar:alt-arrow-down-bold" size="16" />
              </button>
            </template>
          </VueDatePicker>
        </ClientOnly>
      </div>
    </div>

    <div class="metrics-container">
      <MetricSlider
        v-for="config in metricConfigs"
        :key="config.key"
        v-model="metrics[config.key]"
        :config="config"
      />
    </div>

    <div class="checkboxes-section">
      <h3 class="checkboxes-title">
        <Icon name="solar:clipboard-check-bold" size="18" />
        Daily Check-ins
      </h3>
      <div class="checkbox-group">
        <label class="checkbox-item">
          <input type="checkbox" v-model="checkboxes.healthyFood" />
          <span class="checkbox-label">
            <Icon name="solar:leaf-bold" size="18" />
            Healthy Food
          </span>
        </label>
        <label class="checkbox-item">
          <input type="checkbox" v-model="checkboxes.caffeine" />
          <span class="checkbox-label">
            <Icon name="solar:cup-hot-bold" size="18" />
            Caffeine
          </span>
        </label>
        <label class="checkbox-item">
          <input type="checkbox" v-model="checkboxes.gym" />
          <span class="checkbox-label">
            <Icon name="solar:dumbbell-large-bold" size="18" />
            Gym
          </span>
        </label>
        <label class="checkbox-item">
          <input type="checkbox" v-model="checkboxes.hardWork" />
          <span class="checkbox-label">
            <Icon name="solar:laptop-bold" size="18" />
            Hard Work
          </span>
        </label>
        <label class="checkbox-item">
          <input type="checkbox" v-model="checkboxes.misc" />
          <span class="checkbox-label">
            <Icon name="solar:star-bold" size="18" />
            Misc
          </span>
        </label>
      </div>
    </div>

    <div class="note-section">
      <label for="note" class="note-label">
        <Icon name="solar:notes-bold" size="18" />
        Add a note (optional)
      </label>
      <textarea
        id="note"
        v-model="note"
        class="note-input"
        placeholder="How was your day? Any thoughts or reflections..."
        rows="4"
      ></textarea>
    </div>

    <div class="actions">
      <button @click="handleSave" class="btn btn-primary">
        <Icon name="solar:check-circle-bold" size="20" />
        {{ hasEntry ? "Update Entry" : "Save Entry" }}
      </button>
    </div>

    <Transition name="toast">
      <div v-if="showToast" class="toast">
        <Icon name="solar:check-circle-bold" size="20" />
        Entry saved successfully!
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.home-page {
  max-width: 600px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.wave {
  display: inline-flex;
  color: var(--primary);
  animation: wave 2s ease-in-out infinite;
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
}

.date-selector {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--card-bg);
  border: 2px solid var(--border);
  border-radius: 0.75rem;
}

.date-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1rem;
}

.date-picker-wrapper {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
}

.date-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.25rem;
  background: linear-gradient(
    135deg,
    rgba(255, 107, 157, 0.1) 0%,
    rgba(255, 160, 107, 0.1) 100%
  );
  border: 2px solid rgba(255, 107, 157, 0.2);
  border-radius: 0.75rem;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.date-button:hover {
  border-color: rgba(255, 107, 157, 0.4);
  background: linear-gradient(
    135deg,
    rgba(255, 107, 157, 0.15) 0%,
    rgba(255, 160, 107, 0.15) 100%
  );
  transform: translateY(-1px);
}

.date-button:active {
  transform: translateY(0);
}

.date-display {
  font-size: 1rem;
  color: var(--text-primary);
  margin: 0;
  font-weight: 600;
  text-align: center;
  padding: 0.5rem 1rem;
  background: linear-gradient(
    135deg,
    rgba(255, 107, 157, 0.1) 0%,
    rgba(255, 160, 107, 0.1) 100%
  );
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 107, 157, 0.2);
}

.metrics-container {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.checkboxes-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--card-bg);
  border: 2px solid var(--border);
  border-radius: 0.75rem;
}

.checkboxes-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 0.5rem;
  transition: background 0.2s ease;
}

.checkbox-item:hover {
  background: var(--hover-bg);
}

.checkbox-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--primary);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  user-select: none;
}

.note-section {
  margin-bottom: 2rem;
}

.note-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.note-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--border);
  border-radius: 0.75rem;
  background: var(--card-bg);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
  transition: all 0.2s ease;
}

.note-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.1);
}

.note-input::placeholder {
  color: var(--text-tertiary);
}

.actions {
  display: flex;
  justify-content: center;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #ff6b9d 0%, #ffa06b 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 107, 157, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: #4cd964;
  color: white;
  border-radius: 0.75rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(76, 217, 100, 0.3);
  z-index: 1000;
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

/* Custom vue-datepicker styling */
:deep(.dp__theme_light),
:deep(.dp__theme_dark) {
  --dp-background-color: var(--card-bg);
  --dp-text-color: var(--text-primary);
  --dp-hover-color: var(--hover-bg);
  --dp-hover-text-color: var(--text-primary);
  --dp-hover-icon-color: var(--text-primary);
  --dp-primary-color: #ff6b9d;
  --dp-primary-text-color: #fff;
  --dp-secondary-color: var(--text-secondary);
  --dp-border-color: var(--border);
  --dp-menu-border-color: var(--border);
  --dp-border-color-hover: var(--primary);
  --dp-disabled-color: var(--text-tertiary);
  --dp-scroll-bar-background: var(--hover-bg);
  --dp-scroll-bar-color: var(--text-secondary);
  --dp-success-color: #4cd964;
  --dp-success-color-disabled: #a5d4a7;
  --dp-icon-color: var(--text-primary);
  --dp-danger-color: #f44336;
  --dp-highlight-color: rgba(255, 107, 157, 0.1);
}

:deep(.dp__menu) {
  border: 2px solid var(--border);
  border-radius: 0.75rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  font-family: inherit;
}

:deep(.dp__calendar_header_item) {
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
}

:deep(.dp__calendar_item) {
  border-radius: 0.5rem;
}

:deep(.dp__today) {
  border: 2px solid var(--primary);
  font-weight: 700;
}

:deep(.dp__cell_inner) {
  border-radius: 0.5rem;
}

:deep(.dp__active_date) {
  background: linear-gradient(135deg, #ff6b9d 0%, #ffa06b 100%);
}

:deep(.dp__month_year_select) {
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.dp__month_year_select:hover) {
  background: var(--hover-bg);
  color: var(--text-primary);
}

:deep(.dp__arrow_top),
:deep(.dp__arrow_bottom) {
  color: var(--text-primary);
}

:deep(.dp__overlay) {
  background: var(--card-bg);
  border: 1px solid var(--border);
}

:deep(.dp__overlay_cell) {
  border-radius: 0.5rem;
  color: var(--text-primary);
}

:deep(.dp__overlay_cell:hover) {
  background: var(--hover-bg);
}

:deep(.dp__overlay_cell_active) {
  background: linear-gradient(135deg, #ff6b9d 0%, #ffa06b 100%);
  color: white;
}

:deep(.dp__button) {
  background: transparent;
  color: var(--text-primary);
}

:deep(.dp__button:hover) {
  background: var(--hover-bg);
}
</style>
