.PHONY: dev-up dev-down dev-migrate prod-up prod-migrate check-dev-env check-prod-env

DEV_ENV=.env.dev
PROD_ENV=.env.prod

check-dev-env:
	@test -f $(DEV_ENV) || (echo "❌ .env.dev não existe" && exit 1)
	@grep -q "DATABASE_URL" $(DEV_ENV) || (echo "❌ DATABASE_URL ausente (.env.dev)" && exit 1)

check-prod-env:
	@test -f $(PROD_ENV) || (echo "❌ .env.prod não existe" && exit 1)
	@if grep -q "SHADOW_DATABASE_URL" $(PROD_ENV); then \
		echo "❌ SHADOW_DATABASE_URL NÃO pode existir em prod"; \
		exit 1; \
	fi

dev-up: check-dev-env
	@echo "🚧 Subindo ambiente DEV"
	docker-compose -f docker/docker-compose.dev.yml --env-file $(DEV_ENV) up -d

dev-down:
	@echo "🧹 Derrubando ambiente DEV"
	docker-compose -f docker/docker-compose.dev.yml down -v

dev-migrate:
	@echo "🧪 Rodando migrations em DEV"
	DATABASE_URL="$$(grep DATABASE_URL .env.dev | cut -d '=' -f2-)" \
	npx prisma migrate dev

prod-up: check-prod-env
	@echo "🚀 Subindo ambiente PROD"
	docker-compose -f docker/docker-compose.prod.yml --env-file $(PROD_ENV) up -d

prod-migrate: check-prod-env
	@echo "📦 Aplicando migrations em PROD"
	npx prisma migrate deploy
