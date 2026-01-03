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

<style scoped lang="scss">
.insights-page {
  width: 100%;
  padding: 0 2rem;

  .insights-content-wrapper {
    max-width: 1200px;
    animation: fadeIn 0.5s ease;

    .page-header {
      margin-bottom: 2rem;
      text-align: center;
      padding-top: 0.5rem;

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
      padding: var(--spacing-2xl) var(--spacing-xl);
      gap: var(--spacing-md);
      text-align: center;
      background: var(--card-bg);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);

      .empty-icon {
        opacity: 0.5;
        margin-bottom: 0.5rem;
      }

      h3 {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
        color: var(--text-primary);
      }

      p {
        font-size: 1rem;
        color: var(--text-secondary);
        margin: 0;
        max-width: 400px;
      }
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md) var(--spacing-lg);
      border-radius: var(--radius-md);
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
      margin-top: var(--spacing-md);

      &.btn-primary {
        background: var(--gradient-primary);
        color: white;
        border: none;
        box-shadow: var(--shadow-colored);

        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-primary);
        }
      }
    }

    @media (max-width: 768px) {
      padding: 0rem 0.25rem;

      .page-title {
        font-size: 1.75rem;
      }

      .page-subtitle {
        font-size: 1rem;
      }
    }
  }
}
</style>
