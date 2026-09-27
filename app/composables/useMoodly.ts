import { useEntries } from './useEntries';
import { useMetricConfig } from './useMetricConfig';

export function useMoodly() {
  const {
    entries,
    loadEntries,
    saveEntry,
    deleteEntry,
    isLoading,
    isInitialized,
    getEntryByDate,
  } = useEntries();

  const {
    metricConfigs,
    isConfigLoaded,
    isConfigLoading,
    loadConfig,
    saveConfig,
    hasMetrics,
    groupedMetrics,
  } = useMetricConfig();

  const { darkMode, toggleDarkMode } = useDarkMode();

  /** Load both entries and metric config */
  const initialize = async () => {
    await Promise.all([loadEntries(), loadConfig()]);
  };

  return {
    // Entries
    entries,
    isLoading,
    isInitialized,
    loadEntries,
    saveEntry,
    deleteEntry,
    getEntryByDate,

    // Metric Config
    metricConfigs,
    isConfigLoaded,
    isConfigLoading,
    loadConfig,
    saveConfig,
    hasMetrics,
    groupedMetrics,

    // UI
    darkMode,
    toggleDarkMode,

    // Combined
    initialize,
  };
}
