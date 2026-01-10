import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Mail, Phone, Globe, Linkedin, Facebook, Instagram, Twitter, Check, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";

interface SignatureData {
  fullName: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  facebook: string;
  instagram: string;
  twitter: string;
  photoUrl: string;
  logoUrl: string;
  template: "modern" | "classic" | "minimal" | "bold";
  primaryColor: string;
  ctaText: string;
  ctaUrl: string;
}

const defaultData: SignatureData = {
  fullName: "Jean-Marc Bouchard",
  jobTitle: "Entrepreneur en rénovation",
  company: "Réno-Expert",
  email: "jm@reno-expert.ca",
  phone: "(418) 555-1234",
  website: "www.reno-expert.ca",
  linkedin: "",
  facebook: "",
  instagram: "",
  twitter: "",
  photoUrl: "",
  logoUrl: "",
  template: "modern",
  primaryColor: "#2563eb",
  ctaText: "",
  ctaUrl: "",
};

const templates = [
  { id: "modern", name: "Moderne", description: "Style épuré avec accent coloré" },
  { id: "classic", name: "Classique", description: "Professionnel et sobre" },
  { id: "minimal", name: "Minimaliste", description: "Texte simple, sans fioritures" },
  { id: "bold", name: "Audacieux", description: "Grande photo, couleurs vives" },
];

