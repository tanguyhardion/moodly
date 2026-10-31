<template>
  <button
    v-if="lookBack"
    class="mx-auto flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-[13px] text-muted transition hover:bg-surface/70"
    type="button"
    :title="`Open ${lookBack.date}`"
    @click="$emit('select', lookBack.date)"
  >
    <Icon name="solar:history-bold" size="16" class="shrink-0" />
    <span class="shrink-0 font-semibold">{{ lookBack.label }}</span>
    <span v-if="lookBack.moodColor" class="size-2.5 shrink-0 rounded-full" :style="{ background: lookBack.moodColor }" />
    <span v-if="lookBack.summary" class="truncate">{{ lookBack.summary }}</span>
  </button>
</template>

<script setup lang="ts">
import { getCurrentDateString, parseLocalDateString } from '~/utils/helpers';
import { MOOD_COLORS, findMoodMetric, moodLevel } from '~/utils/moodColors';

const props = defineProps<{
  /** YYYY-MM-DD of the day being viewed */
  date: string;
}>();

defineEmits<{
  select: [date: string];
}>();

const { getEntryByDate, metricConfigs } = useMoodly();

/** Same day shifted back, or null when it doesn't exist (e.g. Feb 29 a year ago, Mar 31 a month ago). */
function sameDayBack(date: string, { years = 0, months = 0 }): string | null {
  const d = parseLocalDateString(date);
  const day = d.getDate();
  d.setFullYear(d.getFullYear() - years, d.getMonth() - months);
  return d.getDate() === day ? getCurrentDateString(d) : null;
}

/** A year ago if logged, else a month ago. */
const lookBack = computed(() => {
  const candidates = [
    { label: 'A year ago', date: sameDayBack(props.date, { years: 1 }) },
    { label: 'A month ago', date: sameDayBack(props.date, { months: 1 }) },
  ];

  for (const { label, date } of candidates) {
    const entry = date ? getEntryByDate(date) : undefined;
    if (!date || !entry) continue;

    const mood = findMoodMetric(metricConfigs.value);
    const moodValue = mood ? entry.data[mood.id] : null;
    // Where you were, what you ticked, then a note if there is one; the line truncates what doesn't fit
    const parts: string[] = [];
    for (const m of metricConfigs.value) {
      const v = entry.data[m.id];
      if (m.type === 'location' && v && typeof v === 'object') parts.unshift(v.name.split(',')[0]!);
      if (m.type === 'checkbox' && v === true) parts.push(m.label);
    }
    const note = metricConfigs.value
      .filter(m => m.type === 'text')
      .map(m => entry.data[m.id])
      .find((v): v is string => typeof v === 'string' && v.trim() !== '');
    if (note) parts.push(`“${note.trim()}”`);

    return {
      label,
      date,
      moodColor: mood && typeof moodValue === 'number' ? MOOD_COLORS[moodLevel(moodValue, mood)].color : null,
      summary: parts.join(' · '),
    };
  }
  return null;
});
</script>
