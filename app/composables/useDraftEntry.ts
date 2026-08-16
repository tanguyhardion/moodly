import type { MetricDataMap } from '~/types';

const DRAFT_PREFIX = 'moodly-draft-entry-';

export function useDraftEntry() {
  const getDraftKey = (dateStr: string) => `${DRAFT_PREFIX}${dateStr}`;

  const getDraft = (dateStr: string): MetricDataMap | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(getDraftKey(dateStr));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.data || null;
    } catch (e) {
      console.error('Failed to read draft entry from localStorage:', e);
      return null;
    }
  };

  const saveDraft = (dateStr: string, data: MetricDataMap) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        getDraftKey(dateStr),
        JSON.stringify({
          date: dateStr,
          data,
          updatedAt: Date.now(),
        })
      );
    } catch (e) {
      console.error('Failed to save draft entry to localStorage:', e);
    }
  };

  const clearDraft = (dateStr: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(getDraftKey(dateStr));
    } catch (e) {
      console.error('Failed to clear draft entry from localStorage:', e);
    }
  };

  const cleanupOldDrafts = () => {
    if (typeof window === 'undefined') return;
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(DRAFT_PREFIX)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            // Remove drafts older than 7 days
            if (parsed.updatedAt && Date.now() - parsed.updatedAt > 7 * 24 * 60 * 60 * 1000) {
              keysToRemove.push(key);
            }
          }
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      // ignore
    }
  };

  return {
    getDraft,
    saveDraft,
    clearDraft,
    cleanupOldDrafts,
  };
}
