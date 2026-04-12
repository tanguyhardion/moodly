<template>
  <Transition name="fade">
    <div v-if="isOpen" class="settings-overlay" @click.self="close">
      <div class="settings-card" :class="{ 'editor-open': showAlertEditor }">
        <div class="header">
          <h2>Settings</h2>
          <button class="close-btn" @click="close">
            <Icon name="solar:close-circle-bold" size="24" />
          </button>
        </div>

        <div class="content">
          <LoadingState v-if="loading" />
          <template v-else>
            <div class="section">
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

            <div class="section">
              <div class="section-header">
                <div>
                  <h3>Email Alerts</h3>
                  <p class="description">
                    Get notified when your check-in values meet specific conditions.
                  </p>
                </div>
                <button
                  class="add-alert-btn"
                  @click="openAlertEditor()"
                  :disabled="!hasMetrics"
                >
                  <Icon name="solar:add-circle-bold" size="18" />
                  Add
                </button>
              </div>

              <div v-if="!hasMetrics" class="empty-alerts">
                <p>Configure metrics first to create email alerts.</p>
              </div>
              <div v-else-if="alerts.length === 0" class="empty-alerts">
                <p>No email alerts configured yet.</p>
              </div>
              <div v-else class="alerts-list">
                <div
                  v-for="alert in alerts"
                  :key="alert.id"
                  class="alert-item"
                >
                  <div class="alert-info" @click="openAlertEditor(alert)">
                    <span class="alert-name">{{ alert.name }}</span>
                    <span class="alert-conditions">
                      {{ alert.conditions.length }} condition{{
                        alert.conditions.length !== 1 ? "s" : ""
                      }}
                      ({{ alert.conditionLogic === "all" ? "AND" : "OR" }})
                    </span>
                  </div>
                  <div class="alert-actions">
                    <div class="switch small">
                      <input
                        type="checkbox"
                        :checked="alert.enabled"
                        @change="toggleAlert(alert)"
                      />
                      <span class="slider"></span>
                    </div>
                    <button
                      class="delete-alert-btn"
                      @click.stop="deleteAlert(alert)"
                    >
                      <Icon name="solar:trash-bin-trash-bold" size="16" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="actions">
          <button class="save-btn" @click="save" :disabled="saving">
            {{ saving ? "Saving..." : "Save Changes" }}
          </button>
        </div>

        <Transition name="slide">
          <div v-if="showAlertEditor" class="alert-editor-panel">
            <EmailAlertEditor
              :alert="editingAlert"
              :metrics="metrics"
              :saving="savingAlert"
              @close="closeAlertEditor"
              @save="saveAlert"
            />
          </div>
        </Transition>
      </div>

      <Transition name="toast">
        <div v-if="showToast" class="toast">
          <Icon name="solar:check-circle-bold" size="20" />
          <span>{{ toastMessage }}</span>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { moodlyBackendService } from "~/utils/moodly-backend";
import type { AppSettings, EmailAlert, MetricConfig } from "~/types";

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

const alerts = ref<EmailAlert[]>([]);
const metrics = ref<MetricConfig[]>([]);

const loading = ref(false);
const saving = ref(false);
const savingAlert = ref(false);
const showToast = ref(false);
const toastMessage = ref("Settings saved successfully!");

const showAlertEditor = ref(false);
const editingAlert = ref<EmailAlert | undefined>(undefined);

const hasMetrics = computed(() => metrics.value.length > 0);

const close = () => {
  if (showAlertEditor.value) {
    closeAlertEditor();
    return;
  }
  isOpen.value = false;
};

