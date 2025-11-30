<template>
  <div class="page history-page">
    <LoadingState v-if="!isReady" message="Loading your history..." />
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
        <EntryCard
          v-for="entry in sortedEntries"
          :key="entry.id"
          :entry="entry"
          :metric-configs="metricConfigs"
          :show-delete="true"
          @delete="handleDelete(entry.id)"
        />
      </TransitionGroup>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { entries, metricConfigs, deleteEntry, isInitialized } = useMoodly();

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

const sortedEntries = computed(() => {
  return [...entries.value].sort((a, b) => b.date.localeCompare(a.date));
});

const handleDelete = async (id: string) => {
  if (confirm("Are you sure you want to delete this entry?")) {
    try {
      await deleteEntry(id);
    } catch (error) {
      console.error("Failed to delete entry:", error);
      alert("Failed to delete entry. Please try again.");
    }
  }
};
</script>

<style scoped>
.history-page {
  max-width: 800px;
  margin: 0 auto;
}

.history-content {
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
  position: relative;
  text-align: center;
  margin-bottom: 2rem;
  padding-top: 0.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
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

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  color: var(--text-tertiary);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
}

.empty-state p {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0 0 1.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 1rem 2.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 1.0625rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  letter-spacing: -0.01em;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: linear-gradient(135deg, #ff6b9d 0%, #ffa06b 100%);
  color: white;
  box-shadow: var(--shadow-colored);
}

.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #e94a7c 0%, #ff8a52 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px -5px rgba(255, 107, 157, 0.4);
}

.btn-primary:hover::before {
  opacity: 1;
}

.entries-list {
  display: grid;
  gap: 1rem;
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
</style>
