import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeSVG } from "qrcode.react";
import { 
  Download, 
  Share2, 
  UserPlus, 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  Copy,
  Check,
  Smartphone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CardData {
  fullName: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  mobile: string;
  website: string;
  address: string;
  linkedin: string;
  facebook: string;
  instagram: string;
  twitter: string;
  photoUrl: string;
  bio: string;
  primaryColor: string;
}

const defaultData: CardData = {
  fullName: "Jean-Marc Bouchard",
  jobTitle: "Entrepreneur en rénovation",
  company: "Réno-Expert",
  email: "jm@reno-expert.ca",
  phone: "(418) 555-1234",
  mobile: "(418) 555-5678",
  website: "www.reno-expert.ca",
  address: "123 rue Principale, Québec, QC G1K 1A1",
  linkedin: "https://linkedin.com/in/jmbouchard",
  facebook: "",
  instagram: "",
  twitter: "",
  photoUrl: "",
  bio: "Plus de 20 ans d'expérience en rénovation résidentielle. Travail soigné, prix honnêtes.",
  primaryColor: "#2563eb",
};

const colorPresets = [
  { name: "Bleu", value: "#2563eb" },
  { name: "Vert", value: "#059669" },
  { name: "Orange", value: "#ea580c" },
  { name: "Rouge", value: "#dc2626" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Noir", value: "#18181b" },
];

function generateVCard(data: CardData): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${data.fullName}`,
    `N:${data.fullName.split(" ").reverse().join(";")};;;`,
  ];
  
  if (data.company) lines.push(`ORG:${data.company}`);
  if (data.jobTitle) lines.push(`TITLE:${data.jobTitle}`);
  if (data.email) lines.push(`EMAIL;TYPE=WORK:${data.email}`);
  if (data.phone) lines.push(`TEL;TYPE=WORK,VOICE:${data.phone}`);
  if (data.mobile) lines.push(`TEL;TYPE=CELL:${data.mobile}`);
  if (data.website) lines.push(`URL:https://${data.website}`);
  if (data.address) lines.push(`ADR;TYPE=WORK:;;${data.address.replace(/,/g, ";")}`);
  if (data.linkedin) lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${data.linkedin}`);
  if (data.facebook) lines.push(`X-SOCIALPROFILE;TYPE=facebook:${data.facebook}`);
  if (data.instagram) lines.push(`X-SOCIALPROFILE;TYPE=instagram:${data.instagram}`);
  if (data.twitter) lines.push(`X-SOCIALPROFILE;TYPE=twitter:${data.twitter}`);
  if (data.bio) lines.push(`NOTE:${data.bio}`);
  if (data.photoUrl) lines.push(`PHOTO;VALUE=URI:${data.photoUrl}`);
  
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export default function DigitalCard() {
  const [data, setData] = useState<CardData>(defaultData);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const updateField = (field: keyof CardData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const vCard = generateVCard(data);
  const cardUrl = typeof window !== "undefined" ? window.location.href : "";

  const downloadVCard = () => {
    const blob = new Blob([vCard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.fullName.replace(/\s+/g, "_")}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Téléchargé!", description: "La carte de visite a été téléchargée." });
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(cardUrl);
    setCopied(true);
    toast({ title: "Lien copié!", description: "Partagez ce lien pour votre carte numérique." });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCard = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Carte de visite - ${data.fullName}`,
        text: `${data.fullName} - ${data.jobTitle}`,
        url: cardUrl,
      });
    } else {
      copyLink();
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 400, 400);
        ctx.drawImage(img, 0, 0, 400, 400);
        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `qr-${data.fullName.replace(/\s+/g, "_")}.png`;
        a.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    toast({ title: "QR Code téléchargé!" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Carte de Visite Numérique</h1>
          <p className="text-muted-foreground">Créez votre carte de visite avec QR code pour un partage facile</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nom complet</Label>
                    <Input
                      id="fullName"
                      value={data.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      data-testid="input-fullname"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Titre / Poste</Label>
                    <Input
                      id="jobTitle"
                      value={data.jobTitle}
                      onChange={(e) => updateField("jobTitle", e.target.value)}
                      data-testid="input-jobtitle"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise</Label>
                  <Input
                    id="company"
                    value={data.company}
                    onChange={(e) => updateField("company", e.target.value)}
                    data-testid="input-company"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / Description courte</Label>
                  <Textarea
                    id="bio"
                    value={data.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    rows={2}
                    data-testid="input-bio"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photoUrl">URL de la photo</Label>
                  <Input
                    id="photoUrl"
                    value={data.photoUrl}
                    onChange={(e) => updateField("photoUrl", e.target.value)}
                    placeholder="https://..."
                    data-testid="input-photo"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coordonnées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" /> Téléphone bureau
                    </Label>
                    <Input
                      id="phone"
                      value={data.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      data-testid="input-phone"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobile" className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" /> Mobile
                    </Label>
                    <Input
                      id="mobile"
                      value={data.mobile}
                      onChange={(e) => updateField("mobile", e.target.value)}
                      data-testid="input-mobile"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Site web
                    </Label>
                    <Input
                      id="website"
                      value={data.website}
                      onChange={(e) => updateField("website", e.target.value)}
                      placeholder="www.exemple.com"
                      data-testid="input-website"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Adresse
                  </Label>
                  <Input
                    id="address"
                    value={data.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    data-testid="input-address"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Réseaux sociaux</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4" /> LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      value={data.linkedin}
                      onChange={(e) => updateField("linkedin", e.target.value)}
                      data-testid="input-linkedin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="flex items-center gap-2">
                      <Facebook className="h-4 w-4" /> Facebook
                    </Label>
                    <Input
                      id="facebook"
                      value={data.facebook}
                      onChange={(e) => updateField("facebook", e.target.value)}
                      data-testid="input-facebook"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="flex items-center gap-2">
                      <Instagram className="h-4 w-4" /> Instagram
                    </Label>
                    <Input
                      id="instagram"
                      value={data.instagram}
                      onChange={(e) => updateField("instagram", e.target.value)}
                      data-testid="input-instagram"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="flex items-center gap-2">
                      <Twitter className="h-4 w-4" /> Twitter/X
                    </Label>
                    <Input
                      id="twitter"
                      value={data.twitter}
                      onChange={(e) => updateField("twitter", e.target.value)}
                      data-testid="input-twitter"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Couleur du thème</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => updateField("primaryColor", c.value)}
                      className={`w-10 h-10 rounded-full border-2 transition-transform ${
                        data.primaryColor === c.value ? "scale-110 border-foreground" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                      data-testid={`button-color-${c.name.toLowerCase()}`}
                    />
                  ))}
                  <Input
                    type="color"
                    value={data.primaryColor}
                    onChange={(e) => updateField("primaryColor", e.target.value)}
                    className="w-10 h-10 p-0 border-0 cursor-pointer"
                    data-testid="input-custom-color"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Aperçu de votre carte</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="rounded-xl overflow-hidden shadow-lg"
                  style={{ backgroundColor: data.primaryColor }}
                  data-testid="card-preview"
                >
                  <div className="p-6 text-white">
                    <div className="flex items-start gap-4">
                      {data.photoUrl ? (
                        <img 
                          src={data.photoUrl} 
                          alt={data.fullName}
                          className="w-20 h-20 rounded-full object-cover border-2 border-white/30"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                          {data.fullName.split(" ").map(n => n[0]).join("")}
                        </div>
                      )}
                      <div>
                        <h2 className="text-2xl font-bold">{data.fullName}</h2>
                        <p className="opacity-90">{data.jobTitle}</p>
                        {data.company && <p className="opacity-75 text-sm">{data.company}</p>}
                      </div>
                    </div>
                    {data.bio && (
                      <p className="mt-4 text-sm opacity-80">{data.bio}</p>
                    )}
                  </div>
                  <div className="bg-white p-6 space-y-3">
                    {data.email && (
                      <a href={`mailto:${data.email}`} className="flex items-center gap-3 text-gray-700 hover:text-gray-900">
                        <Mail className="h-5 w-5" style={{ color: data.primaryColor }} />
                        {data.email}
                      </a>
                    )}
                    {data.phone && (
                      <a href={`tel:${data.phone}`} className="flex items-center gap-3 text-gray-700 hover:text-gray-900">
                        <Phone className="h-5 w-5" style={{ color: data.primaryColor }} />
                        {data.phone}
                      </a>
                    )}
                    {data.mobile && (
                      <a href={`tel:${data.mobile}`} className="flex items-center gap-3 text-gray-700 hover:text-gray-900">
                        <Smartphone className="h-5 w-5" style={{ color: data.primaryColor }} />
                        {data.mobile}
                      </a>
                    )}
                    {data.website && (
                      <a href={`https://${data.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-700 hover:text-gray-900">
                        <Globe className="h-5 w-5" style={{ color: data.primaryColor }} />
                        {data.website}
                      </a>
                    )}
                    {data.address && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <MapPin className="h-5 w-5" style={{ color: data.primaryColor }} />
                        <span className="text-sm">{data.address}</span>
                      </div>
                    )}
                    <Separator className="my-4" />
                    <div className="flex justify-center gap-4">
                      {data.linkedin && (
                        <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-100">
                          <Linkedin className="h-5 w-5" style={{ color: data.primaryColor }} />
                        </a>
                      )}
                      {data.facebook && (
                        <a href={data.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-100">
                          <Facebook className="h-5 w-5" style={{ color: data.primaryColor }} />
                        </a>
                      )}
                      {data.instagram && (
                        <a href={data.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-100">
                          <Instagram className="h-5 w-5" style={{ color: data.primaryColor }} />
                        </a>
                      )}
                      {data.twitter && (
                        <a href={data.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-100">
                          <Twitter className="h-5 w-5" style={{ color: data.primaryColor }} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QR Code</CardTitle>
                <CardDescription>Scannez pour ajouter aux contacts</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG 
                    id="qr-code-svg"
                    value={vCard}
                    size={200}
                    level="M"
                    fgColor={data.primaryColor}
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Ce QR code ajoute automatiquement vos coordonnées aux contacts du téléphone
                </p>
                <Button variant="outline" onClick={downloadQR} className="w-full" data-testid="button-download-qr">
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger le QR Code
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={downloadVCard} className="w-full" data-testid="button-download-vcard">
                <UserPlus className="mr-2 h-4 w-4" />
                Télécharger vCard
              </Button>
              <Button variant="outline" onClick={shareCard} className="w-full" data-testid="button-share">
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Share2 className="mr-2 h-4 w-4" />}
                {copied ? "Copié!" : "Partager"}
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Utilisation</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="print">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="print">Imprimer</TabsTrigger>
                    <TabsTrigger value="share">Partager</TabsTrigger>
                    <TabsTrigger value="nfc">NFC</TabsTrigger>
                  </TabsList>
                  <TabsContent value="print" className="text-sm space-y-2 mt-4">
                    <p>1. Téléchargez le QR code</p>
                    <p>2. Imprimez-le sur vos cartes de visite physiques</p>
                    <p>3. Les gens scannent et vous êtes dans leurs contacts!</p>
                  </TabsContent>
                  <TabsContent value="share" className="text-sm space-y-2 mt-4">
                    <p>1. Envoyez le fichier vCard par email ou SMS</p>
                    <p>2. Le destinataire l'ouvre et vous êtes ajouté</p>
                    <p>3. Ou partagez le lien de cette page</p>
                  </TabsContent>
                  <TabsContent value="nfc" className="text-sm space-y-2 mt-4">
                    <p>1. Achetez une carte NFC vierge (~$5)</p>
                    <p>2. Programmez-la avec le lien de votre carte</p>
                    <p>3. Un simple tap et vos contacts sont partagés!</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
