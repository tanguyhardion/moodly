import type { MoodEntry, MetricType, MetricConfig } from "~/types";
import * as XLSX from "xlsx";

export function useMoodly() {
  const entries = useLocalStorage<MoodEntry[]>("moodly-entries", []);
  const darkMode = useLocalStorage<boolean>("moodly-dark-mode", false);

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
      emojis: ["😴", "🥱", "😶", "💪", "⚡"],
      labels: ["Exhausted", "Tired", "Normal", "Energized", "Supercharged"],
    },
    {
      name: "Sleep",
      key: "sleep",
      icon: "solar:moon-stars-bold",
      color: "#A78BFA",
      emojis: ["😵", "😪", "😑", "😌", "😴"],
      labels: ["Awful", "Poor", "Fair", "Good", "Excellent"],
    },
    {
      name: "Focus",
      key: "focus",
      icon: "solar:target-bold",
      color: "#4ECDC4",
      emojis: ["🤯", "😵‍💫", "😐", "🎯", "🧠"],
      labels: ["Scattered", "Distracted", "Average", "Focused", "Laser-sharp"],
    },
  ];

  // Get today's entry
  const getTodayEntry = (): MoodEntry | undefined => {
    const today = new Date().toISOString().split("T")[0];
    return entries.value.find((entry: MoodEntry) => entry.date === today);
  };

  // Get entry for a specific date
  const getEntryByDate = (date: string): MoodEntry | undefined => {
    return entries.value.find((entry: MoodEntry) => entry.date === date);
  };

  // Check if entry exists for today
  const hasTodayEntry = computed(() => {
    return getTodayEntry() !== undefined;
  });

  // Check if entry exists for a specific date
  const hasEntryForDate = (date: string): boolean => {
    return getEntryByDate(date) !== undefined;
  };

  // Save or update entry
  const saveEntry = (
    metrics: MoodEntry["metrics"],
    checkboxes?: MoodEntry["checkboxes"],
    note?: string,
    date?: string,
  ) => {
    const targetDate = date || new Date().toISOString().split("T")[0]!;
    const existingIndex = entries.value.findIndex(
      (entry: MoodEntry) => entry.date === targetDate,
    );
    const existingEntry =
      existingIndex >= 0 ? entries.value[existingIndex] : null;

    const entry: MoodEntry = {
      id: existingEntry ? existingEntry.id : generateId(),
      date: targetDate,
      metrics,
      checkboxes,
      note,
      createdAt: existingEntry ? existingEntry.createdAt : Date.now(),
    };

    if (existingIndex >= 0) {
      entries.value[existingIndex] = entry;
    } else {
      entries.value.push(entry);
    }

    // Sort by date descending
    entries.value.sort((a: MoodEntry, b: MoodEntry) =>
      b.date.localeCompare(a.date),
    );
  };

  // Delete entry
  const deleteEntry = (id: string) => {
    const index = entries.value.findIndex(
      (entry: MoodEntry) => entry.id === id,
    );
    if (index >= 0) {
      entries.value.splice(index, 1);
    }
  };

  // Get entries for date range
  const getEntriesInRange = (days: number): MoodEntry[] => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0] || "";

    return entries.value.filter(
      (entry: MoodEntry) => entry.date >= startDateStr,
    );
  };

  // Calculate average for a metric
  const getMetricAverage = (metric: MetricType, days: number = 7): number => {
    const recentEntries = getEntriesInRange(days);
    if (recentEntries.length === 0) return 0;

    const sum = recentEntries.reduce(
      (acc, entry) => acc + entry.metrics[metric],
      0,
    );
    return sum / recentEntries.length;
  };

  // Get metric trend (positive, negative, or neutral)
  const getMetricTrend = (
    metric: MetricType,
    days: number = 7,
  ): "up" | "down" | "neutral" => {
    const recentEntries = getEntriesInRange(days);
    if (recentEntries.length < 2) return "neutral";

    const firstHalf = recentEntries
      .slice(Math.floor(recentEntries.length / 2))
      .reverse();
    const secondHalf = recentEntries
      .slice(0, Math.floor(recentEntries.length / 2))
      .reverse();

    if (firstHalf.length === 0 || secondHalf.length === 0) return "neutral";

    const firstAvg =
      firstHalf.reduce((acc, e) => acc + e.metrics[metric], 0) /
      firstHalf.length;
    const secondAvg =
      secondHalf.reduce((acc, e) => acc + e.metrics[metric], 0) /
      secondHalf.length;

    const diff = secondAvg - firstAvg;
    if (Math.abs(diff) < 0.3) return "neutral";
    return diff > 0 ? "up" : "down";
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value;
    if (import.meta.client) {
      document.documentElement.classList.toggle("dark", darkMode.value);
    }
  };

  // Apply dark mode on mount
  onMounted(() => {
    if (import.meta.client) {
      document.documentElement.classList.toggle("dark", darkMode.value);
    }
  });

  // Export functions
  const exportToJSON = () => {
    const dataStr = JSON.stringify(entries.value, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    downloadFile(dataBlob, `moodly-data-${getCurrentDateString()}.json`);
  };

  const exportToCSV = () => {
    if (entries.value.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = [
      "Date",
      "Mood",
      "Energy",
      "Sleep",
      "Focus",
      "Healthy Food",
      "Gym",
      "Misc",
      "Note",
      "Created At",
    ];
    const rows = entries.value.map((entry) => [
      entry.date,
      entry.metrics.mood,
      entry.metrics.energy,
      entry.metrics.sleep,
      entry.metrics.focus,
      entry.checkboxes?.healthyFood ? "Yes" : "No",
      entry.checkboxes?.gym ? "Yes" : "No",
      entry.checkboxes?.misc ? "Yes" : "No",
      entry.note ? `"${entry.note.replace(/"/g, '""')}"` : "",
      new Date(entry.createdAt).toISOString(),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n",
    );
    const dataBlob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    downloadFile(dataBlob, `moodly-data-${getCurrentDateString()}.csv`);
  };

  const exportToExcel = () => {
    if (entries.value.length === 0) {
      alert("No data to export");
      return;
    }

    // Create worksheet data
    const headers = [
      "Date",
      "Mood",
      "Energy",
      "Sleep",
      "Focus",
      "Healthy Food",
      "Gym",
      "Misc",
      "Note",
      "Created At",
    ];

    const rows = entries.value.map((entry) => [
      entry.date,
      entry.metrics.mood,
      entry.metrics.energy,
      entry.metrics.sleep,
      entry.metrics.focus,
      entry.checkboxes?.healthyFood ? "Yes" : "No",
      entry.checkboxes?.gym ? "Yes" : "No",
      entry.checkboxes?.misc ? "Yes" : "No",
      entry.note || "",
      new Date(entry.createdAt).toISOString(),
    ]);

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 12 }, // Date
      { wch: 6 },  // Mood
      { wch: 8 },  // Energy
      { wch: 6 },  // Sleep
      { wch: 6 },  // Focus
      { wch: 14 }, // Healthy Food
      { wch: 6 },  // Gym
      { wch: 6 },  // Misc
      { wch: 30 }, // Note
      { wch: 22 }, // Created At
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Moodly Data");

    // Generate buffer and create blob
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    downloadFile(dataBlob, `moodly-data-${getCurrentDateString()}.xlsx`);
  };

  const exportToMarkdown = () => {
    if (entries.value.length === 0) {
      alert("No data to export");
      return;
    }

    let markdown = "# Moodly Data Export\n\n";
    markdown += `Exported on: ${new Date().toLocaleDateString()}\n\n`;
    markdown += `Total entries: ${entries.value.length}\n\n`;
    markdown += "---\n\n";

    entries.value.forEach((entry) => {
      markdown += `## ${entry.date}\n\n`;
      markdown += "### Metrics\n\n";
      markdown += `- **Mood**: ${entry.metrics.mood}/5 ${metricConfigs[0]?.emojis[entry.metrics.mood - 1] || ""}\n`;
      markdown += `- **Energy**: ${entry.metrics.energy}/5 ${metricConfigs[1]?.emojis[entry.metrics.energy - 1] || ""}\n`;
      markdown += `- **Sleep**: ${entry.metrics.sleep}/5 ${metricConfigs[2]?.emojis[entry.metrics.sleep - 1] || ""}\n`;
      markdown += `- **Focus**: ${entry.metrics.focus}/5 ${metricConfigs[3]?.emojis[entry.metrics.focus - 1] || ""}\n\n`;

      if (entry.checkboxes) {
        markdown += "### Daily Check-ins\n\n";
        markdown += `- **Healthy Food**: ${entry.checkboxes.healthyFood ? "✅" : "❌"}\n`;
        markdown += `- **Gym**: ${entry.checkboxes.gym ? "✅" : "❌"}\n`;
        markdown += `- **Misc**: ${entry.checkboxes.misc ? "✅" : "❌"}\n\n`;
      }

      if (entry.note) {
        markdown += "### Note\n\n";
        markdown += `${entry.note}\n\n`;
      }

      markdown += `*Recorded on: ${new Date(entry.createdAt).toLocaleString()}*\n\n`;
      markdown += "---\n\n";
    });

    const dataBlob = new Blob([markdown], { type: "text/markdown" });
    downloadFile(dataBlob, `moodly-data-${getCurrentDateString()}.md`);
  };

  return {
    entries,
    darkMode,
    metricConfigs,
    getTodayEntry,
    getEntryByDate,
    hasTodayEntry,
    hasEntryForDate,
    saveEntry,
    deleteEntry,
    getEntriesInRange,
    getMetricAverage,
    getMetricTrend,
    toggleDarkMode,
    exportToJSON,
    exportToCSV,
    exportToExcel,
    exportToMarkdown,
  };
}

// Helper function to generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to get current date string for filenames
function getCurrentDateString(): string {
  return new Date().toISOString().split("T")[0] || "";
}

// Helper function to download a file
function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
