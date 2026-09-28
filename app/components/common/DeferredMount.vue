<template>
  <div ref="el" :style="!ready ? { minHeight: `${height}px` } : undefined">
    <slot v-if="ready" />
  </div>
</template>
<script setup lang="ts">
// Mounts its slot only once it nears the viewport, after the browser is idle.
// Keeps heavy children (charts) from blocking the first paint of a page.

const props = withDefaults(defineProps<{ height?: number; rootMargin?: string }>(), {
  height: 0,
  rootMargin: '200px',
});

const el = ref<HTMLElement | null>(null);
const ready = ref(false);

onMounted(() => {
  const idle = (cb: () => void) =>
    'requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 300 }) : setTimeout(cb, 16);

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      idle(() => (ready.value = true));
    },
    { rootMargin: props.rootMargin }
  );
  if (el.value) observer.observe(el.value);
  onUnmounted(() => observer.disconnect());
});
</script>
