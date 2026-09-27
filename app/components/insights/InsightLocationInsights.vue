<template>
  <div class="flex flex-col gap-8">
    <InsightSection title="Places" icon="solar:map-point-bold" color="var(--pink)">
      <div v-for="loc in locationInsights" :key="loc.metricId" class="card p-3">
        <p class="eyebrow px-2 pt-1 pb-2">{{ loc.metricLabel }}</p>
        <ul class="flex flex-col">
          <li v-for="place in loc.places" :key="place.name" class="flex items-center gap-3 rounded-2xl px-2 py-2.5 odd:bg-surface-2">
            <Icon name="solar:map-point-bold" size="16" class="shrink-0" :style="{ color: loc.color }" />
            <span class="min-w-0 flex-1 truncate font-medium">{{ place.name }}</span>
            <span class="text-[13px] tabular-nums text-muted">{{ place.count }}×</span>
            <span v-if="primaryMetric && place.avgMood !== null" class="w-16 text-right font-display font-bold tabular-nums">
              {{ fmtNum(place.avgMood, primaryMetric) }}
            </span>
          </li>
        </ul>
      </div>
    </InsightSection>

    <InsightSection v-if="weatherInsights.length > 0" title="Weather" icon="solar:cloud-sun-bold">
      <div v-if="weatherMoodCorrelation.hasData && weatherMoodCorrelation.summary" class="flex items-start gap-3 rounded-card bg-mood-soft p-4">
        <Icon name="solar:lightbulb-bold" size="20" class="mt-0.5 shrink-0 text-mood-strong" />
        <p class="font-medium">{{ weatherMoodCorrelation.summary }}</p>
      </div>

      <div v-if="weatherMoodCorrelation.bestWeather || weatherMoodCorrelation.worstWeather" class="grid grid-cols-2 gap-3">
        <div v-if="weatherMoodCorrelation.bestWeather" class="card p-4">
          <p class="eyebrow text-success">Best for {{ primaryMetric?.label || 'mood' }}</p>
          <p class="mt-1 font-display text-lg font-bold">{{ weatherMoodCorrelation.bestWeather.condition }}</p>
          <p v-if="primaryMetric" class="text-sm tabular-nums text-muted">avg {{ fmtNum(weatherMoodCorrelation.bestWeather.avgMood, primaryMetric) }}</p>
        </div>
        <div v-if="weatherMoodCorrelation.worstWeather" class="card p-4">
          <p class="eyebrow text-danger">Lowest {{ primaryMetric?.label || 'mood' }}</p>
          <p class="mt-1 font-display text-lg font-bold">{{ weatherMoodCorrelation.worstWeather.condition }}</p>
          <p v-if="primaryMetric" class="text-sm tabular-nums text-muted">avg {{ fmtNum(weatherMoodCorrelation.worstWeather.avgMood, primaryMetric) }}</p>
        </div>
      </div>

      <div class="card p-3">
        <p class="eyebrow px-2 pt-1 pb-2">{{ primaryMetric?.label || 'Mood' }} by condition</p>
        <ul class="flex flex-col">
          <li v-for="w in weatherInsights" :key="w.condition" class="flex items-center gap-3 rounded-2xl px-2 py-2.5 odd:bg-surface-2">
            <Icon :name="getWeatherIcon(w.icon)" size="18" class="shrink-0 text-muted" />
            <span class="min-w-0 flex-1 truncate font-medium">{{ w.condition }}</span>
            <span class="text-[13px] tabular-nums text-muted">{{ w.count }}×</span>
            <span v-if="w.avgTemp !== null" class="w-12 text-right text-[13px] tabular-nums text-muted">{{ w.avgTemp }}°C</span>
            <span v-if="primaryMetric && w.avgMood !== null" class="w-16 text-right font-display font-bold tabular-nums">
              {{ fmtNum(w.avgMood, primaryMetric) }}
            </span>
          </li>
        </ul>
      </div>
    </InsightSection>
  </div>
</template>
<script setup lang="ts">
const { locationInsights, primaryMetric, weatherInsights, weatherMoodCorrelation } = useInsightsData();

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
</script>
