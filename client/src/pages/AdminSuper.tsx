import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { TEMPLATE_CONFIGS, useTemplate, type TemplateType } from "@/contexts/TemplateContext";
import { ADMIN_MODULES, getModuleName } from "@/lib/admin-modules";
import { Save, Shield, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type TemplateFeatures = Record<TemplateType, string[]>;

interface TemplateFeatureRecord {
  id: number;
  templateType: string;
  enabledFeatures: string[];
}

function getAdminKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("quebexico_admin_key") || "";
}

function getDefaultFeatures(): TemplateFeatures {
  const initial: TemplateFeatures = {} as TemplateFeatures;
  Object.entries(TEMPLATE_CONFIGS).forEach(([key, config]) => {
    initial[key as TemplateType] = [...config.features];
  });
  return initial;
}

async function fetchTemplateFeatures(): Promise<TemplateFeatureRecord[]> {
  const res = await fetch("/api/admin/template-features", {
    headers: { "x-admin-key": getAdminKey() },
    credentials: "include",
  });
  if (!res.ok) return [];
  return await res.json();
}

function serverToLocal(records: TemplateFeatureRecord[]): TemplateFeatures {
  const defaults = getDefaultFeatures();
  records.forEach(record => {
    if (record.templateType in defaults) {
      defaults[record.templateType as TemplateType] = record.enabledFeatures;
    }
  });
  return defaults;
}

export default function AdminSuper() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { refetchFeatures } = useTemplate();
  const lang = (language === "en" || language === "es" ? language : "fr") as "fr" | "en" | "es";

  const { data: serverRecords = [], isLoading } = useQuery<TemplateFeatureRecord[]>({
    queryKey: ["/api/admin/template-features"],
    queryFn: fetchTemplateFeatures,
  });

  const [templateFeatures, setTemplateFeatures] = useState<TemplateFeatures>(() => getDefaultFeatures());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (serverRecords.length > 0) {
      setTemplateFeatures(serverToLocal(serverRecords));
    }
  }, [serverRecords]);

  const translations = {
    fr: {
      title: "Super Admin",
      subtitle: "Configurer les modules disponibles pour chaque type de template",
      templateConfig: "Configuration des templates",
      availableModules: "Modules disponibles",
      save: "Enregistrer",
      reset: "Réinitialiser",
      saved: "Configuration sauvegardée",
      savedDescription: "Les changements sont maintenant actifs",
      error: "Erreur lors de la sauvegarde",
    },
    en: {
      title: "Super Admin",
      subtitle: "Configure available modules for each template type",
      templateConfig: "Template configuration",
      availableModules: "Available modules",
      save: "Save",
      reset: "Reset",
      saved: "Configuration saved",
      savedDescription: "Changes are now active",
      error: "Error saving configuration",
    },
    es: {
      title: "Super Admin",
      subtitle: "Configurar los módulos disponibles para cada tipo de template",
      templateConfig: "Configuración de templates",
      availableModules: "Módulos disponibles",
      save: "Guardar",
      reset: "Reiniciar",
      saved: "Configuración guardada",
      savedDescription: "Los cambios están activos ahora",
      error: "Error al guardar",
    },
  };

  const t = translations[lang];

  const getTemplateName = (template: TemplateType) => {
    const config = TEMPLATE_CONFIGS[template];
    switch (lang) {
      case "en": return config.nameEn;
      case "es": return config.nameEs;
      default: return config.nameFr;
    }
  };

  const allModuleIds = ADMIN_MODULES.map(m => m.requiredFeature);
  const uniqueModuleIds = Array.from(new Set(allModuleIds));

  const toggleFeature = (template: TemplateType, feature: string) => {
    setTemplateFeatures(prev => {
      const current = prev[template] || [];
      if (current.includes(feature)) {
        return { ...prev, [template]: current.filter(f => f !== feature) };
      } else {
        return { ...prev, [template]: [...current, feature] };
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/template-features", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": getAdminKey(),
        },
        credentials: "include",
        body: JSON.stringify({ features: templateFeatures }),
      });

      if (!res.ok) throw new Error("Save failed");

      queryClient.invalidateQueries({ queryKey: ["/api/admin/template-features"] });
      refetchFeatures();
      
      toast({
        title: t.saved,
        description: t.savedDescription,
      });
    } catch {
      toast({
        title: t.error,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    const defaults = getDefaultFeatures();
    setTemplateFeatures(defaults);
    
    setIsSaving(true);
    try {
      await fetch("/api/admin/template-features", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": getAdminKey(),
        },
        credentials: "include",
        body: JSON.stringify({ features: defaults }),
      });

      queryClient.invalidateQueries({ queryKey: ["/api/admin/template-features"] });
      refetchFeatures();
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={isSaving} data-testid="button-save-super">
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {t.save}
        </Button>
        <Button variant="outline" onClick={handleReset} disabled={isSaving} data-testid="button-reset-super">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t.reset}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {(Object.keys(TEMPLATE_CONFIGS) as TemplateType[]).map((template) => (
          <Card key={template} data-testid={`card-template-${template}`}>
            <CardHeader>
              <CardTitle>{getTemplateName(template)}</CardTitle>
              <CardDescription>{TEMPLATE_CONFIGS[template].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {uniqueModuleIds.map((moduleId) => {
                const module = ADMIN_MODULES.find(m => m.requiredFeature === moduleId);
                if (!module) return null;
                
                const isEnabled = templateFeatures[template]?.includes(moduleId) || false;
                const isApplicable = module.templates === "all" || module.templates.includes(template);

                return (
                  <div key={moduleId} className="flex items-center gap-3">
                    <Checkbox
                      id={`${template}-${moduleId}`}
                      checked={isEnabled}
                      onCheckedChange={() => toggleFeature(template, moduleId)}
                      disabled={!isApplicable}
                      data-testid={`checkbox-${template}-${moduleId}`}
                    />
                    <Label
                      htmlFor={`${template}-${moduleId}`}
                      className={!isApplicable ? "text-muted-foreground" : ""}
                    >
                      {getModuleName(module, lang)}
                      {!isApplicable && " (N/A)"}
                    </Label>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
