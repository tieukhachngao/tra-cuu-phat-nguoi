import { vi } from "./vi.js";
import { en } from "./en.js";
import type { Locale, Messages } from "./types.js";

export type { Locale, Messages };

const locales: Record<Locale, Messages> = { vi, en };

const userLocales = new Map<number, Locale>();

export function getMessages(userId: number): Messages {
  return locales[userLocales.get(userId) || "vi"];
}

export function setLocale(userId: number, locale: Locale): void {
  userLocales.set(userId, locale);
}

export function getLocale(userId: number): Locale {
  return userLocales.get(userId) || "vi";
}
