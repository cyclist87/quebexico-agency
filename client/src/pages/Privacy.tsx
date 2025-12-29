import { useLanguage } from "@/contexts/LanguageContext";

export default function Privacy() {
  const { language } = useLanguage();

  const content = {
    fr: {
      title: "Politique de Confidentialité",
      sections: [
        {
          title: "Collecte des données",
          text: "Nous collectons uniquement les données que vous nous fournissez volontairement via notre formulaire de contact (nom, email, message) et notre liste de diffusion (email)."
        },
        {
          title: "Utilisation des données",
          text: "Vos données sont utilisées uniquement pour répondre à vos demandes et vous envoyer des communications si vous vous êtes inscrit à notre liste de diffusion."
        },
        {
          title: "Protection des données",
          text: "Nous mettons en place des mesures de sécurité appropriées pour protéger vos données personnelles contre tout accès non autorisé."
        },
        {
          title: "Vos droits",
          text: "Vous pouvez à tout moment demander l'accès, la modification ou la suppression de vos données en nous contactant à salut@quebexico.co"
        },
        {
          title: "Cookies",
          text: "Ce site utilise des cookies essentiels au fonctionnement du site. Aucun cookie de suivi publicitaire n'est utilisé."
        }
      ]
    },
    en: {
      title: "Privacy Policy",
      sections: [
        {
          title: "Data Collection",
          text: "We only collect data that you voluntarily provide through our contact form (name, email, message) and our mailing list (email)."
        },
        {
          title: "Data Usage",
          text: "Your data is used only to respond to your inquiries and send you communications if you have subscribed to our mailing list."
        },
        {
          title: "Data Protection",
          text: "We implement appropriate security measures to protect your personal data from unauthorized access."
        },
        {
          title: "Your Rights",
          text: "You can request access, modification, or deletion of your data at any time by contacting us at salut@quebexico.co"
        },
        {
          title: "Cookies",
          text: "This site uses essential cookies for the site to function. No advertising tracking cookies are used."
        }
      ]
    },
    es: {
      title: "Política de Privacidad",
      sections: [
        {
          title: "Recopilación de datos",
          text: "Solo recopilamos los datos que nos proporciona voluntariamente a través de nuestro formulario de contacto (nombre, correo electrónico, mensaje) y nuestra lista de correo (correo electrónico)."
        },
        {
          title: "Uso de datos",
          text: "Sus datos se utilizan únicamente para responder a sus consultas y enviarle comunicaciones si se ha suscrito a nuestra lista de correo."
        },
        {
          title: "Protección de datos",
          text: "Implementamos medidas de seguridad apropiadas para proteger sus datos personales del acceso no autorizado."
        },
        {
          title: "Sus derechos",
          text: "Puede solicitar acceso, modificación o eliminación de sus datos en cualquier momento contactándonos en salut@quebexico.co"
        },
        {
          title: "Cookies",
          text: "Este sitio utiliza cookies esenciales para que el sitio funcione. No se utilizan cookies de seguimiento publicitario."
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
