# Use Cases — Sistema de Reservas

Este documento define os **casos de uso essenciais** do sistema.
Ele descreve as regras de negócio esperadas que impactam schema, queries e validações.

---

## UC-01 — Criar Reserva

**Ator:** Cliente

### Fluxo principal
1. Cliente seleciona um barbeiro
2. Informa `startTime` e `endTime`
3. Sistema valida:
   - horário válido
   - barbeiro ativo
4. Sistema tenta criar a reserva
5. Reserva é criada com sucesso

### Regras de negócio
- `startTime` deve ser anterior a `endTime`
- O intervalo deve representar um horário válido de reserva
- O barbeiro deve estar ativo
- O sistema **não consulta previamente** disponibilidade
- Conflitos de horário são tratados via **constraint no banco**
- Violação de constraint resulta em **erro de conflito de reserva**


---

## UC-02 — Cancelar Reserva

**Ator:** Cliente ou Admin

### Fluxo principal
1. Sistema verifica se a reserva existe
2. Sistema verifica autorização:
   - pertence ao cliente **ou**
   - ator possui role `ADMIN`
3. Reserva é marcada como cancelada (soft state)

### Observações
- Reserva **não é deletada**
- Este caso de uso está definido no domínio, mas sua persistência (status/cancelamento) ainda não está implementada


---

## UC-03 — Listar Agenda do Barbeiro

**Ator:** Barbeiro ou Admin

### Fluxo principal
1. Sistema recebe um intervalo de datas
2. Retorna reservas do barbeiro no período
3. Resultado ordenado por `startTime`

### Decisões pendentes
- Inclusão de reservas canceladas
- Política de visibilidade por período

---

## UC-04 — Listar Reservas do Cliente

**Ator:** Cliente

### Fluxo principal
1. Retorna reservas do cliente
2. Resultado paginado
3. Ordenado por data

### Decisões pendentes
- Inclusão de reservas canceladas
- Política de visibilidade de reservas passadas

### Observações
- Datas e horários são tratados em UTC
