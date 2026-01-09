import { z } from "zod";

export const LanguageSchema = z.enum(["fr", "en", "es"]);
export type Language = z.infer<typeof LanguageSchema>;

export const LocalizedStringSchema = z.union([
  z.string(),
  z.object({
    fr: z.string(),
    en: z.string().optional(),
    es: z.string().optional(),
  }),
]);

export type LocalizedString = z.infer<typeof LocalizedStringSchema>;

export function getLocalizedValue(
  value: LocalizedString | undefined,
  language: Language,
  fallback: string = ""
): string {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value[language] || value.fr || fallback;
}

export function createLocalizedString(
  fr: string,
  en?: string,
  es?: string
): LocalizedString {
  if (!en && !es) return fr;
  return { fr, en, es };
}

export const LocalizedArraySchema = z.union([
  z.array(z.string()),
  z.object({
    fr: z.array(z.string()),
    en: z.array(z.string()).optional(),
    es: z.array(z.string()).optional(),
  }),
]);

export type LocalizedArray = z.infer<typeof LocalizedArraySchema>;

export function getLocalizedArray(
  value: LocalizedArray | undefined,
  language: Language,
  fallback: string[] = []
): string[] {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  return value[language] || value.fr || fallback;
}