const loadSettings = async () => {
  loading.value = true;
  try {
    const [settingsData, alertsData, metricData] = await Promise.all([
      moodlyBackendService.getSettings(),
      moodlyBackendService.getEmailAlerts(),
      moodlyBackendService.getMetricConfig(),
    ]);
    settings.value = settingsData;
    alerts.value = alertsData;
    metrics.value = metricData.metrics;
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
    toastMessage.value = "Settings saved successfully!";
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

const openAlertEditor = (alert?: EmailAlert) => {
  editingAlert.value = alert;
  showAlertEditor.value = true;
};

const closeAlertEditor = () => {
  showAlertEditor.value = false;
  editingAlert.value = undefined;
};

const saveAlert = async (alert: EmailAlert) => {
  savingAlert.value = true;
  try {
    const savedAlert = await moodlyBackendService.saveEmailAlert(alert);

    if (alert.id) {
      const index = alerts.value.findIndex((a) => a.id === alert.id);
      if (index !== -1) {
        alerts.value[index] = savedAlert;
      }
    } else {
      alerts.value.unshift(savedAlert);
    }

    closeAlertEditor();
    toastMessage.value = "Alert saved successfully!";
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 2000);
  } catch (error) {
    console.error("Failed to save alert", error);
    alert("Failed to save alert");
  } finally {
    savingAlert.value = false;
  }
};

const toggleAlert = async (alertItem: EmailAlert) => {
  try {
    const updated = await moodlyBackendService.saveEmailAlert({
      ...alertItem,
      enabled: !alertItem.enabled,
    });
    const index = alerts.value.findIndex((a) => a.id === alertItem.id);
    if (index !== -1) {
      alerts.value[index] = updated;
    }
  } catch (error) {
    console.error("Failed to toggle alert", error);
  }
};

const deleteAlert = async (alertItem: EmailAlert) => {
  if (!alertItem.id) return;
  if (!confirm(`Delete alert "${alertItem.name}"?`)) return;

  try {
    await moodlyBackendService.deleteEmailAlert(alertItem.id);
    alerts.value = alerts.value.filter((a) => a.id !== alertItem.id);
    toastMessage.value = "Alert deleted!";
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 2000);
  } catch (error) {
    console.error("Failed to delete alert", error);
    alert("Failed to delete alert");
  }
};

watch(isOpen, (val) => {
  if (val) {
    loadSettings();
  }
});
</script>

<style scoped lang="scss">
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
  pointer-events: none;
}

.settings-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  box-shadow: var(--shadow-2xl);
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  pointer-events: auto;

  &.editor-open {
    max-width: 600px;
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-shrink: 0;

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }
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

  &:hover {
    background: var(--hover-bg);
    color: var(--text-primary);
  }
}

.content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  pointer-events: auto;
}

.section {
  margin-bottom: var(--spacing-lg);

  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-md);
}

.form-group {
  margin-bottom: var(--spacing-md);

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: var(--spacing-sm);
  }
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

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
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

  &:hover {
    background: var(--border-light);
    border-color: var(--border-hover);
  }

  span {
    font-weight: 600;
    color: var(--text-primary);
  }
}

.switch {
  position: relative;
  display: inline-block;
  width: 2.75rem;
  height: 1.5rem;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  &.small {
    width: 2.25rem;
    height: 1.25rem;

    .slider::before {
      height: 0.9rem;
      width: 0.9rem;
      left: 0.15rem;
      bottom: 0.15rem;
    }

    input:checked + .slider::before {
      transform: translateX(1rem);
    }
  }
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

  &::before {
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
}

input:checked + .slider {
  background-color: var(--primary);

  &::before {
    transform: translateX(1.25rem);
  }
}

.add-alert-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: var(--shadow-colored);
  }
}

.empty-alerts {
  padding: var(--spacing-lg);
  text-align: center;
  color: var(--text-secondary);
  background: var(--hover-bg);
  border-radius: var(--radius-lg);
  font-size: 0.875rem;

  p {
    margin: 0;
  }
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.alert-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--hover-bg);
  border-radius: var(--radius-lg);
  border: 1px solid transparent;
  transition: all 0.2s;

  &:hover {
    border-color: var(--border-hover);
  }
}

.alert-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
  flex: 1;
  min-width: 0;
}

.alert-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9375rem;
}

.alert-conditions {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.alert-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.delete-alert-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: var(--error);
    color: white;
  }
}

.alert-editor-panel {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--card-bg);
  z-index: 10;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  cursor: auto;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
  flex-shrink: 0;
  pointer-events: auto;
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

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: var(--shadow-colored);
  }
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

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 1rem;
  background: var(--gradient-success);
  color: white;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.9375rem;
  box-shadow: 0 10px 25px rgba(var(--color-shadow-success), 0.4);
  z-index: 1100;
  backdrop-filter: blur(10px);
  white-space: nowrap;
  height: max-content;
  width: max-content;
  flex-shrink: 0;
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
