<script setup lang="ts">
import { ref, watch, computed } from "vue";
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
const isFocused = ref(false);
const highlightedIndex = ref(-1);
let debounceTimer: NodeJS.Timeout | null = null;

// Initialize search query if modelValue exists
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && newVal.name !== searchQuery.value) {
      searchQuery.value = newVal.name;
    } else if (!newVal && !isFocused.value) {
      searchQuery.value = "";
    }
  },
  { immediate: true },
);

const hasSearched = computed(() => searchQuery.value.length >= 3);
const noResults = computed(
  () => hasSearched.value && !isLoading.value && results.value.length === 0,
);

const handleInput = (event: Event) => {
  const query = (event.target as HTMLInputElement).value;
  searchQuery.value = query;
  highlightedIndex.value = -1;

  if (!query) {
    results.value = [];
    showResults.value = false;
    emit("update:modelValue", null);
    return;
  }

  if (debounceTimer) clearTimeout(debounceTimer);

  if (query.length < 3) {
    showResults.value = false;
    return;
  }

  isLoading.value = true;
  showResults.value = true;

  debounceTimer = setTimeout(async () => {
    try {
      const response = await moodlyBackendService.searchLocation(query);
      if (response && response.features) {
        results.value = response.features.map((feature: any) => ({
          name: feature.properties.formatted,
          latitude: feature.properties.lat,
          longitude: feature.properties.lon,
          id: feature.properties.place_id,
        }));
      } else {
        results.value = [];
      }
    } catch (e) {
      console.error(e);
      results.value = [];
    } finally {
      isLoading.value = false;
    }
  }, 400);
};

const selectLocation = (location: any) => {
  searchQuery.value = location.name;
  showResults.value = false;
  isFocused.value = false;
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
  highlightedIndex.value = -1;
  emit("update:modelValue", null);
};

const handleFocus = () => {
  isFocused.value = true;
  if (searchQuery.value.length >= 3 && results.value.length > 0) {
    showResults.value = true;
  }
};

const handleBlur = () => {
  isFocused.value = false;
  // Delay closing to allow click on results
  setTimeout(() => {
    if (!isFocused.value) {
      showResults.value = false;
      highlightedIndex.value = -1;
    }
  }, 200);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (!showResults.value || results.value.length === 0) return;

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      highlightedIndex.value = Math.min(
        highlightedIndex.value + 1,
        results.value.length - 1,
      );
      break;
    case "ArrowUp":
      event.preventDefault();
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1);
      break;
    case "Enter":
      event.preventDefault();
      if (highlightedIndex.value >= 0) {
        selectLocation(results.value[highlightedIndex.value]);
      }
      break;
    case "Escape":
      event.preventDefault();
      showResults.value = false;
      highlightedIndex.value = -1;
      break;
  }
};
</script>

<template>
  <div class="location-section">
    <div class="location-header">
      <div class="icon-container">
        <Icon name="mdi:map-marker" size="24" class="icon-primary" />
      </div>
      <label for="location" class="location-label">Location</label>
    </div>

    <div class="autocomplete-wrapper">
      <div class="input-wrapper">
        <input
          id="location"
          :value="searchQuery"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
          class="location-input"
          placeholder="Search for a location..."
          autocomplete="off"
          type="text"
        />
        <button
          v-if="searchQuery"
          @click="clearLocation"
          class="clear-btn"
          title="Clear location"
        >
          <Icon name="mdi:close" size="18" />
        </button>
      </div>

      <!-- Loading State -->
      <transition name="fade">
        <div v-if="isLoading && showResults" class="loading-state">
          <div class="spinner"></div>
          <span>Searching locations...</span>
        </div>
      </transition>

      <!-- Results Dropdown -->
      <transition name="slide-down">
        <div v-if="showResults && !isLoading" class="results-dropdown">
          <!-- Results Found -->
          <div v-if="results.length > 0">
            <div
              v-for="(result, index) in results"
              :key="result.id"
              class="result-item"
              :class="{ highlighted: index === highlightedIndex }"
              @click="selectLocation(result)"
              @mouseenter="highlightedIndex = index"
            >
              <div class="result-icon">
                <Icon name="mdi:map-marker-outline" size="18" />
              </div>
              <div class="result-content">
                <div class="result-name">{{ result.name }}</div>
              </div>
            </div>
          </div>

          <!-- No Results -->
          <div v-else-if="noResults" class="no-results">
            <Icon name="mdi:map-search" size="32" />
            <p>No locations found for "{{ searchQuery }}"</p>
            <span class="hint">Try a different search term</span>
          </div>

          <!-- Minimum Characters Required -->
          <div
            v-else-if="searchQuery.length > 0 && searchQuery.length < 3"
            class="min-chars"
          >
            <Icon name="mdi:information-outline" size="18" />
            <span>Type at least 3 characters to search</span>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
.location-section {
  margin-bottom: var(--spacing-xl);
  padding: 1.75rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-light);
  }

  .location-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);

    .location-label {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 1.1rem;
    }
  }

  .autocomplete-wrapper {
    position: relative;

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;

      .location-input {
        width: 100%;
        padding: var(--spacing-md);
        padding-right: 40px;
        border: 2px solid var(--border);
        border-radius: var(--radius-lg);
        background: var(--bg-secondary);
        color: var(--text-primary);
        font-size: 1rem;
        transition: all 0.2s ease;
        font-family: inherit;

        &:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-bg);
        }

        &::placeholder {
          color: var(--text-secondary);
        }
      }

      .clear-btn {
        position: absolute;
        right: 12px;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        border-radius: var(--radius-md);
        transition: all 0.2s ease;
        width: 32px;
        height: 32px;

        &:hover {
          color: var(--text-primary);
          background: var(--bg-secondary);
        }

        &:active {
          transform: scale(0.95);
        }
      }
    }

    /* Loading State */
    .loading-state {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
      color: var(--text-secondary);
      font-size: 0.95rem;

      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid var(--primary-bg);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
    }

    /* Results Dropdown */
    .results-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      right: 0;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      max-height: 320px;
      overflow-y: auto;
      overflow-x: hidden;

      .result-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md) var(--spacing-lg);
        cursor: pointer;
        transition: all 0.15s ease;
        color: var(--text-primary);
        border-bottom: 1px solid var(--border-light);

        &:last-child {
          border-bottom: none;
        }

        &:hover,
        &.highlighted {
          background: var(--primary-bg);
          color: var(--primary);

          .result-icon {
            background: var(--primary);
            color: white;
          }
        }

        .result-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          flex-shrink: 0;
        }

        .result-content {
          flex: 1;
          min-width: 0;

          .result-name {
            font-weight: 500;
            white-space: normal;
            word-break: break-word;
            font-size: 0.95rem;
          }
        }
      }

      /* Empty States */
      .no-results,
      .min-chars {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-md);
        padding: var(--spacing-xl) var(--spacing-lg);
        color: var(--text-secondary);
        text-align: center;
        min-height: 120px;
      }

      .no-results {
        p {
          margin: 0;
          font-weight: 500;
          color: var(--text-primary);
          font-size: 0.95rem;
        }

        span {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
      }

      .min-chars {
        min-height: auto;
        padding: var(--spacing-lg);

        span {
          font-size: 0.9rem;
        }
      }

      /* Scrollbar Styling */
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--border);
        border-radius: 3px;

        &:hover {
          background: var(--text-secondary);
        }
      }
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
