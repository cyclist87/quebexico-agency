import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Save, Globe, Bell, Shield, Cpu, Loader2, AlertTriangle, Zap, Trash2, Palette } from "lucide-react";

const getAdminKey = () => localStorage.getItem("quebexico_admin_key") || "";
const MONTHLY_TOKEN_LIMIT = 3000000;

async function adminRequest<T>(method: string, url: string, data?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-admin-key": getAdminKey(),
  };
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

function getUsageStatus(tokensUsed: number, limit: number) {
  const percentage = (tokensUsed / limit) * 100;
  if (percentage >= 100) return { level: "exceeded", color: "destructive" as const };
  if (percentage >= 80) return { level: "warning", color: "warning" as const };
  if (percentage >= 50) return { level: "medium", color: "secondary" as const };
  return { level: "low", color: "default" as const };
}

interface AiUsageStats {
  totalTokens: number;
  totalCost: number;
  usageByDay: { date: string; tokens: number; cost: number }[];
  customKeyUsage: number;
  platformKeyUsage: number;
}

interface SiteSetting {
  id: number;
  key: string;
  value: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSettingsPage() {
  const { language } = useLanguage();
  const lang = (language === "en" || language === "es" ? language : "fr") as "fr" | "en" | "es";

  const translations = {
    fr: {
      title: "Paramètres",
      subtitle: "Configuration générale de votre site",
      general: "Général",
      appearance: "Apparence",
      ai: "Intelligence artificielle",
      notifications: "Notifications",
      security: "Sécurité",
      siteName: "Nom du site",
      siteDescription: "Description",
      contactEmail: "Email de contact",
      save: "Enregistrer",
      darkMode: "Mode sombre",
      primaryColor: "Couleur principale",
      emailNotifications: "Notifications par email",
      smsNotifications: "Notifications SMS",
      twoFactor: "Authentification à deux facteurs",
      sessionTimeout: "Expiration de session (minutes)",
      openaiTitle: "Assistant IA (OpenAI)",
      openaiDesc: "Configurez votre propre clé pour un usage illimité.",
      openaiKey: "Clé API OpenAI",
      usageTitle: "Consommation IA",
      usageDesc: "Suivez l'utilisation du chatbot IA sur les 30 derniers jours",
      usageThisMonth: "Utilisation ce mois-ci",
      creditsRemaining: "crédits restants",
      limitReached: "Limite de crédits atteinte",
      limitReachedDesc: "Vous avez utilisé tous vos crédits IA inclus. Pour continuer à utiliser le chatbot, vous pouvez passer au forfait supérieur ou configurer votre propre clé OpenAI.",
      validateAndSave: "Valider et sauvegarder",
      customKeyActive: "Clé personnalisée active",
      keyConfigured: "Clé configurée",
      unlimitedUsage: "Votre clé OpenAI personnalisée est active (usage illimité)",
      removeKey: "Supprimer et revenir aux crédits inclus",
      totalTokens: "Tokens totaux",
      estimatedCost: "Coût estimé",
      platformKey: "Clé plateforme",
      customKey: "Clé personnalisée",
      dailyUsage: "Usage quotidien",
      noUsage: "Aucune utilisation enregistrée pour le moment.",
      loading: "Chargement...",
    },
    en: {
      title: "Settings",
      subtitle: "General configuration for your site",
      general: "General",
      appearance: "Appearance",
      ai: "Artificial Intelligence",
      notifications: "Notifications",
      security: "Security",
      siteName: "Site name",
      siteDescription: "Description",
      contactEmail: "Contact email",
      save: "Save",
      darkMode: "Dark mode",
      primaryColor: "Primary color",
      emailNotifications: "Email notifications",
      smsNotifications: "SMS notifications",
      twoFactor: "Two-factor authentication",
      sessionTimeout: "Session timeout (minutes)",
      openaiTitle: "AI Assistant (OpenAI)",
      openaiDesc: "Configure your own key for unlimited usage.",
      openaiKey: "OpenAI API Key",
      usageTitle: "AI Consumption",
      usageDesc: "Track AI chatbot usage over the last 30 days",
      usageThisMonth: "Usage this month",
      creditsRemaining: "credits remaining",
      limitReached: "Credit limit reached",
      limitReachedDesc: "You've used all your included AI credits. To continue using the chatbot, you can upgrade your plan or configure your own OpenAI key.",
      validateAndSave: "Validate and save",
      customKeyActive: "Custom key active",
      keyConfigured: "Key configured",
      unlimitedUsage: "Your custom OpenAI key is active (unlimited usage)",
      removeKey: "Remove and return to included credits",
      totalTokens: "Total tokens",
      estimatedCost: "Estimated cost",
      platformKey: "Platform key",
      customKey: "Custom key",
      dailyUsage: "Daily usage",
      noUsage: "No usage recorded yet.",
      loading: "Loading...",
    },
    es: {
      title: "Configuración",
      subtitle: "Configuración general de tu sitio",
      general: "General",
      appearance: "Apariencia",
      ai: "Inteligencia Artificial",
      notifications: "Notificaciones",
      security: "Seguridad",
      siteName: "Nombre del sitio",
      siteDescription: "Descripción",
      contactEmail: "Email de contacto",
      save: "Guardar",
      darkMode: "Modo oscuro",
      primaryColor: "Color principal",
      emailNotifications: "Notificaciones por email",
      smsNotifications: "Notificaciones SMS",
      twoFactor: "Autenticación de dos factores",
      sessionTimeout: "Expiración de sesión (minutos)",
      openaiTitle: "Asistente IA (OpenAI)",
      openaiDesc: "Configura tu propia clave para uso ilimitado.",
      openaiKey: "Clave API OpenAI",
      usageTitle: "Consumo IA",
      usageDesc: "Sigue el uso del chatbot IA en los últimos 30 días",
      usageThisMonth: "Uso este mes",
      creditsRemaining: "créditos restantes",
      limitReached: "Límite de créditos alcanzado",
      limitReachedDesc: "Has usado todos tus créditos IA incluidos. Para continuar usando el chatbot, puedes actualizar tu plan o configurar tu propia clave OpenAI.",
      validateAndSave: "Validar y guardar",
      customKeyActive: "Clave personalizada activa",
      keyConfigured: "Clave configurada",
      unlimitedUsage: "Tu clave OpenAI personalizada está activa (uso ilimitado)",
      removeKey: "Eliminar y volver a créditos incluidos",
      totalTokens: "Tokens totales",
      estimatedCost: "Costo estimado",
      platformKey: "Clave plataforma",
      customKey: "Clave personalizada",
      dailyUsage: "Uso diario",
      noUsage: "Ningún uso registrado por el momento.",
      loading: "Cargando...",
    },
  };

  const t = translations[lang];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="flex-wrap gap-1">
          <TabsTrigger value="general" data-testid="tab-general">
            <Globe className="w-4 h-4 mr-2" />
            {t.general}
          </TabsTrigger>
          <TabsTrigger value="appearance" data-testid="tab-appearance">
            <Palette className="w-4 h-4 mr-2" />
            {t.appearance}
          </TabsTrigger>
          <TabsTrigger value="ai" data-testid="tab-ai">
            <Cpu className="w-4 h-4 mr-2" />
            {t.ai}
          </TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">
            <Bell className="w-4 h-4 mr-2" />
            {t.notifications}
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            <Shield className="w-4 h-4 mr-2" />
            {t.security}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettingsCard t={t} />
        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceCard t={t} />
        </TabsContent>

        <TabsContent value="ai">
          <AiSettingsTab t={t} lang={lang} />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsCard t={t} />
        </TabsContent>

        <TabsContent value="security">
          <SecurityCard t={t} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GeneralSettingsCard({ t }: { t: Record<string, string> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.general}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="siteName">{t.siteName}</Label>
          <Input id="siteName" placeholder="Mon Site" data-testid="input-site-name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="siteDescription">{t.siteDescription}</Label>
          <Input id="siteDescription" placeholder="Description de mon site" data-testid="input-site-description" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactEmail">{t.contactEmail}</Label>
          <Input id="contactEmail" type="email" placeholder="contact@example.com" data-testid="input-contact-email" />
        </div>
        <Button data-testid="button-save-general">
          <Save className="w-4 h-4 mr-2" />
          {t.save}
        </Button>
      </CardContent>
    </Card>
  );
}

function AppearanceCard({ t }: { t: Record<string, string> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.appearance}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="darkMode">{t.darkMode}</Label>
          <Switch id="darkMode" data-testid="switch-dark-mode" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="primaryColor">{t.primaryColor}</Label>
          <Input id="primaryColor" type="color" className="w-20 h-10" data-testid="input-primary-color" />
        </div>
        <Button data-testid="button-save-appearance">
          <Save className="w-4 h-4 mr-2" />
          {t.save}
        </Button>
      </CardContent>
    </Card>
  );
}

