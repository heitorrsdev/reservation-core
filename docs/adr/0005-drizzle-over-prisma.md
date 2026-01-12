# ADR 0005: Adoção do Drizzle ORM em vez do Prisma

## Contexto

O projeto foi iniciado utilizando o Prisma ORM, visando produtividade e tipagem forte.

Com a evolução do domínio, surgiram requisitos que exigem uso extensivo de recursos avançados do PostgreSQL, gerando fricção com o modelo de abstração do Prisma.

## Decisão

Substituir o Prisma ORM pelo **Drizzle ORM**, adotando uma abordagem ORM-thin e SQL-first.

Critérios determinantes:

* Menor abstração sobre o PostgreSQL
* Melhor convivência com SQL explícito
* Redução de workarounds e risco de drift
* Alinhamento com a estratégia PostgreSQL-first

## Consequências

* Maior proximidade entre código e banco
* Menor “magia” do ORM
* Mais responsabilidade explícita na camada de infraestrutura
