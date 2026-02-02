import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Mail, Calendar, Save, Loader2, FileText, Globe } from "lucide-react";
import { SiStripe, SiGoogle, SiMailchimp, SiTwilio } from "react-icons/si";
import { useState, useEffect } from "react";

const getAdminKey = () => localStorage.getItem("quebexico_admin_key") || "";

async function adminRequest<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": getAdminKey(),
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error("Request failed");
  if (res.status === 204) return {} as T;
  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

interface SiteSetting {
  id: number;
  key: string;
  value: string | null;
}

interface Integration {
  id: string;
  name: string;
  description: { fr: string; en: string; es: string };
  icon: React.ReactNode;
  status: "connected" | "available" | "coming_soon";
  category: "payment" | "email" | "calendar" | "maps" | "messaging";
}

function getIntegrations(
  stripeConfigured: boolean,
  tinymceConfigured: boolean,
  directSiteConfigured: boolean
): Integration[] {
  return [
    {
      id: "direct_site",
      name: "Site de réservation (quebexico.com)",
      description: {
        fr: "Connexion à la plateforme pour propriétés et réservations",
        en: "Connect to platform for properties and bookings",
        es: "Conexión a la plataforma para propiedades y reservas",
      },
      icon: <Globe className="w-6 h-6" />,
      status: directSiteConfigured ? "connected" : "available",
      category: "payment",
    },
    {
      id: "stripe",
      name: "Stripe",
      description: {
        fr: "Paiements en ligne sécurisés",
        en: "Secure online payments",
        es: "Pagos en línea seguros",
      },
      icon: <SiStripe className="w-6 h-6" />,
      status: stripeConfigured ? "connected" : "available",
      category: "payment",
    },
    {
      id: "tinymce",
      name: "TinyMCE",
      description: {
        fr: "Éditeur de texte enrichi",
        en: "Rich text editor",
        es: "Editor de texto enriquecido",
      },
      icon: <FileText className="w-6 h-6" />,
      status: tinymceConfigured ? "connected" : "available",
      category: "email",
    },
    {
      id: "google_maps",
      name: "Google Maps",
      description: {
        fr: "Cartes et géolocalisation",
        en: "Maps and geolocation",
        es: "Mapas y geolocalización",
      },
      icon: <SiGoogle className="w-6 h-6" />,
      status: "available",
      category: "maps",
    },
    {
      id: "resend",
      name: "Resend",
      description: {
        fr: "Emails transactionnels",
        en: "Transactional emails",
        es: "Correos transaccionales",
      },
      icon: <Mail className="w-6 h-6" />,
      status: "connected",
      category: "email",
    },
    {
      id: "google_calendar",
      name: "Google Calendar",
      description: {
        fr: "Synchronisation de calendrier",
        en: "Calendar synchronization",
        es: "Sincronización de calendario",
      },
      icon: <Calendar className="w-6 h-6" />,
      status: "coming_soon",
      category: "calendar",
    },
    {
      id: "twilio",
      name: "Twilio",
      description: {
        fr: "SMS et notifications",
        en: "SMS and notifications",
        es: "SMS y notificaciones",
      },
      icon: <SiTwilio className="w-6 h-6" />,
      status: "coming_soon",
      category: "messaging",
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: {
        fr: "Marketing par email",
        en: "Email marketing",
        es: "Marketing por email",
      },
      icon: <SiMailchimp className="w-6 h-6" />,
      status: "coming_soon",
      category: "email",
    },
  ];
}

