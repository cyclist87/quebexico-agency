import { useLanguage } from "@/contexts/LanguageContext";

export default function Cookies() {
  const { language } = useLanguage();

  const content = {
    fr: {
      title: "Politique de Cookies",
      sections: [
        {
          title: "Qu'est-ce qu'un cookie ?",
          text: "Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez un site web. Il permet au site de se souvenir de vos préférences."
        },
        {
          title: "Cookies essentiels",
          text: "Nous utilisons uniquement des cookies essentiels au fonctionnement du site, notamment pour mémoriser votre préférence de langue."
        },
        {
          title: "Cookies tiers",
          text: "Notre site peut intégrer du contenu tiers (YouTube pour les vidéos, TidyCal pour la prise de rendez-vous) qui peuvent utiliser leurs propres cookies."
        },
        {
          title: "Gestion des cookies",
          text: "Vous pouvez configurer votre navigateur pour refuser les cookies. Notez que cela peut affecter le fonctionnement de certaines fonctionnalités du site."
        }
      ]
    },
    en: {
      title: "Cookie Policy",
      sections: [
        {
          title: "What is a cookie?",
          text: "A cookie is a small text file stored on your device when you visit a website. It allows the site to remember your preferences."
        },
        {
          title: "Essential cookies",
          text: "We only use essential cookies for the site to function, including remembering your language preference."
        },
        {
          title: "Third-party cookies",
          text: "Our site may embed third-party content (YouTube for videos, TidyCal for booking) that may use their own cookies."
        },
        {
          title: "Managing cookies",
          text: "You can configure your browser to refuse cookies. Note that this may affect the functionality of some site features."
        }
      ]
    },
    es: {
      title: "Política de Cookies",
      sections: [
        {
          title: "¿Qué es una cookie?",
          text: "Una cookie es un pequeño archivo de texto almacenado en su dispositivo cuando visita un sitio web. Permite que el sitio recuerde sus preferencias."
        },
        {
          title: "Cookies esenciales",
          text: "Solo utilizamos cookies esenciales para que el sitio funcione, incluyendo recordar su preferencia de idioma."
        },
        {
          title: "Cookies de terceros",
          text: "Nuestro sitio puede incorporar contenido de terceros (YouTube para videos, TidyCal para reservas) que pueden usar sus propias cookies."
        },
        {
          title: "Gestión de cookies",
          text: "Puede configurar su navegador para rechazar cookies. Tenga en cuenta que esto puede afectar la funcionalidad de algunas características del sitio."
        }
      ]
    }
  };

  const c = content[language];

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container-padding max-w-3xl mx-auto">
        <h1 className="font-display text-4xl font-bold mb-8">{c.title}</h1>
        <div className="space-y-8">
          {c.sections.map((section, index) => (
            <div key={index}>
              <h2 className="font-bold text-xl mb-2">{section.title}</h2>
              <p className="text-muted-foreground">{section.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
