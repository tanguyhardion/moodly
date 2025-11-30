import type { MoodEntry, MetricConfig } from "~/types";
import * as XLSX from "xlsx";
import { downloadFile, getCurrentDateString } from "~/utils/helpers";

export function useExport(
  entries: Ref<MoodEntry[]>,
  metricConfigs: MetricConfig[],
) {
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
      "Hard Work",
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
      entry.checkboxes?.hardWork ? "Yes" : "No",
      entry.checkboxes?.misc ? "Yes" : "No",
      entry.note ? `"${entry.note.replace(/"/g, '""')}"` : "",
      entry.createdAt,
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
      "Hard Work",
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
      entry.checkboxes?.hardWork ? "Yes" : "No",
      entry.checkboxes?.misc ? "Yes" : "No",
      entry.note || "",
      entry.createdAt,
    ]);

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 12 }, // Date
      { wch: 6 }, // Mood
      { wch: 8 }, // Energy
      { wch: 6 }, // Sleep
      { wch: 6 }, // Focus
      { wch: 14 }, // Healthy Food
      { wch: 6 }, // Gym
      { wch: 12 }, // Hard Work
      { wch: 6 }, // Misc
      { wch: 30 }, // Note
      { wch: 22 }, // Created At
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Moodly Data");

    // Generate buffer and create blob
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
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
        markdown += `- **Hard Work**: ${entry.checkboxes.hardWork ? "✅" : "❌"}\n`;
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
    exportToJSON,
    exportToCSV,
    exportToExcel,
    exportToMarkdown,
  };
}