export default function AdminIntegrations() {
  const { language } = useLanguage();
  const lang = (language === "en" || language === "es" ? language : "fr") as "fr" | "en" | "es";
  const { toast } = useToast();

  const [tinymceApiKey, setTinymceApiKey] = useState("");
  const [directSiteApiUrl, setDirectSiteApiUrl] = useState("");
  const [directSiteApiKey, setDirectSiteApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const { data: stripeStatus, isLoading: stripeLoading } = useQuery<{ configured: boolean }>({
    queryKey: ["/api/integrations/stripe/status"],
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<SiteSetting[]>({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => adminRequest<SiteSetting[]>("GET", "/api/admin/settings"),
  });

  const isLoading = stripeLoading || settingsLoading;

  const tinymceSetting = settings?.find((s) => s.key === "tinymce_api_key");
  const directSiteUrlSetting = settings?.find((s) => s.key === "direct_site_api_url");
  const directSiteKeySetting = settings?.find((s) => s.key === "direct_site_api_key");
  const tinymceConfigured = !!tinymceSetting?.value;
  const directSiteConfigured = !!(directSiteUrlSetting?.value && directSiteKeySetting?.value);

  useEffect(() => {
    if (tinymceSetting?.value) setTinymceApiKey(tinymceSetting.value);
  }, [tinymceSetting]);
  useEffect(() => {
    if (directSiteUrlSetting?.value && directSiteUrlSetting.value !== "***configured***")
      setDirectSiteApiUrl(directSiteUrlSetting.value);
  }, [directSiteUrlSetting]);
  useEffect(() => {
    if (directSiteKeySetting?.value && directSiteKeySetting.value !== "***configured***")
      setDirectSiteApiKey(directSiteKeySetting.value);
  }, [directSiteKeySetting]);

  const saveTinymceKey = async () => {
    setIsSaving(true);
    try {
      await adminRequest("PUT", `/api/admin/settings/tinymce_api_key`, { value: tinymceApiKey || null });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: lang === "en" ? "Setting saved" : lang === "es" ? "Configuración guardada" : "Paramètre sauvegardé" });
      setExpandedCard(null);
    } catch {
      toast({ title: lang === "en" ? "Error" : "Erreur", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const saveDirectSite = async () => {
    setIsSaving(true);
    try {
      await adminRequest("PUT", `/api/admin/settings/direct_site_api_url`, { value: directSiteApiUrl?.trim() || null });
      await adminRequest("PUT", `/api/admin/settings/direct_site_api_key`, { value: directSiteApiKey?.trim() || null });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: lang === "en" ? "Setting saved" : lang === "es" ? "Configuración guardada" : "Paramètre sauvegardé" });
      setExpandedCard(null);
    } catch {
      toast({ title: lang === "en" ? "Error" : "Erreur", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const integrations = getIntegrations(stripeStatus?.configured ?? false, tinymceConfigured, directSiteConfigured);

  const translations = {
    fr: {
      title: "Intégrations",
      subtitle: "Connectez vos services externes et configurez vos clés API",
      connected: "Connecté",
      available: "Disponible",
      comingSoon: "Bientôt",
      configure: "Configurer",
      connect: "Connecter",
      apiKey: "Clé API",
      save: "Enregistrer",
      cancel: "Annuler",
      tinymceDesc: "Obtenez votre clé sur tiny.cloud",
      directSiteUrl: "URL de l'API",
      directSiteKey: "Clé API",
      directSiteHelp: "Sur quebexico.com : Host → Site de réservation → ouvrir le site → onglet API. Sans ces champs (ou sans .env), le module réservation ne charge pas de propriétés.",
    },
    en: {
      title: "Integrations",
      subtitle: "Connect your external services and configure API keys",
      connected: "Connected",
      available: "Available",
      comingSoon: "Coming soon",
      configure: "Configure",
      connect: "Connect",
      apiKey: "API Key",
      save: "Save",
      cancel: "Cancel",
      tinymceDesc: "Get your key at tiny.cloud",
      directSiteUrl: "API URL",
      directSiteKey: "API Key",
      directSiteHelp: "On quebexico.com: Host → Direct Booking Site → open site → API tab. Without these (or .env), the booking module won't load properties.",
    },
    es: {
      title: "Integraciones",
      subtitle: "Conecta tus servicios externos y configura tus claves API",
      connected: "Conectado",
      available: "Disponible",
      comingSoon: "Próximamente",
      configure: "Configurar",
      connect: "Conectar",
      apiKey: "Clave API",
      save: "Guardar",
      cancel: "Cancelar",
      tinymceDesc: "Obtén tu clave en tiny.cloud",
      directSiteUrl: "URL de la API",
      directSiteKey: "Clave API",
      directSiteHelp: "En quebexico.com: Host → Site de réservation → abrir sitio → pestaña API. Sin esto (o .env), el módulo de reservas no cargará propiedades.",
    },
  };

  const t = translations[lang];

  const getStatusBadge = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return <Badge variant="default" className="bg-green-500">{t.connected}</Badge>;
      case "available":
        return <Badge variant="secondary">{t.available}</Badge>;
      case "coming_soon":
        return <Badge variant="outline">{t.comingSoon}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => (
            <Card key={integration.id} data-testid={`card-integration-${integration.id}`}>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  {integration.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                  <CardDescription>{integration.description[lang]}</CardDescription>
                </div>
                {getStatusBadge(integration.status)}
              </CardHeader>
              <CardContent>
                {integration.id === "tinymce" && expandedCard === "tinymce" ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tinymce-api-key">{t.apiKey}</Label>
                      <Input
                        id="tinymce-api-key"
                        type="password"
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        value={tinymceApiKey}
                        onChange={(e) => setTinymceApiKey(e.target.value)}
                        data-testid="input-tinymce-api-key"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t.tinymceDesc}:{" "}
                        <a href="https://www.tiny.cloud/" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                          tiny.cloud
                        </a>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={saveTinymceKey}
                        disabled={isSaving}
                        data-testid="button-save-tinymce-key"
                      >
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {t.save}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setExpandedCard(null)}
                        data-testid="button-cancel-tinymce"
                      >
                        {t.cancel}
                      </Button>
                    </div>
                  </div>
                ) : integration.id === "direct_site" && expandedCard === "direct_site" ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="direct-site-url">{t.directSiteUrl}</Label>
                      <Input
                        id="direct-site-url"
                        type="url"
                        placeholder="https://quebexico.com"
                        value={directSiteApiUrl}
                        onChange={(e) => setDirectSiteApiUrl(e.target.value)}
                        data-testid="input-direct-site-url"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="direct-site-key">{t.directSiteKey}</Label>
                      <Input
                        id="direct-site-key"
                        type="password"
                        placeholder={directSiteConfigured ? "••••••••••••••••" : ""}
                        value={directSiteApiKey}
                        onChange={(e) => setDirectSiteApiKey(e.target.value)}
                        data-testid="input-direct-site-key"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{t.directSiteHelp}</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={saveDirectSite}
                        disabled={isSaving}
                        data-testid="button-save-direct-site"
                      >
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {t.save}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setExpandedCard(null)}
                        data-testid="button-cancel-direct-site"
                      >
                        {t.cancel}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant={integration.status === "connected" ? "outline" : "default"}
                    className="w-full"
                    disabled={integration.status === "coming_soon"}
                    onClick={() => {
                      if (integration.id === "tinymce") setExpandedCard("tinymce");
                      if (integration.id === "direct_site") setExpandedCard("direct_site");
                    }}
                    data-testid={`button-integration-${integration.id}`}
                  >
                    {integration.status === "connected" ? t.configure : t.connect}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
