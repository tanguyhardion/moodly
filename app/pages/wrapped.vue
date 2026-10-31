<template>
  <div class="page">
    <LoadingState v-if="isLoading || isConfigLoading" message="Wrapping up your year…" />

    <div v-else-if="stats.daysLogged === 0" class="empty-state">
      <Icon name="solar:gift-bold" size="44" class="text-faint" />
      <p class="text-lg font-bold text-ink">Nothing to wrap for {{ year }}</p>
      <p class="max-w-xs text-sm">Check in during {{ year }} and your recap will show up here.</p>
    </div>

    <div v-else class="flex flex-col gap-4">
      <!-- Hero -->
      <section class="wrapped-hero card flex flex-col items-center gap-2 py-10 text-center">
        <div class="flex items-center gap-3">
          <button v-if="hasYear(year - 1)" class="icon-btn size-8 bg-white/30" type="button" title="Previous year" @click="setYear(year - 1)">
            <Icon name="solar:alt-arrow-left-bold" size="16" />
          </button>
          <p class="eyebrow !text-current opacity-80">Moodly Wrapped</p>
          <button v-if="hasYear(year + 1)" class="icon-btn size-8 bg-white/30" type="button" title="Next year" @click="setYear(year + 1)">
            <Icon name="solar:alt-arrow-right-bold" size="16" />
          </button>
        </div>
        <h1 class="font-display text-7xl font-extrabold tabular-nums">{{ year }}</h1>
        <p class="max-w-xs text-[15px] opacity-85">
          {{ isFinished ? 'Your year in check-ins.' : 'Your year so far.' }}
        </p>
      </section>

      <!-- Days logged + streak -->
      <section class="grid grid-cols-2 gap-4">
        <div class="card">
          <p class="eyebrow">Days logged</p>
          <p class="mt-1 font-display text-5xl font-extrabold tabular-nums">{{ stats.daysLogged }}</p>
          <p class="text-[13px] text-muted">{{ Math.round((stats.daysLogged / stats.daysInYear) * 100) }}% of {{ isFinished ? 'the year' : 'the year so far' }}</p>
        </div>
        <div class="card">
          <p class="eyebrow">Longest streak</p>
          <p class="mt-1 font-display text-5xl font-extrabold tabular-nums">{{ stats.longestStreak }}</p>
          <p class="text-[13px] text-muted">days in a row</p>
        </div>
      </section>

      <!-- Mood overview -->
      <section v-if="moodMetric && stats.avgMood !== null" class="card flex flex-col gap-4">
        <div>
          <p class="eyebrow">Average {{ moodMetric.label.toLowerCase() }}</p>
          <p class="mt-1 font-display text-5xl font-extrabold tabular-nums" :style="{ color: levelColor(stats.avgMood) }">
            {{ stats.avgMood.toFixed(1) }}<span class="text-xl text-muted">/{{ moodMetric.max }}</span>
          </p>
        </div>
        <div>
          <div class="flex h-4 overflow-hidden rounded-full" aria-hidden="true">
            <span
              v-for="level in LEVELS"
              :key="level"
              :style="{ width: `${stats.moodShare[level] * 100}%`, background: MOOD_COLORS[level].color }"
            />
          </div>
          <p class="mt-2 text-[13px] text-muted">
            {{ Math.round((stats.moodShare[4] + stats.moodShare[5]) * 100) }}% good days,
            {{ Math.round((stats.moodShare[1] + stats.moodShare[2]) * 100) }}% tough ones
          </p>
        </div>
      </section>

      <!-- Month by month -->
      <section v-if="moodMetric && stats.avgMood !== null" class="card">
        <p class="eyebrow mb-4">Month by month</p>
        <div class="flex h-32 items-end gap-1.5">
          <div v-for="(value, i) in stats.monthlyMood" :key="i" class="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span
              class="w-full rounded-md"
              :style="value === null
                ? { height: '4px', background: 'var(--line)' }
                : { height: `${barHeight(value)}%`, background: levelColor(value) }"
              :title="value === null ? undefined : `${MONTH_SHORT[i]}: ${value.toFixed(1)}`"
            />
            <span class="text-[10px] text-muted">{{ MONTH_SHORT[i]![0] }}</span>
          </div>
        </div>
      </section>

      <!-- Highlights -->
      <section v-if="stats.bestMonth || stats.bestWeekday || stats.longestGoodStreak > 1" class="card flex flex-col gap-4">
        <div v-if="stats.bestMonth" class="flex items-center gap-3 leading-snug">
          <Icon name="solar:star-bold" size="22" class="text-mood-strong" />
          <p><span class="text-muted">Best month</span><br /><strong>{{ stats.bestMonth }}</strong></p>
        </div>
        <div v-if="stats.bestWeekday" class="flex items-center gap-3 leading-snug">
          <Icon name="solar:calendar-bold" size="22" class="text-mood-strong" />
          <p><span class="text-muted">Best day of the week</span><br /><strong>{{ stats.bestWeekday }}</strong></p>
        </div>
        <div v-if="stats.longestGoodStreak > 1" class="flex items-center gap-3 leading-snug">
          <Icon name="solar:fire-bold" size="22" class="text-mood-strong" />
          <p><span class="text-muted">Longest good stretch</span><br /><strong>{{ stats.longestGoodStreak }} days</strong> of {{ moodMetric?.label.toLowerCase() }} 4+</p>
        </div>
      </section>

      <!-- Places -->
      <section v-if="stats.topPlaces.length" class="card">
        <p class="eyebrow mb-3">Where you were</p>
        <ol class="flex flex-col gap-2">
          <li v-for="(place, i) in stats.topPlaces" :key="place.name" class="flex items-center gap-3">
            <span class="grid size-7 shrink-0 place-items-center rounded-full bg-mood-soft font-display text-sm font-extrabold text-mood-strong">{{ i + 1 }}</span>
            <span class="min-w-0 flex-1 truncate font-semibold">{{ place.name }}</span>
            <span class="text-[13px] tabular-nums text-muted">{{ place.count }} days</span>
          </li>
        </ol>
      </section>

      <!-- Habits -->
      <section v-if="stats.topHabits.length" class="card">
        <p class="eyebrow mb-3">What you did most</p>
        <ol class="flex flex-col gap-2">
          <li v-for="(habit, i) in stats.topHabits" :key="habit.label" class="flex items-center gap-3">
            <span class="grid size-7 shrink-0 place-items-center rounded-full bg-mood-soft font-display text-sm font-extrabold text-mood-strong">{{ i + 1 }}</span>
            <span class="min-w-0 flex-1 truncate font-semibold">{{ habit.label }}</span>
            <span class="text-[13px] tabular-nums text-muted">{{ habit.count }}×</span>
          </li>
        </ol>
      </section>

      <!-- Best day -->
      <NuxtLink
        v-if="stats.bestDay"
        :to="{ path: '/', query: { date: stats.bestDay.date } }"
        class="card flex items-center gap-3 transition hover:brightness-[0.98]"
      >
        <span class="grid size-11 shrink-0 place-items-center rounded-full font-display text-lg font-extrabold" :style="{ background: levelColor(stats.bestDay.value), color: levelInk(stats.bestDay.value) }">
          {{ stats.bestDay.value }}
        </span>
        <p class="min-w-0 flex-1"><span class="text-muted">One of your best days</span><br /><strong>{{ formatDay(stats.bestDay.date) }}</strong></p>
        <Icon name="solar:alt-arrow-right-bold" size="18" class="text-muted" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MOOD_COLORS, moodLevel, type MoodLevel } from '~/utils/moodColors';
