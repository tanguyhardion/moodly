import { v4 as uuidv4 } from "uuid";

/**
 * Generate unique IDs using UUID v4
 * We use UUIDs for robust uniqueness across devices and sessions
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Get current date string (YYYY-MM-DD)
 * Uses local time to match user's perspective
 */
export function getCurrentDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date is a weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Helper to parse YYYY-MM-DD to local Date (at 00:00:00)
 */
export function parseLocalDateString(dateStr: string): Date {
  const parts = dateStr.split("-").map(Number);
  const year = parts[0]!;
  const month = parts[1]!;
  const day = parts[2]!;
  return new Date(year, month - 1, day);
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
