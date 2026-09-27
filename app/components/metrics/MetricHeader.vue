<template>
  <div class="flex min-h-9 items-center gap-2.5">
    <span
      v-if="config.icon"
      class="grid size-8 shrink-0 place-items-center rounded-full"
      :style="{ background: hexToRgba(config.color || '', 0.16), color: config.color || 'var(--mood-strong)' }"
    >
      <Icon :name="config.icon" size="17" />
    </span>
    <span class="min-w-0 flex-1 truncate font-semibold">{{ config.label }}</span>
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { MetricConfig } from '~/types';

defineProps<{
  config: MetricConfig;
}>();
</script>
