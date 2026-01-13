import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Terminal, Eye, EyeOff } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { login, isDevMode } = useAdminAuth();
  const { language } = useLanguage();
  
  const [secretKey, setSecretKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const translations = {
    fr: {
      title: "Connexion Admin",
      description: "Entrez votre clé secrète pour accéder au tableau de bord",
      secretKeyLabel: "Clé secrète",
      secretKeyPlaceholder: "Entrez votre clé admin...",
      loginButton: "Se connecter",
      devLoginButton: "Connexion Dev",
      devModeNote: "Mode développement activé",
      invalidKey: "Clé invalide. Vérifiez votre clé secrète.",
    },
    en: {
      title: "Admin Login",
      description: "Enter your secret key to access the dashboard",
      secretKeyLabel: "Secret Key",
      secretKeyPlaceholder: "Enter your admin key...",
      loginButton: "Login",
      devLoginButton: "Dev Login",
      devModeNote: "Development mode enabled",
      invalidKey: "Invalid key. Check your secret key.",
    },
    es: {
      title: "Acceso Admin",
      description: "Ingresa tu clave secreta para acceder al panel",
      secretKeyLabel: "Clave Secreta",
      secretKeyPlaceholder: "Ingresa tu clave admin...",
      loginButton: "Ingresar",
      devLoginButton: "Acceso Dev",
      devModeNote: "Modo desarrollo activado",
      invalidKey: "Clave inválida. Verifica tu clave secreta.",
    },
  };

  const t = translations[language] || translations.fr;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await login(secretKey);
      if (success) {
        setLocation("/admin");
      } else {
        setError(t.invalidKey);
      }
    } catch {
      setError(t.invalidKey);
    } finally {
      setLoading(false);
    }
  }

  async function handleDevLogin() {
    const devKey = import.meta.env.VITE_DEV_ADMIN_KEY;
    if (!devKey) {
      setError("VITE_DEV_ADMIN_KEY not configured");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      const success = await login(devKey);
      if (success) {
        setLocation("/admin");
      } else {
        setError(t.invalidKey);
      }
    } catch {
      setError(t.invalidKey);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="secretKey">{t.secretKeyLabel}</Label>
              <div className="relative">
                <Input
                  id="secretKey"
                  type={showKey ? "text" : "password"}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder={t.secretKeyPlaceholder}
                  data-testid="input-admin-key"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowKey(!showKey)}
                  data-testid="button-toggle-key-visibility"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !secretKey}
              data-testid="button-admin-login"
            >
              {loading ? "..." : t.loginButton}
            </Button>

            {isDevMode && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Terminal className="w-4 h-4" />
                  <span>{t.devModeNote}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleDevLogin}
                  disabled={loading}
                  data-testid="button-dev-login"
                >
                  {t.devLoginButton}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
