import type { MetricType, MetricConfig, DailyEntry } from "~/types";

export function useMetrics() {
  const metricConfigs: MetricConfig[] = [
    {
      name: "Mood",
      key: "mood",
      icon: "solar:emoji-funny-square-bold",
      color: "#FF6B9D",
      emojis: ["😢", "😕", "😐", "🙂", "😊"],
      labels: ["Terrible", "Bad", "Okay", "Good", "Great"],
    },
    {
      name: "Energy",
      key: "energy",
      icon: "solar:bolt-bold",
      color: "#FFC93C",
      emojis: ["🥴", "🥱", "😐", "💪", "⚡"],
      labels: ["Exhausted", "Tired", "Normal", "Energized", "Supercharged"],
    },
    {
      name: "Sleep",
      key: "sleep",
      icon: "solar:moon-stars-bold",
      color: "#A78BFA",
      emojis: ["😵", "😪", "😐", "😌", "😴"],
      labels: ["Awful", "Poor", "Fair", "Good", "Excellent"],
    },
    {
      name: "Focus",
      key: "focus",
      icon: "solar:target-bold",
      color: "#10B981",
      emojis: ["🤯", "😵‍💫", "😐", "🎯", "🧠"],
      labels: ["Scattered", "Distracted", "Average", "Focused", "Laser-sharp"],
    },
    {
      name: "Stress",
      key: "stress",
      icon: "solar:pulse-bold",
      color: "#F97316",
      emojis: ["😰", "😫", "😐", "😇", "🧘"],
      labels: ["Overwhelmed", "Stressed", "Moderate", "Calm", "Zen"],
    },
  ];

  // Calculate average for a metric
  const getMetricAverage = (
    entries: DailyEntry[],
    metric: MetricType,
    days: number = 7,
  ): number => {
    const recentEntries = getEntriesInRange(entries, days);
    // Filter out entries with null values for this metric
    const validEntries = recentEntries.filter(
      (entry) => entry.metrics[metric] !== null,
    );
    if (validEntries.length === 0) return 0;

    const sum = validEntries.reduce(
      (acc, entry) => acc + (entry.metrics[metric] as number),
      0,
    );
    return sum / validEntries.length;
  };

  // Get metric trend (positive, negative, or neutral)
  const getMetricTrend = (
    entries: DailyEntry[],
    metric: MetricType,
    days: number = 7,
  ): "up" | "down" | "neutral" => {
    const recentEntries = getEntriesInRange(entries, days);
    // Filter out entries with null values
    const validEntries = recentEntries.filter(
      (entry) => entry.metrics[metric] !== null,
    );
    if (validEntries.length < 2) return "neutral";

    const firstHalf = validEntries
      .slice(Math.floor(validEntries.length / 2))
      .reverse();
    const secondHalf = validEntries
      .slice(0, Math.floor(validEntries.length / 2))
      .reverse();

    if (firstHalf.length === 0 || secondHalf.length === 0) return "neutral";

    const firstAvg =
      firstHalf.reduce((acc, e) => acc + (e.metrics[metric] as number), 0) /
      firstHalf.length;
    const secondAvg =
      secondHalf.reduce((acc, e) => acc + (e.metrics[metric] as number), 0) /
      secondHalf.length;

    const diff = secondAvg - firstAvg;
    if (Math.abs(diff) < 0.3) return "neutral";
    return diff > 0 ? "up" : "down";
  };

  // Helper: Get entries for date range
  const getEntriesInRange = (
    entries: DailyEntry[],
    days: number,
  ): DailyEntry[] => {
    if (days === 0) {
      return entries;
    }
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0] || "";

    return entries.filter((entry: DailyEntry) => entry.date >= startDateStr);
  };

  return {
    metricConfigs,
    getMetricAverage,
    getMetricTrend,
  };
}
