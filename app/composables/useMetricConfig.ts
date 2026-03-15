import type { MetricConfig } from '~/types';
import { moodlyBackendService } from '~/utils/moodly-backend';

const metricConfigs = ref<MetricConfig[]>([]);
const isConfigLoaded = ref(false);
const isConfigLoading = ref(false);

export function useMetricConfig() {
  const loadConfig = async (force = false) => {
    if (isConfigLoaded.value && !force) return;
    isConfigLoading.value = true;
    try {
      const result = await moodlyBackendService.getMetricConfig();
      metricConfigs.value = (result.metrics ?? []).sort((a, b) => a.order - b.order);
      isConfigLoaded.value = true;
    } catch (error) {
      console.error('Failed to load metric config:', error);
      metricConfigs.value = [];
    } finally {
      isConfigLoading.value = false;
    }
  };

  const saveConfig = async (metrics: MetricConfig[]) => {
    try {
      await moodlyBackendService.saveMetricConfig(metrics);
      metricConfigs.value = [...metrics].sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Failed to save metric config:', error);
      throw error;
    }
  };

  const hasMetrics = computed(() => metricConfigs.value.length > 0);

  /** Group metrics by their `group` field. Ungrouped metrics go under '' */
  const groupedMetrics = computed(() => {
    const groups = new Map<string, MetricConfig[]>();
    for (const m of metricConfigs.value) {
      const key = m.group ?? '';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(m);
    }
    return groups;
  });

  return {
    metricConfigs,
    isConfigLoaded,
    isConfigLoading,
    loadConfig,
    saveConfig,
    hasMetrics,
    groupedMetrics,
  };
}
