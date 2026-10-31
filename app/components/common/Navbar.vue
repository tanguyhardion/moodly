<template>
  <header class="sticky top-0 z-[100] bg-bg/80 backdrop-blur-md">
    <div class="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4">
      <NuxtLink to="/" class="flex items-center gap-2">
        <MoodlyLogo class="size-7" />
        <span class="font-display text-xl font-extrabold tracking-tight">moodly</span>
      </NuxtLink>

      <nav ref="desktopNav" class="relative mx-auto hidden items-center gap-1 sm:flex" aria-label="Main">
        <span
          class="pill-indicator pointer-events-none absolute left-0 top-0 h-full rounded-full bg-mood"
          :class="{ 'pill-ready': ready }"
          :style="desktopStyle"
          aria-hidden="true"
        />
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="relative flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors"
          :class="isActive(link) ? 'text-mood-ink' : 'text-ink/70 hover:text-ink'"
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
    ref="mobileNav"
    class="fixed inset-x-3 bottom-3 z-[100] grid grid-cols-5 rounded-card bg-surface/95 p-1.5 shadow-pop backdrop-blur-md sm:hidden"
    style="margin-bottom: env(safe-area-inset-bottom, 0px)"
    aria-label="Main"
  >
    <span
      class="pill-indicator pointer-events-none absolute left-0 top-1.5 bottom-1.5 rounded-2xl bg-mood"
      :class="{ 'pill-ready': ready }"
      :style="mobileStyle"
      aria-hidden="true"
    />
    <NuxtLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="relative flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px] font-semibold transition-colors"
      :class="isActive(link) ? 'text-mood-ink' : 'text-ink/70'"
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

const desktopNav = ref<HTMLElement | null>(null);
const mobileNav = ref<HTMLElement | null>(null);
const desktopStyle = ref<Record<string, string>>({ opacity: '0' });
const mobileStyle = ref<Record<string, string>>({ opacity: '0' });
const ready = ref(false);
let resizeObserver: ResizeObserver | null = null;

const pillStyle = (nav: HTMLElement | null) => {
  const index = links.findIndex(isActive);
  const el = nav?.querySelectorAll('a')[index] as HTMLElement | undefined;
  // Hidden navs (display: none) report a zero width
  if (!el || !el.offsetWidth) return { opacity: '0' };
  return {
    opacity: '1',
    width: `${el.offsetWidth}px`,
    transform: `translateX(${el.offsetLeft}px)`,
  };
};

const updatePills = () => {
  desktopStyle.value = pillStyle(desktopNav.value);
  mobileStyle.value = pillStyle(mobileNav.value);
};

watch(() => route.path, () => nextTick(updatePills));

onMounted(() => {
  updatePills();
  // Enable transitions only after the first placement so the pill doesn't fly in on load
  requestAnimationFrame(() => (ready.value = true));
  window.addEventListener('resize', updatePills);
  document.fonts?.ready.then(updatePills);
  // Icons and fonts settle after mount and change link widths, so re-measure on any size change
  resizeObserver = new ResizeObserver(updatePills);
  [desktopNav.value, mobileNav.value].forEach((nav) => {
    if (!nav) return;
    resizeObserver!.observe(nav);
    nav.querySelectorAll('a').forEach((a) => resizeObserver!.observe(a));
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updatePills);
  resizeObserver?.disconnect();
});

defineEmits<{
  openSettings: [];
}>();
</script>

<style scoped>
.pill-indicator {
  will-change: transform, width;
}
.pill-ready {
  transition:
    transform 0.4s cubic-bezier(0.34, 1.2, 0.5, 1),
    width 0.4s cubic-bezier(0.34, 1.2, 0.5, 1),
    opacity 0.2s;
}
</style>
