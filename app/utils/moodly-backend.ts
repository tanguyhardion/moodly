import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import type { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/browser";
import type { DailyEntry, MetricConfig, AppSettings, ApiResponse, WeatherData, EmailAlert, ScheduledLetter, SessionToken } from "~/types";

const LEGACY_DEFAULT_COLOR = "#1e40af";

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

  // --- Passkeys (Face ID / fingerprint) ---
  /** Prompts for Face ID / fingerprint, then exchanges the signed result for a session token. */
  loginWithPasskey: async (): Promise<void> => {
    const { options, challengeToken } = await apiPost<{ options: PublicKeyCredentialRequestOptionsJSON; challengeToken: string }>(
      "/api/verify-password",
      { action: "login-options" },
    );
    const response = await startAuthentication({ optionsJSON: options });
    const session = await apiPost<SessionToken>("/api/verify-password", { action: "login-verify", challengeToken, response });
    sessionStorage.setItem(SESSION_TOKEN_KEY, session.token);
  },

  /** Registers a passkey on this device and returns its id. Needs a session. */
  registerPasskey: async (): Promise<string> => {
    const { options, challengeToken } = await apiPost<{ options: PublicKeyCredentialCreationOptionsJSON; challengeToken: string }>(
      "/api/verify-password",
      { action: "register-options" },
    );
    const response = await startRegistration({ optionsJSON: options });
    return (await apiPost<{ id: string }>("/api/verify-password", { action: "register-verify", challengeToken, response })).id;
  },

  removePasskey: (id: string): Promise<{ success: boolean }> =>
    apiPost<{ success: boolean }>("/api/verify-password", { action: "remove", id }),

  // --- Entries ---
  getEntries: (params?: { from?: string; to?: string; date?: string }): Promise<DailyEntry[]> =>
    apiGet<DailyEntry[]>("/api/entries", params as Record<string, string>),

  saveEntry: (entry: { id?: string; date: string; data: Record<string, unknown> }): Promise<DailyEntry> =>
    apiPost<DailyEntry>("/api/entries", entry),

  deleteEntry: (id: string): Promise<{ id: string }> =>
    apiDelete<{ id: string }>("/api/entries", { id }),

  // --- Metric Configuration ---
  getMetricConfig: async (): Promise<{ metrics: MetricConfig[]; updatedAt: string | null }> => {
    const res = await apiGet<{ metrics: MetricConfig[]; updatedAt: string | null }>("/api/metric-config");
    // Drop the legacy default blue so these metrics follow the dynamic mood color
    res.metrics = res.metrics.map((m) =>
      m.color?.toLowerCase() === LEGACY_DEFAULT_COLOR ? { ...m, color: undefined } : m,
    );
    return res;
  },

  saveMetricConfig: (metrics: MetricConfig[]): Promise<{ success: boolean }> =>
    apiPost<{ success: boolean }>("/api/metric-config", { metrics }),

  // --- Settings ---
  getSettings: (): Promise<AppSettings> =>
    apiGet<AppSettings>("/api/settings"),

  saveSettings: (settings: AppSettings): Promise<{ success: boolean }> =>
    apiPost<{ success: boolean }>("/api/settings", settings),

  // --- Push notifications ---
  // Served by the settings function (`?push=1`) to stay within the host's function limit
  getPushPublicKey: async (): Promise<string> =>
    (await apiGet<{ publicKey: string }>("/api/settings", { push: "1" })).publicKey,

  savePushSubscription: (subscription: PushSubscriptionJSON): Promise<{ success: boolean }> =>
    request<{ success: boolean }>("POST", "/api/settings", { params: { push: "1" }, body: subscription }),

  deletePushSubscription: (endpoint: string): Promise<{ success: boolean }> =>
    request<{ success: boolean }>("DELETE", "/api/settings", { params: { push: "1" }, body: { endpoint } }),

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
