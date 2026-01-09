# ADR 0002: Governança Arquitetural via TypeScript e ESLint

## Contexto

A arquitetura em camadas, por si só, não é suficiente para evitar violações estruturais ao longo do tempo, especialmente em um framework flexível como o NestJS.

Confiar apenas em disciplina humana para manter limites arquiteturais é frágil e não escala.

## Decisão

Utilizar **TypeScript e ESLint como ferramentas de enforcement arquitetural**, aplicando restrições explícitas em tempo de desenvolvimento.

A estratégia inclui:

* Alias de paths refletindo as camadas arquiteturais
* Regras de importação que impedem dependências inválidas entre camadas
* Violação arquitetural tratada como erro de lint, não como convenção informal

## Consequências

* Violações arquiteturais são detectadas imediatamente
* Menor liberdade estrutural em troca de maior consistência
* Arquitetura tratada como regra técnica, não como guideline opcional