function NotificationsCard({ t }: { t: Record<string, string> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.notifications}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="emailNotifications">{t.emailNotifications}</Label>
          <Switch id="emailNotifications" defaultChecked data-testid="switch-email-notifications" />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="smsNotifications">{t.smsNotifications}</Label>
          <Switch id="smsNotifications" data-testid="switch-sms-notifications" />
        </div>
        <Button data-testid="button-save-notifications">
          <Save className="w-4 h-4 mr-2" />
          {t.save}
        </Button>
      </CardContent>
    </Card>
  );
}

function SecurityCard({ t }: { t: Record<string, string> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.security}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="twoFactor">{t.twoFactor}</Label>
          <Switch id="twoFactor" data-testid="switch-two-factor" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sessionTimeout">{t.sessionTimeout}</Label>
          <Input id="sessionTimeout" type="number" defaultValue="30" className="w-24" data-testid="input-session-timeout" />
        </div>
        <Button data-testid="button-save-security">
          <Save className="w-4 h-4 mr-2" />
          {t.save}
        </Button>
      </CardContent>
    </Card>
  );
}

function AiSettingsTab({ t, lang }: { t: Record<string, string>; lang: "fr" | "en" | "es" }) {
  const { toast } = useToast();
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [openaiKeyStatus, setOpenaiKeyStatus] = useState<"none" | "valid" | "invalid" | "configured">("none");

  const { data: settings, isLoading } = useQuery<SiteSetting[]>({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      return adminRequest<SiteSetting[]>("GET", "/api/admin/settings");
    },
  });

  const { data: usageStats } = useQuery<AiUsageStats>({
    queryKey: ["/api/admin/ai-usage"],
    queryFn: async () => {
      return adminRequest<AiUsageStats>("GET", "/api/admin/ai-usage");
    },
  });

  useEffect(() => {
    if (settings) {
      const openaiSetting = settings.find(s => s.key === "openai_api_key");
      if (openaiSetting?.value) {
        setOpenaiKeyStatus("configured");
      }
    }
  }, [settings]);

  const saveSetting = async (key: string, value: string | null) => {
    setIsSaving(true);
    try {
      await adminRequest("PUT", `/api/admin/settings/${key}`, { value });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: lang === "en" ? "Setting saved" : lang === "es" ? "Configuración guardada" : "Paramètre sauvegardé" });
    } catch {
      toast({ title: lang === "en" ? "Error" : "Erreur", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const validateAndSaveOpenAIKey = async () => {
    if (!openaiApiKey.trim()) return;

    setIsValidating(true);
    try {
      const result = await adminRequest<{ valid: boolean; error?: string }>(
        "POST",
        "/api/admin/settings/validate-openai-key",
        { apiKey: openaiApiKey }
      );

      if (result.valid) {
        setOpenaiKeyStatus("valid");
        await saveSetting("openai_api_key", openaiApiKey);
        setOpenaiApiKey("");
        setOpenaiKeyStatus("configured");
      } else {
        setOpenaiKeyStatus("invalid");
        toast({ title: lang === "en" ? "Invalid API key" : "Clé API invalide", variant: "destructive" });
      }
    } catch {
      setOpenaiKeyStatus("invalid");
    } finally {
      setIsValidating(false);
    }
  };

  const removeOpenAIKey = async () => {
    setIsSaving(true);
    try {
      await adminRequest("PUT", `/api/admin/settings/openai_api_key`, { value: null });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      setOpenaiKeyStatus("none");
      setOpenaiApiKey("");
    } catch {
      toast({ title: lang === "en" ? "Error" : "Erreur", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-muted-foreground text-center">{t.loading}</p>
        </CardContent>
      </Card>
    );
  }

  const tokensUsed = usageStats?.platformKeyUsage || 0;
  const usagePercentage = Math.min((tokensUsed / MONTHLY_TOKEN_LIMIT) * 100, 100);
  const status = getUsageStatus(tokensUsed, MONTHLY_TOKEN_LIMIT);
  const tokensRemaining = Math.max(MONTHLY_TOKEN_LIMIT - tokensUsed, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t.openaiTitle}
            {openaiKeyStatus === "configured" && (
              <Badge variant="secondary">{t.customKeyActive}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t.usageThisMonth}</span>
                <span className="text-sm text-muted-foreground">
                  {tokensUsed.toLocaleString()} / {MONTHLY_TOKEN_LIMIT.toLocaleString()} tokens
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              
              {status.level === "exceeded" ? (
                <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-destructive">{t.limitReached}</p>
                    <p className="text-sm text-muted-foreground">{t.limitReachedDesc}</p>
                  </div>
                </div>
              ) : status.level === "warning" ? (
                <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                  <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    {tokensRemaining.toLocaleString()} {t.creditsRemaining}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {tokensRemaining.toLocaleString()} {t.creditsRemaining}
                </p>
              )}
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">{t.openaiKey}</h4>
              <p className="text-sm text-muted-foreground mb-4">
                {t.openaiDesc}{" "}
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  OpenAI
                </a>
              </p>
              
              {openaiKeyStatus === "configured" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-md">
                    <Badge variant="outline">{t.keyConfigured}</Badge>
                    <span className="text-sm text-muted-foreground">{t.unlimitedUsage}</span>
                  </div>
                  <Button variant="outline" onClick={removeOpenAIKey} disabled={isSaving} data-testid="button-remove-openai-key">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    {t.removeKey}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={openaiApiKey}
                    onChange={(e) => {
                      setOpenaiApiKey(e.target.value);
                      setOpenaiKeyStatus("none");
                    }}
                    data-testid="input-openai-api-key"
                  />
                  {openaiKeyStatus === "invalid" && (
                    <p className="text-sm text-destructive">
                      {lang === "en" ? "Invalid key" : lang === "es" ? "Clave inválida" : "Clé invalide"}
                    </p>
                  )}
                  <Button onClick={validateAndSaveOpenAIKey} disabled={isValidating || !openaiApiKey.trim()} data-testid="button-save-openai-key">
                    {isValidating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {t.validateAndSave}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AiUsageCard t={t} lang={lang} />
    </div>
  );
}

function AiUsageCard({ t, lang }: { t: Record<string, string>; lang: "fr" | "en" | "es" }) {
  const { data: stats, isLoading } = useQuery<AiUsageStats>({
    queryKey: ["/api/admin/ai-usage"],
    queryFn: async () => {
      return adminRequest<AiUsageStats>("GET", "/api/admin/ai-usage");
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.usageTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">{t.loading}</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalTokens === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.usageTitle}</CardTitle>
          <CardDescription>{t.usageDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">{t.noUsage}</p>
        </CardContent>
      </Card>
    );
  }

  const platformPercentage = stats.totalTokens > 0 
    ? Math.round((stats.platformKeyUsage / stats.totalTokens) * 100) 
    : 0;
  const customPercentage = 100 - platformPercentage;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.usageTitle} (30 {lang === "en" ? "days" : lang === "es" ? "días" : "jours"})</CardTitle>
        <CardDescription>{t.usageDesc}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-secondary/50 rounded-md text-center">
            <p className="text-2xl font-bold">{stats.totalTokens.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{t.totalTokens}</p>
          </div>
          <div className="p-4 bg-secondary/50 rounded-md text-center">
            <p className="text-2xl font-bold">${parseFloat(stats.totalCost.toFixed(4))}</p>
            <p className="text-sm text-muted-foreground">{t.estimatedCost}</p>
          </div>
          <div className="p-4 bg-secondary/50 rounded-md text-center">
            <p className="text-2xl font-bold">{platformPercentage}%</p>
            <p className="text-sm text-muted-foreground">{t.platformKey}</p>
          </div>
          <div className="p-4 bg-secondary/50 rounded-md text-center">
            <p className="text-2xl font-bold">{customPercentage}%</p>
            <p className="text-sm text-muted-foreground">{t.customKey}</p>
          </div>
        </div>

        {stats.usageByDay.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">{t.dailyUsage}</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {stats.usageByDay.slice(-7).reverse().map((day) => (
                <div key={day.date} className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                  <span className="text-sm">
                    {new Date(day.date).toLocaleDateString(lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "fr-FR", { 
                      weekday: "short", 
                      day: "numeric", 
                      month: "short" 
                    })}
                  </span>
                  <span className="text-sm font-medium">{day.tokens.toLocaleString()} tokens</span>
                  <span className="text-sm text-muted-foreground">${parseFloat(day.cost.toFixed(4))}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
