<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div class="flex items-center gap-2 px-4 pt-5 pb-2 sm:px-6">
      <button class="icon-btn" type="button" title="Back to settings" @click="$emit('close')">
        <Icon name="solar:alt-arrow-left-bold" size="22" />
      </button>
      <h3 class="text-2xl font-extrabold">{{ isEditing ? "Edit alert" : "New alert" }}</h3>
    </div>

    <div class="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pt-3 pb-6">
      <div>
        <label for="alert-name" class="field-label">Name</label>
        <input id="alert-name" v-model="localAlert.name" type="text" placeholder="e.g. Low mood" class="input" />
      </div>

      <div class="flex flex-col gap-3">
        <div>
          <span class="field-label mb-0">Send the email when</span>
        </div>
        <div class="segmented self-start shadow-none ring-1 ring-line" role="radiogroup" aria-label="Match">
          <button type="button" role="radio" :aria-checked="localAlert.conditionLogic === 'all'" :class="{ 'is-active': localAlert.conditionLogic === 'all' }" @click="localAlert.conditionLogic = 'all'">
            All match
          </button>
          <button type="button" role="radio" :aria-checked="localAlert.conditionLogic === 'any'" :class="{ 'is-active': localAlert.conditionLogic === 'any' }" @click="localAlert.conditionLogic = 'any'">
            Any matches
          </button>
        </div>

        <div class="flex flex-col gap-2">
          <div
            v-for="(condition, index) in localAlert.conditions"
            :key="index"
            class="grid grid-cols-[minmax(0,1fr)_2.25rem] gap-2 rounded-2xl bg-surface-2 p-2 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_2.25rem]"
          >
            <select v-model="condition.metricId" class="input h-10 bg-surface" aria-label="Metric">
              <option value="" disabled>Metric…</option>
              <option v-for="metric in availableMetrics" :key="metric.id" :value="metric.id">{{ metric.label }}</option>
            </select>
            <button
              class="icon-btn size-9 self-center hover:bg-danger/15 hover:text-danger sm:order-last"
              type="button"
              title="Remove condition"
              :disabled="localAlert.conditions.length <= 1"
              @click="removeCondition(index)"
            >
              <Icon name="solar:trash-bin-trash-bold" size="16" />
            </button>
            <select v-model="condition.operator" class="input h-10 bg-surface" aria-label="Comparison">
              <option v-for="op in getOperatorsForMetric(condition.metricId)" :key="op.value" :value="op.value">{{ op.label }}</option>
            </select>
            <input
              v-if="showValueInput(condition)"
              v-model="condition.value"
              :type="getValueInputType(condition.metricId)"
              :step="getValueInputStep(condition.metricId)"
              class="input h-10 bg-surface tabular-nums"
              placeholder="Value"
              aria-label="Value"
            />
          </div>
        </div>

        <button
          class="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line py-2.5 text-sm font-semibold text-muted transition hover:border-mood hover:text-ink"
          type="button"
          @click="addCondition"
        >
          <Icon name="solar:add-circle-bold" size="18" />
          Add condition
        </button>
      </div>

      <div>
        <label for="alert-subject" class="field-label">Email subject</label>
        <input id="alert-subject" v-model="localAlert.emailSubject" type="text" placeholder="e.g. Checking in on you" class="input" />
      </div>

      <div>
        <label for="alert-message" class="field-label">Email message</label>
        <textarea
          id="alert-message"
          v-model="localAlert.emailMessage"
          placeholder="e.g. Your mood today was {{mood}}. Maybe call a friend tonight."
          class="input"
          rows="4"
        ></textarea>
        <p class="mt-1.5 text-xs text-muted">
          Insert a value with <code class="rounded bg-surface-2 px-1 py-0.5 font-mono" v-text="placeholderExample"></code>, using the metric's name.
        </p>
      </div>
    </div>

    <div class="flex justify-end gap-2 border-t border-line px-6 py-4">
      <button class="btn btn-secondary" type="button" @click="$emit('close')">Cancel</button>
      <button class="btn btn-primary" type="button" :disabled="!isValid || saving" @click="save">
        {{ saving ? "Saving…" : isEditing ? "Update alert" : "Create alert" }}
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { EmailAlert, AlertCondition, AlertOperator, MetricConfig } from "~/types";

