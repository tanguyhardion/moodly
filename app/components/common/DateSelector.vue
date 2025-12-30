<script setup lang="ts">
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

const props = defineProps<{
  modelValue: Date;
  maxDate: Date;
  darkMode: boolean;
  simple?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: Date): void;
}>();

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

// Check if selected date is today
const isToday = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(props.modelValue);
  selected.setHours(0, 0, 0, 0);
  return selected.getTime() === today.getTime();
});

// Navigate to previous day
const goToPreviousDay = () => {
  const newDate = new Date(props.modelValue);
  newDate.setDate(newDate.getDate() - 1);
  emit("update:modelValue", newDate);
};

// Navigate to next day
const goToNextDay = () => {
  const newDate = new Date(props.modelValue);
  newDate.setDate(newDate.getDate() + 1);
  // Don't go beyond maxDate
  if (newDate <= props.maxDate) {
    emit("update:modelValue", newDate);
  }
};
</script>

<template>
  <div class="date-selector" :class="{ 'is-simple': simple }">
    <div v-if="!simple" class="selector-header">
      <div class="icon-container">
        <Icon name="solar:calendar-bold" size="24" class="calendar-icon" />
      </div>
      <label class="date-label">Select Date</label>
    </div>
    <div class="date-picker-wrapper">
      <button
        class="nav-arrow left-arrow"
        @click="goToPreviousDay"
        title="Previous day"
      >
        <Icon name="solar:alt-arrow-left-bold" size="20" />
      </button>
      <ClientOnly>
        <VueDatePicker
          :model-value="modelValue"
          @update:model-value="$emit('update:modelValue', $event)"
          :max-date="maxDate"
          :dark="darkMode"
          :enable-time-picker="false"
          auto-apply
          :clearable="false"
          class="date-picker"
        >
          <template #trigger>
            <button class="date-button">
              <Icon name="solar:calendar-bold" size="20" class="button-icon" />
              <span class="button-text">{{
                formatDateDisplay(modelValue)
              }}</span>
            </button>
          </template>
        </VueDatePicker>
      </ClientOnly>
      <button
        v-if="!isToday"
        class="nav-arrow right-arrow"
        @click="goToNextDay"
        title="Next day"
      >
        <Icon name="solar:alt-arrow-right-bold" size="20" />
      </button>
      <div v-else class="arrow-placeholder"></div>
    </div>
  </div>
</template>

<style scoped>
.date-selector {
  margin-bottom: var(--spacing-xl);
  padding: 1.75rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.date-selector:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-light);
}

.date-selector.is-simple {
  margin-bottom: 0;
  padding: 0.5rem;
  background: transparent;
  border: none;
  box-shadow: none;
}

.date-selector.is-simple:hover {
  transform: none;
}

.date-selector.is-simple .date-button {
  padding: 0.75rem 1rem;
}

.date-selector.is-simple .nav-arrow {
  width: 40px;
  height: 40px;
}

.selector-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.date-label {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.date-picker-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.date-picker {
  flex: 1;
}

.nav-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  background: linear-gradient(
    135deg,
    var(--primary-rgba-08) 0%,
    rgba(var(--color-primary-gradient-end), 0.08) 100%
  );
  border: 2px solid var(--primary-rgba-20);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 0 0 rgba(var(--color-shadow-primary), 0);
}

.nav-arrow:hover {
  border-color: var(--primary-rgba-40);
  background: linear-gradient(
    135deg,
    var(--primary-rgba-12) 0%,
    rgba(var(--color-primary-gradient-end), 0.12) 100%
  );
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--primary-rgba-20);
}

.nav-arrow:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(var(--color-shadow-primary), 0.15);
}

.arrow-placeholder {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.date-button {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  width: 100%;
  padding: 1.125rem 1.5rem;
  background: linear-gradient(
    135deg,
    var(--primary-rgba-08) 0%,
    rgba(var(--color-primary-gradient-end), 0.08) 100%
  );
  border: 2px solid var(--primary-rgba-20);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 0 0 rgba(var(--color-shadow-primary), 0);
}

.button-icon {
  flex-shrink: 0;
}

.button-text {
  flex: 1;
  text-align: center;
  margin-right: 20px;
}

.date-button:hover {
  border-color: var(--primary-rgba-40);
  background: linear-gradient(
    135deg,
    var(--primary-rgba-12) 0%,
    rgba(var(--color-primary-gradient-end), 0.12) 100%
  );
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--primary-rgba-20);
}

.date-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(var(--color-shadow-primary), 0.15);
}

/* Custom vue-datepicker styling */
:deep(.dp__theme_light),
:deep(.dp__theme_dark) {
  --dp-background-color: var(--card-bg);
  --dp-text-color: var(--text-primary);
  --dp-hover-color: var(--hover-bg);
  --dp-hover-text-color: var(--text-primary);
  --dp-hover-icon-color: var(--text-primary);
  --dp-primary-color: var(--primary);
  --dp-primary-text-color: #fff;
  --dp-secondary-color: var(--text-secondary);
  --dp-border-color: var(--border);
  --dp-menu-border-color: var(--border);
  --dp-border-color-hover: var(--primary);
  --dp-disabled-color: var(--text-tertiary);
  --dp-scroll-bar-background: var(--hover-bg);
  --dp-scroll-bar-color: var(--text-secondary);
  --dp-success-color: var(--success);
  --dp-success-color-disabled: #a5d4a7;
  --dp-icon-color: var(--text-primary);
  --dp-danger-color: var(--error);
  --dp-highlight-color: rgba(var(--color-shadow-primary), 0.1);
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
  background: var(--gradient-primary);
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
  background: var(--gradient-primary);
  color: white;
}

:deep(.dp__button) {
  background: transparent;
  color: var(--text-primary);
}

:deep(.dp__button:hover) {
  background: var(--hover-bg);
}

.calendar-icon {
  color: var(--primary);
}
</style>
