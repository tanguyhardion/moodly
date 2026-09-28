<template>
  <div class="loading-state flex flex-col items-center justify-center gap-5 py-20 text-muted" role="status" aria-live="polite">
    <div class="relative grid size-20 place-items-center">
      <!-- soft halo that breathes behind the logo -->
      <span class="halo absolute inset-3 rounded-full bg-mood-soft" />
      <svg class="absolute inset-0 size-full -rotate-90" viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <circle cx="40" cy="40" r="35" stroke-width="4" class="stroke-mood-soft" />
        <circle class="arc stroke-mood" cx="40" cy="40" r="35" stroke-width="4" stroke-linecap="round" pathLength="100" />
      </svg>
      <MoodlyLogo variant="mark" class="logo relative size-9" />
    </div>
    <p class="text-sm font-medium">{{ message || 'Loading…' }}</p>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  message?: string;
}>();
</script>
<style scoped>
/* Wait a beat before showing, so quick loads don't flash a spinner */
.loading-state {
  animation: fade-in 0.3s ease 0.15s both;
}

/* Five pushes per cycle, each a different distance, so the slow spot lands somewhere new every time.
   Length runs on its own, longer beat, so the two drift apart. */
.arc {
  transform-origin: center;
  stroke-dasharray: 16 84;
  animation:
    spin 5.5s infinite,
    length 3.7s ease-in-out infinite;
}

.halo {
  animation: breathe 2.2s ease-in-out infinite;
}

.logo {
  animation: bob 2.2s ease-in-out infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  20% {
    transform: rotate(300deg);
  }
  40% {
    transform: rotate(640deg);
  }
  60% {
    transform: rotate(890deg);
  }
  80% {
    transform: rotate(1210deg);
  }
  100% {
    transform: rotate(1440deg);
  }
}

@keyframes length {
  0%,
  100% {
    stroke-dasharray: 12 88;
  }
  35% {
    stroke-dasharray: 40 60;
  }
  65% {
    stroke-dasharray: 20 80;
  }
}

@keyframes breathe {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.9);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

@keyframes bob {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .arc {
    animation-duration: 16s, 8s;
  }
  .halo,
  .logo {
    animation: none;
  }
}
</style>
