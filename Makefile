# ─────────────────────────────────────────────────────────────
# Variáveis
# ─────────────────────────────────────────────────────────────

DEV_ENV  = .env.dev
PROD_ENV = .env.prod

DEV_COMPOSE  = docker/docker-compose.dev.yml
PROD_COMPOSE = docker/docker-compose.prod.yml

TREE_IGNORE = node_modules|.git|dist|*.env*


# ─────────────────────────────────────────────────────────────
# Phony
# ─────────────────────────────────────────────────────────────

.PHONY: \
	dev-up dev-down \
	dev-migrate-create dev-migrate-apply \
	prod-up prod-migrate \
	check-dev-env check-prod-env \
	prisma-validate prisma-migrate-apply prisma-generate \
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
	@if grep -q "^SHADOW_DATABASE_URL=" $(PROD_ENV); then \
		echo "❌ SHADOW_DATABASE_URL NÃO pode existir em prod"; \
		exit 1; \
	fi


# ─────────────────────────────────────────────────────────────
# Targets neutros (CI-safe)
# ─────────────────────────────────────────────────────────────

lint:
	pnpm lint

typecheck:
	pnpm tsc --noEmit

test:
	pnpm test

prisma-validate:
	npx prisma validate

prisma-migrate-apply:
	npx prisma migrate deploy

prisma-generate:
	npx prisma generate


# ─────────────────────────────────────────────────────────────
# DEV
# ─────────────────────────────────────────────────────────────

dev-up: check-dev-env
	@echo "🚧 Subindo Postgres DEV"
	docker compose -f $(DEV_COMPOSE) up -d

dev-down:
	@echo "🧹 Derrubando Postgres DEV"
	docker compose -f $(DEV_COMPOSE) down -v

dev-migrate-create: check-dev-env
	@echo "📝 Gerando migration (DEV)"
	npx dotenv-cli -e $(DEV_ENV) -- \
		npx prisma migrate dev --create-only

dev-migrate-apply: check-dev-env
	@echo "🧪 Aplicando migrations no banco DEV"
	npx dotenv-cli -e $(DEV_ENV) -- \
		$(MAKE) prisma-migrate-apply
	npx dotenv-cli -e $(DEV_ENV) -- \
		$(MAKE) prisma-generate


# ─────────────────────────────────────────────────────────────
# PROD
# ─────────────────────────────────────────────────────────────

prod-up: check-prod-env
	@echo "🚀 Subindo Postgres PROD"
	docker compose -f $(PROD_COMPOSE) up -d

prod-migrate: check-prod-env
	@echo "📦 Aplicando migrations em PROD"
	npx dotenv-cli -e $(PROD_ENV) -- \
		$(MAKE) prisma-migrate-apply


# ─────────────────────────────────────────────────────────────
# Utils
# ─────────────────────────────────────────────────────────────

tree:
	@echo "🌳 Estrutura de pastas"
	tree -a -L 6 -I "$(TREE_IGNORE)" --prune
