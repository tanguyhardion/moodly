import type { DailyEntry, MetricConfig, AppSettings, ApiResponse, WeatherData } from "~/types";

const API_BASE = import.meta.env.DEV
  ? "http://localhost:3001"
  : "https://moodly-backend.vercel.app";

function getMasterPassword(): string {
  return sessionStorage.getItem("moodly-master-password") ?? "";
}

function authParams(): string {
  return `masterPassword=${encodeURIComponent(getMasterPassword())}`;
}

async function apiGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const qs = new URLSearchParams({ ...params, masterPassword: getMasterPassword() });
  const res = await fetch(`${API_BASE}${path}?${qs.toString()}`);
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error ?? "Request failed");
  return json.data as T;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body as Record<string, unknown>, masterPassword: getMasterPassword() }),
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error ?? "Request failed");
  return json.data as T;
}

export const moodlyBackendService = {
  // --- Entries ---
  getEntries: (params?: { from?: string; to?: string; date?: string }): Promise<DailyEntry[]> =>
    apiGet<DailyEntry[]>("/api/get-entries", params as Record<string, string>),

  saveEntry: (entry: { id?: string; date: string; data: Record<string, unknown> }): Promise<DailyEntry> =>
    apiPost<DailyEntry>("/api/save-entry", entry),

  deleteEntry: (id: string): Promise<{ id: string }> =>
    apiPost<{ id: string }>("/api/delete-entry", { id }),

  // --- Metric Configuration ---
  getMetricConfig: (): Promise<{ metrics: MetricConfig[]; updatedAt: string | null }> =>
    apiGet<{ metrics: MetricConfig[]; updatedAt: string | null }>("/api/metric-config"),

  saveMetricConfig: (metrics: MetricConfig[]): Promise<{ success: boolean }> =>
    apiPost<{ success: boolean }>("/api/metric-config", { metrics }),

  // --- Settings ---
  getSettings: (): Promise<AppSettings> =>
    apiGet<AppSettings>("/api/settings"),

  saveSettings: (settings: AppSettings): Promise<{ success: boolean }> =>
    apiPost<{ success: boolean }>("/api/settings", settings),

  // --- Location Search ---
  searchLocation: (query: string): Promise<unknown> =>
    apiGet<unknown>("/api/search-location", { q: query }),

  // --- Weather ---
  getWeather: (lat: number, lon: number, date?: string): Promise<WeatherData> =>
    apiGet<WeatherData>("/api/get-weather", {
      lat: String(lat),
      lon: String(lon),
      ...(date ? { date } : {}),
    }),

  // --- Letters ---
  createLetter: (message: string, sendDate: string): Promise<{ id: number; message: string; sendDate: string; createdAt: string }> =>
    apiPost<{ id: number; message: string; sendDate: string; createdAt: string }>("/api/letters", { message, sendDate }),
};
