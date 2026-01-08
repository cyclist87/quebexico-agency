import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MessageCircle, BookOpen, Plus, Trash2, Edit, ChevronRight, ChevronDown, ArrowLeft, Lock, LogOut, FileText, Star, GripVertical, Eye, EyeOff, Languages, Loader2, Settings } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import type { BlogPost, BlogCategory } from "@shared/schema";

const getAdminKey = () => localStorage.getItem("quebexico_admin_key") || "";
const setAdminKey = (key: string) => localStorage.setItem("quebexico_admin_key", key);
const clearAdminKey = () => localStorage.removeItem("quebexico_admin_key");

interface SiteSetting {
  id: number;
  key: string;
  value: string | null;
  createdAt: string;
  updatedAt: string;
}

function SettingsTab() {
  const { toast } = useToast();
  const [tinymceApiKey, setTinymceApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: settings, isLoading } = useQuery<SiteSetting[]>({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      return adminRequest<SiteSetting[]>("GET", "/api/admin/settings");
    },
  });

  useEffect(() => {
    if (settings) {
      const tinymceSetting = settings.find(s => s.key === "tinymce_api_key");
      if (tinymceSetting?.value) {
        setTinymceApiKey(tinymceSetting.value);
      }
    }
  }, [settings]);

  const saveSetting = async (key: string, value: string | null) => {
    setIsSaving(true);
    try {
      await adminRequest("PUT", `/api/admin/settings/${key}`, { value });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Paramètre sauvegardé", description: "Le paramètre a été mis à jour avec succès" });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de sauvegarder le paramètre", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-muted-foreground text-center">Chargement des paramètres...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Éditeur de contenu (TinyMCE)</CardTitle>
          <CardDescription>
            Configurez votre clé API TinyMCE pour l'éditeur de texte enrichi.
            Obtenez une clé gratuite sur{" "}
            <a 
              href="https://www.tiny.cloud/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              tiny.cloud
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tinymce-api-key">Clé API TinyMCE</Label>
              <Input
                id="tinymce-api-key"
                type="password"
                placeholder="Entrez votre clé API TinyMCE"
                value={tinymceApiKey}
                onChange={(e) => setTinymceApiKey(e.target.value)}
                data-testid="input-tinymce-api-key"
              />
            </div>
            <Button
              onClick={() => saveSetting("tinymce_api_key", tinymceApiKey || null)}
              disabled={isSaving}
              data-testid="button-save-tinymce-key"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sauvegarder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function adminRequest<T>(method: string, url: string, data?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-admin-key": getAdminKey(),
  };
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

interface ChatSession {
  id: number;
  visitorId: string;
  language: string;
  email: string | null;
  status: string;
  createdAt: string;
  messages?: ChatMessage[];
}

interface ChatMessage {
  id: number;
  sessionId: number;
  role: string;
  content: string;
  createdAt: string;
}

interface KnowledgeDoc {
  id: number;
  title: string;
  content: string;
  language: string;
  category: string | null;
  isActive: boolean;
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [kbDialogOpen, setKbDialogOpen] = useState(false);

  useEffect(() => {
    document.title = "Administration | QUEBEXICO";
  }, []);
  const [editingDoc, setEditingDoc] = useState<KnowledgeDoc | null>(null);
  const [newDoc, setNewDoc] = useState({ title: "", content: "", language: "fr", category: "" });
  
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const emptyPost = {
    slug: "",
    titleFr: "",
    titleEn: "",
    titleEs: "",
    excerptFr: "",
    excerptEn: "",
    excerptEs: "",
    contentFr: "",
    contentEn: "",
    contentEs: "",
    imageUrl: "",
    videoUrl: "",
    categoryId: null as number | null,
    tags: [] as string[],
    isFeatured: false,
    isPublished: false,
    authorName: "",
    publishedAt: "",
  };
  const [newPost, setNewPost] = useState(emptyPost);
  const emptyCategory = {
    slug: "",
    nameFr: "",
    nameEn: "",
    nameEs: "",
  };
  const [newCategory, setNewCategory] = useState(emptyCategory);
  const [enOpen, setEnOpen] = useState(false);
  const [esOpen, setEsOpen] = useState(false);
  const [editEnOpen, setEditEnOpen] = useState(false);
  const [editEsOpen, setEditEsOpen] = useState(false);
  const [translating, setTranslating] = useState(false);
  const { toast } = useToast();

  const generateTranslations = async (isEditing: boolean) => {
    const post = isEditing ? editingPost : newPost;
    if (!post?.titleFr || !post?.contentFr) {
      toast({ title: "Erreur", description: "Veuillez d'abord remplir le titre et contenu en français", variant: "destructive" });
      return;
    }
    
    setTranslating(true);
    try {
      const response = await adminRequest<{ titleEn: string; titleEs: string; excerptEn: string; excerptEs: string; contentEn: string; contentEs: string }>(
        "POST",
        "/api/admin/translate",
        {
          titleFr: post.titleFr,
          excerptFr: post.excerptFr || "",
          contentFr: post.contentFr,
        }
      );
      
      if (isEditing && editingPost) {
        setEditingPost({
          ...editingPost,
          titleEn: response.titleEn,
          titleEs: response.titleEs,
          excerptEn: response.excerptEn,
          excerptEs: response.excerptEs,
          contentEn: response.contentEn,
          contentEs: response.contentEs,
        });
        setEditEnOpen(true);
        setEditEsOpen(true);
      } else {
        setNewPost({
          ...newPost,
          titleEn: response.titleEn,
          titleEs: response.titleEs,
          excerptEn: response.excerptEn,
          excerptEs: response.excerptEs,
          contentEn: response.contentEn,
          contentEs: response.contentEs,
        });
        setEnOpen(true);
        setEsOpen(true);
      }
      toast({ title: "Traductions générées", description: "Les traductions EN et ES ont été générées avec succès" });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de générer les traductions", variant: "destructive" });
    } finally {
      setTranslating(false);
    }
  };

  // Check existing key on mount
  useEffect(() => {
    if (getAdminKey()) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async () => {
    setAdminKey(adminKeyInput);
    try {
      await adminRequest<KnowledgeDoc[]>("GET", "/api/admin/knowledge-base");
      setIsAuthenticated(true);
      setAuthError("");
    } catch (error) {
      clearAdminKey();
      setAuthError("Clé d'administration invalide");
    }
  };

  const handleLogout = () => {
    clearAdminKey();
    setIsAuthenticated(false);
    setAdminKeyInput("");
    queryClient.clear();
  };

  // Fetch chat sessions
  const { data: sessions = [], isLoading: sessionsLoading, error: sessionsError } = useQuery<ChatSession[]>({
    queryKey: ["/api/admin/chat/sessions"],
    queryFn: () => adminRequest<ChatSession[]>("GET", "/api/admin/chat/sessions"),
    enabled: isAuthenticated,
  });

  // Fetch selected session details
  const { data: sessionDetails } = useQuery<ChatSession>({
    queryKey: ["/api/admin/chat/sessions", selectedSession?.id],
    queryFn: () => adminRequest<ChatSession>("GET", `/api/admin/chat/sessions/${selectedSession?.id}`),
    enabled: isAuthenticated && !!selectedSession,
  });

  // Fetch knowledge base
  const { data: knowledgeDocs = [], isLoading: kbLoading } = useQuery<KnowledgeDoc[]>({
    queryKey: ["/api/admin/knowledge-base"],
    queryFn: () => adminRequest<KnowledgeDoc[]>("GET", "/api/admin/knowledge-base"),
    enabled: isAuthenticated,
  });

  // Fetch blog posts
  const { data: blogPosts = [], isLoading: blogLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/admin/blog"],
    queryFn: () => adminRequest<BlogPost[]>("GET", "/api/admin/blog"),
    enabled: isAuthenticated,
  });

  // Fetch blog categories
  const { data: blogCategories = [] } = useQuery<BlogCategory[]>({
    queryKey: ["/api/admin/blog/categories"],
    queryFn: () => adminRequest<BlogCategory[]>("GET", "/api/admin/blog/categories"),
    enabled: isAuthenticated,
  });

  // Fetch site settings for TinyMCE API key
  const { data: adminSettings = [] } = useQuery<SiteSetting[]>({
    queryKey: ["/api/admin/settings"],
    queryFn: () => adminRequest<SiteSetting[]>("GET", "/api/admin/settings"),
    enabled: isAuthenticated,
  });

  const tinymceApiKey = adminSettings.find(s => s.key === "tinymce_api_key")?.value || undefined;

  // Handle auth errors
  useEffect(() => {
    if (sessionsError?.message === "Unauthorized") {
      handleLogout();
    }
  }, [sessionsError]);

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: (id: number) => adminRequest("DELETE", `/api/admin/chat/sessions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/chat/sessions"] });
      setSelectedSession(null);
    },
  });

  // Create knowledge doc mutation
  const createDocMutation = useMutation({
    mutationFn: (doc: typeof newDoc) => adminRequest("POST", "/api/admin/knowledge-base", doc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/knowledge-base"] });
      setKbDialogOpen(false);
      setNewDoc({ title: "", content: "", language: "fr", category: "" });
    },
  });

  // Update knowledge doc mutation
  const updateDocMutation = useMutation({
    mutationFn: (doc: KnowledgeDoc) => adminRequest("PUT", `/api/admin/knowledge-base/${doc.id}`, doc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/knowledge-base"] });
      setEditingDoc(null);
    },
  });

  // Delete knowledge doc mutation
  const deleteDocMutation = useMutation({
    mutationFn: (id: number) => adminRequest("DELETE", `/api/admin/knowledge-base/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/knowledge-base"] });
    },
  });

  // Create blog post mutation
  const createPostMutation = useMutation({
    mutationFn: (post: typeof newPost) => {
      const postData = {
        ...post,
        publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : null,
      };
      return adminRequest("POST", "/api/admin/blog", postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      setBlogDialogOpen(false);
      setNewPost(emptyPost);
      toast({ title: "Succès", description: "Article créé avec succès" });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message || "Erreur lors de la création de l'article", variant: "destructive" });
    },
  });

  // Update blog post mutation
  const updatePostMutation = useMutation({
    mutationFn: (post: BlogPost) => {
      const { id, createdAt, updatedAt, ...updateData } = post;
      return adminRequest("PUT", `/api/admin/blog/${id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      setEditingPost(null);
      toast({ title: "Succès", description: "Article modifié avec succès" });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message || "Erreur lors de la modification de l'article", variant: "destructive" });
    },
  });

  // Delete blog post mutation
  const deletePostMutation = useMutation({
    mutationFn: (id: number) => adminRequest("DELETE", `/api/admin/blog/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
    },
  });

  // Set featured post mutation
  const setFeaturedMutation = useMutation({
    mutationFn: (id: number) => adminRequest("POST", `/api/admin/blog/${id}/featured`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (cat: typeof newCategory) => adminRequest("POST", "/api/admin/blog/categories", cat),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog/categories"] });
      setCategoryDialogOpen(false);
      setNewCategory(emptyCategory);
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: (cat: BlogCategory) => adminRequest("PUT", `/api/admin/blog/categories/${cat.id}`, cat),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog/categories"] });
      setEditingCategory(null);
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => adminRequest("DELETE", `/api/admin/blog/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog/categories"] });
    },
  });

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Administration</CardTitle>
            <CardDescription>
              Entrez la clé d'administration pour accéder au tableau de bord
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Clé d'administration"
              value={adminKeyInput}
              onChange={(e) => setAdminKeyInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              data-testid="input-admin-key"
            />
            {authError && (
              <p className="text-sm text-destructive">{authError}</p>
            )}
            <Button className="w-full" onClick={handleLogin} data-testid="button-admin-login">
              Se connecter
            </Button>
            <div className="text-center">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au site
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container-padding max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-3xl font-bold">Administration</h1>
              <p className="text-muted-foreground">Tableau de bord de gestion</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>

        <Tabs defaultValue="blog" className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <TabsList className="h-auto p-1">
              <TabsTrigger value="blog" className="gap-2">
                <FileText className="h-4 w-4" />
                Blog
              </TabsTrigger>
            </TabsList>
            <TabsList className="h-auto p-1">
              <div className="flex items-center gap-1 px-2 text-xs text-muted-foreground font-medium">
                <MessageCircle className="h-3 w-3" />
                Chatbot IA
              </div>
              <TabsTrigger value="conversations" className="gap-2">
                Conversations
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="gap-2">
                Base de connaissances
              </TabsTrigger>
            </TabsList>
            <TabsList className="h-auto p-1">
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Paramètres
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Conversations Tab */}
          <TabsContent value="conversations">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sessions List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Sessions ({sessions.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[500px] overflow-y-auto">
                    {sessionsLoading ? (
                      <p className="p-4 text-muted-foreground">Chargement...</p>
                    ) : sessions.length === 0 ? (
                      <p className="p-4 text-muted-foreground">Aucune conversation</p>
                    ) : (
                      sessions.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => setSelectedSession(session)}
                          className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedSession?.id === session.id ? "bg-muted" : ""
                          }`}
                          data-testid={`session-item-${session.id}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {session.email || session.visitorId.slice(0, 20)}...
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(session.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {session.language.toUpperCase()}
                              </Badge>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Conversation Detail */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">
                      {selectedSession ? "Conversation" : "Sélectionnez une conversation"}
                    </CardTitle>
                    {selectedSession?.email && (
                      <CardDescription>{selectedSession.email}</CardDescription>
                    )}
                  </div>
                  {selectedSession && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSessionMutation.mutate(selectedSession.id)}
                      data-testid="button-delete-session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {sessionDetails?.messages ? (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      {sessionDetails.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg text-sm ${
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Sélectionnez une conversation pour voir les messages
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle>Base de connaissances</CardTitle>
                  <CardDescription>
                    Ajoutez des informations pour améliorer les réponses du chatbot
                  </CardDescription>
                </div>
                <Dialog open={kbDialogOpen} onOpenChange={setKbDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-knowledge">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter un document</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Input
                        placeholder="Titre"
                        value={newDoc.title}
                        onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                        data-testid="input-kb-title"
                      />
                      <Textarea
                        placeholder="Contenu (informations pour le chatbot)"
                        value={newDoc.content}
                        onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                        className="min-h-[150px]"
                        data-testid="input-kb-content"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Select
                          value={newDoc.language}
                          onValueChange={(v) => setNewDoc({ ...newDoc, language: v })}
                        >
                          <SelectTrigger data-testid="select-kb-language">
                            <SelectValue placeholder="Langue" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Catégorie (optionnel)"
                          value={newDoc.category}
                          onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
                          data-testid="input-kb-category"
                        />
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => createDocMutation.mutate(newDoc)}
                        disabled={!newDoc.title || !newDoc.content}
                        data-testid="button-save-knowledge"
                      >
                        Enregistrer
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {kbLoading ? (
                  <p className="text-muted-foreground">Chargement...</p>
                ) : knowledgeDocs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucun document. Ajoutez des informations sur vos services, tarifs, FAQ, etc.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {knowledgeDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 border rounded-lg"
                        data-testid={`kb-doc-${doc.id}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="font-semibold">{doc.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {doc.language.toUpperCase()}
                              </Badge>
                              {doc.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {doc.category}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {doc.content}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingDoc(doc)}
                              data-testid={`button-edit-kb-${doc.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteDocMutation.mutate(doc.id)}
                              data-testid={`button-delete-kb-${doc.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={!!editingDoc} onOpenChange={() => setEditingDoc(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Modifier le document</DialogTitle>
                </DialogHeader>
                {editingDoc && (
                  <div className="space-y-4 pt-4">
                    <Input
                      placeholder="Titre"
                      value={editingDoc.title}
                      onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                    />
                    <Textarea
                      placeholder="Contenu"
                      value={editingDoc.content}
                      onChange={(e) => setEditingDoc({ ...editingDoc, content: e.target.value })}
                      className="min-h-[150px]"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        value={editingDoc.language}
                        onValueChange={(v) => setEditingDoc({ ...editingDoc, language: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Langue" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Catégorie"
                        value={editingDoc.category || ""}
                        onChange={(e) => setEditingDoc({ ...editingDoc, category: e.target.value })}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => updateDocMutation.mutate(editingDoc)}
                    >
                      Mettre à jour
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog">
            <div className="space-y-6">
              {/* Categories Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <div>
                    <CardTitle>Catégories</CardTitle>
                    <CardDescription>Organisez vos articles par catégories</CardDescription>
                  </div>
                  <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" data-testid="button-add-category">
                        <Plus className="h-4 w-4 mr-2" />
                        Catégorie
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nouvelle catégorie</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <Input
                          placeholder="Slug (ex: technology)"
                          value={newCategory.slug}
                          onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                          data-testid="input-category-slug"
                        />
                        <Input
                          placeholder="Nom (Français)"
                          value={newCategory.nameFr}
                          onChange={(e) => setNewCategory({ ...newCategory, nameFr: e.target.value })}
                          data-testid="input-category-name-fr"
                        />
                        <Input
                          placeholder="Name (English)"
                          value={newCategory.nameEn}
                          onChange={(e) => setNewCategory({ ...newCategory, nameEn: e.target.value })}
                          data-testid="input-category-name-en"
                        />
                        <Input
                          placeholder="Nombre (Español)"
                          value={newCategory.nameEs}
                          onChange={(e) => setNewCategory({ ...newCategory, nameEs: e.target.value })}
                          data-testid="input-category-name-es"
                        />
                        <Button
                          className="w-full"
                          onClick={() => createCategoryMutation.mutate(newCategory)}
                          disabled={!newCategory.slug || !newCategory.nameFr || !newCategory.nameEn || !newCategory.nameEs}
                          data-testid="button-save-category"
                        >
                          Créer
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {blogCategories.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Aucune catégorie. Créez-en une pour organiser vos articles.
                    </p>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      {blogCategories.map((cat) => (
                        <div key={cat.id} className="flex items-center gap-1">
                          <Badge variant="secondary" data-testid={`badge-category-${cat.id}`}>
                            {cat.nameFr}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setEditingCategory(cat)}
                            data-testid={`button-edit-category-${cat.id}`}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => deleteCategoryMutation.mutate(cat.id)}
                            data-testid={`button-delete-category-${cat.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Blog Posts Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <div>
                    <CardTitle>Articles ({blogPosts.length})</CardTitle>
                    <CardDescription>
                      Gérez vos articles de blog multilingues
                    </CardDescription>
                  </div>
                  <Dialog open={blogDialogOpen} onOpenChange={setBlogDialogOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-add-post">
                        <Plus className="h-4 w-4 mr-2" />
                        Nouvel article
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Créer un article</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            placeholder="Slug (ex: my-article)"
                            value={newPost.slug}
                            onChange={(e) => setNewPost({ ...newPost, slug: e.target.value })}
                            data-testid="input-post-slug"
                          />
                          <Input
                            placeholder="Auteur"
                            value={newPost.authorName}
                            onChange={(e) => setNewPost({ ...newPost, authorName: e.target.value })}
                            data-testid="input-post-author"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-sm text-muted-foreground">Date de publication</Label>
                            <Input
                              type="datetime-local"
                              value={newPost.publishedAt}
                              onChange={(e) => setNewPost({ ...newPost, publishedAt: e.target.value })}
                              data-testid="input-post-published-at"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-base font-semibold">Français (principal)</Label>
                            <Input
                              placeholder="Titre (FR)"
                              value={newPost.titleFr}
                              onChange={(e) => setNewPost({ ...newPost, titleFr: e.target.value })}
                              data-testid="input-post-title-fr"
                            />
                            <Input
                              placeholder="Extrait (FR)"
                              value={newPost.excerptFr}
                              onChange={(e) => setNewPost({ ...newPost, excerptFr: e.target.value })}
                            />
                            <div data-testid="input-post-content-fr">
                              <RichTextEditor
                                value={newPost.contentFr}
                                onChange={(content) => setNewPost({ ...newPost, contentFr: content })}
                                placeholder="Contenu (FR)"
                                apiKey={tinymceApiKey}
                                height={250}
                              />
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => generateTranslations(false)}
                            disabled={translating || !newPost.titleFr || !newPost.contentFr}
                            className="w-full"
                            data-testid="button-generate-translations"
                          >
                            {translating ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Languages className="h-4 w-4 mr-2" />
                            )}
                            Générer les traductions EN/ES
                          </Button>

                          <Collapsible open={enOpen} onOpenChange={setEnOpen}>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" className="w-full justify-between" data-testid="button-toggle-en">
                                <span className="flex items-center gap-2">
                                  English
                                  {newPost.titleEn && <Badge variant="secondary" className="text-xs">Rempli</Badge>}
                                </span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${enOpen ? "rotate-180" : ""}`} />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-2 pt-2">
                              <Input
                                placeholder="Title (EN)"
                                value={newPost.titleEn}
                                onChange={(e) => setNewPost({ ...newPost, titleEn: e.target.value })}
                                data-testid="input-post-title-en"
                              />
                              <Input
                                placeholder="Excerpt (EN)"
                                value={newPost.excerptEn}
                                onChange={(e) => setNewPost({ ...newPost, excerptEn: e.target.value })}
                              />
                              <div data-testid="input-post-content-en">
                                <RichTextEditor
                                  value={newPost.contentEn}
                                  onChange={(content) => setNewPost({ ...newPost, contentEn: content })}
                                  placeholder="Content (EN)"
                                  apiKey={tinymceApiKey}
                                  height={200}
                                />
                              </div>
                            </CollapsibleContent>
                          </Collapsible>

                          <Collapsible open={esOpen} onOpenChange={setEsOpen}>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" className="w-full justify-between" data-testid="button-toggle-es">
                                <span className="flex items-center gap-2">
                                  Español
                                  {newPost.titleEs && <Badge variant="secondary" className="text-xs">Rempli</Badge>}
                                </span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${esOpen ? "rotate-180" : ""}`} />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-2 pt-2">
                              <Input
                                placeholder="Título (ES)"
                                value={newPost.titleEs}
                                onChange={(e) => setNewPost({ ...newPost, titleEs: e.target.value })}
                                data-testid="input-post-title-es"
                              />
                              <Input
                                placeholder="Extracto (ES)"
                                value={newPost.excerptEs}
                                onChange={(e) => setNewPost({ ...newPost, excerptEs: e.target.value })}
                              />
                              <div data-testid="input-post-content-es">
                                <RichTextEditor
                                  value={newPost.contentEs}
                                  onChange={(content) => setNewPost({ ...newPost, contentEs: content })}
                                  placeholder="Contenido (ES)"
                                  apiKey={tinymceApiKey}
                                  height={200}
                                />
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            placeholder="URL Image (https://...)"
                            value={newPost.imageUrl}
                            onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                            data-testid="input-post-image"
                          />
                          <Input
                            placeholder="URL Vidéo (optionnel)"
                            value={newPost.videoUrl}
                            onChange={(e) => setNewPost({ ...newPost, videoUrl: e.target.value })}
                            data-testid="input-post-video"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <Select
                            value={newPost.categoryId?.toString() || "none"}
                            onValueChange={(v) => setNewPost({ ...newPost, categoryId: v === "none" ? null : parseInt(v) })}
                          >
                            <SelectTrigger data-testid="select-post-category">
                              <SelectValue placeholder="Catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Aucune catégorie</SelectItem>
                              {blogCategories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                  {cat.nameFr}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Tags (séparés par virgule)"
                            value={newPost.tags.join(", ")}
                            onChange={(e) => setNewPost({ ...newPost, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                            data-testid="input-post-tags"
                          />
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={newPost.isPublished}
                              onCheckedChange={(v) => setNewPost({ ...newPost, isPublished: v })}
                              data-testid="switch-post-published"
                            />
                            <Label>Publié</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={newPost.isFeatured}
                              onCheckedChange={(v) => setNewPost({ ...newPost, isFeatured: v })}
                              data-testid="switch-post-featured"
                            />
                            <Label>Mise en avant</Label>
                          </div>
                        </div>

                        <Button
                          className="w-full"
                          onClick={() => createPostMutation.mutate(newPost)}
                          disabled={!newPost.slug || !newPost.titleFr || !newPost.contentFr}
                          data-testid="button-save-post"
                        >
                          Créer l'article
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {blogLoading ? (
                    <p className="text-muted-foreground">Chargement...</p>
                  ) : blogPosts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Aucun article. Créez votre premier article de blog.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {blogPosts.map((post) => (
                        <div
                          key={post.id}
                          className="p-4 border rounded-lg"
                          data-testid={`blog-post-${post.id}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-grab" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h3 className="font-semibold">{post.titleFr}</h3>
                                  {post.isFeatured && (
                                    <Badge variant="default" className="text-xs">
                                      <Star className="h-3 w-3 mr-1" />
                                      Vedette
                                    </Badge>
                                  )}
                                  {post.isPublished ? (
                                    <Badge variant="secondary" className="text-xs">
                                      <Eye className="h-3 w-3 mr-1" />
                                      Publié
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">
                                      <EyeOff className="h-3 w-3 mr-1" />
                                      Brouillon
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {post.excerptFr || post.contentFr.slice(0, 100)}...
                                </p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  <Badge variant="outline" className="text-xs">
                                    /{post.slug}
                                  </Badge>
                                  {post.authorName && (
                                    <span className="text-xs text-muted-foreground">
                                      par {post.authorName}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {!post.isFeatured && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setFeaturedMutation.mutate(post.id)}
                                  title="Mettre en vedette"
                                  data-testid={`button-feature-post-${post.id}`}
                                >
                                  <Star className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingPost(post)}
                                data-testid={`button-edit-post-${post.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deletePostMutation.mutate(post.id)}
                                data-testid={`button-delete-post-${post.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Edit Post Dialog */}
            <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Modifier l'article</DialogTitle>
                </DialogHeader>
                {editingPost && (
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Slug"
                        value={editingPost.slug}
                        onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                      />
                      <Input
                        placeholder="Auteur"
                        value={editingPost.authorName || ""}
                        onChange={(e) => setEditingPost({ ...editingPost, authorName: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-sm text-muted-foreground">Date de publication</Label>
                        <Input
                          type="datetime-local"
                          value={editingPost.publishedAt ? new Date(editingPost.publishedAt).toISOString().slice(0, 16) : ""}
                          onChange={(e) => setEditingPost({ ...editingPost, publishedAt: e.target.value ? new Date(e.target.value) : null })}
                          data-testid="input-edit-post-published-at"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Français (principal)</Label>
                        <Input
                          placeholder="Titre (FR)"
                          value={editingPost.titleFr}
                          onChange={(e) => setEditingPost({ ...editingPost, titleFr: e.target.value })}
                        />
                        <Input
                          placeholder="Extrait (FR)"
                          value={editingPost.excerptFr || ""}
                          onChange={(e) => setEditingPost({ ...editingPost, excerptFr: e.target.value })}
                        />
                        <RichTextEditor
                          value={editingPost.contentFr}
                          onChange={(content) => setEditingPost({ ...editingPost, contentFr: content })}
                          placeholder="Contenu (FR)"
                          apiKey={tinymceApiKey}
                          height={250}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => generateTranslations(true)}
                        disabled={translating || !editingPost.titleFr || !editingPost.contentFr}
                        className="w-full"
                      >
                        {translating ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Languages className="h-4 w-4 mr-2" />
                        )}
                        Régénérer les traductions EN/ES
                      </Button>

                      <Collapsible open={editEnOpen} onOpenChange={setEditEnOpen}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between">
                            <span className="flex items-center gap-2">
                              English
                              {editingPost.titleEn && <Badge variant="secondary" className="text-xs">Rempli</Badge>}
                            </span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${editEnOpen ? "rotate-180" : ""}`} />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2 pt-2">
                          <Input
                            placeholder="Title (EN)"
                            value={editingPost.titleEn}
                            onChange={(e) => setEditingPost({ ...editingPost, titleEn: e.target.value })}
                          />
                          <Input
                            placeholder="Excerpt (EN)"
                            value={editingPost.excerptEn || ""}
                            onChange={(e) => setEditingPost({ ...editingPost, excerptEn: e.target.value })}
                          />
                          <RichTextEditor
                            value={editingPost.contentEn}
                            onChange={(content) => setEditingPost({ ...editingPost, contentEn: content })}
                            placeholder="Content (EN)"
                            apiKey={tinymceApiKey}
                            height={200}
                          />
                        </CollapsibleContent>
                      </Collapsible>

                      <Collapsible open={editEsOpen} onOpenChange={setEditEsOpen}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between">
                            <span className="flex items-center gap-2">
                              Español
                              {editingPost.titleEs && <Badge variant="secondary" className="text-xs">Rempli</Badge>}
                            </span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${editEsOpen ? "rotate-180" : ""}`} />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2 pt-2">
                          <Input
                            placeholder="Título (ES)"
                            value={editingPost.titleEs}
                            onChange={(e) => setEditingPost({ ...editingPost, titleEs: e.target.value })}
                          />
                          <Input
                            placeholder="Extracto (ES)"
                            value={editingPost.excerptEs || ""}
                            onChange={(e) => setEditingPost({ ...editingPost, excerptEs: e.target.value })}
                          />
                          <RichTextEditor
                            value={editingPost.contentEs}
                            onChange={(content) => setEditingPost({ ...editingPost, contentEs: content })}
                            placeholder="Contenido (ES)"
                            apiKey={tinymceApiKey}
                            height={200}
                          />
                        </CollapsibleContent>
                      </Collapsible>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="URL Image"
                        value={editingPost.imageUrl || ""}
                        onChange={(e) => setEditingPost({ ...editingPost, imageUrl: e.target.value })}
                      />
                      <Input
                        placeholder="URL Vidéo"
                        value={editingPost.videoUrl || ""}
                        onChange={(e) => setEditingPost({ ...editingPost, videoUrl: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        value={editingPost.categoryId?.toString() || "none"}
                        onValueChange={(v) => setEditingPost({ ...editingPost, categoryId: v === "none" ? null : parseInt(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucune catégorie</SelectItem>
                          {blogCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.nameFr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Tags (séparés par virgule)"
                        value={editingPost.tags?.join(", ") || ""}
                        onChange={(e) => setEditingPost({ ...editingPost, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                      />
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={editingPost.isPublished || false}
                          onCheckedChange={(v) => setEditingPost({ ...editingPost, isPublished: v })}
                        />
                        <Label>Publié</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={editingPost.isFeatured || false}
                          onCheckedChange={(v) => setEditingPost({ ...editingPost, isFeatured: v })}
                        />
                        <Label>Mise en avant</Label>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => updatePostMutation.mutate(editingPost)}
                    >
                      Mettre à jour
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Edit Category Dialog */}
            <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Modifier la catégorie</DialogTitle>
                </DialogHeader>
                {editingCategory && (
                  <div className="space-y-4 pt-4">
                    <Input
                      placeholder="Slug"
                      value={editingCategory.slug}
                      onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                    />
                    <Input
                      placeholder="Nom (Français)"
                      value={editingCategory.nameFr}
                      onChange={(e) => setEditingCategory({ ...editingCategory, nameFr: e.target.value })}
                    />
                    <Input
                      placeholder="Name (English)"
                      value={editingCategory.nameEn}
                      onChange={(e) => setEditingCategory({ ...editingCategory, nameEn: e.target.value })}
                    />
                    <Input
                      placeholder="Nombre (Español)"
                      value={editingCategory.nameEs}
                      onChange={(e) => setEditingCategory({ ...editingCategory, nameEs: e.target.value })}
                    />
                    <Button
                      className="w-full"
                      onClick={() => updateCategoryMutation.mutate(editingCategory)}
                    >
                      Mettre à jour
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
