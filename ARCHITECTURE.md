# QUEBEXICO Template System - Architecture & Documentation

> Document de référence pour le partage inter-projets Replit

---

## Résumé

| Propriété | Valeur |
|-----------|--------|
| **Nom** | QUEBEXICO Template System |
| **Type** | Système de templates réutilisables pour sites vitrines clients |
| **Description** | Plateforme multilingue (FR/EN/ES) offrant des templates configurables pour athlètes, freelancers, hôtes location courte durée, services de nettoyage, clubs sportifs et professionnels (avocats/consultants) |
| **Langues** | Français (défaut) / English / Español |
| **URL Dev** | Via Replit Deployment |

### Clients cibles
- Athlètes professionnels
- Freelancers / Consultants
- Hôtes STR (location courte durée)
- Services de nettoyage
- Clubs sportifs
- Professionnels (avocats, consultants)

---

## Stack Technique

### Frontend

| Technologie | Usage |
|-------------|-------|
| React 18 | Framework UI |
| TypeScript | Typage statique |
| Vite | Build tool + HMR |
| Wouter | Routing client léger |
| TanStack Query v5 | State management / Cache API |
| Tailwind CSS v4 | Styling utilitaire |
| shadcn/ui (Radix) | Composants UI accessibles |
| Framer Motion | Animations et transitions |
| React Hook Form | Gestion formulaires |
| Zod | Validation schemas |
| date-fns | Formatage dates multilingue |

### Backend

| Technologie | Usage |
|-------------|-------|
| Node.js + Express | Serveur API REST |
| TypeScript (ESM) | Typage serveur |
| Drizzle ORM | Requêtes base de données |
| PostgreSQL | Base de données relationnelle |
| OpenAI API | Chatbot IA / Traduction automatique |

### Services Externes Intégrés

| Service | Usage |
|---------|-------|
| OpenAI (via Replit AI) | Chatbot IA, traduction automatique |
| Pexels API | Images stock gratuites pour blog |
| Direct Site API (quebexico.com) | Réservations directes (propriétés STR) |
| Replit Object Storage | Upload fichiers/images |
| TinyMCE | Éditeur rich text (blog) |

---

## Structure des Dossiers

```
├── client/                     # Frontend React
│   ├── src/
│   │   ├── components/         # Composants réutilisables
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── booking/        # Composants réservation Direct Site
│   │   │   ├── Navigation.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ChatWidget.tsx
│   │   │   ├── PexelsImagePicker.tsx
│   │   │   └── PexelsImageField.tsx
│   │   ├── pages/              # Pages de l'application
│   │   │   ├── demo/           # Templates de démonstration
│   │   │   ├── tools/          # Outils clients (signature, carte)
│   │   │   ├── Home.tsx
│   │   │   ├── Blog.tsx
│   │   │   ├── Admin.tsx
│   │   │   └── ...
│   │   ├── contexts/           # React Contexts
│   │   │   └── LanguageContext.tsx
│   │   ├── hooks/              # Custom hooks
│   │   │   ├── use-pexels.ts
│   │   │   ├── use-direct-site.ts
│   │   │   └── use-profile-localization.ts
│   │   ├── lib/                # Utilitaires
│   │   │   ├── translations.ts
│   │   │   ├── queryClient.ts
│   │   │   └── signature-generator.ts
│   │   └── App.tsx             # Routes principales
│   └── index.html
├── server/                     # Backend Express
│   ├── direct-sites/           # Intégration Direct Site (API quebexico.com)
│   │   ├── client.ts           # Client HTTP Direct Site
│   │   └── routes.ts           # Proxy API routes
│   ├── replit_integrations/    # Intégrations Replit
│   │   ├── chat/               # Chatbot IA
│   │   │   ├── routes.ts       # Routes API chat
│   │   │   └── storage.ts      # Stockage sessions
│   │   ├── object_storage/     # Upload fichiers
│   │   │   ├── routes.ts       # Routes upload
│   │   │   └── objectStorage.ts # Service Object Storage
│   │   ├── image/              # Génération images IA
│   │   └── batch/              # Traitement par lots
│   ├── utils/
│   │   └── encryption.ts       # Chiffrement clés API
│   ├── routes.ts               # Endpoints API principaux
│   ├── storage.ts              # Interface base de données
│   ├── pexels.ts               # Proxy Pexels API
│   └── index.ts                # Point d'entrée serveur
├── shared/                     # Code partagé client/serveur
│   ├── schema.ts               # Schéma Drizzle (tables DB)
│   ├── routes.ts               # Contrats API typés
│   ├── direct-sites.ts         # Types Direct Site
│   ├── localization.ts         # Types multilingues
│   └── demo-profiles.ts        # Configurations templates démo
├── ARCHITECTURE.md             # Ce fichier
└── replit.md                   # Notes projet Replit
```

