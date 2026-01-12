# ADR 0003: Estratégia PostgreSQL-first para o Modelo de Dados

## Contexto

O domínio da aplicação envolve regras relacionadas a tempo, concorrência e integridade que são naturalmente expressas no nível do banco de dados.

Implementar essas regras apenas na camada de aplicação aumenta risco de inconsistência e condições de corrida.

## Decisão

Adotar uma abordagem **PostgreSQL-first**, onde o banco de dados é a **fonte da verdade** para regras estruturais e de integridade.

Diretrizes:

* Regras críticas vivem no banco sempre que possível
* Recursos avançados do PostgreSQL são considerados parte do domínio
* O ORM não é responsável por abstrair semântica complexa do banco

## Consequências

* Garantias fortes de integridade e concorrência
* Redução de lógica defensiva na aplicação
* Maior dependência consciente de PostgreSQL
