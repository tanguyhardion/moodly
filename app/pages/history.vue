<template>
  <div class="page history-page">
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
</template>

<script setup lang="ts">
const { entries, metricConfigs, deleteEntry } = useMoodly();

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
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #ff6b9d 0%, #ffa06b 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 107, 157, 0.4);
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
