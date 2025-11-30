<template>
  <div class="app-container">
    <PasswordGate @authenticated="handleAuthenticated" />

    <nav class="navbar">
      <div class="nav-content">
        <div class="nav-section">
          <button
            @click="toggleMobileMenu"
            class="burger-menu"
            title="Toggle menu"
          >
            <Icon
              v-if="!mobileMenuOpen"
              name="solar:hamburger-menu-bold"
              size="24"
            />
            <Icon v-else name="solar:close-circle-bold" size="24" />
          </button>
        </div>

        <div class="logo-section">
          <NuxtLink to="/" class="logo" @click="mobileMenuOpen = false">
            <img src="/favicon.ico" alt="Moodly" class="logo-icon" width="28" height="28" />
            <span class="logo-text">Moodly</span>
          </NuxtLink>
        </div>

        <div class="nav-links" :class="{ 'mobile-open': mobileMenuOpen }">
          <NuxtLink to="/" class="nav-link" @click="mobileMenuOpen = false">
            <Icon name="solar:home-2-bold" size="20" />
            <span>Home</span>
          </NuxtLink>
          <NuxtLink
            to="/history"
            class="nav-link"
            @click="mobileMenuOpen = false"
          >
            <Icon name="solar:history-bold" size="20" />
            <span>History</span>
          </NuxtLink>
          <NuxtLink
            to="/stats"
            class="nav-link"
            @click="mobileMenuOpen = false"
          >
            <Icon name="solar:chart-bold" size="20" />
            <span>Stats</span>
          </NuxtLink>
        </div>

        <button
          @click="toggleDarkMode"
          class="theme-toggle"
          title="Toggle theme"
        >
          <Icon v-if="darkMode" name="solar:sun-bold" size="20" />
          <Icon v-else name="solar:moon-bold" size="20" />
        </button>
      </div>
    </nav>

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
const { darkMode, toggleDarkMode, loadEntries } = useMoodly();

const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

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
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  position: relative;
}

.nav-section {
  display: none;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.burger-menu {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  border-radius: 0.625rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.burger-menu:hover {
  background: var(--hover-bg);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  font-weight: 800;
  font-size: 1.35rem;
  color: var(--text-primary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: -0.02em;
}

.logo:hover {
  transform: scale(1.05);
  color: var(--primary);
}

.logo-icon {
  color: var(--primary);
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
}

.logo-text {
  display: inline;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.nav-link::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius-md);
  background: var(--hover-bg);
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: -1;
}

.nav-link:hover::before {
  opacity: 1;
}

.nav-link:hover {
  color: var(--text-primary);
  transform: translateY(-1px);
}

.nav-link.router-link-active {
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.15) 0%, rgba(255, 160, 107, 0.15) 100%);
  color: var(--primary);
  box-shadow: 0 0 0 1px rgba(255, 107, 157, 0.2);
}

.nav-link.router-link-active::before {
  display: none;
}

.nav-link span {
  display: none;
}

@media (min-width: 640px) {
  .nav-link span {
    display: inline;
  }
}

@media (max-width: 768px) {
  .nav-section {
    display: flex;
  }

  .burger-menu {
    display: flex;
  }

  .logo-text {
    display: inline;
  }

  .logo-section {
    flex: 1;
    justify-content: center;
  }

  .nav-links {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background: var(--nav-bg);
    border-bottom: 1px solid var(--border);
    padding: 0 1.5rem;
    gap: 0;
    justify-content: flex-start;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }

  .nav-links.mobile-open {
    padding: 1rem 1.5rem;
    max-height: 300px;
  }

  .nav-link {
    padding: 0.75rem 1rem;
    border-radius: 0.625rem;
  }

  .nav-link span {
    display: inline;
  }
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: none;
  background: var(--hover-bg);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 0 1px var(--border-light);
}

.theme-toggle:hover {
  background: var(--active-bg);
  transform: rotate(20deg) scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.2);
}

.theme-toggle:active {
  transform: rotate(20deg) scale(0.95);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  position: relative;
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
  background: linear-gradient(135deg, #ff6b9d 0%, #ffa06b 100%);
  top: -225px;
  left: -225px;
  animation-delay: 0s;
}

.shape-2 {
  width: 550px;
  height: 550px;
  background: linear-gradient(135deg, #a78bfa 0%, #4ecdc4 100%);
  bottom: -275px;
  right: -275px;
  animation-delay: -12s;
}

.shape-3 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #ffc93c 0%, #ff6b9d 100%);
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
