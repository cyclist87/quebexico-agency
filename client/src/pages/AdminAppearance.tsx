import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Loader2, Palette, Image, Type, FileText, Save, RotateCcw, Upload, Eye, X, ExternalLink, Search } from "lucide-react";
import type { SiteConfigType } from "@shared/schema";

const DEFAULT_CONFIG: Partial<SiteConfigType> = {
  siteName: "Mon Site",
  logoUrl: "",
  primaryColor: "#2563eb",
  secondaryColor: "#64748b",
  accentColor: "#f59e0b",
  fontFamily: "Inter",
  footerTextFr: "",
  footerTextEn: "",
  footerTextEs: "",
};

function LogoUploader({ 
  logoUrl, 
  onLogoChange 
}: { 
  logoUrl: string; 
  onLogoChange: (url: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setIsUploading(true);
    
    try {
      const response = await fetch("/api/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `logo-${Date.now()}-${file.name}`,
          size: file.size,
          contentType: file.type,
        }),
      });
      
      if (!response.ok) throw new Error("Failed to get upload URL");
      
      const { uploadURL, objectPath } = await response.json();
      
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      
      if (!uploadResponse.ok) throw new Error("Upload failed");
      
      onLogoChange(objectPath);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Erreur lors du téléversement. Veuillez réessayer.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDropZone = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  const handleUrlSubmit = () => {
    if (urlValue.trim()) {
      onLogoChange(urlValue.trim());
      setUrlValue("");
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-3">
      {logoUrl ? (
        <div className="relative inline-block">
          <div className="p-4 border rounded-lg bg-muted/50">
            <img
              src={logoUrl}
              alt="Logo"
              className="max-h-24 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='40'%3E%3Crect fill='%23f3f4f6' width='100' height='40'/%3E%3Ctext x='50' y='25' text-anchor='middle' fill='%239ca3af' font-size='12'%3ELogo%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={() => onLogoChange("")}
            data-testid="button-remove-logo"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover-elevate transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropZone}
          data-testid="dropzone-logo-upload"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Téléversement en cours...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Cliquez ou glissez votre logo ici</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, SVG (max 2MB)</p>
            </div>
          )}
        </div>
      )}
      
      <div className="flex gap-2">
        {logoUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            data-testid="button-change-logo"
          >
            <Upload className="h-4 w-4 mr-2" />
            Changer
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowUrlInput(!showUrlInput)}
          data-testid="button-toggle-url-input"
        >
          Utiliser une URL
        </Button>
      </div>
      
      {showUrlInput && (
        <div className="flex gap-2">
          <Input
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="flex-1"
            data-testid="input-logo-url"
          />
          <Button type="button" size="sm" onClick={handleUrlSubmit} data-testid="button-apply-url">
            Appliquer
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AdminAppearance() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<SiteConfigType>>(DEFAULT_CONFIG);

  const { data: config, isLoading } = useQuery<SiteConfigType | null>({
    queryKey: ["/api/site-config"],
    staleTime: 0,
  });

  const mutation = useMutation({
    mutationFn: async (data: Partial<SiteConfigType>) => {
      const response = await fetch("/api/admin/site-config", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to save");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-config"] });
      toast({
        title: "Sauvegardé",
        description: "L'apparence a été mise à jour avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (config) {
      setFormData({ ...DEFAULT_CONFIG, ...config });
    }
  }, [config]);

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminShell>
    );
  }

  const currentData = config ? { ...DEFAULT_CONFIG, ...config } : DEFAULT_CONFIG;

  const handleInputChange = (field: keyof SiteConfigType, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    mutation.mutate(formData);
  };

  const handleReset = () => {
    setFormData(config ? { ...DEFAULT_CONFIG, ...config } : DEFAULT_CONFIG);
    toast({
      title: "Réinitialisé",
      description: "Les modifications ont été annulées.",
    });
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">
              Apparence
            </h1>
            <p className="text-muted-foreground">
              Personnalisez l'apparence de votre site
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={mutation.isPending}
              data-testid="button-reset"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={mutation.isPending}
              data-testid="button-save"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Sauvegarder
            </Button>
          </div>
        </div>

        <Tabs defaultValue="branding" className="space-y-4">
          <TabsList>
            <TabsTrigger value="branding" data-testid="tab-branding">
              <Image className="h-4 w-4 mr-2" />
              Marque
            </TabsTrigger>
            <TabsTrigger value="colors" data-testid="tab-colors">
              <Palette className="h-4 w-4 mr-2" />
              Couleurs
            </TabsTrigger>
            <TabsTrigger value="typography" data-testid="tab-typography">
              <Type className="h-4 w-4 mr-2" />
              Typographie
            </TabsTrigger>
            <TabsTrigger value="footer" data-testid="tab-footer">
              <FileText className="h-4 w-4 mr-2" />
              Pied de page
            </TabsTrigger>
            <TabsTrigger value="seo" data-testid="tab-seo">
              <Search className="h-4 w-4 mr-2" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="preview" data-testid="tab-preview">
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="branding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Logo et identité</CardTitle>
                <CardDescription>
                  Configurez le logo et le nom de votre site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nom du site</Label>
                  <Input
                    id="siteName"
                    value={formData.siteName || ""}
                    onChange={(e) => handleInputChange("siteName", e.target.value)}
                    placeholder="Mon Site"
                    data-testid="input-site-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <LogoUploader
                    logoUrl={formData.logoUrl || ""}
                    onLogoChange={(url) => handleInputChange("logoUrl", url)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="colors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Palette de couleurs</CardTitle>
                <CardDescription>
                  Personnalisez les couleurs principales de votre site
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Couleur primaire</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.primaryColor || "#3b82f6"}
                      onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                      data-testid="input-primary-color"
                    />
                    <Input
                      value={formData.primaryColor || "#3b82f6"}
                      onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                      className="flex-1"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Couleur secondaire</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={formData.secondaryColor || "#1e40af"}
                      onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                      data-testid="input-secondary-color"
                    />
                    <Input
                      value={formData.secondaryColor || "#1e40af"}
                      onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                      className="flex-1"
                      placeholder="#1e40af"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Couleur d'accent</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={formData.accentColor || "#f59e0b"}
                      onChange={(e) => handleInputChange("accentColor", e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                      data-testid="input-accent-color"
                    />
                    <Input
                      value={formData.accentColor || "#f59e0b"}
                      onChange={(e) => handleInputChange("accentColor", e.target.value)}
                      className="flex-1"
                      placeholder="#f59e0b"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aperçu des couleurs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 flex-wrap">
                  <div
                    className="w-24 h-24 rounded-lg flex items-center justify-center text-white font-medium shadow-sm"
                    style={{ backgroundColor: formData.primaryColor || "#3b82f6" }}
                  >
                    Primaire
                  </div>
                  <div
                    className="w-24 h-24 rounded-lg flex items-center justify-center text-white font-medium shadow-sm"
                    style={{ backgroundColor: formData.secondaryColor || "#1e40af" }}
                  >
                    Secondaire
                  </div>
                  <div
                    className="w-24 h-24 rounded-lg flex items-center justify-center text-white font-medium shadow-sm"
                    style={{ backgroundColor: formData.accentColor || "#f59e0b" }}
                  >
                    Accent
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="typography" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Polices de caractères</CardTitle>
                <CardDescription>
                  Choisissez la police utilisée sur votre site
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-w-md">
                  <Label htmlFor="fontFamily">Police du site</Label>
                  <Input
                    id="fontFamily"
                    value={formData.fontFamily || "Inter"}
                    onChange={(e) => handleInputChange("fontFamily", e.target.value)}
                    placeholder="Inter"
                    data-testid="input-font-family"
                  />
                  <p className="text-sm text-muted-foreground">
                    Polices Google Fonts recommandées: Inter, Poppins, Montserrat, Open Sans, Roboto
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="footer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Texte du pied de page</CardTitle>
                <CardDescription>
                  Personnalisez le texte affiché dans le pied de page (multilingue)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="footerTextFr">Texte du pied de page (Français)</Label>
                  <Textarea
                    id="footerTextFr"
                    value={formData.footerTextFr || ""}
                    onChange={(e) => handleInputChange("footerTextFr", e.target.value)}
                    placeholder="Entrez le texte du pied de page en français..."
                    rows={3}
                    data-testid="input-footer-fr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footerTextEn">Footer Text (English)</Label>
                  <Textarea
                    id="footerTextEn"
                    value={formData.footerTextEn || ""}
                    onChange={(e) => handleInputChange("footerTextEn", e.target.value)}
                    placeholder="Enter the footer text in English..."
                    rows={3}
                    data-testid="input-footer-en"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footerTextEs">Texto del pie de página (Español)</Label>
                  <Textarea
                    id="footerTextEs"
                    value={formData.footerTextEs || ""}
                    onChange={(e) => handleInputChange("footerTextEs", e.target.value)}
                    placeholder="Ingrese el texto del pie de página en español..."
                    rows={3}
                    data-testid="input-footer-es"
                  />
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Référencement (SEO)</CardTitle>
                <CardDescription>
                  Optimisez votre site pour les moteurs de recherche
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Français</h4>
                  <div className="space-y-2">
                    <Label htmlFor="metaTitleFr">Titre de la page (FR)</Label>
                    <Input
                      id="metaTitleFr"
                      value={formData.metaTitleFr || ""}
                      onChange={(e) => handleInputChange("metaTitleFr", e.target.value)}
                      placeholder="Mon Site | Location de vacances"
                      data-testid="input-meta-title-fr"
                    />
                    <p className="text-xs text-muted-foreground">
                      Apparaît dans l'onglet du navigateur et les résultats de recherche (max 60 caractères)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metaDescriptionFr">Description (FR)</Label>
                    <Textarea
                      id="metaDescriptionFr"
                      value={formData.metaDescriptionFr || ""}
                      onChange={(e) => handleInputChange("metaDescriptionFr", e.target.value)}
                      placeholder="Découvrez nos hébergements uniques pour vos vacances..."
                      rows={3}
                      data-testid="input-meta-desc-fr"
                    />
                    <p className="text-xs text-muted-foreground">
                      Résumé affiché dans les résultats de recherche (max 160 caractères)
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">English</h4>
                  <div className="space-y-2">
                    <Label htmlFor="metaTitleEn">Page Title (EN)</Label>
                    <Input
                      id="metaTitleEn"
                      value={formData.metaTitleEn || ""}
                      onChange={(e) => handleInputChange("metaTitleEn", e.target.value)}
                      placeholder="My Site | Vacation Rentals"
                      data-testid="input-meta-title-en"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metaDescriptionEn">Description (EN)</Label>
                    <Textarea
                      id="metaDescriptionEn"
                      value={formData.metaDescriptionEn || ""}
                      onChange={(e) => handleInputChange("metaDescriptionEn", e.target.value)}
                      placeholder="Discover our unique accommodations for your vacation..."
                      rows={3}
                      data-testid="input-meta-desc-en"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Español</h4>
                  <div className="space-y-2">
                    <Label htmlFor="metaTitleEs">Título de la página (ES)</Label>
                    <Input
                      id="metaTitleEs"
                      value={formData.metaTitleEs || ""}
                      onChange={(e) => handleInputChange("metaTitleEs", e.target.value)}
                      placeholder="Mi Sitio | Alquiler vacacional"
                      data-testid="input-meta-title-es"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metaDescriptionEs">Descripción (ES)</Label>
                    <Textarea
                      id="metaDescriptionEs"
                      value={formData.metaDescriptionEs || ""}
                      onChange={(e) => handleInputChange("metaDescriptionEs", e.target.value)}
                      placeholder="Descubre nuestros alojamientos únicos para tus vacaciones..."
                      rows={3}
                      data-testid="input-meta-desc-es"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aperçu Google</CardTitle>
                <CardDescription>
                  Voici comment votre site apparaîtra dans les résultats de recherche
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-white">
                  <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                    {formData.metaTitleFr || formData.siteName || "Mon Site"}
                  </div>
                  <div className="text-green-700 text-sm">
                    {formData.customDomain ? `https://${formData.customDomain}` : "https://monsite.replit.app"}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    {formData.metaDescriptionFr || "Aucune description définie. Ajoutez une description pour améliorer votre référencement."}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader className="flex-row flex-wrap items-center justify-between gap-4">
                <div>
                  <CardTitle>Aperçu du site</CardTitle>
                  <CardDescription>
                    Visualisez l'apparence de votre site avec les paramètres actuels
                  </CardDescription>
                </div>
                <Button variant="outline" asChild data-testid="button-open-site">
                  <a href="/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ouvrir le site
                  </a>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div 
                    className="p-4 flex items-center gap-4"
                    style={{ backgroundColor: formData.primaryColor || "#2563eb" }}
                  >
                    {formData.logoUrl ? (
                      <img
                        src={formData.logoUrl}
                        alt="Logo"
                        className="h-10 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 bg-white/20 rounded flex items-center justify-center">
                        <Image className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <span 
                      className="text-white font-bold text-lg"
                      style={{ fontFamily: formData.fontFamily || "Inter" }}
                    >
                      {formData.siteName || "Mon Site"}
                    </span>
                    <div className="ml-auto flex gap-2">
                      <div className="px-3 py-1 rounded text-sm text-white/80">Accueil</div>
                      <div className="px-3 py-1 rounded text-sm text-white/80">Propriétés</div>
                      <div className="px-3 py-1 rounded text-sm text-white/80">Contact</div>
                    </div>
                  </div>
                  
                  <div className="p-8 bg-background min-h-[200px]">
                    <div className="max-w-2xl mx-auto text-center space-y-4">
                      <h1 
                        className="text-3xl font-bold"
                        style={{ fontFamily: formData.fontFamily || "Inter" }}
                      >
                        Bienvenue sur {formData.siteName || "notre site"}
                      </h1>
                      <p className="text-muted-foreground">
                        Découvrez nos propriétés exceptionnelles
                      </p>
                      <div className="flex justify-center gap-3">
                        <Button
                          style={{ backgroundColor: formData.primaryColor || "#2563eb" }}
                          className="text-white"
                        >
                          Voir les propriétés
                        </Button>
                        <Button
                          variant="outline"
                          style={{ borderColor: formData.secondaryColor || "#64748b", color: formData.secondaryColor || "#64748b" }}
                        >
                          En savoir plus
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="p-4 text-center text-sm"
                    style={{ backgroundColor: formData.secondaryColor || "#64748b" }}
                  >
                    <span className="text-white/80" style={{ fontFamily: formData.fontFamily || "Inter" }}>
                      {formData.footerTextFr || `© ${new Date().getFullYear()} ${formData.siteName || "Mon Site"}. Tous droits réservés.`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminShell>
  );
}
