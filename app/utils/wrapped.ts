import type { DailyEntry, LocationValue, MetricConfig, SliderMetricConfig } from '~/types';
import { moodLevel, type MoodLevel } from '~/utils/moodColors';
import { parseLocalDateString } from '~/utils/helpers';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];

/** Minimum mood readings for a month or weekday to count as "best", so one great day doesn't win. */
const MIN_SAMPLES = 3;

export interface WrappedStats {
  year: number;
  daysLogged: number;
  /** Days of the year so far (all 365/366 for a past year) */
  daysInYear: number;
  longestStreak: number;
  avgMood: number | null;
  /** Share of mood readings at each level, 1 (low) to 5 (high) */
  moodShare: Record<MoodLevel, number>;
  /** Average mood per month, null when the month has no readings */
  monthlyMood: (number | null)[];
  bestMonth: string | null;
  bestWeekday: string | null;
  longestGoodStreak: number;
  bestDay: { date: string; value: number } | null;
  topPlaces: { name: string; count: number }[];
  topHabits: { label: string; count: number }[];
}

const avg = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);

/** Longest run of consecutive days. Dates must be sorted ascending and unique. */
function longestRun(dates: string[]): number {
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const date of dates) {
    const d = parseLocalDateString(date);
    run = prev && Math.round((d.getTime() - prev.getTime()) / 86_400_000) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

function bestKey(groups: Map<number, number[]>): number | null {
  let best: { key: number; avg: number } | null = null;
  for (const [key, values] of groups) {
    const a = avg(values);
    if (a !== null && values.length >= MIN_SAMPLES && (!best || a > best.avg)) best = { key, avg: a };
  }
  return best?.key ?? null;
}

export function computeWrapped(
  year: number,
  allEntries: DailyEntry[],
  metrics: MetricConfig[],
  mood: SliderMetricConfig | null,
): WrappedStats {
  const entries = allEntries
    .filter(e => e.date.startsWith(`${year}-`))
    .sort((a, b) => a.date.localeCompare(b.date));

  const now = new Date();
  const yearDays = new Date(year, 1, 29).getMonth() === 1 ? 366 : 365;
  const daysInYear = year < now.getFullYear()
    ? yearDays
    : Math.floor((now.getTime() - new Date(year, 0, 1).getTime()) / 86_400_000) + 1;

  // Mood readings
  const readings = mood
    ? entries.flatMap(e => {
        const v = e.data[mood.id];
        return typeof v === 'number' ? [{ date: e.date, value: v }] : [];
      })
    : [];

  const moodShare = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<MoodLevel, number>;
  const byMonth = new Map<number, number[]>();
  const byWeekday = new Map<number, number[]>();
  for (const r of readings) {
    moodShare[moodLevel(r.value, mood!)] += 1 / readings.length;
    const d = parseLocalDateString(r.date);
    byMonth.set(d.getMonth(), [...(byMonth.get(d.getMonth()) ?? []), r.value]);
    byWeekday.set(d.getDay(), [...(byWeekday.get(d.getDay()) ?? []), r.value]);
  }

  const bestMonthIdx = bestKey(byMonth);
  const bestWeekdayIdx = bestKey(byWeekday);
  const bestDay = readings.reduce<{ date: string; value: number } | null>(
    (best, r) => (!best || r.value > best.value ? r : best),
    null,
  );

  // Places and habits
  const placeCounts = new Map<string, number>();
  const habitCounts = new Map<string, number>();
  for (const e of entries) {
    for (const m of metrics) {
      const v = e.data[m.id];
      if (m.type === 'location' && v && typeof v === 'object') {
        const name = (v as LocationValue).name.split(',')[0]!.trim();
        placeCounts.set(name, (placeCounts.get(name) ?? 0) + 1);
      }
      if (m.type === 'checkbox' && v === true) habitCounts.set(m.label, (habitCounts.get(m.label) ?? 0) + 1);
    }
  }
  const top = (counts: Map<string, number>, n: number) =>
    [...counts].sort((a, b) => b[1] - a[1]).slice(0, n);

  return {
    year,
    daysLogged: entries.length,
    daysInYear,
    longestStreak: longestRun(entries.map(e => e.date)),
    avgMood: avg(readings.map(r => r.value)),
    moodShare,
    monthlyMood: MONTHS.map((_, i) => avg(byMonth.get(i) ?? [])),
    bestMonth: bestMonthIdx === null ? null : MONTHS[bestMonthIdx]!,
    bestWeekday: bestWeekdayIdx === null ? null : WEEKDAYS[bestWeekdayIdx]!,
    longestGoodStreak: mood ? longestRun(readings.filter(r => moodLevel(r.value, mood) >= 4).map(r => r.date)) : 0,
    bestDay,
    topPlaces: top(placeCounts, 3).map(([name, count]) => ({ name, count })),
    topHabits: top(habitCounts, 5).map(([label, count]) => ({ label, count })),
  };
}
