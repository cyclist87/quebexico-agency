import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { TEMPLATE_CONFIGS, type TemplateType } from "@/contexts/TemplateContext";
import { ADMIN_MODULES, getModuleName } from "@/lib/admin-modules";
import { Save, Shield, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type TemplateFeatures = Record<TemplateType, string[]>;

export default function AdminSuper() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const lang = (language === "en" || language === "es" ? language : "fr") as "fr" | "en" | "es";

  const [templateFeatures, setTemplateFeatures] = useState<TemplateFeatures>(() => {
    const initial: TemplateFeatures = {} as TemplateFeatures;
    Object.entries(TEMPLATE_CONFIGS).forEach(([key, config]) => {
      initial[key as TemplateType] = [...config.features];
    });
    return initial;
  });

  const translations = {
    fr: {
      title: "Super Admin",
      subtitle: "Configurer les modules disponibles pour chaque type de template",
      templateConfig: "Configuration des templates",
      availableModules: "Modules disponibles",
      save: "Enregistrer",
      reset: "Réinitialiser",
      saved: "Configuration sauvegardée",
      savedDescription: "Les changements prendront effet après rechargement",
    },
    en: {
      title: "Super Admin",
      subtitle: "Configure available modules for each template type",
      templateConfig: "Template configuration",
      availableModules: "Available modules",
      save: "Save",
      reset: "Reset",
      saved: "Configuration saved",
      savedDescription: "Changes will take effect after reload",
    },
    es: {
      title: "Super Admin",
      subtitle: "Configurar los módulos disponibles para cada tipo de template",
      templateConfig: "Configuración de templates",
      availableModules: "Módulos disponibles",
      save: "Guardar",
      reset: "Reiniciar",
      saved: "Configuración guardada",
      savedDescription: "Los cambios tendrán efecto después de recargar",
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
  const uniqueModuleIds = [...new Set(allModuleIds)];

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

  const handleSave = () => {
    localStorage.setItem("qbx_template_features", JSON.stringify(templateFeatures));
    toast({
      title: t.saved,
      description: t.savedDescription,
    });
  };

  const handleReset = () => {
    const initial: TemplateFeatures = {} as TemplateFeatures;
    Object.entries(TEMPLATE_CONFIGS).forEach(([key, config]) => {
      initial[key as TemplateType] = [...config.features];
    });
    setTemplateFeatures(initial);
  };

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
        <Button onClick={handleSave} data-testid="button-save-super">
          <Save className="w-4 h-4 mr-2" />
          {t.save}
        </Button>
        <Button variant="outline" onClick={handleReset} data-testid="button-reset-super">
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
