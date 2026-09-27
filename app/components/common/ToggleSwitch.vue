<template>
  <label class="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-surface-2 px-4 py-3">
    <span class="flex min-w-0 flex-col">
      <span class="text-[15px] font-semibold">
        <slot />
      </span>
      <span v-if="$slots.description" class="text-[13px] text-muted">
        <slot name="description" />
      </span>
    </span>
    <input
      type="checkbox"
      class="peer sr-only"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span
      aria-hidden="true"
      class="relative h-7 w-12 shrink-0 rounded-full bg-line transition peer-checked:bg-mood peer-focus-visible:ring-2 peer-focus-visible:ring-mood-strong peer-disabled:opacity-50 after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"
    />
  </label>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  disabled?: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: boolean];
}>();
</script>
