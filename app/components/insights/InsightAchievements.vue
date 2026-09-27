<template>
  <InsightSection title="Achievements" icon="solar:medal-ribbon-star-bold" color="var(--gold)">
    <div class="grid gap-3 sm:grid-cols-2">
      <div v-for="a in achievements" :key="a.key" class="card flex items-start gap-3 p-4">
        <span class="grid size-11 shrink-0 place-items-center rounded-2xl" :style="{ background: a.iconBg, color: a.iconColor }">
          <Icon :name="a.icon" size="22" />
        </span>
        <div class="min-w-0">
          <p class="font-semibold">{{ a.title }}</p>
          <p class="text-sm text-muted">{{ a.description }}</p>
        </div>
      </div>
    </div>
  </InsightSection>
</template>
<script setup lang="ts">
const { achievements } = useInsightsData();
</script>
