# ADR 0004: Estratégia SQL-first para Migrations

## Contexto

A adoção de recursos avançados do PostgreSQL torna inviável a geração automática de migrations a partir de schemas TypeScript ou DSLs de ORM.

Migrations automáticas tendem a gerar drift e perda de controle em cenários com SQL avançado.

## Decisão

Adotar uma estratégia **SQL-first para migrations**, com as seguintes regras:

* Migrations são escritas explicitamente em SQL
* SQL avançado é encorajado e versionado
* Nenhuma migration é gerada automaticamente a partir de código

O ORM é utilizado apenas como executor e integrador do fluxo de migrations.

## Consequências

* Total previsibilidade sobre alterações de schema
* Maior responsabilidade na escrita de migrations
* Eliminação de abstrações frágeis sobre o banco