---

## Pages de l'Application

### Pages Publiques - Site Principal

| URL | Composant | Description |
|-----|-----------|-------------|
| `/` | Home | Page d'accueil agence QUEBEXICO |
| `/contact` | Contact | Formulaire de contact |
| `/blog` | Blog | Liste des articles publiés |
| `/blog/:slug` | BlogPost | Article de blog individuel |
| `/book/discovery` | BookDiscovery | Réservation appel découverte (TidyCal) |
| `/book/expert` | BookExpert | Réservation consultation expert |
| `/booking` | Booking | Module de réservation Direct Site |
| `/offre` | Offre | Page offre commerciale |
| `/legal` | Legal | Mentions légales |
| `/privacy` | Privacy | Politique de confidentialité |
| `/terms` | Terms | Conditions d'utilisation |
| `/cookies` | Cookies | Politique cookies |

### Pages Publiques - Templates Démo

| URL | Composant | Description |
|-----|-----------|-------------|
| `/demo` | DemoIndex | Index des templates disponibles |
| `/demo/athlete/:page?` | DemoAthlete | Template athlète professionnel |
| `/demo/freelancer/:page?` | DemoFreelancer | Template freelancer/consultant |
| `/demo/chalet/:page?` | DemoRentalHost | Template hôte location courte durée |
| `/demo/cleaning/:page?` | DemoCleaning | Template service de nettoyage |
| `/demo/sports-club/:page?` | DemoSportsClub | Template club sportif (cyclisme) |
| `/demo/professional/:page?` | DemoProfessional | Template professionnel (avocat) |

### Pages Publiques - Outils Clients

| URL | Composant | Description |
|-----|-----------|-------------|
| `/tools/signature` | EmailSignature | Générateur de signature email |
| `/tools/carte` | DigitalCard | Générateur de carte de visite numérique |
| `/c/:slug` | PublicCard | Carte de visite publique persistante |

### Pages Admin (Authentification requise)

| URL | Composant | Description |
|-----|-----------|-------------|
| `/admin` | Admin | Dashboard administration complet |

Onglets du dashboard admin :
- **Chatbot** : Sessions de chat, base de connaissances IA
- **Blog** : Gestion articles et catégories multilingues
- **Cartes numériques** : CRUD cartes de visite
- **Signatures email** : CRUD signatures
- **Paramètres** : Clé OpenAI personnalisée, usage IA

---

## APIs Exposées

### Authentification Admin
Toutes les routes `/api/admin/*` utilisent le header `X-Admin-Key` avec la valeur de `ADMIN_SECRET_KEY`.

