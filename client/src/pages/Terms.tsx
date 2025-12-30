import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const pageTitles = {
  fr: "Conditions Générales | QUEBEXICO",
  en: "Terms and Conditions | QUEBEXICO",
  es: "Términos y Condiciones | QUEBEXICO",
};

export default function Terms() {
  const { language } = useLanguage();

  useEffect(() => {
    document.title = pageTitles[language as keyof typeof pageTitles] || pageTitles.fr;
  }, [language]);

  const content = {
    fr: {
      title: "Conditions Générales",
      sections: [
        {
          title: "Services",
          text: "QUEBEXICO offre des services de conseil en innovation, stratégie, branding et expériences digitales. Chaque projet fait l'objet d'un devis personnalisé."
        },
        {
          title: "Devis et facturation",
          text: "Tout projet débute après acceptation d'un devis écrit. Les modalités de paiement sont définies dans chaque proposition commerciale."
        },
        {
          title: "Propriété intellectuelle",
          text: "Sauf accord contraire, les livrables deviennent propriété du client après paiement intégral. QUEBEXICO conserve le droit de mentionner la collaboration dans son portfolio."
        },
        {
          title: "Confidentialité",
          text: "Nous nous engageons à traiter de manière confidentielle toutes les informations partagées dans le cadre de nos collaborations."
        },
        {
          title: "Responsabilité",
          text: "Notre responsabilité est limitée au montant des honoraires perçus pour le projet concerné."
        }
      ]
    },
    en: {
      title: "Terms and Conditions",
      sections: [
        {
          title: "Services",
          text: "QUEBEXICO offers innovation consulting, strategy, branding, and digital experience services. Each project is subject to a personalized quote."
        },
        {
          title: "Quotes and Billing",
          text: "All projects begin after acceptance of a written quote. Payment terms are defined in each commercial proposal."
        },
        {
          title: "Intellectual Property",
          text: "Unless otherwise agreed, deliverables become the client's property after full payment. QUEBEXICO retains the right to mention the collaboration in its portfolio."
        },
        {
          title: "Confidentiality",
          text: "We commit to treating all information shared during our collaborations as confidential."
        },
        {
          title: "Liability",
          text: "Our liability is limited to the amount of fees received for the project in question."
        }
      ]
    },
    es: {
      title: "Términos y Condiciones",
      sections: [
        {
          title: "Servicios",
          text: "QUEBEXICO ofrece servicios de consultoría en innovación, estrategia, branding y experiencias digitales. Cada proyecto está sujeto a un presupuesto personalizado."
        },
        {
          title: "Presupuestos y facturación",
          text: "Todos los proyectos comienzan después de la aceptación de un presupuesto escrito. Los términos de pago se definen en cada propuesta comercial."
        },
        {
          title: "Propiedad intelectual",
          text: "Salvo acuerdo en contrario, los entregables pasan a ser propiedad del cliente después del pago completo. QUEBEXICO se reserva el derecho de mencionar la colaboración en su portafolio."
        },
        {
          title: "Confidencialidad",
          text: "Nos comprometemos a tratar de manera confidencial toda la información compartida durante nuestras colaboraciones."
        },
        {
          title: "Responsabilidad",
          text: "Nuestra responsabilidad se limita al monto de los honorarios recibidos por el proyecto en cuestión."
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
