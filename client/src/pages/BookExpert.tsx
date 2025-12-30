import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function BookExpert() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="container-padding max-w-4xl mx-auto">
        <Link href="/contact">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.contact.title}
          </Button>
        </Link>
        
        <h1 className="font-display text-2xl font-bold mb-4 text-center">
          {t.booking.expert.title}
        </h1>
        
        <div className="bg-card rounded-2xl border shadow-lg overflow-hidden" style={{ minHeight: "calc(100vh - 180px)", height: "800px" }}>
          <iframe
            src="https://tidycal.com/lachance/1h-expert-consult"
            width="100%"
            height="100%"
            frameBorder="0"
            title={t.booking.expert.title}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
