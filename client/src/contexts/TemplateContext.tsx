import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export type TemplateType = "str" | "freelancer" | "sports_club" | "cleaning" | "agency";
type TemplateFeatures = Record<TemplateType, string[]>;

interface TemplateFeatureRecord {
  id: number;
  templateType: string;
  enabledFeatures: string[];
}

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
  updateTemplateFeatures: (features: TemplateFeatures) => Promise<void>;
  isLoading: boolean;
  refetchFeatures: () => void;
}

const TemplateContext = createContext<TemplateContextValue | undefined>(undefined);

interface TemplateProviderProps {
  children: ReactNode;
  defaultTemplate?: TemplateType;
}

function getAdminKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("quebexico_admin_key") || "";
}

async function fetchTemplateFeatures(): Promise<TemplateFeatureRecord[]> {
  if (typeof window === "undefined") return [];
  try {
    const res = await fetch("/api/admin/template-features", {
      headers: { "x-admin-key": getAdminKey() },
      credentials: "include",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function saveTemplateFeatures(features: TemplateFeatures): Promise<void> {
  if (typeof window === "undefined") return;
  await fetch("/api/admin/template-features", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": getAdminKey(),
    },
    credentials: "include",
    body: JSON.stringify({ features }),
  });
}

function getEffectiveFeatures(
  template: TemplateType,
  serverFeatures: TemplateFeatureRecord[]
): string[] {
  const serverRecord = serverFeatures.find(f => f.templateType === template);
  if (serverRecord && serverRecord.enabledFeatures.length > 0) {
    return serverRecord.enabledFeatures;
  }
  return TEMPLATE_CONFIGS[template].features;
}

export function TemplateProvider({ children, defaultTemplate = "str" }: TemplateProviderProps) {
  const queryClient = useQueryClient();
  
  const [currentTemplate, setCurrentTemplate] = useState<TemplateType>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("quebexico_template");
      if (stored && stored in TEMPLATE_CONFIGS) {
        return stored as TemplateType;
      }
    }
    return defaultTemplate;
  });

  const { data: serverFeatures = [], isLoading, refetch } = useQuery<TemplateFeatureRecord[]>({
    queryKey: ["/api/admin/template-features"],
    queryFn: fetchTemplateFeatures,
    staleTime: 1000 * 60 * 5,
  });

  const handleSetTemplate = useCallback((template: TemplateType) => {
    setCurrentTemplate(template);
    if (typeof window !== "undefined") {
      localStorage.setItem("quebexico_template", template);
    }
  }, []);

  const updateTemplateFeatures = useCallback(async (features: TemplateFeatures) => {
    await saveTemplateFeatures(features);
    queryClient.invalidateQueries({ queryKey: ["/api/admin/template-features"] });
  }, [queryClient]);

  const templateConfig = TEMPLATE_CONFIGS[currentTemplate];
  const templateFeatures = getEffectiveFeatures(currentTemplate, serverFeatures);

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
        isLoading,
        refetchFeatures: refetch,
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
