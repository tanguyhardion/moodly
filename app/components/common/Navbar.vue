<template>
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
          <img
            src="/logo.svg"
            alt="Moodly"
            class="logo-icon"
            width="32"
            height="32"
          />
          <span class="logo-text">Moodly</span>
        </NuxtLink>
      </div>

      <div class="nav-links" :class="{ 'mobile-open': mobileMenuOpen }">
        <NuxtLink to="/" class="nav-link" @click="mobileMenuOpen = false">
          <Icon name="solar:home-2-bold" size="20" />
          <span>Home</span>
        </NuxtLink>
        <NuxtLink
          to="/insights"
          class="nav-link"
          @click="mobileMenuOpen = false"
        >
          <Icon name="mdi:sparkles" size="20" />
          <span>Insights</span>
        </NuxtLink>
        <NuxtLink
          to="/stats"
          class="nav-link"
          @click="mobileMenuOpen = false"
        >
          <Icon name="solar:chart-bold" size="20" />
          <span>Stats</span>
        </NuxtLink>
        <NuxtLink
          to="/history"
          class="nav-link"
          @click="mobileMenuOpen = false"
        >
          <Icon name="solar:history-bold" size="20" />
          <span>History</span>
        </NuxtLink>
      </div>

      <div class="nav-actions">
        <button
          @click="$emit('openSettings')"
          class="nav-button"
          title="Settings"
        >
          <Icon
            name="solar:settings-bold"
            size="20"
            class="nav-button-icon"
          />
        </button>
        <button
          @click="toggleDarkMode"
          class="nav-button"
          title="Toggle theme"
        >
          <Icon
            v-if="darkMode"
            name="solar:sun-bold"
            size="20"
            class="nav-button-icon"
          />
          <Icon
            v-else
            name="solar:moon-bold"
            size="20"
            class="nav-button-icon"
          />
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const { darkMode, toggleDarkMode } = useMoodly();

const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

defineEmits<{
  openSettings: [];
}>();
</script>

<style scoped>
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
  flex: 1;
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
  content: "";
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
  background: var(--nav-link-active-bg);
  color: var(--nav-link-active-color);
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

.nav-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex: 1;
  justify-content: flex-end;
}

.nav-button {
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

.nav-button:hover {
  background: var(--border-hover);
  box-shadow: 0 4px 12px rgba(var(--color-shadow-primary), 0.2);
}

.nav-button .nav-button-icon {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-button:hover .nav-button-icon {
  transform: rotate(40deg) scale(1.05);
}

@media (max-width: 640px) {
  .nav-content {
    padding: 0.75rem 1rem;
  }
}
</style>
