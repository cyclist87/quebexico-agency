import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTemplate, TEMPLATE_CONFIGS, type TemplateType } from "@/contexts/TemplateContext";
import { getModulesForTemplate, getModuleName, type AdminModule } from "@/lib/admin-modules";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Home, ChevronLeft, Settings } from "lucide-react";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const { language } = useLanguage();
  const { currentTemplate, setCurrentTemplate, templateConfig, availableTemplates } = useTemplate();
  const [location] = useLocation();

  const lang = (language === "en" || language === "es" ? language : "fr") as "fr" | "en" | "es";
  const { templateFeatures } = useTemplate();
  const activeModules = getModulesForTemplate(currentTemplate, templateFeatures);
  
  const mainModules = activeModules.filter((m) => m.category === "main");
  const settingsModules = activeModules.filter((m) => m.category === "settings" || m.category === "analytics");

  const getTemplateName = (config: typeof templateConfig) => {
    switch (lang) {
      case "en": return config.nameEn;
      case "es": return config.nameEs;
      default: return config.nameFr;
    }
  };

  const labels = {
    fr: {
      admin: "Administration",
      backToSite: "Retour au site",
      templateSelector: "Type de site",
      mainMenu: "Menu principal",
      settings: "Configuration",
    },
    en: {
      admin: "Administration",
      backToSite: "Back to site",
      templateSelector: "Site type",
      mainMenu: "Main menu",
      settings: "Settings",
    },
    es: {
      admin: "Administración",
      backToSite: "Volver al sitio",
      templateSelector: "Tipo de sitio",
      mainMenu: "Menú principal",
      settings: "Configuración",
    },
  };

  const t = labels[lang];

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="p-4 overflow-visible">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">{t.admin}</span>
            </div>
            <div className="relative">
              <Select value={currentTemplate} onValueChange={(v) => setCurrentTemplate(v as TemplateType)}>
                <SelectTrigger className="w-full" data-testid="select-template-type">
                  <SelectValue placeholder={t.templateSelector} />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" align="start" className="bg-background border shadow-lg">
                  {availableTemplates.map((tmpl) => (
                    <SelectItem key={tmpl.id} value={tmpl.id} data-testid={`select-template-${tmpl.id}`}>
                      {getTemplateName(tmpl)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <ScrollArea className="flex-1">
              <SidebarGroup>
                <SidebarGroupLabel>{t.mainMenu}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {mainModules.map((module) => (
                      <ModuleMenuItem
                        key={module.id}
                        module={module}
                        lang={lang}
                        isActive={location === module.route}
                      />
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {settingsModules.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <SidebarGroup>
                    <SidebarGroupLabel>{t.settings}</SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {settingsModules.map((module) => (
                          <ModuleMenuItem
                            key={module.id}
                            module={module}
                            lang={lang}
                            isActive={location === module.route}
                          />
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                </>
              )}
            </ScrollArea>
          </SidebarContent>

          <SidebarFooter className="p-4">
            <Link href="/">
              <Button variant="outline" className="w-full gap-2" data-testid="button-back-to-site">
                <ChevronLeft className="h-4 w-4" />
                {t.backToSite}
              </Button>
            </Link>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto bg-background">
          <div className="flex items-center gap-2 p-4 border-b lg:hidden">
            <SidebarTrigger data-testid="button-admin-sidebar-toggle" />
            <span className="font-semibold">{t.admin}</span>
          </div>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

interface ModuleMenuItemProps {
  module: AdminModule;
  lang: "fr" | "en" | "es";
  isActive: boolean;
}

function ModuleMenuItem({ module, lang, isActive }: ModuleMenuItemProps) {
  const Icon = module.icon;
  
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={module.route} data-testid={`nav-admin-${module.id}`}>
          <Icon className="h-4 w-4" />
          <span>{getModuleName(module, lang)}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
