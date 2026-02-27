# ─────────────────────────────────────────────────────────────
# Variáveis
# ─────────────────────────────────────────────────────────────

DEV_COMPOSE  = docker/docker-compose.dev.yml
PROD_COMPOSE = docker/docker-compose.prod.yml
TEST_COMPOSE = docker/docker-compose.test.yml

TREE_IGNORE = node_modules|.git|dist|*.env*

# ─────────────────────────────────────────────────────────────
# Phony
# ─────────────────────────────────────────────────────────────

.PHONY: \
	check-env \
	lint typecheck build \
	ci-test \
	dev-up dev-stop dev-start dev-down dev-reset dev-migrate \
	prod-up prod-migrate \
	test-up test-down test-reset test-migrate test \
	tree

# ─────────────────────────────────────────────────────────────
# Environment Check
# ─────────────────────────────────────────────────────────────

check-env:
	@if [ -z "$$DATABASE_URL" ]; then \
		echo "❌ DATABASE_URL não definida"; \
		exit 1; \
	fi

# ─────────────────────────────────────────────────────────────
# Quality
# ─────────────────────────────────────────────────────────────

lint:
	pnpm lint

typecheck:
	pnpm tsc --noEmit

# ─────────────────────────────────────────────────────────────
# CI
# ─────────────────────────────────────────────────────────────

ci-test:
	make test-reset
	make test-up
	make test-migrate
	make test
	make test-down

# ─────────────────────────────────────────────────────────────
# DEV
# ─────────────────────────────────────────────────────────────

dev-up:
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

dev-migrate: check-env
	npx ts-node src/infrastructure/scripts/migrate.ts

# ─────────────────────────────────────────────────────────────
# PROD
# ─────────────────────────────────────────────────────────────

prod-up:
	@echo "🚀 Subindo Postgres PROD"
	docker compose -f $(PROD_COMPOSE) up -d

prod-migrate: check-env
	npx ts-node src/infrastructure/scripts/migrate.ts

# ─────────────────────────────────────────────────────────────
# TEST
# ─────────────────────────────────────────────────────────────

test-up:
	@echo "🧪 Subindo Postgres TEST"
	docker compose -f $(TEST_COMPOSE) up -d --wait

test-down:
	@echo "⬇️ Removendo containers TEST (mantendo volumes)"
	docker compose -f $(TEST_COMPOSE) down

test-reset:
	@echo "💥 Resetando ambiente TEST (containers + volumes)"
	docker compose -f $(TEST_COMPOSE) down -v

test-migrate: check-env
	npx ts-node src/infrastructure/scripts/migrate.ts

test:
	pnpm jest

# ─────────────────────────────────────────────────────────────
# Utils
# ─────────────────────────────────────────────────────────────

tree:
	@echo "🌳 Estrutura de pastas"
	tree -a -L 6 -I "$(TREE_IGNORE)" --prune
