import { v4 as uuidv4 } from "uuid";

/**
 * Generate unique IDs using UUID v4
 * We use UUIDs for robust uniqueness across devices and sessions
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Get current date string for filenames
 */
export function getCurrentDateString(): string {
  return new Date().toISOString().split("T")[0] || "";
}

/**
 * Helper function to download a file
 */
export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
