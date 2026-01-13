import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { Mail, CreditCard, QrCode, FileText, ExternalLink } from "lucide-react";

interface Tool {
  id: string;
  name: { fr: string; en: string; es: string };
  description: { fr: string; en: string; es: string };
  icon: React.ReactNode;
  route: string;
  external?: boolean;
}

const TOOLS: Tool[] = [
  {
    id: "email_signature",
    name: {
      fr: "Signature email",
      en: "Email signature",
      es: "Firma de email",
    },
    description: {
      fr: "Créez des signatures email professionnelles",
      en: "Create professional email signatures",
      es: "Crea firmas de email profesionales",
    },
    icon: <Mail className="w-6 h-6" />,
    route: "/tools/signature",
  },
  {
    id: "digital_card",
    name: {
      fr: "Carte de visite digitale",
      en: "Digital business card",
      es: "Tarjeta de visita digital",
    },
    description: {
      fr: "Générez des cartes de visite avec QR code",
      en: "Generate business cards with QR code",
      es: "Genera tarjetas de visita con código QR",
    },
    icon: <QrCode className="w-6 h-6" />,
    route: "/tools/carte",
  },
];

export default function AdminTools() {
  const { language } = useLanguage();
  const lang = (language === "en" || language === "es" ? language : "fr") as "fr" | "en" | "es";

  const translations = {
    fr: {
      title: "Outils",
      subtitle: "Outils à valeur ajoutée pour les hôtes",
      open: "Ouvrir",
    },
    en: {
      title: "Tools",
      subtitle: "Value-added tools for hosts",
      open: "Open",
    },
    es: {
      title: "Herramientas",
      subtitle: "Herramientas de valor agregado para anfitriones",
      open: "Abrir",
    },
  };

  const t = translations[lang];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <Card key={tool.id} data-testid={`card-tool-${tool.id}`}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 rounded-lg bg-muted">
                {tool.icon}
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{tool.name[lang]}</CardTitle>
                <CardDescription>{tool.description[lang]}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={tool.route}>
                <Button className="w-full" data-testid={`button-tool-${tool.id}`}>
                  {t.open}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
