import type { DailyEntry } from '~/types';
import { getCurrentDateString, parseLocalDateString } from '~/utils/helpers';

// Pure numeric / date helpers shared by the stats and insights pages.
// All dates are local "YYYY-MM-DD" strings, matching how entries are stored.

export function pearson(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 5) return 0;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((s, x, i) => s + (x - mx) * (ys[i]! - my), 0);
  const den = Math.sqrt(
    xs.reduce((s, x) => s + (x - mx) ** 2, 0) *
    ys.reduce((s, y) => s + (y - my) ** 2, 0)
  );
  return den === 0 ? 0 : Math.max(-1, Math.min(1, num / den));
}

export function linearSlope(vals: number[]): number {
  const n = vals.length;
  if (n < 2) return 0;
  const mx = (n - 1) / 2;
  const my = vals.reduce((a, b) => a + b, 0) / n;
  const num = vals.reduce((s, v, i) => s + (i - mx) * (v - my), 0);
  const den = vals.reduce((s, _, i) => s + (i - mx) ** 2, 0);
  return den ? num / den : 0;
}

/** Numeric values of one metric, sorted by date ascending. */
export function getNumericVals(metricId: string, es: DailyEntry[]): { date: string; v: number }[] {
  return [...es]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(e => ({ date: e.date, raw: e.data[metricId] }))
    .filter(p => typeof p.raw === 'number' && !isNaN(p.raw as number))
    .map(p => ({ date: p.date, v: p.raw as number }));
}

export function fmtShortDate(dateStr: string): string {
  if (!dateStr) return '';
  return parseLocalDateString(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return getCurrentDateString(d);
}

/** Entries from the last `days` days including today, sorted ascending. `days === 0` means all. */
export function filterEntriesByPeriod(entries: DailyEntry[], days: number): DailyEntry[] {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  if (days === 0) return sorted;
  const cutoff = daysAgo(days - 1);
  return sorted.filter(e => e.date >= cutoff);
}

/** Entries from the `days`-long window just before the current period, sorted ascending. */
export function filterPreviousPeriod(entries: DailyEntry[], days: number): DailyEntry[] {
  if (days === 0) return [];
  const thisCutoff = daysAgo(days - 1);
  const prevCutoff = daysAgo(days * 2 - 1);
  return [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter(e => e.date >= prevCutoff && e.date < thisCutoff);
}

/** Longest run of consecutive dates, and the current run ending today or yesterday. */
export function calcStreak(dates: string[]): { current: number; longest: number } {
  if (!dates.length) return { current: 0, longest: 0 };
  const sorted = [...dates].sort();
  let longest = 0;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = parseLocalDateString(sorted[i - 1]!);
    const curr = parseLocalDateString(sorted[i]!);
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    streak = diff === 1 ? streak + 1 : 1;
    longest = Math.max(longest, streak);
  }
  longest = Math.max(longest, streak);

  const dateSet = new Set(sorted);
  const todayStr = daysAgo(0);
  const yesterdayStr = daysAgo(1);
  const startFrom = dateSet.has(todayStr) ? todayStr : dateSet.has(yesterdayStr) ? yesterdayStr : null;
  let current = 0;
  if (startFrom) {
    current = 1;
    const check = parseLocalDateString(startFrom);
    while (true) {
      check.setDate(check.getDate() - 1);
      if (dateSet.has(getCurrentDateString(check))) current++;
      else break;
    }
  }

  return { current, longest };
}

export function timeToMins(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minsToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = Math.round(mins % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
