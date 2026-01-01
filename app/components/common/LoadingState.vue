<template>
  <div class="loading-state">
    <div class="loading-spinner">
      <div class="spinner-ring"></div>
      <img
        src="/logo-pulse.svg"
        alt="Loading..."
        class="spinner-icon"
        width="40"
        height="40"
      />
    </div>
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
  gap: 1.5rem;
  padding: 5rem 2rem;
  text-align: center;
  color: var(--text-secondary);
  animation: fadeIn 0.4s ease;
}

.loading-spinner {
  position: relative;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.spinner-icon {
  color: var(--primary);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(0.85);
    opacity: 0.6;
  }
}

.loading-state p {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--text-secondary);
}
</style>
