// src/lib/api-config.ts
// Shared API configuration reader

export interface ApiConfig {
  apiBaseUrl: string;
  apiModel: string;
  apiKey: string;
}

const STORAGE_KEY = "parallel-universe-settings";

export function getApiConfig(): ApiConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const settings = JSON.parse(raw);
    if (!settings.apiKey || !settings.apiBaseUrl || !settings.apiModel) return null;
    return {
      apiBaseUrl: settings.apiBaseUrl,
      apiModel: settings.apiModel,
      apiKey: settings.apiKey,
    };
  } catch {
    return null;
  }
}
