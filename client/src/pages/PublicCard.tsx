import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Phone, 
  Globe, 
  Linkedin, 
  Facebook, 
  Instagram, 
  Twitter,
  Download,
  Share2,
  Loader2
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { DigitalCard } from "@shared/schema";

function generateVCard(card: DigitalCard): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${card.fullName}`,
  ];
  
  if (card.company) lines.push(`ORG:${card.company}`);
  if (card.jobTitle) lines.push(`TITLE:${card.jobTitle}`);
  if (card.email) lines.push(`EMAIL:${card.email}`);
  if (card.phone) lines.push(`TEL:${card.phone}`);
  if (card.website) lines.push(`URL:https://${card.website}`);
  if (card.linkedin) lines.push(`X-SOCIALPROFILE;type=linkedin:${card.linkedin}`);
  
  lines.push("END:VCARD");
  return lines.join("\n");
}

export default function PublicCard() {
  const [, params] = useRoute("/c/:slug");
  const slug = params?.slug;

  const { data: card, isLoading, error } = useQuery<DigitalCard>({
    queryKey: ["/api/cards", slug],
    queryFn: async () => {
      const res = await fetch(`/api/cards/${slug}`);
      if (!res.ok) {
        throw new Error("Card not found");
      }
      return res.json();
    },
    enabled: !!slug,
  });

  const handleDownloadVCard = () => {
    if (!card) return;
    const vcard = generateVCard(card);
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${card.slug}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!card) return;
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: card.fullName,
          text: `${card.jobTitle || ""} ${card.company ? `@ ${card.company}` : ""}`.trim(),
          url,
        });
      } catch {
        await navigator.clipboard.writeText(url);
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Carte non trouvée</h1>
            <p className="text-muted-foreground">Cette carte de visite n'existe pas ou a été désactivée.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = card.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const cardUrl = window.location.href;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-8 px-4">
      <div className="max-w-md mx-auto space-y-6">
        {card.logoUrl && (
          <div className="flex justify-center">
            <img 
              src={card.logoUrl} 
              alt={card.company || "Logo"} 
              className="h-12 object-contain"
            />
          </div>
        )}

        <Card className="overflow-hidden">
          <div 
            className="h-24"
            style={{ backgroundColor: card.primaryColor || "#2563eb" }}
          />
          <CardContent className="pt-0 -mt-12">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                {card.photoUrl ? (
                  <AvatarImage src={card.photoUrl} alt={card.fullName} />
                ) : null}
                <AvatarFallback 
                  className="text-2xl font-bold text-white"
                  style={{ backgroundColor: card.primaryColor || "#2563eb" }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <h1 className="text-2xl font-bold mt-4">{card.fullName}</h1>
              {card.jobTitle && (
                <p className="text-muted-foreground">{card.jobTitle}</p>
              )}
              {card.company && (
                <p className="text-sm text-muted-foreground">{card.company}</p>
              )}
            </div>

            <Separator className="my-6" />

            <div className="space-y-3">
              {card.email && (
                <a 
                  href={`mailto:${card.email}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover-elevate"
                  data-testid="link-email"
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: card.primaryColor || "#2563eb" }}
                  >
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{card.email}</p>
                  </div>
                </a>
              )}

              {card.phone && (
                <a 
                  href={`tel:${card.phone}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover-elevate"
                  data-testid="link-phone"
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: card.primaryColor || "#2563eb" }}
                  >
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{card.phone}</p>
                  </div>
                </a>
              )}

              {card.website && (
                <a 
                  href={`https://${card.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover-elevate"
                  data-testid="link-website"
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: card.primaryColor || "#2563eb" }}
                  >
                    <Globe className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Site web</p>
                    <p className="font-medium">{card.website}</p>
                  </div>
                </a>
              )}
            </div>

            {(card.linkedin || card.facebook || card.instagram || card.twitter) && (
              <>
                <Separator className="my-6" />
                <div className="flex justify-center gap-3">
                  {card.linkedin && (
                    <a 
                      href={card.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full flex items-center justify-center hover-elevate border"
                      data-testid="link-linkedin"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {card.facebook && (
                    <a 
                      href={card.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full flex items-center justify-center hover-elevate border"
                      data-testid="link-facebook"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {card.instagram && (
                    <a 
                      href={card.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full flex items-center justify-center hover-elevate border"
                      data-testid="link-instagram"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {card.twitter && (
                    <a 
                      href={card.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full flex items-center justify-center hover-elevate border"
                      data-testid="link-twitter"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button 
            onClick={handleDownloadVCard} 
            className="flex-1"
            data-testid="button-download-vcard"
          >
            <Download className="mr-2 h-4 w-4" />
            Enregistrer le contact
          </Button>
          <Button 
            variant="outline" 
            onClick={handleShare}
            data-testid="button-share"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6 flex flex-col items-center">
            <p className="text-sm text-muted-foreground mb-4">Scannez pour partager</p>
            <div className="bg-white p-3 rounded-lg">
              <QRCodeSVG value={cardUrl} size={150} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
