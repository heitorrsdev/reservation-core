# ADR 0006 — Migration Runner SQL-first

## Contexto

O projeto adota uma estratégia **PostgreSQL-first**, utilizando recursos avançados do banco como:

- `tstzrange`
- `EXCLUDE USING gist`
- triggers
- extensões (`btree_gist`)

Ferramentas ORM tradicionais (ex: Prisma) impõem limitações ao lidar com SQL avançado, gerando atrito e perda de controle sobre o schema.

Além disso, o projeto requer:

- histórico explícito de migrations
- execução determinística
- controle total do SQL executado
- independência de ferramentas opinionadas

## Decisão

Foi implementado um **migration runner próprio** baseado em SQL puro, com estas características:

- Migrations versionadas em arquivos `.sql`
- Execução incremental baseada em tabela `schema_migrations`
- Aplicação de cada migration dentro de transação
- Execução idempotente e determinística
- Runner implementado em TypeScript usando `pg`

A tabela `schema_migrations` é criada automaticamente caso não exista, eliminando dependências manuais.

## Consequências

### Positivas

- Controle total sobre o schema
- Suporte irrestrito a SQL avançado
- Execução previsível em DEV e PROD
- Redução de dependência de ORM

### Negativas

- Menos automação que ORMs tradicionais
- Responsabilidade explícita sobre versionamento e ordem das migrations

## Alternativas Consideradas

- **Prisma Migrate**  
  Rejeitado devido a limitações com SQL avançado e alto atrito operacional.

- **Ferramentas externas (Flyway, Liquibase)**  
  Rejeitadas para manter simplicidade, controle local e menor dependência de tooling externo.
