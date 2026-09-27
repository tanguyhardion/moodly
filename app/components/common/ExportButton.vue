<template>
  <div class="export-container relative">
    <button class="icon-btn" type="button" title="Export your history" :aria-expanded="showMenu" @click="toggleMenu">
      <Icon name="solar:download-minimalistic-bold" size="22" />
    </button>

    <Transition name="menu">
      <div v-if="showMenu" class="absolute right-0 z-50 mt-2 min-w-40 rounded-2xl bg-surface p-1.5 shadow-pop">
        <button
          v-for="format in formats"
          :key="format.type"
          type="button"
          class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition hover:bg-mood-soft"
          @click="handleExport(format.type)"
        >
          <Icon :name="format.icon" size="18" class="text-muted" />
          Export as {{ format.label }}
        </button>
      </div>
    </Transition>
  </div>
</template>
<script setup lang="ts">
import { downloadFile } from '~/utils/helpers';

const { entries } = useMoodly();
const showMenu = ref(false);

const formats = [
  { type: "json", label: "JSON", icon: "solar:code-file-bold" },
];

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const handleExport = (type: string) => {
  if (type === 'json') {
    const blob = new Blob([JSON.stringify(entries.value, null, 2)], { type: 'application/json' });
    downloadFile(blob, `moodly-export-${new Date().toISOString().split('T')[0]}.json`);
  }
  showMenu.value = false;
};

// Close menu when clicking outside
if (import.meta.client) {
  onMounted(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".export-container")) {
        showMenu.value = false;
      }
    };
    document.addEventListener("click", handleClickOutside);
    onUnmounted(() => {
      document.removeEventListener("click", handleClickOutside);
    });
  });
}
</script>
