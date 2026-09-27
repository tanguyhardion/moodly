<template>
  <!-- Inline so it follows the mood tint; public/logo.svg is the static copy used as the favicon. -->
  <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect
      v-if="variant === 'badge'"
      x="8"
      y="8"
      width="496"
      height="496"
      rx="130"
      class="fill-mood transition-[fill] duration-500"
    />
    <g :class="variant === 'badge' ? 'fill-mood-ink stroke-mood-ink' : 'fill-mood-strong stroke-mood-strong'">
      <!-- Stylized M / pulse graph -->
      <path
        d="M128 288 C 128 160, 210 160, 210 240 C 210 280, 230 300, 256 300 C 282 300, 302 280, 302 240 C 302 160, 384 160, 384 288"
        stroke-width="42"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
      <!-- Data points -->
      <circle cx="128" cy="288" r="21" stroke="none" />
      <circle cx="384" cy="288" r="21" stroke="none" />
    </g>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  /** "badge": mark on a mood-colored tile. "mark": the pulse line alone. */
  variant?: 'badge' | 'mark';
}>(), {
  variant: 'badge',
});
</script>
