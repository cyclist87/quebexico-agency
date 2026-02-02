# Migration quebexico_co : Replit → Railway + Neon

## Vue d’ensemble

- **Neon** : base PostgreSQL (tu en as déjà une pour le dev ; tu peux en créer une deuxième pour la prod ou réutiliser).
- **Railway** : hébergement de l’app (Node, build + start).
- **Variables d’environnement** : à configurer sur Railway (pas dans le repo).

---

## Étape 1 — Base de données (Neon)

1. Va sur [neon.tech](https://neon.tech) et connecte-toi.
2. **Option A** : Créer une **nouvelle base** pour la prod (recommandé pour séparer dev/prod).
   - Nouveau projet ou nouvelle branche → note l’**URL de connexion** (Connection string).
3. **Option B** : Réutiliser la base actuelle (dev = prod). Copie ton `DATABASE_URL` actuelle.
4. Note l’URL au format :  
   `postgresql://USER:PASSWORD@HOST/DB?sslmode=require`

---

## Étape 2 — Projet Railway

1. Va sur [railway.app](https://railway.app) et connecte-toi (GitHub recommandé).
2. **New Project** → **Deploy from GitHub repo**.
3. Choisis le repo **quebexico_co** (si le code est poussé sur GitHub).
4. Railway détecte le projet (Node). Il utilisera `railway.json` s’il existe, sinon les scripts `build` et `start` du `package.json`.

---

## Étape 3 — Variables d’environnement (Railway)

Dans le projet Railway → ton service → **Variables** (ou **Settings → Environment**), ajoute :

| Variable | Description | Exemple |
|----------|-------------|--------|
| `NODE_ENV` | `production` | `production` |
| `DATABASE_URL` | URL Neon (prod) | `postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require` |
| `SESSION_SECRET` | Secret pour les sessions | même valeur que en dev ou nouvelle (openssl rand -base64 32) |
| `ADMIN_SECRET_KEY` | Clé d’accès admin | forte en prod (openssl rand -base64 32) |
| `DIRECT_SITE_API_URL` | URL de l’API quebexico.com | `https://quebexico.com` |
| `DIRECT_SITE_API_KEY` | Clé API du site direct (quebexico.com) | clé générée dans Admin → Site de réservation |
| `HOST` | Pour accepter les requêtes externes | `0.0.0.0` |
| `PORT` | Railway l’injecte souvent automatiquement ; si besoin | `5000` ou la variable fournie par Railway |

Ne pas committer `.env` : il est dans `.gitignore`.

---

## Étape 4 — Fichier Railway (quebexico_co)

Un fichier `railway.json` à la racine de quebexico_co indique à Railway comment builder et démarrer :

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run build && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Note** : En général Railway lance d’abord un **build** (script `build` du package.json) puis le **startCommand**. Si ton `package.json` a déjà `"build": "tsx script/build.ts"` et `"start": "NODE_ENV=production node dist/index.cjs"`, tu peux mettre seulement `npm start` dans `startCommand` car Railway exécute souvent `npm run build` en phase de build. Si le build est fait automatiquement, utilise `"startCommand": "npm start"`. Sinon utilise `"startCommand": "npm run build && npm start"` pour tout faire au démarrage du conteneur (moins optimal mais simple).

Vérifie dans Railway : onglet **Build** (commande de build) et **Deploy** (commande de start). Idéal : build = `npm run build`, start = `npm start`.

---

## Étape 5 — Premier déploiement

1. **Push** le code (avec `railway.json` si tu l’ajoutes) sur la branche connectée à Railway.
2. Railway déclenche un **build** puis un **deploy**.
3. Si le build échoue : consulter les logs (Build logs). Souvent `npm run build` nécessite Node 18+ et les deps installées (`npm ci`).
4. Une fois le déploiement vert : **appliquer le schéma DB** sur la base **prod** (Neon prod) :
   - En local, avec une copie de ton `.env` qui contient **uniquement** `DATABASE_URL` de prod :
     ```bash
     cd /Users/jmlachance/Documents/quebexico_co
     DATABASE_URL="postgresql://..." dotenv -e .env.prod -- npm run db:push
     ```
     Ou crée un fichier `.env.prod` avec seulement `DATABASE_URL=...` (ne pas le committer) et lance :
     ```bash
     dotenv -e .env.prod -- npx drizzle-kit push
     ```
   - Ou utiliser un **one-off command** Railway si disponible : même commande dans un conteneur éphémère avec les variables Railway.

---

## Étape 6 — Domaine (optionnel)

- Dans Railway : **Settings** du service → **Networking** → **Generate Domain** (sous-domaine railway.app).
- Ou **Custom Domain** : pointe un CNAME vers l’URL fournie par Railway.

---

## Commandes utiles (résumé)

**En local (avant / pendant la migration) :**

```bash
# Terminal 1 — quebexico
cd /Users/jmlachance/Documents/quebexico
npm run dev

# Terminal 2 — quebexico_co (port 5001 pour éviter conflit)
cd /Users/jmlachance/Documents/quebexico_co
PORT=5001 npm run dev
```

**Build + start (pour vérifier en local comme en prod) :**

```bash
cd /Users/jmlachance/Documents/quebexico_co
npm run build
npm start
```

**Schéma DB sur la base prod (une fois `DATABASE_URL` prod configurée) :**

```bash
cd /Users/jmlachance/Documents/quebexico_co
# Avec .env.prod contenant uniquement DATABASE_URL de prod :
dotenv -e .env.prod -- npx drizzle-kit push
```

---

## Dépannage

- **Build fails** : Vérifier Node version (18+). Vérifier que `npm run build` tourne en local.
- **Application crash au start** : Vérifier les variables (surtout `DATABASE_URL`, `SESSION_SECRET`). Vérifier les logs Railway.
- **503 / pas de réponse** : Vérifier que le serveur écoute sur `0.0.0.0` (variable `HOST=0.0.0.0`) et sur le `PORT` fourni par Railway.
- **DB connection error** : Vérifier `DATABASE_URL` (prod), pare-feu Neon (connexions externes autorisées), SSL (`?sslmode=require`).
