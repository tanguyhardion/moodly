<template>
  <div class="page insights-page">
    <LoadingState v-if="!isReady" message="Loading your insights..." />
    <div v-else class="insights-content-wrapper">
      <div class="page-header">
        <h1 class="page-title">
          <Icon name="mdi:sparkles" size="28" />
          Advanced Insights
        </h1>
        <p class="page-subtitle">
          Discover patterns and correlations in your mood data
        </p>
      </div>

      <div v-if="entries.length === 0" class="empty-state">
        <Icon name="solar:graph-new-bold" size="64" class="empty-icon" />
        <h3>No data yet</h3>
        <p>Create more entries to see advanced insights</p>
        <NuxtLink to="/" class="btn btn-primary">
          <Icon name="solar:add-circle-bold" size="20" />
          Create Entry
        </NuxtLink>
      </div>

      <div v-else class="insights-content">
        <AdvancedAnalytics />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { entries, isInitialized } = useMoodly();

const isReady = ref(false);

// Watch for data initialization
watch(isInitialized, (initialized) => {
  if (initialized && !isReady.value) {
    isReady.value = true;
  }
});

// Initialize if data is already loaded
onMounted(() => {
  if (isInitialized.value) {
    isReady.value = true;
  }
});
</script>

<style scoped>
.insights-page {
  width: 100%;
}

.insights-content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
  padding-top: 0.5rem;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.insights-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
  text-align: center;
  background: var(--surface-card);
  border-radius: 1rem;
  border: 1px solid var(--border-color);
}

.empty-icon {
  opacity: 0.5;
  margin-bottom: 0.5rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.empty-state p {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
  max-width: 400px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  margin-top: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

@media (max-width: 768px) {
  .insights-content-wrapper {
    padding: 1.5rem 1rem;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }
}
</style>
