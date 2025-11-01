<template>
  <div class="export-container">
    <button
      class="export-btn"
      @click="toggleMenu"
      :title="'Export data'"
    >
      <Icon name="solar:download-minimalistic-bold" size="20" />
    </button>

    <Transition name="menu">
      <div v-if="showMenu" class="export-menu">
        <button
          v-for="format in formats"
          :key="format.type"
          class="export-option"
          @click="handleExport(format.type)"
        >
          <Icon :name="format.icon" size="18" />
          <span>{{ format.label }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { exportToJSON, exportToCSV, exportToExcel, exportToMarkdown } = useMoodly();
const showMenu = ref(false);

const formats = [
  { type: 'json', label: 'JSON', icon: 'solar:code-file-bold' },
  { type: 'csv', label: 'CSV', icon: 'solar:document-text-bold' },
  { type: 'excel', label: 'Excel', icon: 'solar:document-bold' },
  { type: 'markdown', label: 'Markdown', icon: 'solar:file-text-bold' }
];

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const handleExport = (type: string) => {
  switch (type) {
    case 'json':
      exportToJSON();
      break;
    case 'csv':
      exportToCSV();
      break;
    case 'excel':
      exportToExcel();
      break;
    case 'markdown':
      exportToMarkdown();
      break;
  }
  showMenu.value = false;
};

// Close menu when clicking outside
if (import.meta.client) {
  onMounted(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.export-container')) {
        showMenu.value = false;
      }
    };
    document.addEventListener('click', handleClickOutside);
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });
  });
}
</script>

<style scoped>
.export-container {
  position: relative;
}

.export-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 0.5rem;
  background: var(--surface-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.export-btn:hover {
  background: var(--surface-tertiary);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.export-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: var(--surface-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-width: 150px;
  z-index: 100;
}

.export-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  text-align: left;
}

.export-option:hover {
  background: var(--surface-secondary);
  color: var(--accent-primary);
}

.export-option:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
}

/* Menu transition */
.menu-enter-active,
.menu-leave-active {
  transition: all 0.2s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
