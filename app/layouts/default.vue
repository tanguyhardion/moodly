<template>
  <div class="app-container">
    <PasswordGate @authenticated="handleAuthenticated" />
    <SettingsDialog v-model="showSettings" />

    <Navbar @openSettings="showSettings = true" />

    <main class="main-content">
      <slot />
    </main>

    <div class="background-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { loadEntries } = useMoodly();

const showSettings = ref(false);

const handleAuthenticated = async () => {
  // Load entries after authentication
  await loadEntries();
};
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  position: relative;
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--nav-bg);
  z-index: 1;
}

.background-shapes {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

/* Prevent horizontal scroll on body */
:global(body) {
  overflow-x: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.25;
  filter: blur(80px);
  animation: float 25s ease-in-out infinite;
  will-change: transform;
}

.shape-1 {
  width: 450px;
  height: 450px;
  background: var(--gradient-primary);
  top: -225px;
  left: -225px;
  animation-delay: 0s;
}

.shape-2 {
  width: 550px;
  height: 550px;
  background: var(--gradient-secondary);
  bottom: -275px;
  right: -275px;
  animation-delay: -12s;
}

.shape-3 {
  width: 350px;
  height: 350px;
  background: var(--gradient-accent);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -6s;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1) rotate(0deg);
  }
  25% {
    transform: translate(40px, -60px) scale(1.05) rotate(5deg);
  }
  50% {
    transform: translate(-30px, 40px) scale(0.95) rotate(-5deg);
  }
  75% {
    transform: translate(20px, -30px) scale(1.02) rotate(3deg);
  }
}

@media (max-width: 640px) {
  .nav-content {
    padding: 0.75rem 1rem;
  }

  .main-content {
    padding: 1.5rem 1rem;
  }

  .shape {
    filter: blur(40px);
  }
}
</style>
