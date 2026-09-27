<script setup lang="ts">
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { moodlyBackendService } from "~/utils/moodly-backend";
import { getCurrentDateString } from "~/utils/helpers";

const { darkMode } = useMoodly();

const message = ref("");
const sendDate = ref<Date | null>(null);
const isSubmitting = ref(false);
const toast = ref<{ message: string; tone: "success" | "error" } | null>(null);

function notify(message: string, tone: "success" | "error" = "success") {
  toast.value = { message, tone };
  setTimeout(() => {
    toast.value = null;
  }, 4000);
}

// Calculate tomorrow's date as minimum
const minDate = computed(() => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
});

const canSubmit = computed(() => {
  return message.value.trim().length > 0 && sendDate.value !== null;
});

const formatDateDisplay = (date: Date | null): string => {
  if (!date) return "Pick a date";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const handleSubmit = async () => {
  if (!canSubmit.value || isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    // Local calendar date; toISOString() would shift it to the previous day east of UTC
    const deliveryDate = sendDate.value!;
    const dateStr = getCurrentDateString(deliveryDate);
    await moodlyBackendService.createLetter(message.value.trim(), dateStr);

    notify(`Letter scheduled for ${formatDateDisplay(deliveryDate)}`);
    message.value = "";
    sendDate.value = null;
  } catch (error) {
    console.error("Failed to schedule letter:", error);
    notify("Couldn't schedule the letter. Try again.", "error");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="page">
    <header class="mb-6">
      <h1 class="page-title">Letters</h1>
      <p class="page-subtitle">Write to your future self. It arrives by email on the day you pick.</p>
    </header>

    <Transition name="toast">
      <div v-if="toast" class="toast" :class="{ 'bg-danger text-white': toast.tone === 'error' }" role="status">
        <Icon :name="toast.tone === 'error' ? 'solar:danger-circle-bold' : 'solar:check-circle-bold'" size="20" />
        {{ toast.message }}
      </div>
    </Transition>

    <form class="card flex flex-col gap-5 p-5 sm:p-6" @submit.prevent="handleSubmit">
      <div>
        <label for="letter-message" class="field-label">Your letter</label>
        <textarea
          id="letter-message"
          v-model="message"
          class="input min-h-64 resize-y text-base leading-7"
          placeholder="Dear future me,"
          rows="10"
        ></textarea>
        <p class="mt-1.5 text-right text-xs tabular-nums text-faint">{{ message.length }} characters</p>
      </div>

      <div>
        <span class="field-label">Deliver on</span>
        <ClientOnly>
          <VueDatePicker
            v-model="sendDate"
            :min-date="minDate"
            :dark="darkMode"
            :enable-time-picker="false"
            auto-apply
            :clearable="false"
          >
            <template #trigger>
              <button type="button" class="input flex items-center gap-2 text-left" :class="{ 'text-faint': !sendDate }">
                <Icon name="solar:calendar-bold" size="18" class="text-muted" />
                {{ formatDateDisplay(sendDate) }}
              </button>
            </template>
          </VueDatePicker>
        </ClientOnly>
        <p class="mt-1.5 text-xs text-muted">Sent in the evening of that day to the email in your settings.</p>
      </div>

      <button type="submit" class="btn btn-primary h-12 self-stretch sm:self-end" :disabled="!canSubmit || isSubmitting">
        <Icon :name="isSubmitting ? 'svg-spinners:ring-resize' : 'solar:letter-bold'" size="20" />
        {{ isSubmitting ? "Scheduling…" : "Schedule letter" }}
      </button>
    </form>
  </div>
</template>
