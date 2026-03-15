import type { DailyEntry, MetricDataMap } from "~/types";
import { moodlyBackendService } from "~/utils/moodly-backend";
import { generateId } from "~/utils/helpers";

const entries = ref<DailyEntry[]>([]);
const isLoading = ref(false);
const isInitialized = ref(false);

export function useEntries() {
  const getEntryByDate = (date: string): DailyEntry | undefined => {
    return entries.value.find(e => e.date === date);
  };

  const loadEntries = async (force = false) => {
    if (isInitialized.value && !force) return;
    isLoading.value = true;
    try {
      const data = await moodlyBackendService.getEntries();
      entries.value = data;
      isInitialized.value = true;
    } catch (error) {
      console.error("Failed to load entries:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const saveEntry = async (date: string, data: MetricDataMap) => {
    try {
      const existing = getEntryByDate(date);
      const saved = await moodlyBackendService.saveEntry({
        id: existing?.id ?? generateId(),
        date,
        data,
      });

      // Update local cache
      const idx = entries.value.findIndex(e => e.date === date);
      if (idx >= 0) {
        entries.value[idx] = saved;
      } else {
        entries.value.unshift(saved);
      }
      return saved;
    } catch (error) {
      console.error("Failed to save entry:", error);
      throw error;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await moodlyBackendService.deleteEntry(id);
      entries.value = entries.value.filter(e => e.id !== id);
    } catch (error) {
      console.error("Failed to delete entry:", error);
      throw error;
    }
  };

  const reloadEntries = async () => {
    await loadEntries(true);
  };

  return {
    entries,
    isLoading,
    isInitialized,
    loadEntries,
    saveEntry,
    deleteEntry,
    reloadEntries,
    getEntryByDate,
  };
}
