<template>
  <div class="alert-editor">
    <div class="editor-header">
      <h3>{{ isEditing ? "Edit Alert" : "New Email Alert" }}</h3>
      <button class="close-btn" @click="$emit('close')">
        <Icon name="solar:close-circle-bold" size="24" />
      </button>
    </div>

    <div class="editor-content">
      <div class="form-group">
        <label>Alert Name</label>
        <input
          v-model="localAlert.name"
          type="text"
          placeholder="e.g., Low mood alert"
          class="input"
        />
      </div>

      <div class="form-group">
        <label>Conditions</label>
        <p class="hint">Send email when these conditions are met</p>

        <div class="condition-logic">
          <label class="radio-label">
            <input
              type="radio"
              v-model="localAlert.conditionLogic"
              value="all"
            />
            <span>All conditions must match (AND)</span>
          </label>
          <label class="radio-label">
            <input
              type="radio"
              v-model="localAlert.conditionLogic"
              value="any"
            />
            <span>Any condition matches (OR)</span>
          </label>
        </div>

        <div class="conditions-list">
          <div
            v-for="(condition, index) in localAlert.conditions"
            :key="index"
            class="condition-row"
          >
            <select v-model="condition.metricId" class="select metric-select">
              <option value="" disabled>Select metric</option>
              <option
                v-for="metric in availableMetrics"
                :key="metric.id"
                :value="metric.id"
              >
                {{ metric.label }}
              </option>
            </select>

            <select
              v-model="condition.operator"
              class="select operator-select"
            >
              <option
                v-for="op in getOperatorsForMetric(condition.metricId)"
                :key="op.value"
                :value="op.value"
              >
                {{ op.label }}
              </option>
            </select>

            <input
              v-if="showValueInput(condition)"
              v-model="condition.value"
              :type="getValueInputType(condition.metricId)"
              :step="getValueInputStep(condition.metricId)"
              class="input value-input"
              placeholder="Value"
            />

            <button
              class="remove-btn"
              @click="removeCondition(index)"
              :disabled="localAlert.conditions.length <= 1"
            >
              <Icon name="solar:trash-bin-trash-bold" size="18" />
            </button>
          </div>
        </div>

        <button class="add-condition-btn" @click="addCondition">
          <Icon name="solar:add-circle-bold" size="18" />
          Add Condition
        </button>
      </div>

      <div class="form-group">
        <label>Email Subject</label>
        <input
          v-model="localAlert.emailSubject"
          type="text"
          placeholder="e.g., Moodly Alert: Low mood detected"
          class="input"
        />
      </div>

      <div class="form-group">
        <label>Email Message</label>
        <p class="hint">
          Use <code v-text="placeholderExample"></code> to insert metric values
        </p>
        <textarea
          v-model="localAlert.emailMessage"
          placeholder="e.g., Your mood today was {{mood}}. Consider taking a break or talking to someone."
          class="input textarea"
          rows="4"
        ></textarea>
      </div>
    </div>

    <div class="editor-actions">
      <button class="btn-secondary" @click="$emit('close')">Cancel</button>
      <button class="btn-primary" @click="save" :disabled="!isValid || saving">
        {{ saving ? "Saving..." : isEditing ? "Update Alert" : "Create Alert" }}
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

const placeholderExample = "{{metric_id}}";

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

<style scoped lang="scss">
.alert-editor {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border);
  background: var(--hover-bg);

  h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
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
    background: var(--border);
    color: var(--text-primary);
  }
}

.editor-content {
  padding: var(--spacing-lg);
  max-height: 60vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: var(--spacing-lg);

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
  }
}

.hint {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-sm) 0;

  code {
    background: var(--hover-bg);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.875em;
    color: var(--primary);
  }
}

.input,
.select {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
}

.textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.condition-logic {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.radio-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-secondary);

  input[type="radio"] {
    width: 16px;
    height: 16px;
    accent-color: var(--primary);
  }
}

.conditions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.condition-row {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.metric-select {
  flex: 2;
  min-width: 0;
}

.operator-select {
  flex: 1.5;
  min-width: 0;
}

.value-input {
  flex: 1;
  min-width: 60px;
}

.remove-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: var(--error);
    color: white;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

.add-condition-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: none;
  border: 1px dashed var(--border);
  color: var(--text-secondary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: var(--hover-bg);
  }
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border);
  background: var(--hover-bg);
}

.btn-secondary {
  background: var(--hover-bg);
  color: var(--text-primary);
  border: 1px solid var(--border);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--border);
  }
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
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
</style>