const props = defineProps<{
  alert?: EmailAlert;
  metrics: MetricConfig[];
  saving?: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", alert: EmailAlert): void;
}>();

const placeholderExample = "{{Mood}}";

const isEditing = computed(() => !!props.alert?.id);

const availableMetrics = computed(() =>
  props.metrics.filter((m) => m.type !== "text" && m.type !== "location" && m.type !== "calculated")
);

const defaultCondition = (): AlertCondition => ({
  metricId: availableMetrics.value[0]?.id ?? "",
  operator: "lt",
  value: 0,
});

const localAlert = ref<EmailAlert>({
  name: "",
  enabled: true,
  conditions: [defaultCondition()],
  conditionLogic: "all",
  emailSubject: "",
  emailMessage: "",
});

watch(
  () => props.alert,
  (alert) => {
    if (alert) {
      localAlert.value = {
        ...alert,
        conditions: alert.conditions.map((c) => ({ ...c })),
      };
    }
  },
  { immediate: true }
);

const operatorsByType: Record<string, { value: AlertOperator; label: string }[]> = {
  slider: [
    { value: "lt", label: "< Less than" },
    { value: "lte", label: "<= Less or equal" },
    { value: "eq", label: "= Equals" },
    { value: "neq", label: "!= Not equals" },
    { value: "gt", label: "> Greater than" },
    { value: "gte", label: ">= Greater or equal" },
  ],
  number: [
    { value: "lt", label: "< Less than" },
    { value: "lte", label: "<= Less or equal" },
    { value: "eq", label: "= Equals" },
    { value: "neq", label: "!= Not equals" },
    { value: "gt", label: "> Greater than" },
    { value: "gte", label: ">= Greater or equal" },
  ],
  checkbox: [
    { value: "is_true", label: "Is checked" },
    { value: "is_false", label: "Is not checked" },
  ],
  time: [
    { value: "lt", label: "< Before" },
    { value: "gt", label: "> After" },
    { value: "eq", label: "= Equals" },
  ],
};

function getOperatorsForMetric(metricId: string) {
  const metric = props.metrics.find((m) => m.id === metricId);
  if (!metric) return operatorsByType.slider;
  return operatorsByType[metric.type] ?? operatorsByType.slider;
}

function showValueInput(condition: AlertCondition) {
  return condition.operator !== "is_true" && condition.operator !== "is_false";
}

function getValueInputType(metricId: string) {
  const metric = props.metrics.find((m) => m.id === metricId);
  if (metric?.type === "time") return "time";
  return "number";
}

function getValueInputStep(metricId: string) {
  const metric = props.metrics.find((m) => m.id === metricId);
  if (metric?.type === "slider" && "step" in metric) return metric.step;
  if (metric?.type === "number" && "step" in metric) return metric.step ?? 1;
  return 1;
}

function addCondition() {
  localAlert.value.conditions.push(defaultCondition());
}

function removeCondition(index: number) {
  if (localAlert.value.conditions.length > 1) {
    localAlert.value.conditions.splice(index, 1);
  }
}

const isValid = computed(() => {
  const a = localAlert.value;
  if (!a.name.trim()) return false;
  if (!a.emailSubject.trim()) return false;
  if (!a.emailMessage.trim()) return false;
  if (a.conditions.length === 0) return false;
  return a.conditions.every((c) => c.metricId);
});

function save() {
  if (!isValid.value) return;

  // Convert string values to numbers where appropriate
  const alertToSave: EmailAlert = {
    ...localAlert.value,
    conditions: localAlert.value.conditions.map((c) => {
      const metric = props.metrics.find((m) => m.id === c.metricId);
      let value = c.value;

      if (metric?.type === "slider" || metric?.type === "number") {
        value = Number(c.value);
      }

      return { ...c, value };
    }),
  };

  emit("save", alertToSave);
}
</script>
