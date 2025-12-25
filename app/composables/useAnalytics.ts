import { ref } from "vue";
import { moodlyBackendService } from "~/utils/moodly-backend";
import type { AnalyticsInsight } from "~/types";

export function useAnalytics() {
  const insights = ref<AnalyticsInsight[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchAnalytics = async () => {
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
