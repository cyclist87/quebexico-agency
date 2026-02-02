# Démarrer les serveurs (dev local)

## Deux terminaux

Pour travailler sur **quebexico** (plateforme) et **quebexico_co** (site direct) en même temps, utilise deux terminaux et des ports différents.

---

### Terminal 1 — quebexico (plateforme)

```bash
cd /Users/jmlachance/Documents/quebexico
npm run dev
```

- **URL** : http://localhost:5000 (ou le `PORT` défini dans ton `.env`)
- **Prérequis** : `.env` avec `DATABASE_URL` (et autres variables si besoin)

---

### Terminal 2 — quebexico_co (site direct / template hôtes)

```bash
cd /Users/jmlachance/Documents/quebexico_co
PORT=5001 npm run dev
```

- **URL** : http://127.0.0.1:5001
- **Prérequis** : `.env` avec `DATABASE_URL`, `SESSION_SECRET`, optionnellement `ADMIN_SECRET_KEY`, `DIRECT_SITE_API_URL`, `DIRECT_SITE_API_KEY`
- `PORT=5001` évite le conflit avec quebexico (5000). Tu peux utiliser un autre port (ex. 3000).

---

## Résumé

| Projet       | Commande                    | URL                    |
|-------------|-----------------------------|-------------------------|
| quebexico   | `cd quebexico && npm run dev` | http://localhost:5000   |
| quebexico_co | `cd quebexico_co && PORT=5001 npm run dev` | http://127.0.0.1:5001 |

Si tu ne lances qu’un seul projet, tu peux utiliser le port par défaut (5000) pour celui-ci.
