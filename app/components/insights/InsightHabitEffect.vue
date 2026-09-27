<template>
  <InsightSection title="Habit ripple effects" icon="solar:bolt-circle-bold" subtitle="How a habit shows up over the next few days">
    <div class="flex flex-col gap-3">
      <div v-for="effect in habitEffects" :key="`${effect.habitId}-${effect.metricId}`" class="card flex flex-col gap-3 p-4">
        <div class="flex items-center gap-3">
          <span class="grid size-10 shrink-0 place-items-center rounded-xl" :style="{ background: hexToRgba(effect.habitColor, 0.16), color: effect.habitColor }">
            <Icon :name="effect.habitIcon || 'solar:check-circle-bold'" size="18" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate font-semibold">{{ effect.habitLabel }}</p>
            <p class="truncate text-[13px] text-muted">then {{ effect.metricLabel }}</p>
          </div>
          <span
            class="shrink-0 rounded-full px-3 py-1 text-sm font-bold tabular-nums"
            :class="effect.strongestEffect > 0 ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'"
          >
            {{ effect.strongestEffect > 0 ? '+' : '−' }}{{ fmtNum(Math.abs(effect.strongestEffect), null) }}
          </span>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div
            v-for="day in [1, 2, 3]"
            :key="day"
            class="rounded-2xl bg-surface-2 p-2.5 text-center"
            :class="{ 'ring-2 ring-mood': day === effect.strongestDay }"
          >
            <p class="eyebrow">Day {{ day }}</p>
            <p class="font-display text-lg font-bold tabular-nums">{{ getDayValue(effect, day) }}</p>
            <p class="flex items-center justify-center gap-0.5 text-xs font-semibold tabular-nums" :class="toneClass(getDayDelta(effect, day))">
              <Icon :name="toneIcon(getDayDelta(effect, day))" size="12" />
              {{ fmtNum(Math.abs(getDayDelta(effect, day)), null) }}
            </p>
          </div>
        </div>

        <p class="text-sm text-muted">{{ getEffectSummary(effect) }}</p>
      </div>
    </div>
  </InsightSection>
</template>
<script setup lang="ts">
import type { HabitEffectItem } from '~/composables/useInsightsData';

const { habitEffects } = useInsightsData();

const getDayValue = (effect: HabitEffectItem, day: number): string => {
  if (day === 1) return effect.day1Avg > 0 ? fmtNum(effect.day1Avg, null) : '—';
  if (day === 2) return effect.day2Avg > 0 ? fmtNum(effect.day2Avg, null) : '—';
  return effect.day3Avg > 0 ? fmtNum(effect.day3Avg, null) : '—';
};

const getDayDelta = (effect: HabitEffectItem, day: number): number => {
  if (day === 1) return effect.day1Delta;
  if (day === 2) return effect.day2Delta;
  return effect.day3Delta;
};

const getEffectSummary = (effect: HabitEffectItem): string => {
  const direction = effect.strongestEffect > 0 ? 'higher' : 'lower';
  const magnitude = Math.abs(effect.strongestEffect);
  return `${effect.metricLabel} is ${magnitude > 1.5 ? 'significantly' : 'moderately'} ${direction} on day ${effect.strongestDay} after this habit.`;
};
</script>
