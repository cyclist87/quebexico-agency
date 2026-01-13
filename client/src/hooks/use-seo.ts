import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import type { SiteConfigType } from "@shared/schema";

type Language = "fr" | "en" | "es";

interface SEOOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

function getLocalizedText(
  lang: Language,
  frField: string | null | undefined,
  enField: string | null | undefined,
  esField: string | null | undefined
): string {
  if (lang === "en" && enField) return enField;
  if (lang === "es" && esField) return esField;
  return frField || "";
}

export function useSEO(options?: SEOOptions) {
  const { language } = useLanguage();
  const lang = (language as Language) || "fr";

  const { data: siteConfig } = useQuery<SiteConfigType | null>({
    queryKey: ["/api/site-config"],
  });

  useEffect(() => {
    const siteName = siteConfig?.siteName || "Mon Site";
    const siteUrl = siteConfig?.customDomain 
      ? `https://${siteConfig.customDomain}` 
      : window.location.origin;

    const defaultTitle = getLocalizedText(
      lang,
      siteConfig?.metaTitleFr,
      siteConfig?.metaTitleEn,
      siteConfig?.metaTitleEs
    ) || siteName;

    const defaultDescription = getLocalizedText(
      lang,
      siteConfig?.metaDescriptionFr,
      siteConfig?.metaDescriptionEn,
      siteConfig?.metaDescriptionEs
    ) || "";

    const title = options?.title 
      ? `${options.title} | ${siteName}` 
      : defaultTitle;
    
    const description = options?.description || defaultDescription;
    const image = options?.image || siteConfig?.logoUrl || "";
    const url = options?.url || siteUrl;

    document.title = title;

    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
      
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute("content", content || "");
    };

    updateMeta("description", description);

    updateMeta("og:title", title, true);
    updateMeta("og:description", description, true);
    updateMeta("og:type", "website", true);
    updateMeta("og:url", url, true);
    const imageUrl = image ? (image.startsWith("http") ? image : `${siteUrl}${image}`) : "";
    updateMeta("og:image", imageUrl, true);

    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", title);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", imageUrl);

  }, [siteConfig, options?.title, options?.description, options?.image, options?.url, lang]);

  return {
    siteName: siteConfig?.siteName || "Mon Site",
    siteUrl: siteConfig?.customDomain 
      ? `https://${siteConfig.customDomain}` 
      : window.location.origin,
  };
}
