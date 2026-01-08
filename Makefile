# ─────────────────────────────────────────────────────────────
# Variáveis de ambiente
# ─────────────────────────────────────────────────────────────

DEV_ENV  = .env.dev
PROD_ENV = .env.prod

DEV_COMPOSE  = docker/docker-compose.dev.yml
PROD_COMPOSE = docker/docker-compose.prod.yml

TREE_IGNORE = node_modules|.git|dist|*.env*|docker


# ─────────────────────────────────────────────────────────────
# Phony targets
# ─────────────────────────────────────────────────────────────

.PHONY: dev-up dev-down dev-migrate \
        prod-up prod-migrate \
        check-dev-env check-prod-env \
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
# DEV
# ─────────────────────────────────────────────────────────────

dev-up: check-dev-env
	@echo "🚧 Subindo ambiente DEV"
	@docker-compose -f $(DEV_COMPOSE) --env-file $(DEV_ENV) up -d

dev-down:
	@echo "🧹 Derrubando ambiente DEV"
	@docker-compose -f $(DEV_COMPOSE) down -v

dev-migrate: check-dev-env
	@echo "🧪 Rodando migrations em DEV"
	@npx dotenv -e $(DEV_ENV) -- sh -c "\
		npx prisma validate && \
		npx prisma migrate dev && \
		npx prisma generate \
	"


# ─────────────────────────────────────────────────────────────
# PROD
# ─────────────────────────────────────────────────────────────

prod-up: check-prod-env
	@echo "🚀 Subindo ambiente PROD"
	@docker-compose -f $(PROD_COMPOSE) --env-file $(PROD_ENV) up -d

prod-migrate: check-prod-env
	@echo "📦 Aplicando migrations em PROD"
	@npx dotenv -e $(PROD_ENV) -- npx prisma migrate deploy


# ─────────────────────────────────────────────────────────────
# Utils
# ─────────────────────────────────────────────────────────────

tree:
	@echo "🌳 Estrutura de pastas do projeto"
	@tree -L 6 -I "$(TREE_IGNORE)"
