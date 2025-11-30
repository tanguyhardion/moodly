export function useDarkMode() {
  const darkMode = useLocalStorage<boolean>("moodly-dark-mode", false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value;
    if (import.meta.client) {
      document.documentElement.classList.toggle("dark", darkMode.value);
    }
  };

  // Apply dark mode on mount
  onMounted(() => {
    if (import.meta.client) {
      document.documentElement.classList.toggle("dark", darkMode.value);
    }
  });

  return {
    darkMode,
    toggleDarkMode,
  };
}
