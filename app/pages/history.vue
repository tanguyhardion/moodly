<template>
  <div class="page">
    <header class="mb-6">
      <h1 class="page-title">History</h1>
      <p class="page-subtitle">Every day you've logged, newest first.</p>
    </header>

    <LoadingState v-if="isLoading" message="Loading your history…" />

    <div v-else-if="entries.length === 0" class="empty-state">
      <Icon name="solar:clipboard-list-bold" size="44" class="text-faint" />
      <p class="text-lg font-bold text-ink">No entries yet</p>
      <p class="max-w-xs text-sm">Check in on the Today tab and your days will show up here.</p>
    </div>

    <div v-else class="flex flex-col gap-3">
      <article
        v-for="entry in displayedEntries"
        :key="entry.id"
        class="card relative overflow-hidden p-4 pl-5"
      >
        <span
          class="absolute inset-y-0 left-0 w-1.5"
          :style="{ background: entryMood(entry)?.color ?? 'var(--line)' }"
          aria-hidden="true"
        />

        <div class="flex items-center gap-3">
          <div class="min-w-0 flex-1">
            <h2 class="text-lg font-extrabold">{{ formatDate(entry.date) }}</h2>
          </div>
          <span
            v-if="entryMood(entry)"
            class="rounded-full px-3 py-1 font-display text-sm font-bold tabular-nums"
            :style="{ background: entryMood(entry)!.color, color: entryMood(entry)!.ink }"
          >
            {{ moodMetric?.label }} {{ entryMood(entry)!.value }}
          </span>
          <button
            v-if="pendingDeleteId !== entry.id"
            class="icon-btn size-9 hover:bg-danger/15 hover:text-danger"
            type="button"
            title="Delete entry"
            @click="pendingDeleteId = entry.id"
          >
            <Icon name="solar:trash-bin-trash-bold" size="16" />
          </button>
          <span v-else class="flex items-center gap-1">
            <button class="btn btn-ghost btn-sm" type="button" @click="pendingDeleteId = null">Keep</button>
            <button class="btn btn-danger btn-sm" type="button" @click="handleDelete(entry.id)">Delete</button>
          </span>
        </div>

        <div class="mt-3 flex flex-col gap-3">
          <template v-for="[groupName, groupMetrics] in groupedMetrics" :key="groupName">
            <div v-if="hasDataInGroup(entry, groupMetrics)" class="flex flex-col gap-1.5">
              <p v-if="groupName" class="eyebrow">{{ groupName }}</p>
              <div class="flex flex-wrap gap-1.5">
                <template v-for="config in groupMetrics" :key="config.id">
                  <span
                    v-if="config.id !== moodMetric?.id && isValidMetricValue(entry.data[config.id] ?? null, config)"
                    class="inline-flex max-w-full items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-sm"
                  >
                    <Icon v-if="config.icon" :name="config.icon" size="14" class="shrink-0" :style="{ color: config.color || 'var(--mood-strong)' }" />
                    <span class="text-muted">{{ config.label }}</span>
                    <template v-if="config.type === 'location'">
                      <span class="truncate font-semibold">{{ (entry.data[config.id] as LocationValue).name }}</span>
                      <template v-if="(entry.data[config.id] as LocationValue).weather">
                        <Icon :name="getWeatherIcon((entry.data[config.id] as LocationValue).weather!.icon)" size="14" class="shrink-0 text-muted" />
                        <span class="font-semibold tabular-nums">{{ formatTemperature((entry.data[config.id] as LocationValue).weather!.temperature) }}</span>
                      </template>
                    </template>
                    <span v-else-if="config.type !== 'checkbox'" class="truncate font-semibold tabular-nums">
                      {{ formatMetricValue(entry.data[config.id] ?? null, config) }}
                    </span>
                  </span>
                </template>
              </div>
            </div>
          </template>
        </div>
      </article>

      <div v-if="displayedCount < sortedEntries.length" ref="loadMoreSentinel" class="grid place-items-center py-6 text-muted">
        <Icon name="svg-spinners:ring-resize" size="24" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { MetricConfig, MetricValue, LocationValue, DailyEntry } from '~/types';
import { MOOD_COLORS, moodLevel } from '~/utils/moodColors';

const { entries, isLoading, deleteEntry, groupedMetrics } = useMoodly();
const { moodMetric } = useMoodTheme();

const pendingDeleteId = ref<string | null>(null);

/** The entry's mood value with its mood color, or null when it has none. */
function entryMood(entry: DailyEntry) {
  const metric = moodMetric.value;
  const value = metric ? entry.data[metric.id] : null;
  if (!metric || typeof value !== 'number') return null;
  return { value, ...MOOD_COLORS[moodLevel(value, metric)] };
}

const sortedEntries = computed(() =>
  [...entries.value].sort((a, b) => b.date.localeCompare(a.date))
);

const displayedCount = ref(10);
const displayedEntries = computed(() => sortedEntries.value.slice(0, displayedCount.value));

function isValidMetricValue(value: any, config: MetricConfig): boolean {
  if (value == null) return false;
  if (config.type === 'checkbox') return value === true;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (config.type === 'location' && typeof value === 'object') {
    return 'name' in value && (value as LocationValue).name.trim() !== '';
  }
  return true;
}

function hasDataInGroup(entry: DailyEntry, groupMetrics: MetricConfig[]): boolean {
  return groupMetrics.some(config => isValidMetricValue(entry.data[config.id] ?? null, config));
}

const loadMoreSentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  observer = new IntersectionObserver((intersectEntries) => {
    if (intersectEntries[0]?.isIntersecting) {
      if (displayedCount.value < sortedEntries.value.length) {
        displayedCount.value += 10;
      }
    }
  }, { rootMargin: '200px' });

  watch(loadMoreSentinel, (el) => {
    if (el) {
      observer?.observe(el);
    } else {
      observer?.disconnect();
    }
  }, { immediate: true });
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

function formatMetricValue(value: MetricValue, config: MetricConfig): string {
  if (value == null) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object' && 'name' in value) return (value as LocationValue).name;
  if (config.type === 'slider') return `${value} / ${(config as any).max}`;
  if (config.type === 'number' && (config as any).unit) return `${value} ${(config as any).unit}`;
  return String(value);
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

async function handleDelete(id: string) {
  pendingDeleteId.value = null;
  await deleteEntry(id);
}
</script>
