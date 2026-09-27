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
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const entryDate = new Date(date);
  entryDate.setHours(0, 0, 0, 0);

  if (entryDate.getTime() === today.getTime()) {
    return "Today";
  } else if (entryDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  } else if (entryDate.getTime() === tomorrow.getTime()) {
    return "Tomorrow";
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }
};

// Relative labels ("Today") get the full date underneath
const isRelativeDay = computed(() =>
  ["Today", "Yesterday", "Tomorrow"].includes(formatDateDisplay(props.modelValue)),
);

// Check if we can navigate to the next day
const canGoNext = computed(() => {
  const current = new Date(props.modelValue);
  current.setHours(0, 0, 0, 0);
  const max = new Date(props.maxDate);
  max.setHours(0, 0, 0, 0);
  return current < max;
});

// Navigate to previous day
const goToPreviousDay = () => {
  const newDate = new Date(props.modelValue);
  newDate.setDate(newDate.getDate() - 1);
  emit("update:modelValue", newDate);
};

// Navigate to next day
const goToNextDay = () => {
  if (canGoNext.value) {
    const newDate = new Date(props.modelValue);
    newDate.setDate(newDate.getDate() + 1);
    emit("update:modelValue", newDate);
  }
};
</script>

<template>
  <div class="flex items-center justify-between gap-2">
    <button class="icon-btn bg-surface shadow-card dark:shadow-none" type="button" title="Previous day" @click="goToPreviousDay">
      <Icon name="solar:alt-arrow-left-bold" size="20" />
    </button>
    <ClientOnly>
      <VueDatePicker
        :model-value="modelValue"
        :max-date="maxDate"
        :dark="darkMode"
        :enable-time-picker="false"
        auto-apply
        :clearable="false"
        @update:model-value="$emit('update:modelValue', $event)"
      >
        <template #trigger>
          <button
            type="button"
            class="group flex flex-col items-center rounded-2xl px-3 py-1 text-center transition hover:bg-mood-soft"
            title="Pick a date"
          >
            <span class="font-display font-extrabold leading-tight tracking-tight" :class="simple ? 'text-lg' : 'text-3xl sm:text-4xl'">
              {{ formatDateDisplay(modelValue) }}
            </span>
            <span v-if="!simple && isRelativeDay" class="flex items-center gap-1 text-sm font-medium text-muted group-hover:text-ink">
              <Icon name="solar:calendar-bold" size="14" />
              {{ modelValue.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }}
            </span>
          </button>
        </template>
      </VueDatePicker>
    </ClientOnly>
    <button
      class="icon-btn bg-surface shadow-card dark:shadow-none"
      :class="{ 'invisible': !canGoNext }"
      type="button"
      title="Next day"
      :disabled="!canGoNext"
      @click="goToNextDay"
    >
      <Icon name="solar:alt-arrow-right-bold" size="20" />
    </button>
  </div>
</template>
