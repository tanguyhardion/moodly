<template>
  <section class="flex flex-col gap-3">
    <div class="flex items-center gap-2.5 px-1">
      <span class="grid size-8 place-items-center rounded-full" :style="{ background: hexToRgba(color, 0.16), color }">
        <Icon :name="icon" size="18" />
      </span>
      <div class="min-w-0">
        <h2 class="text-xl font-extrabold">{{ title }}</h2>
        <p v-if="subtitle" class="text-[13px] text-muted">{{ subtitle }}</p>
      </div>
    </div>
    <slot />
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string;
  icon: string;
  color?: string;
  subtitle?: string;
}>(), {
  color: 'var(--mood-strong)',
});
</script>
