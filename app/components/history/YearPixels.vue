<template>
  <div class="card flex flex-col gap-4 p-4">
    <div class="flex items-center justify-between">
      <button class="icon-btn size-9" type="button" title="Previous year" :disabled="year <= minYear" @click="year--">
        <Icon name="solar:alt-arrow-left-bold" size="18" />
      </button>
      <div class="text-center">
        <p class="font-display text-2xl font-extrabold tabular-nums">{{ year }}</p>
        <p class="text-[13px] text-muted">{{ loggedCount }} {{ loggedCount === 1 ? 'day' : 'days' }} logged</p>
      </div>
      <button class="icon-btn size-9" type="button" title="Next year" :disabled="year >= maxYear" @click="year++">
        <Icon name="solar:alt-arrow-right-bold" size="18" />
      </button>
    </div>

    <!-- One row per month, one cell per day -->
    <div class="pixels" role="grid" :aria-label="`Mood for every day of ${year}`">
      <span />
      <span v-for="day in 31" :key="`h${day}`" class="day-label">{{ day % 5 === 0 || day === 1 ? day : '' }}</span>
      <template v-for="(month, m) in months" :key="m">
        <span class="month-label">{{ month.label }}</span>
        <button
          v-for="cell in month.days"
          :key="cell.date ?? `${m}-${cell.day}`"
          type="button"
          class="pixel"
          :class="{ 'is-today': cell.isToday, 'is-empty': !cell.date }"
          :style="cell.color ? { background: cell.color } : undefined"
          :disabled="!cell.date || cell.isFuture"
          :title="cell.title"
          :aria-label="cell.title"
          @click="cell.date && openDay(cell.date)"
        />
      </template>
    </div>

    <div v-if="moodMetric" class="flex items-center justify-center gap-1.5 text-[12px] text-muted">
      <span>Low</span>
      <span v-for="level in [1, 2, 3, 4, 5] as const" :key="level" class="size-3 rounded-[3px]" :style="{ background: MOOD_COLORS[level].color }" />
      <span>High</span>
      <span class="ml-2 size-3 rounded-[3px] bg-faint/40" />
      <span>No {{ moodMetric.label.toLowerCase() }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MOOD_COLORS, moodLevel } from '~/utils/moodColors';
import { getCurrentDateString } from '~/utils/helpers';

const { entries } = useMoodly();
const { moodMetric } = useMoodTheme();

const today = getCurrentDateString();
const maxYear = new Date().getFullYear();
const minYear = computed(() =>
  entries.value.reduce((min, e) => Math.min(min, Number(e.date.slice(0, 4))), maxYear),
);
const year = ref(maxYear);

const entriesByDate = computed(() => new Map(entries.value.map(e => [e.date, e])));
const loggedCount = computed(() => entries.value.filter(e => e.date.startsWith(`${year.value}-`)).length);

const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

const months = computed(() =>
  MONTH_LABELS.map((label, m) => {
    const daysInMonth = new Date(year.value, m + 1, 0).getDate();
    const days = Array.from({ length: 31 }, (_, i) => {
      const day = i + 1;
      // Days a month doesn't have stay as blank cells so the columns line up
      if (day > daysInMonth) return { day, date: null, color: null, isToday: false, isFuture: false, title: '' };

      const date = `${year.value}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const entry = entriesByDate.value.get(date);
      const metric = moodMetric.value;
      const value = metric && entry ? entry.data[metric.id] : null;
      const hasMood = metric && typeof value === 'number';
      const color = hasMood ? MOOD_COLORS[moodLevel(value, metric)].color : entry ? 'color-mix(in oklab, var(--faint) 40%, transparent)' : null;
      const label = new Date(year.value, m, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      return {
        day,
        date,
        color,
        isToday: date === today,
        isFuture: date > today,
        title: hasMood ? `${label}: ${metric.label} ${value}` : entry ? `${label}: logged` : label,
      };
    });
    return { label, days };
  }),
);

function openDay(date: string) {
  navigateTo({ path: '/', query: { date } });
}
</script>

<style scoped>
.pixels {
  display: grid;
  grid-template-columns: 0.9rem repeat(31, minmax(0, 1fr));
  gap: 2px;
}

.day-label,
.month-label {
  font-size: 9px;
  line-height: 1;
  color: var(--color-muted);
  text-align: center;
  align-self: center;
}

.pixel {
  aspect-ratio: 1;
  border-radius: 2px;
  background: var(--color-surface-2);
  transition: transform 0.1s;
}

.pixel:not(:disabled):hover {
  transform: scale(1.4);
}

.pixel.is-empty {
  background: transparent;
}

.pixel.is-today {
  outline: 1.5px solid var(--color-ink);
  outline-offset: 0;
}

.pixel:disabled:not(.is-empty) {
  opacity: 0.45;
}
</style>
