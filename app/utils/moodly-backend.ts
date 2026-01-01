import type { DailyEntry, AnalyticsInsight, AppSettings } from "~/types";

const getBackendUrl = (): string => {
  return process.env.NODE_ENV === "development"
    ? "http://localhost:3001" // Local backend for development
    : "https://moodly-backend.vercel.app"; // Production backend
};

const getMasterPassword = (): string | null => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("moodly-master-password");
};

export class MoodlyBackendService {
  private readonly backendUrl: string;

  constructor() {
    this.backendUrl = getBackendUrl();
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const masterPassword = getMasterPassword();
    if (!masterPassword) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${this.backendUrl}/api/${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Request failed");
    }

    return data.data;
  }

  async searchLocation(query: string): Promise<any> {
    const masterPassword = getMasterPassword();
    return this.makeRequest(
      `search-location?q=${encodeURIComponent(
        query
      )}&masterPassword=${encodeURIComponent(masterPassword!)}`
    );
  }

  async verifyPassword(password: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/api/verify-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ masterPassword: password }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("Password verification error:", error);
      return false;
    }
  }

  async getEntries(): Promise<DailyEntry[]> {
    const masterPassword = getMasterPassword();
    return this.makeRequest<DailyEntry[]>(
      `get-entries?masterPassword=${encodeURIComponent(masterPassword!)}`
    );
  }

  async saveEntry(entry: DailyEntry): Promise<DailyEntry> {
    const masterPassword = getMasterPassword();
    return this.makeRequest<DailyEntry>("save-entry", {
      method: "POST",
      body: JSON.stringify({
        masterPassword,
        entry,
      }),
    });
  }

  async getAnalytics(): Promise<{ insights: AnalyticsInsight[] }> {
    const masterPassword = getMasterPassword();
    return this.makeRequest<{ insights: AnalyticsInsight[] }>(
      `get-analytics?masterPassword=${encodeURIComponent(masterPassword!)}`
    );
  }

  async getSettings(): Promise<AppSettings> {
    const masterPassword = getMasterPassword();
    return this.makeRequest<AppSettings>(
      `settings?masterPassword=${encodeURIComponent(masterPassword!)}`
    );
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    const masterPassword = getMasterPassword();
    return this.makeRequest<void>("settings", {
      method: "POST",
      body: JSON.stringify({
        masterPassword,
        ...settings,
      }),
    });
  }
}

export const moodlyBackendService = new MoodlyBackendService();
