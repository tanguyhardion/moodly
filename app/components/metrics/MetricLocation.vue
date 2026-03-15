<template>
  <div class="metric-location">
    <div class="location-header">
      <Icon v-if="config.icon" :name="config.icon" size="20" class="metric-icon" :style="iconStyle" />
      <span class="metric-label">{{ config.label }}</span>
    </div>

    <div class="location-input-group">
      <div class="search-wrapper">
        <Icon name="solar:map-point-bold" size="18" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="config.placeholder ?? 'Search for a location...'"
          class="location-input"
          @input="debouncedSearch"
          @focus="showDropdown = true"
        />
        <button
          v-if="currentLocation"
          class="clear-btn"
          @click="clearLocation"
          type="button"
          title="Clear location"
        >
          <Icon name="solar:close-circle-bold" size="18" />
        </button>
      </div>

      <!-- Results dropdown -->
      <Transition name="dropdown">
        <div v-if="showDropdown && results.length > 0" class="location-dropdown">
          <button
            v-for="result in results"
            :key="result.place_id"
            class="location-option"
            @click="selectLocation(result)"
            type="button"
          >
            <Icon name="solar:map-point-bold" size="16" class="option-icon" />
            <span class="option-text">{{ result.formatted }}</span>
          </button>
        </div>
      </Transition>

      <!-- Selected location -->
      <div v-if="currentLocation && typeof currentLocation === 'object'" class="selected-location">
        <Icon name="solar:map-point-check-bold" size="16" class="selected-icon" />
        <span>{{ (currentLocation as LocationValue).name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LocationMetricConfig, MetricValue, LocationValue } from '~/types';
import { moodlyBackendService } from '~/utils/moodly-backend';

interface GeoapifyResult {
  place_id: string;
  formatted: string;
  lat: number;
  lon: number;
}

const props = defineProps<{
  config: LocationMetricConfig;
  modelValue: MetricValue;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: LocationValue | null];
}>();

const searchQuery = ref('');
const results = ref<GeoapifyResult[]>([]);
const showDropdown = ref(false);
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

const currentLocation = computed(() => props.modelValue);

const accentColor = computed(() => props.config.color ?? 'var(--primary)');
const iconStyle = computed(() => ({ color: accentColor.value }));

function debouncedSearch() {
  if (searchTimeout.value) clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(async () => {
    if (searchQuery.value.length < 2) {
      results.value = [];
      return;
    }
    try {
      const data = await moodlyBackendService.searchLocation(searchQuery.value) as { features?: Array<{ properties: { place_id: string; formatted: string }; geometry: { coordinates: number[] } }> };
      results.value = (data.features ?? []).map((f) => ({
        place_id: f.properties.place_id,
        formatted: f.properties.formatted,
        lat: f.geometry.coordinates[1] ?? 0,
        lon: f.geometry.coordinates[0] ?? 0,
      }));
      showDropdown.value = true;
    } catch {
      results.value = [];
    }
  }, 350);
}

function selectLocation(result: GeoapifyResult) {
  emit('update:modelValue', {
    name: result.formatted,
    latitude: result.lat,
    longitude: result.lon,
  });
  searchQuery.value = result.formatted;
  showDropdown.value = false;
  results.value = [];
}

function clearLocation() {
  emit('update:modelValue', null);
  searchQuery.value = '';
  results.value = [];
}

// Close dropdown on outside click
if (import.meta.client) {
  onMounted(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.metric-location')) {
        showDropdown.value = false;
      }
    };
    document.addEventListener('click', handler);
    onUnmounted(() => document.removeEventListener('click', handler));
  });
}
</script>

<style scoped lang="scss">
.metric-location {
  .location-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;

    .metric-label {
      font-weight: 600;
      font-size: 0.9375rem;
      color: var(--text-primary);
    }
  }

  .location-input-group {
    position: relative;

    .search-wrapper {
      position: relative;
      display: flex;
      align-items: center;

      .search-icon {
        position: absolute;
        left: 0.875rem;
        color: var(--text-tertiary);
        pointer-events: none;
      }

      .location-input {
        width: 100%;
        padding: 0.75rem 2.5rem 0.75rem 2.5rem;
        border: 2px solid var(--border);
        border-radius: var(--radius-md);
        background: var(--card-bg);
        color: var(--text-primary);
        font-size: 0.9375rem;
        font-family: inherit;
        transition: all 0.2s ease;

        &::placeholder {
          color: var(--text-tertiary);
        }

        &:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--focus-ring);
        }
      }

      .clear-btn {
        position: absolute;
        right: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border: none;
        background: transparent;
        color: var(--text-tertiary);
        cursor: pointer;
        border-radius: var(--radius-sm);

        &:hover {
          color: var(--error);
          background: var(--hover-bg);
        }
      }
    }

    .location-dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 50;
      max-height: 200px;
      overflow-y: auto;

      .location-option {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        width: 100%;
        padding: 0.625rem 0.875rem;
        border: none;
        background: transparent;
        color: var(--text-primary);
        font-size: 0.8125rem;
        text-align: left;
        cursor: pointer;
        transition: background 0.15s ease;
        font-family: inherit;

        &:hover {
          background: var(--hover-bg);
        }

        &:not(:last-child) {
          border-bottom: 1px solid var(--border);
        }

        .option-icon {
          flex-shrink: 0;
          margin-top: 2px;
          color: var(--primary);
        }

        .option-text {
          line-height: 1.4;
        }
      }
    }

    .selected-location {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      margin-top: 0.5rem;
      font-size: 0.8125rem;
      color: var(--success);
      font-weight: 500;

      .selected-icon {
        flex-shrink: 0;
      }
    }
  }
}

.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.2s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
