# Use Cases — Sistema de Reservas

Este documento define os **casos de uso essenciais** do sistema.
Ele descreve as regras de negócio esperadas que impactam schema, queries e validações.

> **Nota sobre atores:**
> Todos os atores deste documento representam papéis exercidos por Usuários do sistema.
> Cliente é o usuário que realiza reservas.
> Barbeiro é um usuário especializado com agenda própria.
> Processo Administrativo representa ações internas ou administrativas do sistema.

---

## UC-00 — Criar Usuário

**Ator:** Usuário (Cadastro)

### Fluxo principal

1. Sistema recebe email e password
2. Sistema valida formato do email
3. Sistema gera e valida o password hash
4. Usuário é criado com sucesso

### Regras de negócio

* Email deve ter formato válido
* Email deve ser único
* Password **não é armazenado em texto puro**
* Usuário é criado como entidade base do sistema

---

## UC-01 — Criar Barbeiro

**Ator:** Processo Administrativo

### Fluxo principal

1. Sistema recebe um `userId`
2. Sistema verifica se o usuário existe
3. Sistema verifica se o usuário já é barbeiro
4. Sistema cria o barbeiro associado ao usuário

### Regras de negócio

* Barbeiro é uma **especialização de usuário**
* Um usuário pode ser barbeiro **no máximo uma vez**
* A identidade do barbeiro é derivada da identidade do usuário
* Barbeiro é criado como ativo por padrão

---

## UC-02 — Criar Reserva

**Ator:** Cliente

### Fluxo principal

1. Cliente seleciona um barbeiro
2. Informa `start_time` e `end_time`
3. Sistema valida:
   * horário válido
   * barbeiro ativo
4. Sistema tenta criar a reserva
5. Reserva é criada com sucesso

### Regras de negócio

* `start_time` deve ser anterior a `end_time`
* O intervalo deve representar um horário válido de reserva
* O barbeiro deve estar ativo
* O sistema **não consulta previamente** disponibilidade
* Conflitos de horário são tratados via **constraint no banco**
* Violação de constraint resulta em **erro de conflito de reserva**

---

## UC-03 — Cancelar Reserva

**Ator:** Cliente ou barbeiro

### Fluxo principal

1. Sistema verifica se a reserva existe
2. Sistema verifica autorização:
   * pertence ao cliente **ou**
   * ao barbeiro
3. Reserva é marcada como cancelada (soft state)

### Observações

* Reserva **não é deletada**
* Persistência de cancelamento (ex: `status`, `canceled_at`) ainda não implementada

---

## UC-04 — Listar Agenda do Barbeiro

**Ator:** Barbeiro

### Fluxo principal

1. Sistema recebe um intervalo de datas (`start_time` / `end_time`)
2. Retorna reservas do barbeiro no período
3. Resultado ordenado por `start_time`

### Decisões pendentes

* Inclusão de reservas canceladas
* Política de visibilidade por período

---

## UC-05 — Listar Reservas do Cliente

**Ator:** Cliente

### Fluxo principal

1. Retorna reservas do cliente
2. Resultado paginado
3. Ordenado por `start_time`

### Decisões pendentes

* Inclusão de reservas canceladas
* Política de visibilidade de reservas passadas

### Observações

* Datas e horários são tratados em UTC
