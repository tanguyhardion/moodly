<template>
  <Transition name="fade">
    <div v-if="isOpen" class="settings-overlay" @click.self="close">
      <div class="settings-card">
        <div class="header">
          <h2>Settings</h2>
          <button class="close-btn" @click="close">
            <Icon name="solar:close-circle-bold" size="24" />
          </button>
        </div>

        <div class="content">
          <LoadingState v-if="loading" />
          <div v-else class="section">
            <h3>Email Summaries</h3>
            <p class="description">
              Receive automated summaries of your mood and insights.
            </p>

            <div class="form-group">
              <label>Email Address</label>
              <input
                v-model="settings.email"
                type="email"
                placeholder="your@email.com"
                class="input"
              />
            </div>

            <div class="toggles">
              <label class="toggle-row">
                <span>Daily Reminder</span>
                <div class="switch">
                  <input type="checkbox" v-model="settings.dailyReminders" />
                  <span class="slider"></span>
                </div>
              </label>
              <label class="toggle-row">
                <span>Weekly Report</span>
                <div class="switch">
                  <input type="checkbox" v-model="settings.weeklyReports" />
                  <span class="slider"></span>
                </div>
              </label>
              <label class="toggle-row">
                <span>Monthly Report</span>
                <div class="switch">
                  <input type="checkbox" v-model="settings.monthlyReports" />
                  <span class="slider"></span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="save-btn" @click="save" :disabled="saving">
            {{ saving ? "Saving..." : "Save Changes" }}
          </button>
        </div>
      </div>

      <Transition name="toast">
        <div v-if="showToast" class="toast">
          <Icon name="solar:check-circle-bold" size="20" />
          <span>Settings saved successfully!</span>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { moodlyBackendService } from "~/utils/moodly-backend";
import type { AppSettings } from "~/types";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(["update:modelValue"]);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const settings = ref<AppSettings>({
  email: "",
  dailyReminders: false,
  weeklyReports: false,
  monthlyReports: false,
});

const loading = ref(false);
const saving = ref(false);
const showToast = ref(false);

const close = () => {
  isOpen.value = false;
};

const loadSettings = async () => {
  loading.value = true;
  try {
    const data = await moodlyBackendService.getSettings();
    settings.value = data;
  } catch (error) {
    console.error("Failed to load settings", error);
  } finally {
    loading.value = false;
  }
};

const save = async () => {
  saving.value = true;
  try {
    await moodlyBackendService.saveSettings(settings.value);
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
      close();
    }, 2000);
  } catch (error) {
    console.error("Failed to save settings", error);
    alert("Failed to save settings");
  } finally {
    saving.value = false;
  }
};

watch(isOpen, (val) => {
  if (val) {
    loadSettings();
  }
});
</script>

<style scoped>
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.settings-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  width: 90%;
  max-width: 500px;
  box-shadow: var(--shadow-2xl);
  border: 1px solid var(--border);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.section {
  margin-bottom: var(--spacing-lg);
}

.section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-md);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.input {
  width: 100%;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--focus-ring);
}

.toggles {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-md);
  background: var(--hover-bg);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.toggle-row:hover {
  background: var(--border-light);
  border-color: var(--border-hover);
}

.toggle-row span {
  font-weight: 600;
  color: var(--text-primary);
}

.switch {
  position: relative;
  display: inline-block;
  width: 2.75rem;
  height: 1.5rem;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border);
  transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: var(--radius-xl);
}

.slider:before {
  position: absolute;
  content: "";
  height: 1.125rem;
  width: 1.125rem;
  left: 0.1875rem;
  bottom: 0.1875rem;
  background-color: white;
  transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
}

input:checked + .slider {
  background-color: var(--primary);
}

input:checked + .slider:before {
  transform: translateX(1.25rem);
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
}

.save-btn {
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-colored);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 1rem 1.5rem;
  background: var(--gradient-success);
  color: white;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.9375rem;
  box-shadow: 0 10px 25px rgba(var(--color-shadow-success), 0.4);
  z-index: 1100;
  backdrop-filter: blur(10px);
  white-space: nowrap;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 1rem);
}
</style>
