<script setup lang="ts">
defineProps<{
  modelValue: number;
  periods: { label: string; days: number }[];
}>();

defineEmits<{
  (e: "update:modelValue", value: number): void;
}>();
</script>

<template>
  <div class="period-selector">
    <button
      v-for="period in periods"
      :key="period.days"
      @click="$emit('update:modelValue', period.days)"
      class="period-btn"
      :class="{ active: modelValue === period.days }"
    >
      {{ period.label }}
    </button>
  </div>
</template>

<style scoped>
.period-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.period-btn {
  padding: 0.625rem 1.25rem;
  border: 2px solid var(--border);
  background: var(--card-bg);
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
}

.period-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.period-btn.active {
  background: var(--gradient-primary);
  border-color: transparent;
  color: white;
  box-shadow: var(--shadow-colored);
  transform: translateY(-2px);
}
</style>
