import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { Save, Globe, Palette, Bell, Shield } from "lucide-react";

export default function AdminSettingsPage() {
  const { language } = useLanguage();
  const lang = (language === "en" || language === "es" ? language : "fr") as "fr" | "en" | "es";

  const translations = {
    fr: {
      title: "Paramètres",
      subtitle: "Configuration générale de votre site",
      general: "Général",
      appearance: "Apparence",
      notifications: "Notifications",
      security: "Sécurité",
      siteName: "Nom du site",
      siteDescription: "Description",
      contactEmail: "Email de contact",
      save: "Enregistrer",
      darkMode: "Mode sombre",
      primaryColor: "Couleur principale",
      emailNotifications: "Notifications par email",
      smsNotifications: "Notifications SMS",
      twoFactor: "Authentification à deux facteurs",
      sessionTimeout: "Expiration de session (minutes)",
    },
    en: {
      title: "Settings",
      subtitle: "General configuration for your site",
      general: "General",
      appearance: "Appearance",
      notifications: "Notifications",
      security: "Security",
      siteName: "Site name",
      siteDescription: "Description",
      contactEmail: "Contact email",
      save: "Save",
      darkMode: "Dark mode",
      primaryColor: "Primary color",
      emailNotifications: "Email notifications",
      smsNotifications: "SMS notifications",
      twoFactor: "Two-factor authentication",
      sessionTimeout: "Session timeout (minutes)",
    },
    es: {
      title: "Configuración",
      subtitle: "Configuración general de tu sitio",
      general: "General",
      appearance: "Apariencia",
      notifications: "Notificaciones",
      security: "Seguridad",
      siteName: "Nombre del sitio",
      siteDescription: "Descripción",
      contactEmail: "Email de contacto",
      save: "Guardar",
      darkMode: "Modo oscuro",
      primaryColor: "Color principal",
      emailNotifications: "Notificaciones por email",
      smsNotifications: "Notificaciones SMS",
      twoFactor: "Autenticación de dos factores",
      sessionTimeout: "Expiración de sesión (minutos)",
    },
  };

  const t = translations[lang];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" data-testid="tab-general">
            <Globe className="w-4 h-4 mr-2" />
            {t.general}
          </TabsTrigger>
          <TabsTrigger value="appearance" data-testid="tab-appearance">
            <Palette className="w-4 h-4 mr-2" />
            {t.appearance}
          </TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">
            <Bell className="w-4 h-4 mr-2" />
            {t.notifications}
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            <Shield className="w-4 h-4 mr-2" />
            {t.security}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t.general}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">{t.siteName}</Label>
                <Input id="siteName" placeholder="Mon Site" data-testid="input-site-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">{t.siteDescription}</Label>
                <Input id="siteDescription" placeholder="Description de mon site" data-testid="input-site-description" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">{t.contactEmail}</Label>
                <Input id="contactEmail" type="email" placeholder="contact@example.com" data-testid="input-contact-email" />
              </div>
              <Button data-testid="button-save-general">
                <Save className="w-4 h-4 mr-2" />
                {t.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>{t.appearance}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="darkMode">{t.darkMode}</Label>
                <Switch id="darkMode" data-testid="switch-dark-mode" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryColor">{t.primaryColor}</Label>
                <Input id="primaryColor" type="color" className="w-20 h-10" data-testid="input-primary-color" />
              </div>
              <Button data-testid="button-save-appearance">
                <Save className="w-4 h-4 mr-2" />
                {t.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t.notifications}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications">{t.emailNotifications}</Label>
                <Switch id="emailNotifications" defaultChecked data-testid="switch-email-notifications" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="smsNotifications">{t.smsNotifications}</Label>
                <Switch id="smsNotifications" data-testid="switch-sms-notifications" />
              </div>
              <Button data-testid="button-save-notifications">
                <Save className="w-4 h-4 mr-2" />
                {t.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t.security}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="twoFactor">{t.twoFactor}</Label>
                <Switch id="twoFactor" data-testid="switch-two-factor" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">{t.sessionTimeout}</Label>
                <Input id="sessionTimeout" type="number" defaultValue="30" className="w-24" data-testid="input-session-timeout" />
              </div>
              <Button data-testid="button-save-security">
                <Save className="w-4 h-4 mr-2" />
                {t.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
