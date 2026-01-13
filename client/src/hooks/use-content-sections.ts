import { useQuery } from "@tanstack/react-query";
import type { ContentSection } from "@shared/schema";

export function useContentSections() {
  const { data: sections = [], isLoading, error } = useQuery<ContentSection[]>({
    queryKey: ["/api/content-sections"],
    staleTime: 1000 * 60 * 5,
  });

  return {
    sections,
    isLoading,
    error,
  };
}

export function useContentSection(sectionType: string) {
  const { sections, isLoading, error } = useContentSections();
  const section = sections.find((s) => s.sectionType === sectionType);

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
