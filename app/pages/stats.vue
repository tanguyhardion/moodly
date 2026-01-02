<template>
  <div class="page stats-page">
    <LoadingState v-if="!isReady" message="Loading your statistics..." />
    <div v-else class="stats-content-wrapper">
      <div class="page-header">
        <h1 class="page-title">
          <Icon name="solar:chart-bold" size="28" />
          Statistics
        </h1>
        <p class="page-subtitle">
          {{
            selectedDays === 0
              ? "Your all-time progress"
              : `Your progress over the last ${selectedDays} days`
          }}
        </p>
      </div>

      <div ref="periodSelectorRef">
        <PeriodSelector v-model="selectedDays" :periods="periods" />
      </div>

      <!-- Sticky Period Selector -->
      <Transition name="slide-down">
        <div v-if="showStickyHeader" class="sticky-header">
          <div class="sticky-content">
            <PeriodSelector v-model="selectedDays" :periods="periods" />
          </div>
        </div>
      </Transition>

      <div v-if="recentEntries.length === 0" class="empty-state">
        <Icon name="solar:graph-new-bold" size="64" class="empty-icon" />
        <h3>No data for this period</h3>
        <p>Create more entries to see your statistics</p>
        <NuxtLink to="/" class="btn btn-primary">
          <Icon name="solar:add-circle-bold" size="20" />
          Create Entry
        </NuxtLink>
      </div>

      <div v-else class="stats-content">
        <MetricsLineChart
          :entries="recentEntries"
          :metric-configs="metricConfigs"
        />

        <CheckinsStats :check-in-rate="checkInRate" />

        <CheckinsTimeline :entries="recentEntries" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { entries, metricConfigs, getEntriesInRange, isInitialized } =
  useMoodly();

const isReady = ref(false);

// Watch for data initialization
watch(isInitialized, (initialized) => {
  if (initialized && !isReady.value) {
    isReady.value = true;
  }
});

// Initialize if data is already loaded
const periodSelectorRef = ref<HTMLElement | null>(null);
const showStickyHeader = ref(false);

onMounted(() => {
  if (isInitialized.value) {
    isReady.value = true;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry) {
        // Check if element is above the viewport (allowing for some margin)
        showStickyHeader.value =
          !entry.isIntersecting && entry.boundingClientRect.top < 60;
      }
    },
    { threshold: 0, rootMargin: "-80px 0px 0px 0px" },
  );

  if (periodSelectorRef.value) {
    observer.observe(periodSelectorRef.value);
  }

  watch(periodSelectorRef, (el) => {
    if (el) observer.observe(el);
  });
});

const selectedDays = ref(7);
const periods = [
  { label: "7 Days", days: 7 },
  { label: "14 Days", days: 14 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
  { label: "All", days: 0 },
];

const recentEntries = computed(() => {
  return getEntriesInRange(selectedDays.value);
});

const checkInRate = computed(() => {
  if (recentEntries.value.length === 0) {
    return {
      healthyFood: 0,
      caffeine: 0,
      gym: 0,
      hardWork: 0,
      alcohol: 0,
      misc: 0,
    };
  }

  const totalEntries = recentEntries.value.length;
  const healthyFoodCount = recentEntries.value.filter(
    (entry) => entry.checkboxes?.healthyFood,
  ).length;
  const caffeineCount = recentEntries.value.filter(
    (entry) => entry.checkboxes?.caffeine,
  ).length;
  const gymCount = recentEntries.value.filter(
    (entry) => entry.checkboxes?.gym,
  ).length;
  const hardWorkCount = recentEntries.value.filter(
    (entry) => entry.checkboxes?.hardWork,
  ).length;
  const alcoholCount = recentEntries.value.filter(
    (entry) => entry.checkboxes?.alcohol,
  ).length;
  const miscCount = recentEntries.value.filter(
    (entry) => entry.checkboxes?.misc,
  ).length;

  return {
    healthyFood: Math.round((healthyFoodCount / totalEntries) * 100),
    caffeine: Math.round((caffeineCount / totalEntries) * 100),
    gym: Math.round((gymCount / totalEntries) * 100),
    hardWork: Math.round((hardWorkCount / totalEntries) * 100),
    alcohol: Math.round((alcoholCount / totalEntries) * 100),
    misc: Math.round((miscCount / totalEntries) * 100),
  };
});
</script>

<style scoped lang="scss">
.stats-page {
  max-width: 900px;
  margin: 0 auto;

  .stats-content-wrapper {
    animation: fadeIn 0.3s ease;

    .page-header {
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

    /* Sticky header uses global .sticky-header and .sticky-content with local overrides */
    .sticky-content {
      padding: var(--spacing-sm);
      width: auto;

      /* Override PeriodSelector margin in sticky mode */
      :deep(.period-selector) {
        margin-bottom: 0;
      }
    }
  }
}
</style>
