<template>
  <div class="page history-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <Icon name="solar:history-bold" size="28" />
          Your Journey
        </h1>
        <ExportButton v-if="entries.length > 0" class="export-btn-wrapper" />
      </div>
      <p class="page-subtitle">
        {{ entries.length }} {{ entries.length === 1 ? 'entry' : 'entries' }} recorded
      </p>
    </div>

    <div v-if="entries.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
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

const handleDelete = (id: string) => {
  if (confirm('Are you sure you want to delete this entry?')) {
    deleteEntry(id);
  }
};
</script>

<style scoped>
.history-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.export-btn-wrapper {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.export-btn-wrapper:hover {
  opacity: 1;
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
  font-size: 4rem;
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
  background: linear-gradient(135deg, #FF6B9D 0%, #FFA06B 100%);
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
