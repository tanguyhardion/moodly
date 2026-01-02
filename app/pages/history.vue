<template>
  <div class="page history-page">
    <LoadingState v-if="!isInitialized" message="Loading your history..." />
    <div v-else class="history-content">
      <div class="page-header">
        <ExportButton v-if="entries.length > 0" class="export-btn-wrapper" />
        <h1 class="page-title">
          <Icon name="solar:history-bold" size="28" />
          Your Journey
        </h1>
        <p class="page-subtitle">
          {{ entries.length }}
          {{ entries.length === 1 ? "entry" : "entries" }} recorded
        </p>
      </div>

      <div v-if="entries.length === 0" class="empty-state">
        <Icon name="solar:document-add-bold" size="64" class="empty-icon" />
        <h3>No entries yet</h3>
        <p>Start your journey by creating your first check-in</p>
        <NuxtLink to="/" class="btn btn-primary">
          <Icon name="solar:add-circle-bold" size="20" />
          Create Entry
        </NuxtLink>
      </div>

      <div v-else class="entries-list">
        <TransitionGroup name="list">
          <LazyEntryCard
            v-for="entry in displayedEntries"
            :key="entry.id"
            :entry="entry"
            :metric-configs="metricConfigs"
          />
        </TransitionGroup>

        <div v-if="hasMore" ref="sentinelRef" class="load-sentinel">
          <LoadingState
            v-if="isLoadingMore"
            message="Loading more entries..."
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { entries, metricConfigs, isInitialized } = useMoodly();

const INITIAL_LOAD = 5;
const LOAD_MORE_COUNT = 10;
const displayCount = ref(INITIAL_LOAD);
const sentinelRef = ref<HTMLElement | null>(null);
const isLoadingMore = ref(false);

const sortedEntries = computed(() => {
  return [...entries.value].sort((a, b) => b.date.localeCompare(a.date));
});

const displayedEntries = computed(() => {
  return sortedEntries.value.slice(0, displayCount.value);
});

const hasMore = computed(() => {
  return displayCount.value < sortedEntries.value.length;
});

const loadMore = async () => {
  if (isLoadingMore.value) return;

  isLoadingMore.value = true;
  // Small delay to show loading state
  await new Promise((resolve) => setTimeout(resolve, 300));
  displayCount.value += LOAD_MORE_COUNT;
  isLoadingMore.value = false;
};

// Set up intersection observer for infinite scroll
onMounted(() => {
  if (!sentinelRef.value) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && hasMore.value && !isLoadingMore.value) {
        loadMore();
      }
    },
    { threshold: 0.1 },
  );

  watch(
    sentinelRef,
    (newSentinel) => {
      if (newSentinel) {
        observer.observe(newSentinel);
      }
    },
    { immediate: true },
  );

  onUnmounted(() => {
    observer.disconnect();
  });
});

// Reset display count when entries change
watch(entries, () => {
  displayCount.value = INITIAL_LOAD;
});
</script>

<style scoped lang="scss">
.history-page {
  max-width: var(--max-width-md);
  margin: 0 auto;

  .history-content {
    animation: fadeIn 0.3s ease;
  }

  .page-header {
    position: relative;
    text-align: center;
    margin-bottom: var(--spacing-xl);
    padding-top: var(--spacing-sm);

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-md);
    }

    .export-btn-wrapper {
      position: absolute;
      top: 0;
      right: 0;
    }

    .page-subtitle {
      font-size: 1rem;
      color: var(--text-secondary);
      margin: 0;
    }
  }

  .empty-state {
    text-align: center;
    padding: var(--spacing-2xl) var(--spacing-xl);

    .empty-icon {
      color: var(--text-tertiary);
      margin-bottom: var(--spacing-md);
    }

    h3 {
      font-size: 1.5rem;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-sm);
    }

    p {
      font-size: 1rem;
      color: var(--text-secondary);
      margin: 0 0 var(--spacing-lg);
    }

    /* btn and btn-primary use global classes from main.css */
  }

  .entries-list {
    display: grid;
    gap: var(--spacing-md);
  }

  .list-enter-active,
  .list-leave-active {
    transition: all 0.3s ease;
  }

  .list-enter-from {
    opacity: 0;
    transform: translateX(-20px);
  }

  .list-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }

  .list-move {
    transition: transform 0.3s ease;
  }

  .load-sentinel {
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: var(--spacing-md);
  }
}
</style>
