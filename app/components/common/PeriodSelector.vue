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
  <div class="segmented" role="group" aria-label="Time period">
    <button
      v-for="period in periods"
      :key="period.days"
      type="button"
      :class="{ 'is-active': modelValue === period.days }"
      :aria-pressed="modelValue === period.days"
      @click="$emit('update:modelValue', period.days)"
    >
      {{ period.label }}
    </button>
  </div>
</template>