### Endpoints Publics

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/projects` | Liste des projets portfolio |
| `POST` | `/api/messages` | Créer message contact |
| `POST` | `/api/subscribers` | Inscription newsletter |
| `GET` | `/api/blog` | Articles publiés |
| `GET` | `/api/blog/:slug` | Article par slug |
| `GET` | `/api/blog/categories` | Catégories blog |
| `GET` | `/api/cards/:slug` | Carte numérique publique |

### Endpoints Admin

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/admin/blog` | Tous les articles (brouillons inclus) |
| `POST` | `/api/admin/blog` | Créer article |
| `PUT` | `/api/admin/blog/:id` | Modifier article |
| `DELETE` | `/api/admin/blog/:id` | Supprimer article |
| `POST` | `/api/admin/blog/:id/featured` | Mettre en vedette |
| `PUT` | `/api/admin/blog/order` | Réorganiser articles |
| `GET/POST/PUT/DELETE` | `/api/admin/blog/categories/*` | CRUD catégories |
| `GET` | `/api/admin/settings` | Paramètres site |
| `PUT` | `/api/admin/settings/:key` | Modifier paramètre |
| `POST` | `/api/admin/settings/validate-openai-key` | Valider clé OpenAI |
| `POST` | `/api/admin/translate` | Traduction auto IA (FR→EN/ES) |
| `GET` | `/api/admin/ai-usage` | Statistiques usage IA |
| `GET/POST/PUT/DELETE` | `/api/admin/digital-cards/*` | CRUD cartes numériques |
| `GET/POST/PUT/DELETE` | `/api/admin/email-signatures/*` | CRUD signatures |
| `GET` | `/api/admin/chat/sessions` | Liste sessions chatbot |
| `GET` | `/api/admin/chat/sessions/:id` | Détails session avec messages |
| `DELETE` | `/api/admin/chat/sessions/:id` | Supprimer session |
| `GET` | `/api/admin/knowledge-base` | Liste documents base connaissances |
| `POST` | `/api/admin/knowledge-base` | Créer document |
| `PUT` | `/api/admin/knowledge-base/:id` | Modifier document |
| `DELETE` | `/api/admin/knowledge-base/:id` | Supprimer document |

### Endpoints Chatbot (Public)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/chat/sessions` | Créer/récupérer session par visitorId |
| `POST` | `/api/chat/sessions/:id/messages` | Envoyer message (SSE streaming) |

**Request body (sessions):**
```json
{ "visitorId": "uuid-unique", "language": "fr|en|es" }
```

**Request body (messages):**
```json
{ "content": "Message utilisateur", "language": "fr" }
```

**Response:** Server-Sent Events (SSE) avec chunks du modèle IA

### Endpoints Object Storage (Upload Fichiers)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/api/uploads/request-url` | Non* | Obtenir URL présignée pour upload |
| `GET` | `/objects/:objectPath(*)` | Non | Servir fichiers uploadés |

> ⚠️ **Note sécurité:** L'endpoint upload n'a pas d'authentification par défaut. Pour une utilisation production, ajouter un middleware d'auth avant d'exposer publiquement.

**Flow d'upload :**
1. Client envoie metadata JSON à `/api/uploads/request-url`
2. Serveur retourne `uploadURL` (URL GCS présignée) + `objectPath`
3. Client upload fichier directement vers `uploadURL`
4. Fichier accessible via `/objects/{objectPath}`

**Request body (request-url):**
```json
{ "name": "photo.jpg", "size": 123456, "contentType": "image/jpeg" }
```

**Response:**
```json
{ "uploadURL": "https://storage.googleapis.com/...", "objectPath": "/objects/uploads/uuid" }
```

### Endpoints Pexels (Proxy)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/pexels/search?query=...&page=1&per_page=15` | Recherche images stock |

### Endpoints Direct Site (Proxy vers quebexico.com)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/direct-site/enabled` | Vérifie si la connexion quebexico.com est configurée |
| `GET` | `/api/direct-site/config` | Configuration du site direct |
| `GET` | `/api/direct-site/properties` | Liste des propriétés (cet hôte) |
| `GET` | `/api/direct-site/availability?propertyId=X&startDate=...&endDate=...` | Disponibilités |
| `GET` | `/api/direct-site/pricing?propertyId=X&checkIn=...&checkOut=...` | Calcul tarif |
| `POST` | `/api/direct-site/reservations` | Créer réservation |
| `POST` | `/api/direct-site/inquiries` | Envoyer demande d'info |

