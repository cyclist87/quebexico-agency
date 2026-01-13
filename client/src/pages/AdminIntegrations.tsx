import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { Mail, Calendar } from "lucide-react";
import { SiStripe, SiGoogle, SiMailchimp, SiTwilio } from "react-icons/si";
import { Loader2 } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: { fr: string; en: string; es: string };
  icon: React.ReactNode;
  status: "connected" | "available" | "coming_soon";
  category: "payment" | "email" | "calendar" | "maps" | "messaging";
}

function getIntegrations(stripeConfigured: boolean): Integration[] {
  return [
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

  const { data: stripeStatus, isLoading } = useQuery<{ configured: boolean }>({
    queryKey: ["/api/integrations/stripe/status"],
  });

  const integrations = getIntegrations(stripeStatus?.configured ?? false);

  const translations = {
    fr: {
      title: "Intégrations",
      subtitle: "Connectez vos services externes",
      connected: "Connecté",
      available: "Disponible",
      comingSoon: "Bientôt",
      configure: "Configurer",
      connect: "Connecter",
    },
    en: {
      title: "Integrations",
      subtitle: "Connect your external services",
      connected: "Connected",
      available: "Available",
      comingSoon: "Coming soon",
      configure: "Configure",
      connect: "Connect",
    },
    es: {
      title: "Integraciones",
      subtitle: "Conecta tus servicios externos",
      connected: "Conectado",
      available: "Disponible",
      comingSoon: "Próximamente",
      configure: "Configurar",
      connect: "Conectar",
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
                <Button
                  variant={integration.status === "connected" ? "outline" : "default"}
                  className="w-full"
                  disabled={integration.status === "coming_soon"}
                  data-testid={`button-integration-${integration.id}`}
                >
                  {integration.status === "connected" ? t.configure : t.connect}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
