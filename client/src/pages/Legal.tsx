import { useLanguage } from "@/contexts/LanguageContext";

export default function Legal() {
  const { language } = useLanguage();

  const content = {
    fr: {
      title: "Mentions Légales",
      sections: [
        {
          title: "Éditeur du site",
          text: "QUEBEXICO est une agence créative stratégique basée au Québec, Canada. Pour toute question, contactez-nous à salut@quebexico.co"
        },
        {
          title: "Propriété intellectuelle",
          text: "L'ensemble du contenu de ce site (textes, images, vidéos, logos) est protégé par le droit d'auteur. Toute reproduction sans autorisation préalable est interdite."
        },
        {
          title: "Responsabilité",
          text: "QUEBEXICO s'efforce de fournir des informations exactes et à jour. Toutefois, nous ne pouvons garantir l'exactitude de toutes les informations présentes sur ce site."
        }
      ]
    },
    en: {
      title: "Legal Notice",
      sections: [
        {
          title: "Site Publisher",
          text: "QUEBEXICO is a strategic creative agency based in Quebec, Canada. For any questions, contact us at salut@quebexico.co"
        },
        {
          title: "Intellectual Property",
          text: "All content on this site (texts, images, videos, logos) is protected by copyright. Any reproduction without prior authorization is prohibited."
        },
        {
          title: "Liability",
          text: "QUEBEXICO strives to provide accurate and up-to-date information. However, we cannot guarantee the accuracy of all information on this site."
        }
      ]
    },
    es: {
      title: "Aviso Legal",
      sections: [
        {
          title: "Editor del sitio",
          text: "QUEBEXICO es una agencia creativa estratégica con sede en Quebec, Canadá. Para cualquier pregunta, contáctenos en salut@quebexico.co"
        },
        {
          title: "Propiedad intelectual",
          text: "Todo el contenido de este sitio (textos, imágenes, videos, logotipos) está protegido por derechos de autor. Cualquier reproducción sin autorización previa está prohibida."
        },
        {
          title: "Responsabilidad",
          text: "QUEBEXICO se esfuerza por proporcionar información precisa y actualizada. Sin embargo, no podemos garantizar la exactitud de toda la información en este sitio."
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
