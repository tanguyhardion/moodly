<script setup lang="ts">
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { moodlyBackendService } from "~/utils/moodly-backend";

const { darkMode } = useMoodly();

const message = ref("");
const sendDate = ref<Date | null>(null);
const isSubmitting = ref(false);
const showSuccess = ref(false);

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
  if (!date) return "Select a date";
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
    const dateStr = sendDate.value!.toISOString().split("T")[0];
    await moodlyBackendService.createLetter(message.value.trim(), dateStr);

    // Show success and reset form
    showSuccess.value = true;
    message.value = "";
    sendDate.value = null;

    setTimeout(() => {
      showSuccess.value = false;
    }, 4000);
  } catch (error) {
    console.error("Failed to schedule letter:", error);
    alert("Failed to schedule letter. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">
        <Icon name="solar:letter-bold" size="28" class="icon-primary" />
        Letter to Future Self
      </h1>
      <p class="page-subtitle">Write a message to be delivered in the future</p>
    </div>

    <!-- Success Toast -->
    <Transition name="toast">
      <div v-if="showSuccess" class="toast success-toast">
        <Icon name="solar:check-circle-bold" size="20" />
        <span>Letter scheduled! It will be sent at 8 PM on the selected date.</span>
      </div>
    </Transition>

    <div class="letter-form">
      <!-- Message Input -->
      <div class="form-section">
        <div class="form-header">
          <Icon name="solar:pen-bold" size="20" class="icon-primary" />
          <label class="form-label">Your Message</label>
        </div>
        <textarea
          v-model="message"
          class="message-input"
          placeholder="Dear future me...

What do you want to tell yourself? Share your thoughts, hopes, goals, or reminders. This message will find its way back to you on the date you choose."
          rows="8"
        ></textarea>
        <div class="char-count">{{ message.length }} characters</div>
      </div>

      <!-- Date Picker -->
      <div class="form-section">
        <div class="form-header">
          <Icon name="solar:calendar-bold" size="20" class="icon-primary" />
          <label class="form-label">Delivery Date</label>
        </div>
        <ClientOnly>
          <VueDatePicker
            v-model="sendDate"
            :min-date="minDate"
            :dark="darkMode"
            :enable-time-picker="false"
            auto-apply
            :clearable="false"
            class="date-picker"
          >
            <template #trigger>
              <button type="button" class="date-button">
                <Icon name="solar:calendar-bold" size="20" class="button-icon" />
                <span class="button-text">{{ formatDateDisplay(sendDate) }}</span>
              </button>
            </template>
          </VueDatePicker>
        </ClientOnly>
        <p class="form-hint">Your letter will be emailed to you at 8 PM on this date.</p>
      </div>

      <!-- Submit Button -->
      <button
        class="btn btn-primary submit-btn"
        :disabled="!canSubmit || isSubmitting"
        @click="handleSubmit"
      >
        <Icon v-if="isSubmitting" name="solar:refresh-bold" size="20" class="spin" />
        <Icon v-else name="solar:send-square-bold" size="20" />
        <span>{{ isSubmitting ? "Scheduling..." : "Schedule Letter" }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-container {
  max-width: 640px;
  margin: 0 auto;
  padding: 1.5rem;

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }

  @media (max-width: 480px) {
    padding: 1.5rem 0.75rem;
  }
}

.letter-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--border-hover);
    box-shadow: var(--shadow-sm);
  }
}

.form-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.form-label {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.message-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--hover-bg);
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-family: inherit;
  line-height: 1.6;
  resize: vertical;
  min-height: 180px;
  transition: all 0.2s ease;

  &::placeholder {
    color: var(--text-tertiary);
  }

  &:focus {
    outline: none;
    border-color: var(--primary);
    background: var(--card-bg);
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
}

.char-count {
  margin-top: 0.5rem;
  text-align: right;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.date-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 1rem 1.25rem;
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

  .button-icon {
    flex-shrink: 0;
    color: var(--primary);
  }

  .button-text {
    flex: 1;
    text-align: center;
    margin-right: 20px;
  }

  &:hover {
    border-color: var(--primary-rgba-40);
    background: linear-gradient(
      135deg,
      var(--primary-rgba-12) 0%,
      rgba(var(--color-primary-gradient-end), 0.12) 100%
    );
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--primary-rgba-20);
  }
}

.form-hint {
  margin-top: 0.75rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.success-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: var(--success);
  color: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  font-weight: 600;
  z-index: 1000;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(1rem);
}

/* Vue DatePicker styling */
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
</style>
