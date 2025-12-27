import { moodlyBackendService } from "~/utils/moodly-backend";
import type { AnalyticsInsight } from "~/types";

export function useAnalytics() {
  const insights = useState<AnalyticsInsight[]>("analytics-insights", () => []);
  const isLoading = useState<boolean>("analytics-loading", () => false);
  const error = useState<string | null>("analytics-error", () => null);

  const fetchAnalytics = async (force = false) => {
    // If we have data and it's not a forced refresh, don't fetch again
    if (insights.value.length > 0 && !force) {
      return;
    }

    isLoading.value = true;
    error.value = null;
    try {
      const data = await moodlyBackendService.getAnalytics();
      insights.value = data.insights;
    } catch (e: any) {
      console.error("Failed to fetch analytics:", e);
      error.value = e.message || "Failed to load analytics";
    } finally {
      isLoading.value = false;
    }
  };

  return {
    insights,
    isLoading,
    error,
    fetchAnalytics,
  };
}
