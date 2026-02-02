# Connexion quebexico_co ↔ quebexico.com

## Modèle en bref

| Élément | Rôle |
|--------|------|
| **quebexico_co** | Template de site vitrine + réservation. **Un déploiement = un client (un hôte)**. Sans config, c’est un template ; avec URL + clé API (admin ou `.env`), il est « branché » sur un site direct précis sur quebexico.com. |
| **quebexico.com** | Plateforme hôtes : propriétés, calendriers, réservations. Chaque **Site de réservation directe** (Direct Booking Site) = un hôte, avec sa propre **clé API**. |
| **Connexion** | Dans quebexico_co, tu définis **une** URL + **une** clé API soit dans l’**admin** (Intégrations), soit dans un fichier **`.env`**. Le serveur appelle quebexico.com avec cette clé ; l’API renvoie uniquement les données de ce site direct. |

Sans config, le template reste utilisable mais le module de réservation ne charge pas de propriétés depuis quebexico.com.

---

## Réplication pour plusieurs hôtes (code clean, réplicable)

- **Un déploiement quebexico_co par hôte** : chaque client a son propre déploiement. La config (URL + clé) se fait **par admin** (recommandé) ou par `.env` / variables d’environnement.
- **Sur quebexico.com** : chaque hôte a son propre « Site de réservation directe » et sa propre clé API.
- **Résumé** : 1 hôte → 1 site direct sur quebexico.com → 1 clé API → 1 déploiement quebexico_co avec cette clé (admin ou .env). Code unique, réplicable.

---

## Lancer quebexico_co en local (localhost)

1. Dans un terminal, aller dans le dossier du projet **quebexico_co** :
   ```bash
   cd /chemin/vers/quebexico_co
   ```
2. Installer les dépendances si besoin : `npm install`
3. **Configurer `.env`** (copier depuis `.env.example` si besoin) :
   - **`DATABASE_URL`** (obligatoire) : URL PostgreSQL **dédiée à quebexico_co** (recommandé : ne pas partager la même base que quebexico, pour une séparation propre). Exemple : même serveur, autre base → `postgres://user:password@host/quebexico_co`. Sur Replit / Neon : créer une **deuxième base** et utiliser son URL ici.
   - `SESSION_SECRET` : obligatoire si tu utilises l’admin (chiffrement des clés). Même valeur que quebexico ou générer une nouvelle.
   - `DIRECT_SITE_API_URL` et `DIRECT_SITE_API_KEY` : optionnels pour le module réservation (voir plus bas).
4. Créer la base PostgreSQL dédiée si besoin (ex. `createdb quebexico_co`), puis appliquer le schéma : `npm run db:push`
5. Lancer le serveur en mode dev :
   ```bash
   npm run dev
   ```
6. Ouvrir dans le navigateur : **http://localhost:5000** (ou le port indiqué si `PORT` est défini dans `.env`).

Le même serveur sert l’API et le front ; l’admin est accessible via le site (ex. `/admin` selon les routes).

---

## Étapes détaillées

### 1. Obtenir la clé API sur quebexico.com

**Attention :** Le menu **Host → Site Web** ouvre la page **« Direct Booking Website »** (Content, Domain Settings, Appearance). **La clé API n’est pas sur cette page.**

Il faut aller sur la page **« Site de réservation »** (Direct Booking Site), qui affiche la **liste** des sites avec la clé API :

1. Se connecter à **quebexico.com** (compte hôte ou admin).
2. Cliquer sur **Host → Site Web** dans le menu : tu arrives directement sur la **liste des sites de réservation** (page unique ; l’ancienne page « Direct Booking Website » a été supprimée en doublon).
3. Sur la **liste des sites** (cartes avec nom, statut, propriétés) :
   - **Option A** : Cliquer sur le bouton **icône clé** (🔑) sur la carte du site concerné. Une fenêtre « Clé API » s’ouvre : afficher la clé (œil), puis copier.
   - **Option B** : Cliquer sur **Modifier** (Edit), puis dans la boîte de dialogue passer à l’onglet **API** (icône clé), afficher la clé (œil), puis copier.
4. Noter l’**URL de l’API** : en général `https://quebexico.com` (ou l’URL de prod/staging de quebexico.com).

Aucun redémarrage de quebexico.com n’est nécessaire pour que cette clé soit valide.

---

### 2. Renseigner la config dans quebexico_co

Deux options (une seule suffit ; les **variables d’environnement ont priorité** sur l’admin).

**Faut-il faire un `git push` avant l’étape 2 ?** Non. La configuration (admin ou `.env`) ne dépend pas du code poussé. Tu peux configurer la connexion dès que le site tourne en local ou en déploiement.

#### Option A — Admin (recommandé pour un déploiement par client)

1. Se connecter à l’**admin** de **quebexico_co** (ce déploiement) — en local : http://localhost:5000/admin (ou la route admin configurée).
2. Aller dans **Intégrations**.
3. Trouver la carte **« Site de réservation (quebexico.com) »**.
4. Cliquer sur **Connecter** ou **Configurer**.
5. Renseigner :
   - **URL de l’API** : ex. `https://quebexico.com`
   - **Clé API** : la clé copiée à l’étape 1.
6. Cliquer sur **Enregistrer**.

- **Redémarrage** : **non**. La config est lue à chaque requête depuis la base.
- **Git** : **rien à pousser**. La config est en base de données, pas dans le code.

#### Option B — Fichier `.env`

1. À la racine du projet **quebexico_co**, créer ou éditer le fichier **`.env`** (s’inspirer de `.env.example`).
2. Renseigner :
   ```env
   DIRECT_SITE_API_URL=https://quebexico.com
   DIRECT_SITE_API_KEY=la_clé_copiée_sur_quebexico_com
   ```
3. **Redémarrer** le serveur (ou le déploiement) pour que les variables soient prises en compte.
4. **Git** : ne **pas** committer le fichier `.env` (il doit rester dans `.gitignore`) ; en prod, configurer les variables d’environnement sur la plateforme (Railway, Replit, etc.).

---

### 3. Vérifier

- Sur le site public quebexico_co, aller sur la page **Réservation** / **Booking** : les propriétés de ce site direct (cet hôte) doivent s’afficher si la connexion est correcte.
- En cas d’erreur 503 ou « Direct site integration not configured », vérifier que l’URL et la clé sont bien renseignées (admin ou .env) et que la clé correspond bien au site direct ouvert sur quebexico.com.

---

## Récapitulatif : redémarrage et Git

| Cas | Redémarrer quebexico_co ? | Push Git ? |
|-----|---------------------------|------------|
| Config saisie **dans l’admin** (Intégrations) | **Non** | **Non** |
| Config modifiée dans **`.env`** ou variables d’env | **Oui** (pour relire les variables) | **Non** (ne pas committer `.env`) |
| Changement de **code** (nouvelle feature, correctif) | Selon déploiement | **Oui** (pour déployer le code) |

Obtenir la clé sur quebexico.com ne nécessite **ni** redémarrage **ni** push.
