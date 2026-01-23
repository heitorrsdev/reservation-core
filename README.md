# Reservation Core — Barber Shop Booking System

Núcleo de reservas para barbearia, desenvolvido como **projeto de portfólio com padrão profissional**, focado em **arquitetura, domínio rico e modelagem correta de dados**.

Este projeto serve como **repertório técnico** para posições de **Node.js Developer (Pleno)**, priorizando:

* clareza arquitetural
* decisões explícitas e documentadas
* coerência entre domínio, aplicação e persistência

---

## Visão Geral

O sistema permite que usuários realizem **reservas com barbeiros**, tratando **conflitos de horário diretamente no banco de dados** e mantendo as **regras de negócio explícitas no domínio**.

Não se trata de um CRUD genérico:
o foco está em **consistência, invariantes e integridade**.

Principais características:

* Arquitetura em camadas (Clean Architecture)
* Domínio isolado de frameworks
* Identidade centralizada em `User`
* `Barber` modelado como **especialização de usuário**
* Regras críticas garantidas via **constraints no banco**
* SQL como fonte de verdade
* Decisões arquiteturais documentadas (ADR)

---

## Stack Tecnológica

* **Node.js**
* **NestJS** (como camada de aplicação / composição)
* **PostgreSQL**
* **Drizzle ORM** (SQL-first)
* **TypeScript**
* **pnpm**
* **Jest** (testes E2E)

> ℹ️ **Nota:** O projeto adotou uma estratégia **SQL-first**, utilizando Drizzle apenas como camada de infraestrutura.
> Migrations são escritas manualmente em SQL para garantir controle total sobre integridade e constraints.

---

## Arquitetura

A aplicação segue uma **arquitetura em camadas com dependências unidirecionais**:

```
src/
├── domain          # Entidades, VOs, erros e contratos (regras puras)
├── application     # Casos de uso e orquestração do domínio
├── infrastructure  # ORM, banco, framework e detalhes técnicos
```

Princípios adotados:

* O **domínio não depende** de frameworks ou bibliotecas externas
* A **application** depende apenas do domínio
* A **infraestrutura implementa contratos**, nunca regras
* Invariantes críticas são reforçadas **no domínio e no banco**

O enforcement dessa arquitetura é feito via **ESLint**.

📄 Decisões detalhadas em: [`docs/adr`](./docs/adr)

---

## Modelo de Domínio (Visão Conceitual)

* **User**

  * Entidade base de identidade
  * Possui email e password hash validados no domínio

* **Barber**

  * Especialização de `User`
  * Compartilha a mesma identidade (chave primária)
  * Não existe como entidade independente

* **Cliente**

  * Não é uma entidade
  * Representa um `User` que cria reservas

Essa decisão está documentada em ADR e refletida no schema e no código.

---

## Casos de Uso

Os casos de uso são a **fonte de verdade funcional** do sistema.

Atualmente definidos:

* Criar usuário
* Criar barbeiro (especialização de usuário)
* Criar reserva
* Cancelar reserva
* Listar agenda do barbeiro
* Listar reservas do cliente

📄 Consulte: [`docs/use-cases.md`](./docs/use-cases.md)

---

## Banco de Dados e Integridade

* PostgreSQL como banco principal
* Migrations escritas em **SQL puro**
* Constraints utilizadas para:

  * evitar conflitos de horário
  * garantir integridade relacional
* O sistema **não pré-consulta disponibilidade**

  * conflitos são detectados pelo banco
  * violação resulta em erro de domínio

Essa abordagem reduz race conditions e simplifica a lógica de aplicação.

---

## Estado Atual do Projeto

* ✅ Entidades de domínio (`User`, `Barber`, `Reservation`)
* ✅ Casos de uso principais definidos
* ✅ Criação de reservas com validações de domínio
* ✅ Conflitos tratados via constraint no banco
* ⚠️ Persistência de cancelamento de reserva em evolução
* ⚠️ Infra de `User` e `Barber` em implementação

O projeto **prioriza correção arquitetural**, não velocidade.

---

## Documentação

* **ADRs** — decisões arquiteturais e trade-offs
  📄 [`docs/adr`](./docs/adr)

* **Casos de Uso** — regras de negócio e fluxos principais
  📄 [`docs/use-cases.md`](./docs/use-cases.md)

---

## Objetivo do Projeto

Este projeto **não é**:

* um tutorial
* um MVP comercial
* um boilerplate

Ele existe para demonstrar:

* pensamento arquitetural
* domínio de Node.js e TypeScript
* modelagem correta de regras de negócio
* uso consciente de banco de dados relacional
* capacidade de justificar decisões técnicas

---

## Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).
