import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type TemplateType = "str" | "freelancer" | "sports_club" | "cleaning" | "agency";

export interface TemplateConfig {
  id: TemplateType;
  nameFr: string;
  nameEn: string;
  nameEs: string;
  description: string;
  icon: string;
  features: string[];
}

export const TEMPLATE_CONFIGS: Record<TemplateType, TemplateConfig> = {
  str: {
    id: "str",
    nameFr: "Location courte durée",
    nameEn: "Short-term rental",
    nameEs: "Alquiler a corto plazo",
    description: "Gestion de propriétés, réservations, calendrier",
    icon: "Home",
    features: ["properties", "reservations", "coupons"],
  },
  freelancer: {
    id: "freelancer",
    nameFr: "Freelance / Consultant",
    nameEn: "Freelancer / Consultant",
    nameEs: "Freelancer / Consultor",
    description: "Portfolio, services, rendez-vous",
    icon: "Briefcase",
    features: ["coupons"],
  },
  sports_club: {
    id: "sports_club",
    nameFr: "Club sportif",
    nameEn: "Sports club",
    nameEs: "Club deportivo",
    description: "Membres, événements, inscriptions",
    icon: "Trophy",
    features: ["coupons"],
  },
  cleaning: {
    id: "cleaning",
    nameFr: "Service de ménage",
    nameEn: "Cleaning service",
    nameEs: "Servicio de limpieza",
    description: "Réservations, zones de service, tarifs",
    icon: "Sparkles",
    features: ["coupons"],
  },
  agency: {
    id: "agency",
    nameFr: "Agence créative",
    nameEn: "Creative agency",
    nameEs: "Agencia creativa",
    description: "Portfolio, projets, équipe",
    icon: "Palette",
    features: ["coupons"],
  },
};

interface TemplateContextValue {
  currentTemplate: TemplateType;
  setCurrentTemplate: (template: TemplateType) => void;
  templateConfig: TemplateConfig;
  hasFeature: (feature: string) => boolean;
  availableTemplates: TemplateConfig[];
}

const TemplateContext = createContext<TemplateContextValue | undefined>(undefined);

interface TemplateProviderProps {
  children: ReactNode;
  defaultTemplate?: TemplateType;
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

  const handleSetTemplate = useCallback((template: TemplateType) => {
    setCurrentTemplate(template);
    if (typeof window !== "undefined") {
      localStorage.setItem("quebexico_template", template);
    }
  }, []);

  const templateConfig = TEMPLATE_CONFIGS[currentTemplate];

  const hasFeature = useCallback(
    (feature: string) => templateConfig.features.includes(feature),
    [templateConfig.features]
  );

  const availableTemplates = Object.values(TEMPLATE_CONFIGS);

  return (
    <TemplateContext.Provider
      value={{
        currentTemplate,
        setCurrentTemplate: handleSetTemplate,
        templateConfig,
        hasFeature,
        availableTemplates,
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
