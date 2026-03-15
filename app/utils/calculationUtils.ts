import type { CalculatedFormula, MetricDataMap } from '~/types';

/**
 * Parses a "HH:MM" time string into total minutes since midnight.
 * Returns null if the string is absent, empty, or not a valid time.
 */
export function parseTimeToMinutes(timeStr: string | null | undefined): number | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = parseInt(match[1]!, 10);
  const minutes = parseInt(match[2]!, 10);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/**
 * Evaluates a CalculatedFormula against the current entry's MetricDataMap.
 * Returns null when any required source value is missing or invalid.
 *
 * time_diff overnight logic:
 *   diff = toMinutes - fromMinutes
 *   if diff < 0  →  add 24*60  (spans midnight, e.g. 23:00 → 07:00 = 8h)
 *   if diff === 0  →  return 0  (identical times = zero duration, not 24h)
 */
export function evaluateFormula(
  formula: CalculatedFormula,
  entryData: MetricDataMap,
): number | null {
  switch (formula.formulaType) {
    case 'time_diff': {
      const fromRaw = entryData[formula.fromMetricId];
      const toRaw   = entryData[formula.toMetricId];
      if (typeof fromRaw !== 'string' || typeof toRaw !== 'string') return null;

      const fromMins = parseTimeToMinutes(fromRaw);
      const toMins   = parseTimeToMinutes(toRaw);
      if (fromMins === null || toMins === null) return null;

      let diffMins = toMins - fromMins;
      if (diffMins < 0) diffMins += 24 * 60;

      if (formula.unit === 'hours') {
        return Math.round((diffMins / 60) * 100) / 100;
      } else {
        return diffMins;
      }
    }
  }
}
