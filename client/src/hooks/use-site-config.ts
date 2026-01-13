import { useQuery } from "@tanstack/react-query";
import type { SiteConfigType } from "@shared/schema";

export function useSiteConfig() {
  const { data: config, isLoading, error } = useQuery<SiteConfigType | null>({
    queryKey: ["/api/site-config"],
    staleTime: 1000 * 60 * 5,
  });

  return {
    config,
    isLoading,
    error,
    siteName: config?.siteName || "Mon Site",
    logoUrl: config?.logoUrl || null,
    primaryColor: config?.primaryColor || "#2563eb",
    secondaryColor: config?.secondaryColor || "#64748b",
    accentColor: config?.accentColor || "#f59e0b",
    fontFamily: config?.fontFamily || "Inter",
    contactEmail: config?.contactEmail || null,
    contactPhone: config?.contactPhone || null,
    footerText: (lang: "fr" | "en" | "es") => {
      if (!config) return "";
      switch (lang) {
        case "en": return config.footerTextEn || "";
        case "es": return config.footerTextEs || "";
        default: return config.footerTextFr || "";
      }
    },
    address: (lang: "fr" | "en" | "es") => {
      if (!config) return "";
      switch (lang) {
        case "en": return config.addressEn || "";
        case "es": return config.addressEs || "";
        default: return config.addressFr || "";
      }
    },
    socialLinks: {
      facebook: config?.socialFacebook || null,
      instagram: config?.socialInstagram || null,
      linkedin: config?.socialLinkedin || null,
      twitter: config?.socialTwitter || null,
      youtube: config?.socialYoutube || null,
    },
  };
}
