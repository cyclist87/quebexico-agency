import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Loader2, Plus, Pencil, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";
import type { ContentSection, InsertContentSection } from "@shared/schema";

const SECTION_TYPES = [
  { value: "hero", labelFr: "Section Hero", labelEn: "Hero Section", labelEs: "Sección Hero" },
  { value: "about", labelFr: "À propos", labelEn: "About", labelEs: "Acerca de" },
  { value: "services", labelFr: "Services", labelEn: "Services", labelEs: "Servicios" },
  { value: "portfolio", labelFr: "Portfolio", labelEn: "Portfolio", labelEs: "Portafolio" },
  { value: "testimonials", labelFr: "Témoignages", labelEn: "Testimonials", labelEs: "Testimonios" },
  { value: "contact", labelFr: "Contact", labelEn: "Contact", labelEs: "Contacto" },
  { value: "cta", labelFr: "Appel à l'action", labelEn: "Call to Action", labelEs: "Llamada a la acción" },
  { value: "features", labelFr: "Fonctionnalités", labelEn: "Features", labelEs: "Características" },
  { value: "custom", labelFr: "Section personnalisée", labelEn: "Custom Section", labelEs: "Sección personalizada" },
];

export default function AdminContent() {
  const { toast } = useToast();
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertContentSection>>({});

  const { data: sections = [], isLoading } = useQuery<ContentSection[]>({
    queryKey: ["/api/admin/content-sections"],
    staleTime: 0,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<InsertContentSection>) => {
      const response = await fetch("/api/admin/content-sections", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content-sections"] });
      toast({ title: "Section créée", description: "La section a été ajoutée avec succès." });
      setIsDialogOpen(false);
      setFormData({});
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de créer la section.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertContentSection> }) => {
      const response = await fetch(`/api/admin/content-sections/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content-sections"] });
      toast({ title: "Section mise à jour", description: "Les modifications ont été sauvegardées." });
      setIsDialogOpen(false);
      setEditingSection(null);
      setFormData({});
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour la section.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/content-sections/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content-sections"] });
      toast({ title: "Section supprimée", description: "La section a été supprimée." });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de supprimer la section.", variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: number; isEnabled: boolean }) => {
      const response = await fetch(`/api/admin/content-sections/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isEnabled }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to toggle");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content-sections"] });
    },
  });

  const handleEdit = (section: ContentSection) => {
    setEditingSection(section);
    setFormData({
      sectionType: section.sectionType,
      isEnabled: section.isEnabled ?? true,
      orderIndex: section.orderIndex ?? 0,
      titleFr: section.titleFr || "",
      titleEn: section.titleEn || "",
      titleEs: section.titleEs || "",
      subtitleFr: section.subtitleFr || "",
      subtitleEn: section.subtitleEn || "",
      subtitleEs: section.subtitleEs || "",
      contentFr: section.contentFr || "",
      contentEn: section.contentEn || "",
      contentEs: section.contentEs || "",
      imageUrl: section.imageUrl || "",
      buttonTextFr: section.buttonTextFr || "",
      buttonTextEn: section.buttonTextEn || "",
      buttonTextEs: section.buttonTextEs || "",
      buttonUrl: section.buttonUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingSection(null);
    setFormData({
      sectionType: "custom",
      isEnabled: true,
      orderIndex: sections.length,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingSection) {
      updateMutation.mutate({ id: editingSection.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleToggle = (section: ContentSection) => {
    toggleMutation.mutate({ id: section.id, isEnabled: !section.isEnabled });
  };

  const reorderMutation = useMutation({
    mutationFn: async (updates: { id: number; orderIndex: number }[]) => {
      for (const update of updates) {
        await fetch(`/api/admin/content-sections/${update.id}`, {
          method: "PUT",
          body: JSON.stringify({ orderIndex: update.orderIndex }),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content-sections"] });
    },
  });

  const handleMoveUp = (section: ContentSection) => {
    const currentIndex = sections.findIndex((s) => s.id === section.id);
    if (currentIndex <= 0 || reorderMutation.isPending) return;
    const newSections = [...sections];
    [newSections[currentIndex - 1], newSections[currentIndex]] = 
      [newSections[currentIndex], newSections[currentIndex - 1]];
    const updates = newSections.map((s, idx) => ({ id: s.id, orderIndex: idx }));
    reorderMutation.mutate(updates);
  };

  const handleMoveDown = (section: ContentSection) => {
    const currentIndex = sections.findIndex((s) => s.id === section.id);
    if (currentIndex >= sections.length - 1 || reorderMutation.isPending) return;
    const newSections = [...sections];
    [newSections[currentIndex], newSections[currentIndex + 1]] = 
      [newSections[currentIndex + 1], newSections[currentIndex]];
    const updates = newSections.map((s, idx) => ({ id: s.id, orderIndex: idx }));
    reorderMutation.mutate(updates);
  };

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminShell>
    );
  }

  const getSectionTypeLabel = (type: string) => {
    const found = SECTION_TYPES.find((t) => t.value === type);
    return found?.labelFr || type;
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">
              Gestion du contenu
            </h1>
            <p className="text-muted-foreground">
              Gérez les sections affichées sur votre site
            </p>
          </div>
          <Button onClick={handleCreate} data-testid="button-add-section">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une section
          </Button>
        </div>

        {sections.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">Aucune section de contenu configurée</p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Créer votre première section
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sections.map((section) => (
              <Card key={section.id} className={section.isEnabled ? "" : "opacity-60"}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMoveUp(section)}
                        disabled={sections.findIndex((s) => s.id === section.id) === 0 || reorderMutation.isPending}
                        data-testid={`button-move-up-${section.id}`}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMoveDown(section)}
                        disabled={sections.findIndex((s) => s.id === section.id) === sections.length - 1 || reorderMutation.isPending}
                        data-testid={`button-move-down-${section.id}`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {section.titleFr || getSectionTypeLabel(section.sectionType)}
                        </span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {getSectionTypeLabel(section.sectionType)}
                        </span>
                      </div>
                      {section.subtitleFr && (
                        <p className="text-sm text-muted-foreground mt-1">{section.subtitleFr}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggle(section)}
                        data-testid={`button-toggle-section-${section.id}`}
                      >
                        {section.isEnabled ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(section)}
                        data-testid={`button-edit-section-${section.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Supprimer cette section ?")) {
                            deleteMutation.mutate(section.id);
                          }
                        }}
                        data-testid={`button-delete-section-${section.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSection ? "Modifier la section" : "Nouvelle section"}
              </DialogTitle>
              <DialogDescription>
                Configurez le contenu de cette section en trois langues
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Type de section</Label>
                  <Select
                    value={formData.sectionType || "custom"}
                    onValueChange={(value) => setFormData({ ...formData, sectionType: value })}
                  >
                    <SelectTrigger data-testid="select-section-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.labelFr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ordre d'affichage</Label>
                  <Input
                    type="number"
                    value={formData.orderIndex ?? 0}
                    onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value, 10) })}
                    data-testid="input-order-index"
                  />
                </div>
              </div>

              <Tabs defaultValue="fr" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="es">Español</TabsTrigger>
                </TabsList>

                <TabsContent value="fr" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Titre (FR)</Label>
                    <Input
                      value={formData.titleFr || ""}
                      onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
                      placeholder="Titre de la section"
                      data-testid="input-title-fr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sous-titre (FR)</Label>
                    <Input
                      value={formData.subtitleFr || ""}
                      onChange={(e) => setFormData({ ...formData, subtitleFr: e.target.value })}
                      placeholder="Sous-titre optionnel"
                      data-testid="input-subtitle-fr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contenu (FR)</Label>
                    <Textarea
                      value={formData.contentFr || ""}
                      onChange={(e) => setFormData({ ...formData, contentFr: e.target.value })}
                      placeholder="Contenu de la section..."
                      rows={4}
                      data-testid="input-content-fr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Texte du bouton (FR)</Label>
                    <Input
                      value={formData.buttonTextFr || ""}
                      onChange={(e) => setFormData({ ...formData, buttonTextFr: e.target.value })}
                      placeholder="En savoir plus"
                      data-testid="input-button-text-fr"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="en" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title (EN)</Label>
                    <Input
                      value={formData.titleEn || ""}
                      onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                      placeholder="Section title"
                      data-testid="input-title-en"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle (EN)</Label>
                    <Input
                      value={formData.subtitleEn || ""}
                      onChange={(e) => setFormData({ ...formData, subtitleEn: e.target.value })}
                      placeholder="Optional subtitle"
                      data-testid="input-subtitle-en"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Content (EN)</Label>
                    <Textarea
                      value={formData.contentEn || ""}
                      onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                      placeholder="Section content..."
                      rows={4}
                      data-testid="input-content-en"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Button text (EN)</Label>
                    <Input
                      value={formData.buttonTextEn || ""}
                      onChange={(e) => setFormData({ ...formData, buttonTextEn: e.target.value })}
                      placeholder="Learn more"
                      data-testid="input-button-text-en"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="es" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título (ES)</Label>
                    <Input
                      value={formData.titleEs || ""}
                      onChange={(e) => setFormData({ ...formData, titleEs: e.target.value })}
                      placeholder="Título de la sección"
                      data-testid="input-title-es"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtítulo (ES)</Label>
                    <Input
                      value={formData.subtitleEs || ""}
                      onChange={(e) => setFormData({ ...formData, subtitleEs: e.target.value })}
                      placeholder="Subtítulo opcional"
                      data-testid="input-subtitle-es"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contenido (ES)</Label>
                    <Textarea
                      value={formData.contentEs || ""}
                      onChange={(e) => setFormData({ ...formData, contentEs: e.target.value })}
                      placeholder="Contenido de la sección..."
                      rows={4}
                      data-testid="input-content-es"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Texto del botón (ES)</Label>
                    <Input
                      value={formData.buttonTextEs || ""}
                      onChange={(e) => setFormData({ ...formData, buttonTextEs: e.target.value })}
                      placeholder="Más información"
                      data-testid="input-button-text-es"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label>URL de l'image</Label>
                  <Input
                    value={formData.imageUrl || ""}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    data-testid="input-image-url"
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL du bouton</Label>
                  <Input
                    value={formData.buttonUrl || ""}
                    onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
                    placeholder="/contact ou https://..."
                    data-testid="input-button-url"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-section"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Sauvegarder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminShell>
  );
}
