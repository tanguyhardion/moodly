<template>
  <div class="loading-state">
    <Icon name="svg-spinners:ring-resize" size="48" />
    <p>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message?: string;
}>();
</script>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.loading-state p {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}
</style>
