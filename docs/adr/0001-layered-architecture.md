# ADR 0001: Arquitetura em Camadas com Inversão de Dependências

## Contexto

O projeto possui um domínio com regras de negócio não triviais e exige separação clara entre lógica de negócio, orquestração de casos de uso, detalhes de infraestrutura e interface HTTP.

O domínio é tratado como o núcleo do sistema, seguindo princípios de Domain-Driven Design (DDD).

Frameworks como NestJS oferecem alta flexibilidade estrutural, o que pode levar a acoplamento excessivo entre camadas se não houver uma decisão arquitetural explícita sobre direção de dependências e controle de abstrações.

## Decisão

Adotar uma **arquitetura em camadas** baseada no **Dependency Inversion Principle (DIP)**, com responsabilidades bem definidas e dependências unidirecionais:

- **Domain**: núcleo do negócio, contendo entidades, regras e abstrações
- **Application**: orquestração de casos de uso e coordenação do domínio
- **Infrastructure**: detalhes técnicos, ORM, banco de dados e integrações externas
- **HTTP**: interface de entrada (controllers, DTOs, módulos)

### Regras fundamentais

- Camadas internas **não dependem** de camadas externas
- O domínio **não conhece** frameworks, ORM, banco de dados ou mecanismos de entrega
- Camadas internas dependem apenas de **abstrações**
- Camadas externas fornecem **implementações concretas**
- A ligação entre abstrações e implementações é feita por **Dependency Injection**, preferencialmente via container do framework
- Dependências fluem sempre **de fora para dentro**

## Consequências

- Domínio isolado de detalhes técnicos
- Redução de acoplamento estrutural e acidental
- Facilidade de testes unitários e substituição de infraestrutura
- Maior previsibilidade arquitetural
- Necessidade de maior disciplina no uso de abstrações e no registro explícito de dependências
