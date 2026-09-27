<template>
  <header class="sticky top-0 z-[100] bg-bg/80 backdrop-blur-md">
    <div class="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4">
      <NuxtLink to="/" class="flex items-center gap-2">
        <MoodlyLogo class="size-7" />
        <span class="font-display text-xl font-extrabold tracking-tight">moodly</span>
      </NuxtLink>

      <nav class="mx-auto hidden items-center gap-1 sm:flex" aria-label="Main">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition"
          :class="isActive(link) ? 'bg-surface text-ink shadow-card dark:shadow-none' : 'text-muted hover:text-ink'"
        >
          <Icon :name="link.icon" size="18" />
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="ml-auto flex items-center gap-1 sm:ml-0">
        <button type="button" class="icon-btn" :title="darkMode ? 'Light mode' : 'Dark mode'" @click="toggleDarkMode">
          <Icon :name="darkMode ? 'solar:sun-bold' : 'solar:moon-bold'" size="20" />
        </button>
        <button type="button" class="icon-btn" title="Settings" @click="$emit('openSettings')">
          <Icon name="solar:settings-bold" size="20" />
        </button>
      </div>
    </div>
  </header>

  <!-- Mobile tab bar -->
  <nav
    class="fixed inset-x-3 bottom-3 z-[100] grid grid-cols-5 rounded-card bg-surface/95 p-1.5 shadow-pop backdrop-blur-md sm:hidden"
    style="margin-bottom: env(safe-area-inset-bottom, 0px)"
    aria-label="Main"
  >
    <NuxtLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px] font-semibold transition"
      :class="isActive(link) ? 'bg-mood text-mood-ink' : 'text-muted'"
    >
      <Icon :name="link.icon" size="22" />
      {{ link.label }}
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const { darkMode, toggleDarkMode } = useMoodly();
const route = useRoute();

const links = [
  { to: '/', label: 'Today', icon: 'solar:home-smile-bold' },
  { to: '/history', label: 'History', icon: 'solar:calendar-bold' },
  { to: '/stats', label: 'Stats', icon: 'solar:chart-bold' },
  { to: '/insights', label: 'Insights', icon: 'mdi:sparkles' },
  { to: '/letters', label: 'Letters', icon: 'solar:letter-bold' },
];

const isActive = (link: { to: string }) =>
  link.to === '/' ? route.path === '/' : route.path.startsWith(link.to);

defineEmits<{
  openSettings: [];
}>();
</script>
