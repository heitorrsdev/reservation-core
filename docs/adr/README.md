# Architecture Decision Records (ADR)

Este diretório contém os **Architecture Decision Records (ADRs)** do projeto.

ADRs documentam **decisões arquiteturais relevantes**, o contexto em que foram tomadas, as alternativas consideradas e suas consequências.
O objetivo é tornar explícito **o raciocínio técnico por trás da arquitetura**, facilitando manutenção, evolução e avaliação técnica do projeto.

## O que é um ADR

Um ADR registra:

* **Contexto**: o problema ou necessidade arquitetural
* **Decisão**: a escolha feita
* **Consequências**: impactos positivos e negativos
* **Alternativas consideradas** (quando aplicável)

As decisões aqui descritas **refletem o estado real do código no momento do commit**.

## Convenções

* Cada ADR possui um identificador sequencial (`0001`, `0002`, …).
* ADRs são **imutáveis após aceitos**, isto é, após a decisão estar aplicada no código.


  * Caso uma decisão mude, um novo ADR deve ser criado, referenciando o anterior.
* ADRs só devem ser adicionados quando a decisão **já estiver aplicada ou imediatamente aplicável** ao código.

## ADRs existentes

|   ID | Título                               |
| ---: | ------------------------------------ |
| 0001 | Layered Architecture                 |
| 0002 | Architecture Enforcement via Tooling |

---

Para regras de negócio e fluxos da aplicação (nível funcional), consulte `docs/use-cases.md`.
