# ── Faso Atlas — Makefile ────────────────────────────────────────────
.PHONY: help dev stop test lint build deploy-check observability-up observability-down observability-logs openapi-validate

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# ── Development ──────────────────────────────────────────────────────
dev: ## Start all services (Docker Compose)
	docker compose up -d

stop: ## Stop all services
	docker compose down

logs: ## Tail all logs
	docker compose logs -f

observability-up: ## Start Prometheus + Grafana locally
	docker compose --profile observability up -d prometheus grafana

observability-down: ## Stop Prometheus + Grafana locally
	docker compose stop prometheus grafana

observability-logs: ## Tail Prometheus + Grafana logs
	docker compose logs -f prometheus grafana

# ── Backend ──────────────────────────────────────────────────────────
test-backend: ## Run backend Go tests
	cd backend && go test ./... -v -race

lint-backend: ## Lint backend with golangci-lint
	cd backend && golangci-lint run

build-backend: ## Build backend binary
	cd backend && CGO_ENABLED=0 go build -o server ./cmd/server

seed: ## Run SQL migrations & seed data
	cd backend && go run ./cmd/seed -dir=migrations

seed-only: ## Run seed file only (011+)
	cd backend && go run ./cmd/seed -dir=migrations

openapi-validate: ## Lint OpenAPI contract
	npx @redocly/cli@latest lint backend/openapi/openapi.yaml

# ── Web ──────────────────────────────────────────────────────────────
test-web: ## Lint & type-check web
	cd web && npm run lint && npx tsc --noEmit

build-web: ## Build Next.js production
	cd web && npm run build

# ── Mobile ───────────────────────────────────────────────────────────
test-mobile: ## Run Flutter tests
	cd mobile && flutter test

lint-mobile: ## Analyze Flutter code
	cd mobile && flutter analyze --no-fatal-infos

build-apk: ## Build release APK
	cd mobile && flutter build apk --release

# ── All ──────────────────────────────────────────────────────────────
test: test-backend test-mobile ## Run all tests

lint: lint-backend lint-mobile ## Lint all projects

# ── Production ───────────────────────────────────────────────────────
prod-up: ## Start production stack
	docker compose -f docker-compose.prod.yml up -d

prod-down: ## Stop production stack
	docker compose -f docker-compose.prod.yml down

deploy-check: ## Verify deployment prerequisites
	@echo "Checking .env..."
	@test -f .env || (echo "Missing .env file! Copy .env.example" && exit 1)
	@echo "Checking Docker..."
	@docker info > /dev/null 2>&1 || (echo "Docker not running!" && exit 1)
	@echo "All checks passed ✓"

# ── Cloud Deployment ─────────────────────────────────────────────────
deploy-render: ## Deploy backend to Render (Blueprint)
	@echo "→ Push to main branch to trigger Render auto-deploy"
	@echo "→ Or create Blueprint: https://dashboard.render.com/select-repo?type=blueprint"
	@echo "  render.yaml is at repo root"

deploy-netlify: ## Deploy web to Netlify
	cd web && npx netlify build && npx netlify deploy --no-build --prod --dir=.netlify/static --functions=.netlify/functions-internal

deploy-netlify-preview: ## Deploy web preview to Netlify
	cd web && npx netlify build && npx netlify deploy --no-build --dir=.netlify/static --functions=.netlify/functions-internal