import { computeWrapped } from '~/utils/wrapped';
import { parseLocalDateString } from '~/utils/helpers';

const LEVELS: MoodLevel[] = [1, 2, 3, 4, 5];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const { entries, metricConfigs, isLoading, isConfigLoading } = useMoodly();
const { moodMetric } = useMoodTheme();
const route = useRoute();

// `?year=`, else last year during January (when the recap is still fresh), else this year
const year = computed(() => {
  const q = Number(route.query.year);
  if (Number.isInteger(q) && q > 2000) return q;
  const now = new Date();
  return now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
});
const isFinished = computed(() => year.value < new Date().getFullYear());

const stats = computed(() => computeWrapped(year.value, entries.value, metricConfigs.value, moodMetric.value));

const hasYear = (y: number) => entries.value.some(e => e.date.startsWith(`${y}-`));
const setYear = (y: number) => navigateTo({ query: { year: String(y) } }, { replace: true });

const levelColor = (value: number) => (moodMetric.value ? MOOD_COLORS[moodLevel(value, moodMetric.value)].color : 'var(--mood)');
const levelInk = (value: number) => (moodMetric.value ? MOOD_COLORS[moodLevel(value, moodMetric.value)].ink : 'var(--mood-ink)');

/** Bar height relative to the scale, never fully flat so low months still show. */
function barHeight(value: number) {
  const { min = 1, max = 5 } = moodMetric.value ?? {};
  return 12 + ((value - min) / Math.max(max - min, 1)) * 88;
}

const formatDay = (date: string) =>
  parseLocalDateString(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

useHead({ title: () => `Wrapped ${year.value} · Moodly` });
</script>

<style scoped>
.wrapped-hero {
  background: linear-gradient(135deg, #f2a93b, #f2677a 55%, #5b6cd6);
  color: #fff;
}

</style>
