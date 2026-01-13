import { useState, useEffect } from "react";
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
import { Loader2, Palette, Image, Type, FileText, Save, RotateCcw } from "lucide-react";
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
                  <Label htmlFor="logoUrl">URL du logo</Label>
                  <Input
                    id="logoUrl"
                    value={formData.logoUrl || ""}
                    onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                    placeholder="https://example.com/logo.png"
                    data-testid="input-logo-url"
                  />
                  <p className="text-sm text-muted-foreground">
                    Entrez l'URL de votre logo ou téléversez-le dans le stockage d'objets
                  </p>
                </div>
                {formData.logoUrl && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <Label className="mb-2 block">Aperçu</Label>
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      className="max-h-20 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
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
        </Tabs>
      </div>
    </AdminShell>
  );
}
