# faso-trip

> Plateforme touristique et culturelle du Burkina Faso — API Go · Web Next.js · Mobile Flutter

**Version** : 1.0.0 — 7 avril 2026  
**Développeur** : Daniel Schillem  
**Licence** : MIT (voir [LICENSE](LICENSE))

---

## Architecture

```text
┌──────────────┐     ┌────────────────┐     ┌──────────────┐
│  Mobile App  │────▸│   API Go/Gin   │◂────│  Web Next.js │
│   Flutter    │     │   port 8080    │     │   port 3000  │
└──────────────┘     └───────┬────────┘     └──────────────┘
                             │
                    ┌────────┴────────┐
                    │   PostgreSQL    │
                    │   + Redis      │
                    └─────────────────┘
```

| Couche          | Stack                                          | Dossier              |
| --------------- | ---------------------------------------------- | -------------------- |
| Backend API     | Go 1.23 · Gin · GORM · JWT                     | `backend/`           |
| Frontend Web    | Next.js 14 · React 18 · Tailwind · Zustand     | `web/`               |
| Mobile          | Flutter 3.x · Riverpod · GoRouter · Dio · Hive | `mobile/`            |
| Base de données | PostgreSQL 16 · Redis 7                        | Docker Compose       |
| CI/CD           | GitHub Actions (4 workflows)                   | `.github/workflows/` |

### Endpoints API (45 routes)

Auth (7) · Destinations (3) · Map (3) · Itinéraires (5) · Hébergements (3) · Réservations (4) · Atlas (1) · Wiki (5) · Symboles (1) · Recherche (1) · Stats (1) · Favoris (3) · Reviews (5) · Admin (6) · Images (1)

### Endpoints système

- `/health` : liveness probe
- `/ready` : readiness probe PostgreSQL + Redis
- `/metrics` : exposition Prometheus
- `/openapi.yaml` : contrat OpenAPI brut
- `/docs` : pointeur JSON vers le contrat API
- `/version` : métadonnées de build (version, commit, date)

---

## Tests

```bash
# Backend — 46 tests, 6 packages
cd backend && go test ./... -v

# Web — 11 tests (Vitest + Testing Library)
cd web && npm test

# Mobile — 38 tests (flutter_test)
cd mobile && flutter test
```

Pour vérifier la couche système backend :

```bash
cd backend
curl http://localhost:8080/health
curl http://localhost:8080/ready
curl http://localhost:8080/metrics
curl http://localhost:8080/openapi.yaml
curl http://localhost:8080/version
```

Pour valider le contrat OpenAPI localement :

```bash
make openapi-validate
```

Pour démarrer le monitoring local :

```bash
make observability-up
```

Interfaces disponibles :

- API metrics : `http://localhost:8080/metrics`
- Prometheus : `http://localhost:9090`
- Grafana : `http://localhost:3001` (admin / admin)

Grafana charge automatiquement les dashboards `Faso Trip API Overview` et `Faso Trip API Errors` avec :

- débit de requêtes
- latence P95
- requêtes en vol
- répartition par route
- répartition par statuts HTTP
- taux de 4xx, 5xx et 429

---

## Déploiement en production

## Observabilité et contrat API

- Le contrat principal est versionné dans `backend/openapi/openapi.yaml`
- L'API l'expose sur `/openapi.yaml`
- La cible locale `make openapi-validate` lint le contrat OpenAPI
- Le workflow backend vérifie automatiquement `/health`, `/ready`, `/metrics`, `/openapi.yaml` et `/version`
- Le build Docker backend injecte automatiquement `APP_VERSION`, `APP_COMMIT` et `APP_BUILD_DATE` pour alimenter `/version`

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

En production, l'API refuse de démarrer si la configuration critique est invalide :

- `DATABASE_URL`, `REDIS_URL`, `WEB_URL` obligatoires
- `JWT_SECRET` obligatoire et fort (au moins 32 caractères)
- `STRIPE_WEBHOOK_SECRET` obligatoire si `STRIPE_SECRET_KEY` est défini

---

### Frontend — Netlify

Le frontend Next.js est déployé sur **Netlify** avec le plugin `@netlify/plugin-nextjs`.

#### Setup

1. Connecter le repo GitHub à Netlify
2. **Build settings** (auto-détectés depuis `netlify.toml`) :
   - Base directory : `web/`
   - Build command : `npm ci && npm run build`
   - Publish directory : géré automatiquement par `@netlify/plugin-nextjs`
3. Configurer les variables d'environnement :

| Variable                | Valeur                                               |
| ----------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`   | `https://faso-trip-api.onrender.com/api/v1`         |
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

Les cibles Netlify utilisent le flux recommandé Next.js SSR :

```bash
cd web
npx netlify build
npx netlify deploy --no-build --prod --dir=.netlify/static --functions=.netlify/functions-internal
```

---

## Développement local

```bash
cp backend/.env.example backend/.env
cp web/.env.example web/.env
make dev                     # Docker Compose (API + DB + Redis)
make observability-up        # Prometheus + Grafana
cd web && npm run dev        # Frontend Next.js sur :3000
cd mobile && flutter run     # App mobile
```