---

## APIs Consommées

### API Site direct (quebexico.com)

Connexion à quebexico.com pour la réservation directe. **Un déploiement quebexico_co = un hôte** : une clé API par déploiement. Sans config, le template reste utilisable mais le module réservation ne charge pas de propriétés. Voir `docs/CONNEXION_QUEBEXICO_COM.md`.

**Configuration requise :**
```env
DIRECT_SITE_API_URL=https://quebexico.com
DIRECT_SITE_API_KEY=clé du site direct (Host → Site de réservation → onglet API)
```

**Exemple d'utilisation (côté client via hooks) :**
```typescript
import { useDirectSiteConfig, useDirectSiteProperties } from "@/hooks/use-direct-site";

function BookingPage() {
  const { data: config } = useDirectSiteConfig();
  const { data: properties } = useDirectSiteProperties();

  // Utiliser les données...
}
```

**Schémas partagés :** `shared/direct-sites.ts`

### Pexels API

Images stock gratuites avec attribution automatique.

**Configuration requise :**
```env
PEXELS_API_KEY=votre-cle-pexels
```

**Exemple d'utilisation :**
```typescript
import { usePexelsSearch } from "@/hooks/use-pexels";

function ImagePicker() {
  const { data, isLoading } = usePexelsSearch("nature", 1, 15);
  // data.photos contient les images avec attribution
}
```

### OpenAI API (via Replit AI Integration)

Chatbot intelligent et traduction automatique.

**Configuration automatique via Replit :**
- `AI_INTEGRATIONS_OPENAI_API_KEY`
- `AI_INTEGRATIONS_OPENAI_BASE_URL`

**Ou clé personnalisée via admin :** Paramètre `openai_api_key` (chiffré)

---

## Tables de Base de Données

### Contenu & Marketing

```sql
messages          -- Messages formulaire contact
  id, name, email, message, createdAt

subscribers       -- Abonnés newsletter
  id, email, isActive, createdAt

projects          -- Projets portfolio
  id, title, description, imageUrl, link, category, createdAt
```

### Blog Multilingue

```sql
blog_categories   -- Catégories d'articles
  id, slug, nameFr, nameEn, nameEs, createdAt

blog_posts        -- Articles de blog
  id, slug, titleFr, titleEn, titleEs, excerptFr/En/Es,
  contentFr/En/Es, imageUrl, videoUrl, categoryId,
  tags[], isFeatured, isPublished, orderIndex,
  authorName, publishedAt, createdAt, updatedAt
```

### Chatbot IA

```sql
chat_sessions     -- Sessions de conversation
  id, visitorId, language, email, status, createdAt, updatedAt

chat_messages     -- Messages individuels
  id, sessionId, role, content, createdAt

knowledge_base    -- Base de connaissances
  id, title, content, language, category, isActive, createdAt, updatedAt

ai_usage          -- Suivi consommation tokens
  id, model, inputTokens, outputTokens, totalTokens,
  estimatedCost, sessionId, useCustomKey, createdAt
```

### Outils Clients

```sql
digital_cards     -- Cartes de visite numériques
  id, slug, fullName, jobTitle, company, email, phone, website,
  linkedin, facebook, instagram, twitter, photoUrl, logoUrl,
  primaryColor, isActive, createdAt, updatedAt

email_signatures  -- Signatures email
  id, slug, fullName, jobTitle, company, email, phone, website,
  linkedin, facebook, instagram, twitter, photoUrl, logoUrl,
  template, primaryColor, ctaText, ctaUrl, isActive, createdAt, updatedAt
```

### Configuration

```sql
site_settings     -- Paramètres clé-valeur
  id, key, value, createdAt, updatedAt

admin_users       -- Utilisateurs admin (non utilisé actuellement)
  id, email, passwordHash, createdAt
```

---

## Variables d'Environnement

