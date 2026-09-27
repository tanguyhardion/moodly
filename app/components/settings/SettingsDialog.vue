<template>
  <Transition name="fade">
    <div v-if="isOpen" class="overlay" @click.self="close">
      <div class="sheet" role="dialog" aria-modal="true" :aria-label="showAlertEditor ? 'Email alert' : 'Settings'">
        <EmailAlertEditor
          v-if="showAlertEditor"
          :alert="editingAlert"
          :metrics="metrics"
          :saving="savingAlert"
          @close="closeAlertEditor"
          @save="saveAlert"
        />

        <template v-else>
          <div class="flex items-center justify-between gap-3 px-6 pt-6 pb-2">
            <h2 class="text-2xl font-extrabold">Settings</h2>
            <button class="icon-btn" type="button" title="Close" @click="close">
              <Icon name="solar:close-circle-bold" size="24" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto px-6 pb-6">
            <LoadingState v-if="loading" />
            <div v-else class="flex flex-col gap-8 pt-2">
              <section class="flex flex-col gap-3">
                <div>
                  <h3 class="text-lg font-bold">Emails</h3>
                  <p class="text-sm text-muted">Reminders and summaries of how you've been.</p>
                </div>
                <div>
                  <label for="settings-email" class="field-label">Send to</label>
                  <input id="settings-email" v-model="settings.email" type="email" placeholder="you@example.com" class="input" />
                </div>
                <ToggleSwitch v-model="settings.dailyReminders">
                  Daily reminder
                  <template #description>In the evening, if you haven't checked in</template>
                </ToggleSwitch>
                <ToggleSwitch v-model="settings.weeklyReports">
                  Weekly report
                  <template #description>Every Sunday</template>
                </ToggleSwitch>
                <ToggleSwitch v-model="settings.monthlyReports">
                  Monthly report
                  <template #description>On the last day of the month</template>
                </ToggleSwitch>
              </section>

              <section class="flex flex-col gap-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <h3 class="text-lg font-bold">Alerts</h3>
                    <p class="text-sm text-muted">Get an email when a check-in matches your conditions.</p>
                  </div>
                  <button class="btn btn-secondary btn-sm shrink-0" type="button" :disabled="!hasMetrics" @click="openAlertEditor()">
                    <Icon name="solar:add-circle-bold" size="18" />
                    New
                  </button>
                </div>

                <p v-if="!hasMetrics" class="rounded-2xl bg-surface-2 p-4 text-sm text-muted">Set up your metrics first, then add alerts.</p>
                <p v-else-if="alerts.length === 0" class="rounded-2xl bg-surface-2 p-4 text-sm text-muted">No alerts yet.</p>
                <div v-else class="flex flex-col gap-2">
                  <div v-for="alert in alerts" :key="alert.id" class="flex items-center gap-2 rounded-2xl bg-surface-2 py-2 pr-2 pl-4">
                    <button type="button" class="min-w-0 flex-1 py-1 text-left" @click="openAlertEditor(alert)">
                      <span class="block truncate font-semibold">{{ alert.name }}</span>
                      <span class="block text-[13px] text-muted">
                        {{ alert.conditions.length }} condition{{ alert.conditions.length !== 1 ? "s" : "" }},
                        {{ alert.conditionLogic === "all" ? "all must match" : "any can match" }}
                      </span>
                    </button>
                    <label class="relative inline-flex cursor-pointer" :title="alert.enabled ? 'Turn off' : 'Turn on'">
                      <input type="checkbox" class="peer sr-only" :checked="alert.enabled" :aria-label="`${alert.name} enabled`" @change="toggleAlert(alert)" />
                      <span class="relative h-6 w-10 rounded-full bg-line transition peer-checked:bg-mood peer-focus-visible:ring-2 peer-focus-visible:ring-mood-strong after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-4" />
                    </label>
                    <button
                      v-if="pendingDeleteId !== alert.id"
                      class="icon-btn size-9 hover:bg-danger/15 hover:text-danger"
                      type="button"
                      :title="`Delete ${alert.name}`"
                      @click.stop="pendingDeleteId = alert.id ?? null"
                    >
                      <Icon name="solar:trash-bin-trash-bold" size="16" />
                    </button>
                    <button v-else class="btn btn-danger btn-sm" type="button" @click.stop="deleteAlert(alert)">Delete?</button>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div class="flex justify-end gap-2 border-t border-line px-6 py-4">
            <button class="btn btn-secondary" type="button" @click="close">Close</button>
            <button class="btn btn-primary" type="button" :disabled="saving || loading" @click="save">
              {{ saving ? "Saving…" : "Save settings" }}
            </button>
          </div>
        </template>
      </div>

      <Transition name="toast">
        <div v-if="showToast" class="toast" :class="{ 'bg-danger text-white': toastTone === 'error' }" role="status">
          <Icon :name="toastTone === 'error' ? 'solar:danger-circle-bold' : 'solar:check-circle-bold'" size="20" />
          {{ toastMessage }}
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
const toastMessage = ref("");
const toastTone = ref<"success" | "error">("success");
const pendingDeleteId = ref<number | null>(null);

function notify(message: string, tone: "success" | "error" = "success", onHide?: () => void) {
  toastMessage.value = message;
  toastTone.value = tone;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
    onHide?.();
  }, 2200);
}

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
    notify("Settings saved", "success", close);
  } catch (error) {
    console.error("Failed to save settings", error);
    notify("Couldn't save settings. Check your connection and try again.", "error");
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
    notify("Alert saved");
  } catch (error) {
    console.error("Failed to save alert", error);
    notify("Couldn't save the alert. Try again.", "error");
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
    notify("Couldn't update the alert. Try again.", "error");
  }
};

const deleteAlert = async (alertItem: EmailAlert) => {
  if (!alertItem.id) return;
  pendingDeleteId.value = null;

  try {
    await moodlyBackendService.deleteEmailAlert(alertItem.id);
    alerts.value = alerts.value.filter((a) => a.id !== alertItem.id);
    notify("Alert deleted");
  } catch (error) {
    console.error("Failed to delete alert", error);
    notify("Couldn't delete the alert. Try again.", "error");
  }
};

watch(isOpen, (val) => {
  if (val) {
    loadSettings();
  }
});
</script>
