import type { DailyEntry, MetricConfig, AppSettings, ApiResponse, WeatherData, EmailAlert, ScheduledLetter, SessionToken } from "~/types";

const SESSION_TOKEN_KEY = "moodly-session-token";

let apiBase = "";
let onUnauthorized: () => void = () => {};

/** Called once by the `api` plugin with values from runtime config. */
export function configureApi(options: { baseUrl: string; onUnauthorized: () => void }) {
  apiBase = options.baseUrl.replace(/\/$/, "");
  onUnauthorized = options.onUnauthorized;
}

export function getSessionToken(): string | null {
  return sessionStorage.getItem(SESSION_TOKEN_KEY);
}

export function clearSessionToken() {
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
}

async function request<T>(
  method: "GET" | "POST" | "DELETE",
  path: string,
  options: { params?: Record<string, string>; body?: unknown } = {},
): Promise<T> {
  const qs = options.params ? `?${new URLSearchParams(options.params)}` : "";
  const headers: Record<string, string> = {};
  const token = getSessionToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${apiBase}${path}${qs}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  let json: ApiResponse<T> | null = null;
  try {
    json = await res.json();
  } catch {
    // Non-JSON body (e.g. a platform error page); handled below.
  }

  if (res.status === 401 && token) {
    clearSessionToken();
    onUnauthorized();
  }

  if (!res.ok || !json?.success) {
    throw new Error(json?.error ?? `Request failed (${res.status})`);
  }
  return json.data as T;
}

const apiGet = <T>(path: string, params?: Record<string, string>) => request<T>("GET", path, { params });
const apiPost = <T>(path: string, body: unknown) => request<T>("POST", path, { body });
const apiDelete = <T>(path: string, body: unknown) => request<T>("DELETE", path, { body });

export const moodlyBackendService = {
  // --- Auth ---
  /** Exchanges the master password for a session token and stores it. */
  login: async (password: string): Promise<void> => {
    const session = await apiPost<SessionToken>("/api/verify-password", { password });
    sessionStorage.setItem(SESSION_TOKEN_KEY, session.token);
  },

  // --- Entries ---
  getEntries: (params?: { from?: string; to?: string; date?: string }): Promise<DailyEntry[]> =>
    apiGet<DailyEntry[]>("/api/entries", params as Record<string, string>),

  saveEntry: (entry: { id?: string; date: string; data: Record<string, unknown> }): Promise<DailyEntry> =>
    apiPost<DailyEntry>("/api/entries", entry),

  deleteEntry: (id: string): Promise<{ id: string }> =>
    apiDelete<{ id: string }>("/api/entries", { id }),

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
  createLetter: (message: string, sendDate: string): Promise<ScheduledLetter> =>
    apiPost<ScheduledLetter>("/api/letters", { message, sendDate }),

  // --- Email Alerts ---
  getEmailAlerts: (): Promise<EmailAlert[]> =>
    apiGet<EmailAlert[]>("/api/email-alerts"),

  saveEmailAlert: (alert: EmailAlert): Promise<EmailAlert> =>
    apiPost<EmailAlert>("/api/email-alerts", alert),

  deleteEmailAlert: (id: number): Promise<{ id: number }> =>
    apiDelete<{ id: number }>("/api/email-alerts", { id }),

  checkEntryAlerts: (date: string): Promise<{ results: string[] }> =>
    apiPost<{ results: string[] }>("/api/check-entry-alerts", { date }),
};
