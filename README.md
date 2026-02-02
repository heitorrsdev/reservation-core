# Reservation Core — Barber Shop Booking System

Backend de agendamento para barbearia com foco em **arquitetura em camadas**, **domínio explícito** e **integridade garantida via banco relacional**.

O projeto prioriza regras de negócio claras, isolamento do domínio e uso consciente de SQL-first em Node.js.

---

## Visão Geral

Sistema de reservas entre usuários e barbeiros, com detecção de conflitos de horário feita **no banco de dados**, por meio de constraints.

A aplicação não realiza pré-validações redundantes para concorrência; conflitos são tratados como falhas de integridade e propagados corretamente para a camada de aplicação.

Princípios centrais:
- Invariantes protegidas no domínio e no banco
- Dependências unidirecionais entre camadas
- Decisões arquiteturais documentadas

---

## Stack Tecnológica

- Node.js + TypeScript
- NestJS (composição e boundary da aplicação)
- PostgreSQL
- Drizzle ORM (usado apenas na infraestrutura)
- pnpm
- Jest (configurado; testes ainda em evolução)

**Migrations:** SQL puro (SQL-first), escritas manualmente para controle explícito de schema e constraints.

---

## Arquitetura

Arquitetura em camadas com dependências unidirecionais:

```
src/
├── domain         # Entidades, VOs, erros e contratos
├── application    # Casos de uso e orquestração
└── infrastructure # Banco de dados, ORM e adapters
```

Regras:
- `domain` não depende de nenhuma outra camada
- `application` depende apenas de `domain`
- `infrastructure` implementa contratos definidos acima
- Regras de dependência são **enforçadas via ESLint**

Detalhes e trade-offs documentados em: [`docs/adr`](./docs/adr)

---

## Modelo de Domínio

- **User**  
  Raiz de identidade do sistema.  
  Email e password hash são validados no domínio via Value Objects.

- **Barber**  
  Especialização de `User`, compartilhando o mesmo identificador.  
  Possui tabela própria (`barbers`) para dados específicos do papel de barbeiro.

- **Cliente**  
  Não é uma entidade explícita no domínio.  
  Conceito de uso: qualquer `User` que cria uma reserva.

---

## Casos de Uso

Documento fonte de verdade: [`docs/use-cases.md`](./docs/use-cases.md)

Casos definidos:
- Criar usuário
- Criar barbeiro
- Criar reserva
- Cancelar reserva
- Listar agenda do barbeiro
- Listar reservas do cliente

Nem todos possuem infraestrutura implementada no momento.

---

## Banco de Dados e Integridade

- PostgreSQL como fonte de verdade
- Constraints para:
  - integridade relacional
  - prevenção de sobreposição de horários
- Conflitos de reserva:
  - detectados pelo banco
  - traduzidos para erros de aplicação
- Abordagem reduz race conditions e simplifica a lógica da aplicação

---

## Status Atual

Projeto em desenvolvimento, com foco em estrutura e correção arquitetural:

- ✅ Domínio modelado (`User`, `Barber`, `Reservation`)
- ✅ Use cases principais definidos
- ✅ Constraint de conflito de reservas implementada
- ⚠️ Infraestrutura de `User` e `Barber` ainda não implementada
- ⚠️ Cancelamento de reserva em definição (estado ainda não persistido)
- ⚠️ Testes ainda em fase inicial

---

## Documentação

- ADRs (decisões e trade-offs): [`docs/adr`](./docs/adr)
- Casos de uso detalhados: [`docs/use-cases.md`](./docs/use-cases.md)

---

## Licença

[MIT License](LICENSE)
