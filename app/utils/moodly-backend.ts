import type { MoodEntry, AnalyticsInsight } from "~/types";

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
    options: RequestInit = {},
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

  async getEntries(): Promise<MoodEntry[]> {
    const masterPassword = getMasterPassword();
    return this.makeRequest<MoodEntry[]>(
      `get-entries?masterPassword=${encodeURIComponent(masterPassword!)}`,
    );
  }

  async saveEntry(entry: MoodEntry): Promise<MoodEntry> {
    const masterPassword = getMasterPassword();
    return this.makeRequest<MoodEntry>("save-entry", {
      method: "POST",
      body: JSON.stringify({
        masterPassword,
        entry,
      }),
    });
  }

  async deleteEntry(id: string): Promise<{ id: string }> {
    const masterPassword = getMasterPassword();
    return this.makeRequest<{ id: string }>("delete-entry", {
      method: "POST",
      body: JSON.stringify({
        masterPassword,
        id,
      }),
    });
  }

  async getAnalytics(): Promise<{ insights: AnalyticsInsight[] }> {
    const masterPassword = getMasterPassword();
    return this.makeRequest<{ insights: AnalyticsInsight[] }>(`get-analytics?masterPassword=${masterPassword}`);
  }
}

export const moodlyBackendService = new MoodlyBackendService();
