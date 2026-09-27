<template>
  <div class="flex flex-col items-center justify-center gap-4 py-20 text-muted" role="status">
    <div class="relative grid size-16 place-items-center">
      <span class="absolute inset-0 animate-spin rounded-full border-4 border-mood-soft border-t-mood" />
      <MoodlyLogo variant="mark" class="size-8" />
    </div>
    <p class="text-sm font-medium">{{ message || 'Loading…' }}</p>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  message?: string;
}>();
</script>
