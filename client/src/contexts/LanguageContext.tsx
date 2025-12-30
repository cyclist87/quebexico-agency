import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { translations, type Language, type Translations } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const detectBrowserLanguage = (): Language => {
  if (typeof window === "undefined") return "fr";
  
  const browserLang = navigator.language || (navigator as any).userLanguage || "";
  const langCode = browserLang.split("-")[0].toLowerCase();
  
  if (langCode === "en") return "en";
  if (langCode === "es") return "es";
  if (langCode === "fr") return "fr";
  
  return "fr";
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language") as Language;
      if (saved && ["fr", "en", "es"].includes(saved)) {
        return saved;
      }
      return detectBrowserLanguage();
    }
    return "fr";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
