// Simple local storage utilities for MVP
// In production, this would be replaced with a proper database

export const STORAGE_KEYS = {
  STARTUP_IDEAS: 'instant-validation-startup-ideas',
  SIGNUPS: 'instant-validation-signups',
} as const;

export function saveToStorage<T>(key: string, data: T): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  }
  return defaultValue;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
