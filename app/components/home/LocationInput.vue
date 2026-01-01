<script setup lang="ts">
import { ref, watch } from "vue";
import { moodlyBackendService } from "~/utils/moodly-backend";

interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

const props = defineProps<{
  modelValue: Location | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: Location | null): void;
}>();

const searchQuery = ref("");
const results = ref<any[]>([]);
const isLoading = ref(false);
const showResults = ref(false);
let debounceTimer: NodeJS.Timeout | null = null;

// Initialize search query if modelValue exists
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && newVal.name !== searchQuery.value) {
      searchQuery.value = newVal.name;
    } else if (!newVal) {
      // Only clear if it's explicitly null and we aren't typing
      // Actually, if modelValue is null, we should probably clear the input unless the user is in the middle of typing
      // But since this is a controlled component, if the parent says null, it should be null.
      // However, we want to avoid clearing while typing if the parent updates.
      // Let's assume parent updates only on selection.
      if (!showResults.value) {
        searchQuery.value = "";
      }
    }
  },
  { immediate: true },
);

const handleInput = (event: Event) => {
  const query = (event.target as HTMLInputElement).value;
  searchQuery.value = query;

  if (!query) {
    results.value = [];
    showResults.value = false;
    emit("update:modelValue", null);
    return;
  }

  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
    if (query.length < 3) return;

    isLoading.value = true;
    try {
      const response = await moodlyBackendService.searchLocation(query);
      // Geoapify response structure:
      // { type: "FeatureCollection", features: [...] }
      if (response && response.features) {
        results.value = response.features.map((feature: any) => ({
          name: feature.properties.formatted,
          latitude: feature.properties.lat,
          longitude: feature.properties.lon,
          id: feature.properties.place_id,
        }));
        showResults.value = true;
      }
    } catch (e) {
      console.error(e);
    } finally {
      isLoading.value = false;
    }
  }, 500);
};

const selectLocation = (location: any) => {
  searchQuery.value = location.name;
  showResults.value = false;
  emit("update:modelValue", {
    name: location.name,
    latitude: location.latitude,
    longitude: location.longitude,
  });
};

const clearLocation = () => {
  searchQuery.value = "";
  results.value = [];
  showResults.value = false;
  emit("update:modelValue", null);
};

// Close results when clicking outside
// This would require a click-outside directive or listener.
// For simplicity, we can rely on selection or blur, but blur is tricky with click.
// Let's just leave it for now.
</script>

<template>
  <div class="location-section">
    <div class="location-header">
      <div class="icon-container">
        <Icon name="mdi:map-marker" size="24" class="icon-primary" />
      </div>
      <label for="location" class="location-label">Location</label>
    </div>
    <div class="input-wrapper">
      <input
        id="location"
        :value="searchQuery"
        @input="handleInput"
        class="location-input"
        placeholder="Search for a location..."
        autocomplete="off"
      />
      <button v-if="searchQuery" @click="clearLocation" class="clear-btn">
        <Icon name="mdi:close" size="16" />
      </button>
    </div>

    <div v-if="showResults && results.length > 0" class="results-dropdown">
      <div
        v-for="result in results"
        :key="result.id"
        class="result-item"
        @click="selectLocation(result)"
      >
        {{ result.name }}
      </div>
    </div>
    <div v-if="isLoading" class="loading-indicator">Searching...</div>
  </div>
</template>

<style scoped>
.location-section {
  margin-bottom: var(--spacing-xl);
  padding: 1.75rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.location-section:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-light);
}

.location-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--primary-bg);
  border-radius: var(--radius-lg);
  color: var(--primary);
}

.location-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.location-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.location-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-bg);
}

.clear-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
}

.results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
}

.result-item {
  padding: var(--spacing-md);
  cursor: pointer;
  transition: background 0.2s;
  color: var(--text-primary);
}

.result-item:hover {
  background: var(--bg-secondary);
}

.loading-indicator {
  margin-top: 5px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}
</style>
