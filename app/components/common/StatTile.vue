<template>
  <div class="min-w-0 rounded-2xl bg-surface-2 px-3 py-2.5">
    <p class="eyebrow truncate">{{ label }}</p>
    <p class="flex items-center gap-1 truncate font-display text-lg font-bold tabular-nums">
      <slot />{{ value }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
}>();
</script>
