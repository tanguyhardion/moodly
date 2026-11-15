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

  <!-- Mobile tab bar: a floating glass pill, detached from the screen edges -->
  <nav
    ref="mobileNav"
    class="floating-nav fixed left-1/2 z-[100] grid w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 grid-cols-5 rounded-full p-1.5 sm:hidden"
    :class="{ compact }"
    aria-label="Main"
  >
    <span
      class="pill-indicator pointer-events-none absolute left-0 top-1.5 bottom-1.5 rounded-full bg-mood shadow-[0_4px_14px_-4px_var(--mood)]"
      :class="{ 'pill-ready': ready }"
      :style="mobileStyle"
      aria-hidden="true"
    />
    <NuxtLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="tab relative flex flex-col items-center justify-center rounded-full text-[10.5px] font-semibold transition-[color,transform] active:scale-90"
      :class="isActive(link) ? 'text-mood-ink' : 'text-ink/60'"
    >
      <Icon :name="link.icon" size="22" />
      <span class="tab-label">{{ link.label }}</span>
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

// Like iOS tab bars, the mobile bar tucks its labels away while scrolling down and brings
// them back on scroll up or near the top, so it covers less content while reading
const compact = ref(false);
let lastScrollY = 0;
const onScroll = () => {
  const y = window.scrollY;
  if (Math.abs(y - lastScrollY) < 8) return;
  compact.value = y > lastScrollY && y > 80;
  lastScrollY = y;
};
watch(() => route.path, () => (compact.value = false));

const pillStyle = (nav: HTMLElement | null): Record<string, string> => {
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
  window.addEventListener('scroll', onScroll, { passive: true });
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
  window.removeEventListener('scroll', onScroll);
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
.floating-nav {
  bottom: max(1rem, env(safe-area-inset-bottom, 0px));
  /* Frosted glass: translucent surface, blur and a saturation boost of what scrolls behind */
  background: color-mix(in oklab, var(--surface) 72%, transparent);
  backdrop-filter: blur(20px) saturate(1.6);
  -webkit-backdrop-filter: blur(20px) saturate(1.6);
  /* Hairline edge + top highlight + layered drop shadow so the bar reads as lifted off the page */
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.55),
    inset 0 1px 0 rgb(255 255 255 / 0.7),
    0 1px 2px rgb(27 22 34 / 0.08),
    0 12px 32px -8px rgb(27 22 34 / 0.28),
    0 0 0 1px rgb(27 22 34 / 0.06);
  transition: padding 0.3s cubic-bezier(0.34, 1.2, 0.5, 1);
}
/* Plain descendant selector: scoped CSS only tags the last part, and `:global(.dark) .x` would drop `.x` */
.dark .floating-nav {
  background: color-mix(in oklab, var(--surface) 68%, transparent);
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.035),
    inset 0 1px 0 rgb(255 255 255 / 0.04),
    0 16px 40px -8px rgb(0 0 0 / 0.7);
}
.tab {
  height: 3.25rem;
  gap: 0.125rem;
  transition:
    height 0.3s cubic-bezier(0.34, 1.2, 0.5, 1),
    color 0.2s,
    transform 0.15s;
}
.tab-label {
  max-height: 1rem;
  line-height: 1rem;
  overflow: hidden;
  transition:
    max-height 0.3s cubic-bezier(0.34, 1.2, 0.5, 1),
    opacity 0.2s;
}
.compact .tab {
  height: 2.75rem;
  gap: 0;
}
.compact .tab-label {
  max-height: 0;
  opacity: 0;
}
.pill-ready {
  transition:
    transform 0.4s cubic-bezier(0.34, 1.2, 0.5, 1),
    width 0.4s cubic-bezier(0.34, 1.2, 0.5, 1),
    opacity 0.2s;
}
</style>
