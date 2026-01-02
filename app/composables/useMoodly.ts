import type { MetricType } from "~/types";

/**
 * Main composable that orchestrates all Moodly features
 * This composable delegates to specialized composables for better code organization:
 * - useEntries: Manages mood entries (CRUD operations)
 * - useMetrics: Handles metric configurations and calculations
 * - useExport: Provides data export functionality
 * - useDarkMode: Manages dark mode state
 * - useStreak: Manages streak tracking and calculations
 */
export function useMoodly() {
  // Delegate to specialized composables
  const entriesManager = useEntries();
  const metricsManager = useMetrics();
  const darkModeManager = useDarkMode();
  const streakManager = useStreak();
  const exportManager = useExport(
    entriesManager.entries,
    metricsManager.metricConfigs,
  );

  // Wrapper functions for metric calculations that need entries
  const getMetricAverage = (metric: MetricType, days: number = 7): number => {
    return metricsManager.getMetricAverage(
      entriesManager.entries.value,
      metric,
      days,
    );
  };

  const getMetricTrend = (
    metric: MetricType,
    days: number = 7,
  ): "up" | "down" | "neutral" => {
    return metricsManager.getMetricTrend(
      entriesManager.entries.value,
      metric,
      days,
    );
  };

  return {
    // Entries management
    entries: entriesManager.entries,
    isLoading: entriesManager.isLoading,
    isInitialized: entriesManager.isInitialized,
    dataVersion: entriesManager.dataVersion,
    loadEntries: entriesManager.loadEntries,
    reloadEntries: entriesManager.reloadEntries,
    getTodayEntry: entriesManager.getTodayEntry,
    getEntryByDate: entriesManager.getEntryByDate,
    hasTodayEntry: entriesManager.hasTodayEntry,
    hasEntryForDate: entriesManager.hasEntryForDate,
    saveEntry: entriesManager.saveEntry,
    getEntriesInRange: entriesManager.getEntriesInRange,
    getPreviousEntry: entriesManager.getPreviousEntry,

    // Metrics
    metricConfigs: metricsManager.metricConfigs,
    getMetricAverage,
    getMetricTrend,

    // Dark mode
    darkMode: darkModeManager.darkMode,
    toggleDarkMode: darkModeManager.toggleDarkMode,

    // Streak tracking
    streakData: streakManager.streakData,
    updateStreakFromEntries: streakManager.updateStreakFromEntries,
    needsCheckinToday: streakManager.needsCheckinToday,
    isStreakAtRisk: streakManager.isStreakAtRisk,
    streakMessage: streakManager.streakMessage,

    // Export
    exportToJSON: exportManager.exportToJSON,
    exportToCSV: exportManager.exportToCSV,
    exportToExcel: exportManager.exportToExcel,
    exportToMarkdown: exportManager.exportToMarkdown,
  };
}
