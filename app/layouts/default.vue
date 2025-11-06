<template>
  <div class="app-container">
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
            <Icon name="solar:star-shine-bold" size="28" class="logo-icon" />
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
const { darkMode, toggleDarkMode } = useMoodly();

const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
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
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
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
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--text-primary);
  transition: transform 0.2s ease;
}

.logo:hover {
  transform: scale(1.05);
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
  padding: 0.625rem 1rem;
  border-radius: 0.625rem;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.nav-link.router-link-active {
  background: var(--active-bg);
  color: var(--primary);
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
  width: 40px;
  height: 40px;
  border: none;
  background: var(--hover-bg);
  color: var(--text-primary);
  border-radius: 0.625rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  background: var(--active-bg);
  transform: rotate(15deg);
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
  opacity: 0.3;
  filter: blur(60px);
  animation: float 20s ease-in-out infinite;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #ff6b9d 0%, #ffa06b 100%);
  top: -200px;
  left: -200px;
  animation-delay: 0s;
}

.shape-2 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #a78bfa 0%, #4ecdc4 100%);
  bottom: -250px;
  right: -250px;
  animation-delay: -10s;
}

.shape-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #ffc93c 0%, #ff6b9d 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -5s;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 30px) scale(0.9);
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
