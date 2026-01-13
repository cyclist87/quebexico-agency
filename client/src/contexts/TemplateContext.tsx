import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export type TemplateType = "str" | "freelancer" | "sports_club" | "cleaning" | "agency";
type TemplateFeatures = Record<TemplateType, string[]>;

export interface TemplateConfig {
  id: TemplateType;
  nameFr: string;
  nameEn: string;
  nameEs: string;
  description: string;
  icon: string;
  features: string[];
}

const COMMON_FEATURES = ["coupons", "content", "appearance", "integrations", "tools", "settings", "super_admin"];

export const TEMPLATE_CONFIGS: Record<TemplateType, TemplateConfig> = {
  str: {
    id: "str",
    nameFr: "Location courte durée",
    nameEn: "Short-term rental",
    nameEs: "Alquiler a corto plazo",
    description: "Gestion de propriétés, réservations, calendrier",
    icon: "Home",
    features: ["properties", "reservations", ...COMMON_FEATURES],
  },
  freelancer: {
    id: "freelancer",
    nameFr: "Freelance / Consultant",
    nameEn: "Freelancer / Consultant",
    nameEs: "Freelancer / Consultor",
    description: "Portfolio, services, rendez-vous",
    icon: "Briefcase",
    features: [...COMMON_FEATURES],
  },
  sports_club: {
    id: "sports_club",
    nameFr: "Club sportif",
    nameEn: "Sports club",
    nameEs: "Club deportivo",
    description: "Membres, événements, inscriptions",
    icon: "Trophy",
    features: [...COMMON_FEATURES],
  },
  cleaning: {
    id: "cleaning",
    nameFr: "Service de ménage",
    nameEn: "Cleaning service",
    nameEs: "Servicio de limpieza",
    description: "Réservations, zones de service, tarifs",
    icon: "Sparkles",
    features: [...COMMON_FEATURES],
  },
  agency: {
    id: "agency",
    nameFr: "Agence créative",
    nameEn: "Creative agency",
    nameEs: "Agencia creativa",
    description: "Portfolio, projets, équipe",
    icon: "Palette",
    features: [...COMMON_FEATURES],
  },
};

interface TemplateContextValue {
  currentTemplate: TemplateType;
  setCurrentTemplate: (template: TemplateType) => void;
  templateConfig: TemplateConfig;
  templateFeatures: string[];
  hasFeature: (feature: string) => boolean;
  availableTemplates: TemplateConfig[];
  updateTemplateFeatures: (features: TemplateFeatures) => void;
}

const TemplateContext = createContext<TemplateContextValue | undefined>(undefined);

interface TemplateProviderProps {
  children: ReactNode;
  defaultTemplate?: TemplateType;
}

function loadFeatureOverrides(): TemplateFeatures | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("qbx_template_features");
    if (stored) {
      return JSON.parse(stored) as TemplateFeatures;
    }
  } catch (e) {
    console.error("Failed to parse template features from localStorage", e);
  }
  return null;
}

function getEffectiveFeatures(template: TemplateType, overrides: TemplateFeatures | null): string[] {
  if (overrides && overrides[template]) {
    return overrides[template];
  }
  return TEMPLATE_CONFIGS[template].features;
}

export function TemplateProvider({ children, defaultTemplate = "str" }: TemplateProviderProps) {
  const [currentTemplate, setCurrentTemplate] = useState<TemplateType>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("quebexico_template");
      if (stored && stored in TEMPLATE_CONFIGS) {
        return stored as TemplateType;
      }
    }
    return defaultTemplate;
  });

  const [featureOverrides, setFeatureOverrides] = useState<TemplateFeatures | null>(() => loadFeatureOverrides());

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "qbx_template_features") {
        setFeatureOverrides(loadFeatureOverrides());
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleSetTemplate = useCallback((template: TemplateType) => {
    setCurrentTemplate(template);
    if (typeof window !== "undefined") {
      localStorage.setItem("quebexico_template", template);
    }
  }, []);

  const updateTemplateFeatures = useCallback((features: TemplateFeatures) => {
    setFeatureOverrides(features);
    localStorage.setItem("qbx_template_features", JSON.stringify(features));
  }, []);

  const templateConfig = TEMPLATE_CONFIGS[currentTemplate];
  const templateFeatures = getEffectiveFeatures(currentTemplate, featureOverrides);

  const hasFeature = useCallback(
    (feature: string) => templateFeatures.includes(feature),
    [templateFeatures]
  );

  const availableTemplates = Object.values(TEMPLATE_CONFIGS);

  return (
    <TemplateContext.Provider
      value={{
        currentTemplate,
        setCurrentTemplate: handleSetTemplate,
        templateConfig,
        templateFeatures,
        hasFeature,
        availableTemplates,
        updateTemplateFeatures,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplate(): TemplateContextValue {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error("useTemplate must be used within a TemplateProvider");
  }
  return context;
}
