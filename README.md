# FASO-ATLAS

> Plateforme touristique et culturelle du Burkina Faso — API Go · Web Next.js · Mobile Flutter

---

## Déploiement en production

### Backend — Render

Le backend (API Go + PostgreSQL + Redis) est déployé sur **Render** via le fichier `render.yaml` (Infrastructure as Code).

#### Méthode Blueprint (recommandée)

1. Connecter le repo GitHub à Render
2. Aller sur **Dashboard → New → Blueprint Instance**
3. Sélectionner le repo — Render détecte automatiquement `render.yaml`
4. Configurer la variable manuelle `CLOUDINARY_URL` dans le dashboard
5. Le déploiement crée automatiquement : API, PostgreSQL, Redis

#### Variables d'environnement

| Variable         | Source               | Notes                     |
| ---------------- | -------------------- | ------------------------- |
| `DATABASE_URL`   | Auto (fromDatabase)  | Injectée par Blueprint    |
| `REDIS_URL`      | Auto (fromService)   | Injectée par Blueprint    |
| `JWT_SECRET`     | Auto (generateValue) | Généré au 1er déploiement |
| `WEB_URL`        | Manuelle             | URL Netlify du frontend   |
| `CLOUDINARY_URL` | Manuelle             | Pour l'upload d'images    |

---

### Frontend — Netlify

Le frontend Next.js est déployé sur **Netlify** avec le plugin `@netlify/plugin-nextjs`.

#### Setup

1. Connecter le repo GitHub à Netlify
2. **Build settings** (auto-détectés depuis `netlify.toml`) :
   - Base directory : `web/`
   - Build command : `npm ci && npm run build`
   - Publish directory : `web/.next`
3. Configurer les variables d'environnement :

| Variable                | Valeur                                               |
| ----------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`   | `https://faso-atlas-api.onrender.com/api/v1`         |
| `NEXT_PUBLIC_MAP_TILES` | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` |

> **Rappel** : Les variables `NEXT_PUBLIC_*` sont intégrées au build. Toute modification nécessite un redéploiement.

#### Proxy API

Les requêtes `/api/*` sont redirigées vers le backend Render via `netlify.toml` (redirect proxy status 200). Cela évite les problèmes CORS côté client.

---

### Commandes utiles

```bash
make deploy-render          # Instructions déploiement Render
make deploy-netlify          # Déployer en production sur Netlify
make deploy-netlify-preview  # Déployer une preview Netlify
make deploy-check            # Vérifier les prérequis
```

---

## Développement local

```bash
cp backend/.env.example backend/.env
cp web/.env.example web/.env
make dev                     # Docker Compose (API + DB + Redis)
cd web && npm run dev        # Frontend Next.js sur :3000
cd mobile && flutter run     # App mobile
```