const colorPresets = [
  { name: "Bleu", value: "#2563eb" },
  { name: "Vert", value: "#059669" },
  { name: "Orange", value: "#ea580c" },
  { name: "Rouge", value: "#dc2626" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Gris", value: "#475569" },
];

function generateSignatureHtml(data: SignatureData): string {
  const socialLinks = [];
  if (data.linkedin) socialLinks.push(`<a href="${data.linkedin}" style="color:${data.primaryColor};text-decoration:none;margin-right:8px;">LinkedIn</a>`);
  if (data.facebook) socialLinks.push(`<a href="${data.facebook}" style="color:${data.primaryColor};text-decoration:none;margin-right:8px;">Facebook</a>`);
  if (data.instagram) socialLinks.push(`<a href="${data.instagram}" style="color:${data.primaryColor};text-decoration:none;margin-right:8px;">Instagram</a>`);
  if (data.twitter) socialLinks.push(`<a href="${data.twitter}" style="color:${data.primaryColor};text-decoration:none;">Twitter</a>`);

  const photoHtml = data.photoUrl 
    ? `<img src="${data.photoUrl}" alt="${data.fullName}" width="80" height="80" style="border-radius:50%;margin-right:16px;" />`
    : "";

  const logoHtml = data.logoUrl
    ? `<img src="${data.logoUrl}" alt="${data.company || 'Logo'}" height="40" style="max-width:120px;height:40px;object-fit:contain;" />`
    : "";

  const ctaHtml = (data.ctaText && data.ctaUrl)
    ? `<a href="${data.ctaUrl}" style="display:inline-block;background:${data.primaryColor};color:white;padding:8px 16px;border-radius:4px;text-decoration:none;font-size:13px;margin-top:12px;">${data.ctaText}</a>`
    : "";

  if (data.template === "modern") {
    return `
<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;color:#333;">
  ${data.logoUrl ? `<tr><td colspan="2" style="padding-bottom:12px;">${logoHtml}</td></tr>` : ""}
  <tr>
    <td style="vertical-align:top;padding-right:16px;">
      ${photoHtml}
    </td>
    <td style="vertical-align:top;">
      <div style="font-size:18px;font-weight:bold;color:${data.primaryColor};margin-bottom:4px;">${data.fullName}</div>
      <div style="font-size:14px;color:#666;margin-bottom:8px;">${data.jobTitle}${data.company ? ` | ${data.company}` : ""}</div>
      <div style="border-left:3px solid ${data.primaryColor};padding-left:12px;">
        ${data.email ? `<div style="margin-bottom:4px;"><a href="mailto:${data.email}" style="color:#333;text-decoration:none;">${data.email}</a></div>` : ""}
        ${data.phone ? `<div style="margin-bottom:4px;">${data.phone}</div>` : ""}
        ${data.website ? `<div style="margin-bottom:4px;"><a href="https://${data.website}" style="color:${data.primaryColor};text-decoration:none;">${data.website}</a></div>` : ""}
      </div>
      ${socialLinks.length > 0 ? `<div style="margin-top:8px;">${socialLinks.join("")}</div>` : ""}
      ${ctaHtml ? `<div style="margin-top:12px;">${ctaHtml}</div>` : ""}
    </td>
  </tr>
</table>`.trim();
  }

  if (data.template === "classic") {
    return `
<table cellpadding="0" cellspacing="0" style="font-family:Georgia,serif;font-size:14px;color:#333;">
  ${data.logoUrl ? `<tr><td style="padding-bottom:12px;">${logoHtml}</td></tr>` : ""}
  <tr>
    <td>
      <div style="font-size:16px;font-weight:bold;margin-bottom:2px;">${data.fullName}</div>
      <div style="font-size:13px;color:#666;font-style:italic;margin-bottom:8px;">${data.jobTitle}${data.company ? `, ${data.company}` : ""}</div>
      <div style="border-top:1px solid #ccc;padding-top:8px;font-size:13px;">
        ${data.email ? `<span>Email: <a href="mailto:${data.email}" style="color:${data.primaryColor};">${data.email}</a></span><br/>` : ""}
        ${data.phone ? `<span>Tél: ${data.phone}</span><br/>` : ""}
        ${data.website ? `<span>Web: <a href="https://${data.website}" style="color:${data.primaryColor};">${data.website}</a></span>` : ""}
      </div>
      ${ctaHtml ? `<div style="margin-top:12px;">${ctaHtml}</div>` : ""}
    </td>
  </tr>
</table>`.trim();
  }

  if (data.template === "minimal") {
    return `
<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:13px;color:#555;">
  ${data.logoUrl ? `<tr><td style="padding-bottom:8px;">${logoHtml}</td></tr>` : ""}
  <tr>
    <td>
      <strong>${data.fullName}</strong> | ${data.jobTitle}<br/>
      ${[data.email, data.phone, data.website].filter(Boolean).join(" • ")}
      ${ctaHtml ? `<br/>${ctaHtml}` : ""}
    </td>
  </tr>
</table>`.trim();
  }

  if (data.template === "bold") {
    const boldCtaHtml = (data.ctaText && data.ctaUrl)
      ? `<a href="${data.ctaUrl}" style="display:inline-block;background:white;color:${data.primaryColor};padding:8px 16px;border-radius:4px;text-decoration:none;font-size:13px;font-weight:bold;margin-top:12px;">${data.ctaText}</a>`
      : "";
    return `
<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;">
  ${data.logoUrl ? `<tr><td style="padding-bottom:12px;">${logoHtml}</td></tr>` : ""}
  <tr>
    <td style="background:${data.primaryColor};padding:16px;border-radius:8px;">
      <table cellpadding="0" cellspacing="0">
        <tr>
          ${data.photoUrl ? `<td style="vertical-align:top;padding-right:16px;"><img src="${data.photoUrl}" alt="${data.fullName}" width="90" height="90" style="border-radius:8px;border:3px solid white;" /></td>` : ""}
          <td style="vertical-align:top;color:white;">
            <div style="font-size:20px;font-weight:bold;margin-bottom:4px;">${data.fullName}</div>
            <div style="font-size:14px;opacity:0.9;margin-bottom:12px;">${data.jobTitle}${data.company ? ` @ ${data.company}` : ""}</div>
            ${data.email ? `<div style="margin-bottom:4px;"><a href="mailto:${data.email}" style="color:white;text-decoration:none;">${data.email}</a></div>` : ""}
            ${data.phone ? `<div style="margin-bottom:4px;">${data.phone}</div>` : ""}
            ${data.website ? `<div><a href="https://${data.website}" style="color:white;text-decoration:underline;">${data.website}</a></div>` : ""}
            ${boldCtaHtml ? `<div style="margin-top:12px;">${boldCtaHtml}</div>` : ""}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();
  }

  return "";
}

export default function EmailSignature() {
  const [data, setData] = useState<SignatureData>(defaultData);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  const updateField = (field: keyof SignatureData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const signatureHtml = generateSignatureHtml(data);

  const copyToClipboard = async () => {
    try {
      const blob = new Blob([signatureHtml], { type: "text/html" });
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": blob,
          "text/plain": new Blob([signatureHtml], { type: "text/plain" }),
        }),
      ]);
      setCopied(true);
      toast({ title: "Copié!", description: "Collez dans les paramètres de signature de votre client email." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      await navigator.clipboard.writeText(signatureHtml);
      setCopied(true);
      toast({ title: "Code HTML copié!", description: "Collez le code HTML dans votre client email." });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadHtml = () => {
    const blob = new Blob([signatureHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "signature-email.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Générateur de Signature Email</h1>
          <p className="text-muted-foreground">Créez une signature email professionnelle en quelques clics</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Informations
                </CardTitle>
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
                <Separator />
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
                      <Phone className="h-4 w-4" /> Téléphone
                    </Label>
                    <Input
                      id="phone"
                      value={data.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      data-testid="input-phone"
                    />
                  </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="photoUrl">Photo (optionnel)</Label>
                    <ImageUpload
                      value={data.photoUrl}
                      onChange={(url) => updateField("photoUrl", url)}
                      placeholder="URL ou téléverser"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo (optionnel)</Label>
                    <ImageUpload
                      value={data.logoUrl}
                      onChange={(url) => updateField("logoUrl", url)}
                      placeholder="URL ou téléverser"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Réseaux sociaux</CardTitle>
                <CardDescription>Liens optionnels vers vos profils</CardDescription>
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
                      placeholder="https://linkedin.com/in/..."
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
                      placeholder="https://facebook.com/..."
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
                      placeholder="https://instagram.com/..."
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
                      placeholder="https://x.com/..."
                      data-testid="input-twitter"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appel à l'action
                </CardTitle>
                <CardDescription>Ajoutez un bouton pour prendre rendez-vous</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ctaText">Texte du bouton</Label>
                    <Input
                      id="ctaText"
                      value={data.ctaText}
                      onChange={(e) => updateField("ctaText", e.target.value)}
                      placeholder="Planifier un appel"
                      data-testid="input-cta-text"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctaUrl">Lien du bouton</Label>
                    <Input
                      id="ctaUrl"
                      value={data.ctaUrl}
                      onChange={(e) => updateField("ctaUrl", e.target.value)}
                      placeholder="https://calendly.com/..."
                      data-testid="input-cta-url"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Style</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Template</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => updateField("template", t.id)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          data.template === t.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover-elevate"
                        }`}
                        data-testid={`button-template-${t.id}`}
                      >
                        <div className="font-medium text-sm">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Couleur principale</Label>
                  <div className="flex flex-wrap gap-2">
                    {colorPresets.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => updateField("primaryColor", c.value)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${
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
                      className="w-8 h-8 p-0 border-0 cursor-pointer"
                      data-testid="input-custom-color"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Aperçu</CardTitle>
                <CardDescription>Votre signature telle qu'elle apparaîtra</CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  ref={previewRef}
                  className="bg-white p-6 rounded-lg border min-h-[150px]"
                  dangerouslySetInnerHTML={{ __html: signatureHtml }}
                  data-testid="signature-preview"
                />
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={copyToClipboard} className="flex-1" data-testid="button-copy">
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copié!" : "Copier la signature"}
              </Button>
              <Button variant="outline" onClick={downloadHtml} data-testid="button-download">
                <Download className="mr-2 h-4 w-4" />
                Télécharger HTML
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Comment utiliser</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="gmail">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="gmail">Gmail</TabsTrigger>
                    <TabsTrigger value="outlook">Outlook</TabsTrigger>
                    <TabsTrigger value="apple">Apple Mail</TabsTrigger>
                  </TabsList>
                  <TabsContent value="gmail" className="text-sm space-y-2 mt-4">
                    <p>1. Cliquez sur "Copier la signature"</p>
                    <p>2. Ouvrez Gmail → Paramètres → Voir tous les paramètres</p>
                    <p>3. Descendez à "Signature" et créez une nouvelle</p>
                    <p>4. Collez avec Ctrl+V (ou Cmd+V sur Mac)</p>
                  </TabsContent>
                  <TabsContent value="outlook" className="text-sm space-y-2 mt-4">
                    <p>1. Cliquez sur "Copier la signature"</p>
                    <p>2. Fichier → Options → Courrier → Signatures</p>
                    <p>3. Créez une nouvelle signature</p>
                    <p>4. Collez avec Ctrl+V</p>
                  </TabsContent>
                  <TabsContent value="apple" className="text-sm space-y-2 mt-4">
                    <p>1. Cliquez sur "Télécharger HTML"</p>
                    <p>2. Mail → Préférences → Signatures</p>
                    <p>3. Créez une nouvelle signature</p>
                    <p>4. Ouvrez le fichier HTML dans Safari et copiez-collez</p>
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
