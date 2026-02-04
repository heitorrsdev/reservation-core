# ─────────────────────────────────────────────────────────────
# Variáveis
# ─────────────────────────────────────────────────────────────

DEV_ENV  = .env.dev
PROD_ENV = .env.prod

DEV_COMPOSE  = docker/docker-compose.dev.yml
PROD_COMPOSE = docker/docker-compose.prod.yml

MIGRATIONS_DIR = migrations
TREE_IGNORE = node_modules|.git|dist|*.env*


# ─────────────────────────────────────────────────────────────
# Phony
# ─────────────────────────────────────────────────────────────

.PHONY: \
	dev-up dev-down \
	dev-migrate-apply prod-migrate \
	check-dev-env check-prod-env \
	lint typecheck test \
	tree


# ─────────────────────────────────────────────────────────────
# Checks
# ─────────────────────────────────────────────────────────────

check-dev-env:
	@test -f $(DEV_ENV) || (echo "❌ .env.dev não existe" && exit 1)
	@grep -q "^DATABASE_URL=" $(DEV_ENV) || \
		(echo "❌ DATABASE_URL ausente (.env.dev)" && exit 1)

check-prod-env:
	@test -f $(PROD_ENV) || (echo "❌ .env.prod não existe" && exit 1)
	@grep -q "^DATABASE_URL=" $(PROD_ENV) || \
		(echo "❌ DATABASE_URL ausente (.env.prod)" && exit 1)


# ─────────────────────────────────────────────────────────────
# Qualidade (CI-safe)
# ─────────────────────────────────────────────────────────────

lint:
	pnpm lint

typecheck:
	pnpm tsc --noEmit

test:
	pnpm test


# ─────────────────────────────────────────────────────────────
# DEV
# ─────────────────────────────────────────────────────────────

dev-up: check-dev-env
	@echo "🚧 Subindo Postgres DEV"
	docker compose -f $(DEV_COMPOSE) up -d

dev-stop:
	@echo "⏹️ Parando containers DEV"
	docker compose -f $(DEV_COMPOSE) stop

dev-start:
	@echo "▶️ Iniciando containers DEV"
	docker compose -f $(DEV_COMPOSE) start

dev-down:
	@echo "⬇️ Removendo containers DEV (mantendo volumes)"
	docker compose -f $(DEV_COMPOSE) down

dev-reset:
	@echo "💥 Resetando ambiente DEV (containers + volumes)"
	docker compose -f $(DEV_COMPOSE) down -v

dev-migrate:
	npx dotenv-cli -e $(DEV_ENV) -- \
		npx ts-node src/infrastructure/scripts/migrate.ts


# ─────────────────────────────────────────────────────────────
# PROD
# ─────────────────────────────────────────────────────────────

prod-up: check-prod-env
	@echo "🚀 Subindo Postgres PROD"
	docker compose -f $(PROD_COMPOSE) up -d

prod-migrate: check-prod-env
	npx dotenv-cli -e $(PROD_ENV) -- \
		npx ts-node src/infrastructure/scripts/migrate.ts


# ─────────────────────────────────────────────────────────────
# Utils
# ─────────────────────────────────────────────────────────────

tree:
	@echo "🌳 Estrutura de pastas"
	tree -a -L 6 -I "$(TREE_IGNORE)" --prune
