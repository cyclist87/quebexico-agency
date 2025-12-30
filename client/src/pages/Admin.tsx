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
import { MessageCircle, BookOpen, Plus, Trash2, Edit, ChevronRight, ArrowLeft, Lock, LogOut } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

const getAdminKey = () => localStorage.getItem("quebexico_admin_key") || "";
const setAdminKey = (key: string) => localStorage.setItem("quebexico_admin_key", key);
const clearAdminKey = () => localStorage.removeItem("quebexico_admin_key");

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
  const [editingDoc, setEditingDoc] = useState<KnowledgeDoc | null>(null);
  const [newDoc, setNewDoc] = useState({ title: "", content: "", language: "fr", category: "" });

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
              <p className="text-muted-foreground">Gérez le chatbot et la base de connaissances</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>

        <Tabs defaultValue="conversations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="conversations" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Conversations
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Base de connaissances
            </TabsTrigger>
          </TabsList>

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
        </Tabs>
      </div>
    </div>
  );
}
