export function useLocalStorage<T>(key: string, defaultValue: T) {
  const data = ref<T>(defaultValue) as Ref<T>;
  const loaded = ref(false);

  // Load data from localStorage on mount
  onMounted(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        data.value = JSON.parse(item);
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
    }
    loaded.value = true;
  });

  // Watch for changes and save to localStorage
  watch(
    data,
    (newValue) => {
      if (loaded.value) {
        try {
          localStorage.setItem(key, JSON.stringify(newValue));
        } catch (error) {
          console.error(`Error saving ${key} to localStorage:`, error);
        }
      }
    },
    { deep: true }
  );

  return data;
}