### Base de Données (Automatique Replit)
```env
DATABASE_URL      # URL PostgreSQL complète
PGHOST            # Hôte PostgreSQL
PGPORT            # Port PostgreSQL
PGUSER            # Utilisateur PostgreSQL
PGPASSWORD        # Mot de passe PostgreSQL
PGDATABASE        # Nom base de données
```

### Authentification Admin
```env
ADMIN_SECRET_KEY  # Clé secrète pour accès admin
SESSION_SECRET    # Secret pour sessions Express
```

### IA (Replit Integration)
```env
AI_INTEGRATIONS_OPENAI_API_KEY   # Clé OpenAI via Replit
AI_INTEGRATIONS_OPENAI_BASE_URL  # URL base API Replit AI
```

### Services Externes
```env
PEXELS_API_KEY    # API Pexels pour images stock
DIRECT_SITE_API_KEY   # Clé API Direct Site (quebexico.com)
DIRECT_SITE_API_URL   # URL API (ex. https://quebexico.com)
VITE_TINYMCE_API_KEY  # Clé TinyMCE (optionnel)
```

**Obtenir la clé Direct Site :** sur **quebexico.com**, aller dans **Host → Site de réservation** (Direct Booking Site), créer ou ouvrir un site direct, puis copier la clé API affichée. Définir `DIRECT_SITE_API_URL` (ex. `https://quebexico.com`) et `DIRECT_SITE_API_KEY` dans `.env` (voir `.env.example`).

### Object Storage (Replit)
```env
DEFAULT_OBJECT_STORAGE_BUCKET_ID  # ID bucket Replit
PUBLIC_OBJECT_SEARCH_PATHS        # Chemins publics
PRIVATE_OBJECT_DIR                # Dossier privé
```

---

## Conventions de Code

### Composants React
- Composants fonctionnels avec hooks
- shadcn/ui pour tous les composants UI de base
- `useQuery` / `useMutation` pour appels API (TanStack Query v5)
- Fichiers dans `client/src/pages/` pour les pages
- Fichiers dans `client/src/components/` pour composants réutilisables

### API Routes
- Pattern RESTful (`GET /api/resource`, `POST /api/resource`)
- Middleware `requireAdminAuth` pour routes admin (header `X-Admin-Key`)
- Validation avec Zod schemas
- Erreurs retournées en JSON `{ message: string }`

### Base de Données
- Drizzle ORM exclusivement
- Schéma dans `shared/schema.ts`
- Storage interface dans `server/storage.ts`
- Types explicites exportés pour chaque table

### Multilingue
- Traductions UI dans `client/src/lib/translations.ts`
- Contenu localisé avec types `LocalizedString` de `shared/localization.ts`
- Hook `useLanguage()` pour accéder à la langue courante et aux traductions
- Hook `useProfileLocalization()` pour contenu de profil localisé

### Imports et Alias
```typescript
import { Component } from "@/components/Component"     // client/src/
import { schema } from "@shared/schema"                // shared/
import image from "@assets/image.png"                  // attached_assets/
```

---

## Fonctionnalités Clés à Réutiliser

### Système de Templates Démo
- Configuration par profil dans `shared/demo-profiles.ts`
- Composant `DemoSite` générique avec pages activables
- Support complet FR/EN/ES

### Chatbot IA Intégré
- Widget flottant `ChatWidget`
- Base de connaissances administrable
- Suivi consommation tokens
- Support clé OpenAI personnalisée

### Blog Multilingue
- Traduction automatique via IA
- Éditeur rich text TinyMCE
- Sélection images Pexels intégrée
- Catégories et tags

### Outils Clients
- Générateur signature email (4 templates)
- Carte de visite numérique avec QR code
- URLs persistantes `/c/:slug`

### Intégration Direct Site
- Proxy sécurisé (clé API côté serveur)
- Hooks React Query prêts à l'emploi
- Composants réservation réutilisables

---

*Document généré le 2026-01-12*
