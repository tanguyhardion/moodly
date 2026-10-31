<template>
  <!-- isolate keeps Leaflet's z-indexes (400+) under the sticky header and nav -->
  <div class="card isolate overflow-hidden p-0">
    <div ref="mapEl" class="h-64 w-full" role="img" :aria-label="`Map of your places, colored by average ${moodMetric?.label ?? 'mood'}`" />
  </div>
</template>

<script setup lang="ts">
import 'leaflet/dist/leaflet.css';
import type { Map as LeafletMap, LayerGroup } from 'leaflet';
import type { LocationValue } from '~/types';
import { MOOD_COLORS, moodLevel } from '~/utils/moodColors';

const { filteredEntries } = useInsightsData();
const { metricConfigs } = useMoodly();
const { moodMetric } = useMoodTheme();

const mapEl = ref<HTMLElement | null>(null);
let map: LeafletMap | null = null;
let markers: LayerGroup | null = null;
let L: typeof import('leaflet') | null = null;

interface Place {
  name: string;
  lat: number;
  lon: number;
  count: number;
  values: number[];
}

/** Entries in the selected period grouped by place (by coordinates, ~100 m), with the mood values there. */
const places = computed(() => {
  const metric = moodMetric.value;
  const byKey = new Map<string, Place>();
  for (const entry of filteredEntries.value) {
    for (const m of metricConfigs.value) {
      const v = entry.data[m.id];
      if (m.type !== 'location' || !v || typeof v !== 'object') continue;
      const loc = v as LocationValue;
      if (!Number.isFinite(loc.latitude) || !Number.isFinite(loc.longitude)) continue;

      const key = `${loc.latitude.toFixed(3)},${loc.longitude.toFixed(3)}`;
      const place = byKey.get(key) ?? { name: loc.name.split(',')[0]!, lat: loc.latitude, lon: loc.longitude, count: 0, values: [] };
      place.count++;
      const value = metric ? entry.data[metric.id] : null;
      if (typeof value === 'number') place.values.push(value);
      byKey.set(key, place);
    }
  }
  return [...byKey.values()];
});

function escape(text: string) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function render() {
  if (!L || !map || !markers) return;
  markers.clearLayers();
  const metric = moodMetric.value;

  for (const place of places.value) {
    const avg = place.values.length ? place.values.reduce((a, b) => a + b, 0) / place.values.length : null;
    const color = metric && avg !== null ? MOOD_COLORS[moodLevel(avg, metric)].color : '#a39cad';
    // Area grows with visits, so a radius by square root
    const radius = 6 + Math.min(Math.sqrt(place.count) * 3, 18);
    L.circleMarker([place.lat, place.lon], { radius, color: '#fff', weight: 2, fillColor: color, fillOpacity: 0.9 })
      .bindPopup(
        `<strong>${escape(place.name)}</strong><br>${place.count} ${place.count === 1 ? 'day' : 'days'}` +
          (metric && avg !== null ? ` · ${escape(metric.label)} ${avg.toFixed(1)}` : ''),
      )
      .addTo(markers);
  }

  if (places.value.length) {
    map.fitBounds(L.latLngBounds(places.value.map(p => [p.lat, p.lon] as [number, number])), { padding: [32, 32], maxZoom: 12 });
  }
}

onMounted(async () => {
  // Loaded on demand so Leaflet isn't in the main bundle
  L = await import('leaflet');
  if (!mapEl.value) return;
  map = L.map(mapEl.value, { scrollWheelZoom: false, attributionControl: true });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  markers = L.layerGroup().addTo(map);
  render();
});

watch(places, render);

onBeforeUnmount(() => {
  map?.remove();
  map = null;
});
</script>
