<template>
  <div class="metric-location">
    <div class="location-header">
      <Icon v-if="config.icon" :name="config.icon" size="20" class="metric-icon" :style="iconStyle" />
      <span class="metric-label">{{ config.label }}</span>
      <span v-if="config.enableWeather" class="weather-badge" title="Weather tracking enabled">
        <Icon name="solar:cloud-sun-bold" size="14" />
      </span>
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

      <!-- Selected location with weather -->
      <div v-if="currentLocation && typeof currentLocation === 'object'" class="selected-location">
        <div class="selected-location-main">
          <Icon name="solar:map-point-bold" size="16" class="selected-icon" />
          <span>{{ (currentLocation as LocationValue).name }}</span>
        </div>

        <!-- Weather display -->
        <div v-if="isLoadingWeather" class="weather-loading">
          <Icon name="svg-spinners:ring-resize" size="14" />
          <span>Fetching weather...</span>
        </div>
        <div v-else-if="(currentLocation as LocationValue).weather" class="weather-info">
          <Icon :name="getWeatherIcon((currentLocation as LocationValue).weather!.icon)" size="16" class="weather-icon" />
          <span class="weather-temp">{{ formatTemperature((currentLocation as LocationValue).weather!.temperature) }}</span>
          <span class="weather-condition">{{ (currentLocation as LocationValue).weather!.condition }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LocationMetricConfig, MetricValue, LocationValue, WeatherData } from '~/types';
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
  /** Current entry date in YYYY-MM-DD format */
  date?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: LocationValue | null];
}>();

const searchQuery = ref('');
const results = ref<GeoapifyResult[]>([]);
const showDropdown = ref(false);
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const isLoadingWeather = ref(false);

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

async function selectLocation(result: GeoapifyResult) {
  const locationValue: LocationValue = {
    name: result.formatted,
    latitude: result.lat,
    longitude: result.lon,
  };

  // Emit immediately without weather
  emit('update:modelValue', locationValue);
  searchQuery.value = result.formatted;
  showDropdown.value = false;
  results.value = [];

  // Fetch weather if enabled
  if (props.config.enableWeather) {
    isLoadingWeather.value = true;
    try {
      const weather = await moodlyBackendService.getWeather(
        result.lat,
        result.lon,
        props.date
      );
      // Emit updated value with weather
      emit('update:modelValue', {
        ...locationValue,
        weather,
      });
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      // Keep the location without weather on error
    } finally {
      isLoadingWeather.value = false;
    }
  }
}

function clearLocation() {
  emit('update:modelValue', null);
  searchQuery.value = '';
  results.value = [];
}

function getWeatherIcon(icon: string): string {
  const iconMap: Record<string, string> = {
    'sunny': 'solar:sun-bold',
    'partly-cloudy': 'solar:cloud-sun-bold',
    'cloudy': 'solar:cloud-bold',
    'foggy': 'solar:fog-bold',
    'drizzle': 'solar:cloud-rain-bold',
    'rainy': 'solar:cloud-storm-bold',
    'snowy': 'solar:snowflake-bold',
    'stormy': 'solar:cloud-bolt-bold',
  };
  return iconMap[icon] ?? 'solar:cloud-bold';
}

function formatTemperature(temp: number | null): string {
  if (temp === null) return '—';
  return `${Math.round(temp)}°C`;
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

    .weather-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.125rem 0.375rem;
      background: var(--primary-rgba-12);
      border-radius: var(--radius-sm);
      color: var(--primary);
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
      flex-direction: column;
      gap: 0.375rem;
      margin-top: 0.5rem;
      font-size: 0.8125rem;

      .selected-location-main {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        color: var(--success);
        font-weight: 500;

        .selected-icon {
          flex-shrink: 0;
        }
      }

      .weather-loading {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        color: var(--text-tertiary);
        font-size: 0.75rem;
        padding-left: 1.375rem;
      }

      .weather-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.375rem 0.5rem;
        background: var(--hover-bg);
        border-radius: var(--radius-sm);
        margin-left: 1.375rem;
        width: fit-content;

        .weather-icon {
          color: var(--primary);
        }

        .weather-temp {
          font-weight: 600;
          color: var(--text-primary);
        }

        .weather-condition {
          color: var(--text-secondary);
        }
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
