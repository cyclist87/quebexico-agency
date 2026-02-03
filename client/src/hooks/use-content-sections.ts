import { useQuery } from "@tanstack/react-query";
import type { ContentSection } from "@shared/schema";

/** Normalise une section (snake_case → camelCase) pour que le front ait toujours les bonnes clés. */
function normalizeSection(raw: Record<string, unknown>): ContentSection {
  return {
    id: raw.id as number,
    sectionType: (raw.sectionType ?? raw.section_type) as string,
    isEnabled: (raw.isEnabled ?? raw.is_enabled) as boolean,
    orderIndex: (raw.orderIndex ?? raw.order_index) as number,
    titleFr: (raw.titleFr ?? raw.title_fr) as string | null,
    titleEn: (raw.titleEn ?? raw.title_en) as string | null,
    titleEs: (raw.titleEs ?? raw.title_es) as string | null,
    subtitleFr: (raw.subtitleFr ?? raw.subtitle_fr) as string | null,
    subtitleEn: (raw.subtitleEn ?? raw.subtitle_en) as string | null,
    subtitleEs: (raw.subtitleEs ?? raw.subtitle_es) as string | null,
    contentFr: (raw.contentFr ?? raw.content_fr) as string | null,
    contentEn: (raw.contentEn ?? raw.content_en) as string | null,
    contentEs: (raw.contentEs ?? raw.content_es) as string | null,
    imageUrl: (raw.imageUrl ?? raw.image_url) as string | null,
    videoUrl: (raw.videoUrl ?? raw.video_url) as string | null,
    buttonTextFr: (raw.buttonTextFr ?? raw.button_text_fr) as string | null,
    buttonTextEn: (raw.buttonTextEn ?? raw.button_text_en) as string | null,
    buttonTextEs: (raw.buttonTextEs ?? raw.button_text_es) as string | null,
    buttonUrl: (raw.buttonUrl ?? raw.button_url) as string | null,
    customData: (raw.customData ?? raw.custom_data) as string | null,
    createdAt: (raw.createdAt ?? raw.created_at) as Date,
    updatedAt: (raw.updatedAt ?? raw.updated_at) as Date,
  };
}

export function useContentSections() {
  const { data: rawSections = [], isLoading, error } = useQuery<ContentSection[] | Record<string, unknown>[]>({
    queryKey: ["/api/content-sections"],
    staleTime: 1000 * 60 * 5,
  });

  const sections: ContentSection[] = Array.isArray(rawSections)
    ? rawSections.map((s) => normalizeSection((s ?? {}) as Record<string, unknown>))
    : [];

  return {
    sections,
    isLoading,
    error,
  };
}

export function useContentSection(sectionType: string) {
  const { sections, isLoading, error } = useContentSections();
  const section = sections.find((s) => (s.sectionType ?? (s as Record<string, unknown>).section_type) === sectionType);

  return {
    section,
    isLoading,
    error,
    getTitle: (lang: "fr" | "en" | "es") => {
      if (!section) return "";
      switch (lang) {
        case "en": return section.titleEn || "";
        case "es": return section.titleEs || "";
        default: return section.titleFr || "";
      }
    },
    getSubtitle: (lang: "fr" | "en" | "es") => {
      if (!section) return "";
      switch (lang) {
        case "en": return section.subtitleEn || "";
        case "es": return section.subtitleEs || "";
        default: return section.subtitleFr || "";
      }
    },
    getContent: (lang: "fr" | "en" | "es") => {
      if (!section) return "";
      switch (lang) {
        case "en": return section.contentEn || "";
        case "es": return section.contentEs || "";
        default: return section.contentFr || "";
      }
    },
    getButtonText: (lang: "fr" | "en" | "es") => {
      if (!section) return "";
      switch (lang) {
        case "en": return section.buttonTextEn || "";
        case "es": return section.buttonTextEs || "";
        default: return section.buttonTextFr || "";
      }
    },
  };
}
