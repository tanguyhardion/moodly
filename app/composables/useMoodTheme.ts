import { MOOD_COLORS, findMoodMetric, moodLevel, type MoodLevel } from '~/utils/moodColors';

const DEFAULT_LEVEL: MoodLevel = 4;

// Set by the Today screen while an entry is being edited, so the tint follows the slider live.
const liveMoodValue = ref<number | null>(null);

export function useMoodTheme() {
  const { entries, metricConfigs } = useMoodly();

  const moodMetric = computed(() => findMoodMetric(metricConfigs.value));

  /** Mood level of the entry being edited, else of the most recent entry with a mood. */
  const currentLevel = computed<MoodLevel>(() => {
    const metric = moodMetric.value;
    if (!metric) return DEFAULT_LEVEL;
    if (liveMoodValue.value != null) return moodLevel(liveMoodValue.value, metric);

    const latest = [...entries.value]
      .sort((a, b) => b.date.localeCompare(a.date))
      .find(e => typeof e.data[metric.id] === 'number');
    return latest ? moodLevel(latest.data[metric.id] as number, metric) : DEFAULT_LEVEL;
  });

  /** Hex of the current mood color, for chart libraries that need a literal color. */
  const moodColor = computed(() => MOOD_COLORS[currentLevel.value].color);

  const setLiveMoodValue = (value: number | null) => {
    liveMoodValue.value = value;
  };

  /** Applies the tint to <html>. Call once from the layout. */
  const applyMoodTheme = () => {
    watchEffect(() => {
      const { color, ink } = MOOD_COLORS[currentLevel.value];
      const root = document.documentElement.style;
      root.setProperty('--mood', color);
      root.setProperty('--mood-ink', ink);
    });
  };

  return { moodMetric, currentLevel, moodColor, setLiveMoodValue, applyMoodTheme };
}
