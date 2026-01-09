# ADR 0001: Arquitetura em Camadas com Dependências Unidirecionais

## Contexto

O projeto possui um domínio com regras de negócio não triviais e exige separação clara entre lógica de negócio, orquestração de casos de uso, detalhes de infraestrutura e interface HTTP.

Frameworks como NestJS oferecem alta flexibilidade estrutural, o que pode levar a acoplamento excessivo entre camadas se não houver uma decisão arquitetural explícita.

## Decisão

Adotar uma **arquitetura em camadas**, com responsabilidades bem definidas e dependências unidirecionais:

* **Domain**: núcleo do negócio, independente de tecnologia
* **Application**: orquestração de casos de uso
* **Infrastructure**: detalhes técnicos, ORM, banco e integrações
* **HTTP**: interface de entrada (controllers, DTOs, módulos)

Regras fundamentais:

* Camadas internas **não dependem** de camadas externas
* O domínio **não conhece** frameworks, ORM ou banco de dados
* Dependências fluem sempre de fora para dentro

## Consequências

* Maior previsibilidade estrutural
* Facilidade de refatoração e testes
* Redução de acoplamento acidental
* Mais disciplina exigida no desenvolvimento
