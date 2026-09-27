<template>
  <div class="metric-location flex flex-col gap-2">
    <MetricHeader :config="config">
      <span v-if="config.enableWeather" class="text-faint" title="Weather is recorded with the place">
        <Icon name="solar:cloud-sun-bold" size="18" />
      </span>
    </MetricHeader>

    <div class="relative">
      <Icon name="solar:map-point-bold" size="18" class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-faint" />
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="config.placeholder ?? 'Search for a place…'"
        :aria-label="config.label"
        class="input pr-11 pl-10"
        @input="debouncedSearch"
        @focus="showDropdown = true"
      />
      <button
        v-if="currentLocation"
        class="icon-btn absolute top-1/2 right-1 size-9 -translate-y-1/2"
        type="button"
        title="Clear place"
        @click="clearLocation"
      >
        <Icon name="solar:close-circle-bold" size="18" />
      </button>

      <!-- Results dropdown -->
      <Transition name="dropdown">
        <div v-if="showDropdown && results.length > 0" class="absolute inset-x-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl bg-surface p-1.5 shadow-pop">
          <button
            v-for="result in results"
            :key="result.place_id"
            type="button"
            class="flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-mood-soft"
            @click="selectLocation(result)"
          >
            <Icon name="solar:map-point-bold" size="16" class="mt-0.5 shrink-0 text-muted" />
            <span>{{ result.formatted }}</span>
          </button>
        </div>
      </Transition>
    </div>

    <!-- Selected place with weather -->
    <div v-if="currentLocation && typeof currentLocation === 'object'" class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-2xl bg-mood-soft px-4 py-3 text-sm">
      <span class="flex min-w-0 items-center gap-1.5 font-semibold">
        <Icon name="solar:map-point-bold" size="16" class="shrink-0" />
        <span class="truncate">{{ (currentLocation as LocationValue).name }}</span>
      </span>
      <span v-if="isLoadingWeather" class="flex items-center gap-1.5 text-muted">
        <Icon name="svg-spinners:ring-resize" size="14" />
        Getting weather…
      </span>
      <span v-else-if="(currentLocation as LocationValue).weather" class="flex items-center gap-1.5 text-muted">
        <Icon :name="getWeatherIcon((currentLocation as LocationValue).weather!.icon)" size="16" />
        <span class="font-semibold text-ink tabular-nums">{{ formatTemperature((currentLocation as LocationValue).weather!.temperature) }}</span>
        {{ (currentLocation as LocationValue).weather!.condition }}
      </span>
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
