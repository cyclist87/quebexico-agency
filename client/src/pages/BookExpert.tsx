import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const pageTitles = {
  fr: "Consultation Expert | QUEBEXICO",
  en: "Expert Consultation | QUEBEXICO",
  es: "Consulta Experta | QUEBEXICO",
};

export default function BookExpert() {
  const { t, language } = useLanguage();

  useEffect(() => {
    document.title = pageTitles[language as keyof typeof pageTitles] || pageTitles.fr;
  }, [language]);

  return (
    <div className="min-h-screen bg-background pt-24 pb-8">
      <div className="container-padding max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link href="/contact">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.contact.title}
            </Button>
          </Link>
          <h1 className="font-display text-xl font-bold">
            {t.booking.expert.title}
          </h1>
          <div className="w-24" />
        </div>
        
        <div className="bg-card rounded-2xl border shadow-lg overflow-hidden">
          <iframe
            src="https://tidycal.com/lachance/1h-expert-consult"
            width="100%"
            height="800"
            frameBorder="0"
            scrolling="no"
            title={t.booking.expert.title}
            className="w-full border-none block"
            style={{ overflow: "hidden" }}
          />
        </div>
      </div>
    </div>
  );
}
