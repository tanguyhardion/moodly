<template>
  <div class="min-h-dvh">
    <PasswordGate @authenticated="handleAuthenticated" />
    <SettingsDialog v-model="showSettings" />

    <Navbar @openSettings="showSettings = true" />

    <main class="overflow-x-clip pb-24 sm:pb-0">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { initialize } = useMoodly();
const { applyMoodTheme } = useMoodTheme();

const showSettings = ref(false);

applyMoodTheme();

const handleAuthenticated = async () => {
  // Load entries and metric config after authentication
  await initialize();
};
</script>
