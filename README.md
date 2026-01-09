# Reservation Core — Barber Shop Booking System

Núcleo de reservas para barbearia, desenvolvida como **projeto pessoal com padrão profissional**, focado em **boas práticas de arquitetura, domínio e modelagem de dados**.

O projeto serve como **repertório técnico** para posições de **Node.js Developer (Pleno)**, priorizando clareza arquitetural, decisões explícitas e coerência entre código, domínio e persistência.

---

## Visão Geral

O sistema permite que clientes realizem reservas com barbeiros, tratando conflitos de horário diretamente no banco de dados e mantendo as regras de negócio explícitas no domínio.

Principais características:

* Arquitetura em camadas
* Domínio isolado de frameworks
* Regras críticas garantidas via constraints no banco
* Documentação de decisões arquiteturais (ADR)
* Uso de SQL como fonte de verdade para integridade de dados

---

## Stack Tecnológica

* **Node.js**
* **NestJS** (usado como camada de aplicação)
* **PostgreSQL**
* **Prisma** *(em transição para Drizzle ORM)*
* **TypeScript**
* **pnpm**
* **Jest** (testes E2E)

> ⚠️ **Nota:** O projeto está em transição de **Prisma para Drizzle ORM** para suportar uso intensivo de SQL avançado e maior controle sobre migrations e queries.

---

## Arquitetura

A aplicação segue uma **arquitetura em camadas**, com separação clara de responsabilidades:

```
src/
├── domain          # Entidades, erros e contratos (regras de negócio puras)
├── application     # Casos de uso e orquestração do domínio
├── infrastructure  # Implementações técnicas (ORM, banco, frameworks)
```

* O **domínio** não depende de frameworks ou bibliotecas externas
* A **infraestrutura** implementa contratos definidos pelo domínio
* Regras críticas de integridade são garantidas no **nível do banco de dados**


Decisões arquiteturais estão documentadas em **Architecture Decision Records (ADR)**.

📄 Veja: [`docs/adr`](./docs/adr)

---

## Casos de Uso

Os principais fluxos de negócio estão documentados de forma explícita:

* Criar reserva
* Cancelar reserva
* Listar agenda do barbeiro
* Listar reservas do cliente

📄 Veja: [`docs/use-cases.md`](./docs/use-cases.md)

---

## Estado Atual do Projeto

* ✅ Criação de reservas com validações de domínio
* ✅ Conflitos tratados via constraint no banco
* ⚠️ Cancelamento definido no domínio, persistência em implementação
* ⚠️ Migração de ORM em andamento (Prisma → Drizzle)

Este repositório **prioriza correção arquitetural e clareza de decisões**, não velocidade de entrega.

---

## Documentação

* **ADRs:** decisões arquiteturais e seus trade-offs
  📄 [`docs/adr`](./docs/adr)

* **Casos de Uso:** regras de negócio e fluxos principais
  📄 [`docs/use-cases.md`](./docs/use-cases.md)

---

## Objetivo do Projeto

Este projeto não é um tutorial nem um MVP comercial.

Ele existe para demonstrar:

* pensamento arquitetural
* domínio de Node.js e TypeScript
* modelagem correta de regras de negócio
* uso consciente de banco de dados relacional
* capacidade de justificar decisões técnicas

---

## Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE). Veja o arquivo `LICENSE` para mais detalhes.
