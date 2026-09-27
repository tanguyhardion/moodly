<template>
  <InsightSection title="Ideas to try" icon="solar:lightbulb-bold" color="var(--gold)">
    <div class="flex flex-col gap-2">
      <div v-for="r in recommendations" :key="r.key" class="card flex items-start gap-3 p-4">
        <span class="grid size-10 shrink-0 place-items-center rounded-xl" :style="{ background: r.iconBg, color: r.iconColor }">
          <Icon :name="r.icon" size="18" />
        </span>
        <div class="min-w-0">
          <p class="font-semibold">{{ r.title }}</p>
          <p class="text-sm text-muted">{{ r.description }}</p>
        </div>
      </div>
    </div>
  </InsightSection>
</template>
<script setup lang="ts">
const { recommendations } = useInsightsData();
</script>
