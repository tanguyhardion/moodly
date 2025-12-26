import type { DailyEntry } from "~/types";
import { moodlyBackendService } from "~/utils/moodly-backend";
import { generateId } from "~/utils/helpers";

// Global state (singleton) - shared across all components
const entries = ref<DailyEntry[]>([]);
const isLoading = ref(false);
const isInitialized = ref(false);
const dataVersion = ref(0); // Tracks when data changes to trigger refetch

export function useEntries() {
  // Get today's entry
  const getTodayEntry = (): DailyEntry | undefined => {
    const today = new Date().toISOString().split("T")[0]!;
    return entries.value.find((entry: DailyEntry) => entry.date === today);
  };

  // Get entry for a specific date
  const getEntryByDate = (date: string): DailyEntry | undefined => {
    return entries.value.find((entry: DailyEntry) => entry.date === date);
  };

  // Check if entry exists for today
  const hasTodayEntry = computed(() => {
    return getTodayEntry() !== undefined;
  });

  // Check if entry exists for a specific date
  const hasEntryForDate = (date: string): boolean => {
    return getEntryByDate(date) !== undefined;
  };

  // Load entries from database
  const loadEntries = async (force: boolean = false) => {
    // Skip if already initialized and not forced
    if (isInitialized.value && !force) {
      return;
    }

    try {
      isLoading.value = true;
      const data = await moodlyBackendService.getEntries();
      entries.value = data;
      isInitialized.value = true;
    } catch (error) {
      console.error("Failed to load entries:", error);
      isInitialized.value = true;
    } finally {
      isLoading.value = false;
    }
  };

  // Reload entries from database (used after mutations)
  const reloadEntries = async () => {
    await loadEntries(true);
    dataVersion.value++;
  };

  // Save or update entry
  const saveEntry = async (
    metrics: DailyEntry["metrics"],
    checkboxes?: DailyEntry["checkboxes"],
    note?: string,
    date?: string,
  ) => {
    const targetDate = date || new Date().toISOString().split("T")[0]!;
    const existingIndex = entries.value.findIndex(
      (entry: DailyEntry) => entry.date === targetDate,
    );
    const existingEntry =
      existingIndex >= 0 ? entries.value[existingIndex] : null;

    const entry: DailyEntry = {
      id: existingEntry ? existingEntry.id : generateId(),
      date: targetDate,
      metrics,
      checkboxes,
      note,
      createdAt: existingEntry
        ? existingEntry.createdAt
        : new Date().toISOString(),
    };

    try {
      isLoading.value = true;
      const savedEntry = await moodlyBackendService.saveEntry(entry);

      if (existingIndex >= 0) {
        entries.value[existingIndex] = savedEntry;
      } else {
        entries.value.push(savedEntry);
      }

      // Sort by date descending
      entries.value.sort((a: DailyEntry, b: DailyEntry) =>
        b.date.localeCompare(a.date),
      );

      // Increment data version to notify other components
      dataVersion.value++;
    } catch (error) {
      console.error("Failed to save entry:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // Get entries for date range
  const getEntriesInRange = (days: number): DailyEntry[] => {
    if (days === 0) {
      return entries.value;
    }
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0] || "";

    return entries.value.filter(
      (entry: DailyEntry) => entry.date >= startDateStr,
    );
  };

  return {
    entries,
    isLoading,
    isInitialized,
    dataVersion,
    loadEntries,
    reloadEntries,
    getTodayEntry,
    getEntryByDate,
    hasTodayEntry,
    hasEntryForDate,
    saveEntry,
    getEntriesInRange,
  };
}
