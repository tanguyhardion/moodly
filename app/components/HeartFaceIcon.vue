<template>
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="feeling-icon"
  >
    <!-- Head circle -->
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      stroke-width="1.5"
      fill="none"
    />

    <!-- Left eye -->
    <circle cx="9" cy="10" r="1.2" fill="currentColor" />

    <!-- Right eye -->
    <circle cx="15" cy="10" r="1.2" fill="currentColor" />

    <!-- Smile curve -->
    <path
      d="M 8.5 14 Q 12 16 15.5 14"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />

    <!-- Heart accent inside -->
    <path
      d="M 12 17 L 12.5 18 L 13 17 Q 12.5 17.5 12 17"
      fill="currentColor"
      opacity="0.6"
    />
  </svg>
</template>

<style scoped>
.feeling-icon {
  display: inline-block;
  vertical-align: middle;
}
</style>
