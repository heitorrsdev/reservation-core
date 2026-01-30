   # ADR 0007 – User como Identidade, Barber como Especialização (Shared Primary Key)

   ## Contexto

   O sistema precisa lidar com reservas entre clientes e barbeiros. O modelo inicial tentou representar isso usando:

   * `users` com um campo `role` (CLIENT | BARBER | ADMIN)
   * Uma tabela separada `barbers`

   Isso criou ambiguidade conceitual:

   * Um barbeiro era ao mesmo tempo um *role* e uma *entidade*
   * A fonte de verdade sobre “quem é barbeiro” ficou duplicada
   * A tabela `reservations` passou a depender de entidades mal definidas

   Além disso, o papel `ADMIN` não possui casos de uso reais no momento, caracterizando YAGNI.

   ## Decisão

   1. **User será tratado exclusivamente como identidade/autenticação**

      * Representa qualquer pessoa que pode se autenticar no sistema
      * Não carrega semântica de negócio além disso

   2. **Barber será uma especialização de User**

      * Um barbeiro é um User com dados e comportamentos adicionais
      * A existência de um registro em `barbers` define se o User é barbeiro

   3. **Relacionamento User ↔ Barber será 1:1 com chave primária compartilhada**

      * `barbers.id` será ao mesmo tempo PK e FK para `users.id`
      * Garante consistência forte: não existe Barber sem User

   4. **Não haverá distinção explícita de “Cliente”**

      * Cliente é qualquer User que **não** seja Barber
      * Um Barber pode atuar como cliente (ex: agendar horário com outro barbeiro)

   5. **O conceito de Admin será removido**

      * Não há necessidade atual
      * Evita complexidade e regras especiais prematuras

   ## Consequências

   ### Positivas

   * Eliminação de duplicação conceitual (role vs entidade)
   * Modelo alinhado com práticas comuns em sistemas de marketplace
   * Regras de negócio mais claras e fáceis de evoluir
   * Banco de dados passa a refletir corretamente o domínio

   ### Negativas / Trade-offs

   * A distinção entre cliente e barbeiro não é explícita via enum ou flag
   * Consultas precisam usar `JOIN` ou `EXISTS` para verificar se um User é Barber
   * Autorização baseada em papel exigirá uma camada própria no futuro

   Esses trade-offs são considerados aceitáveis e preferíveis à rigidez e ambiguidade do modelo anterior.

   ## Estrutura Conceitual Resultante

   ### users

   * id (PK)
   * email
   * password_hash
   * created_at

   ### barbers

   * id (PK, FK → users.id)
   * name
   * bio
   * active
   * created_at

   ### reservations

   * id (PK)
   * user_id (FK → users.id)      -- cliente
   * barber_id (FK → barbers.id)
   * start_time
   * end_time
   * period
   * created_at

   As constraints de tempo e sobreposição permanecem inalteradas.

   ## Observações Finais

   Esta decisão foca exclusivamente em **modelagem correta do domínio e do banco**.
   Questões de autorização (ex: quem pode criar agenda, atender clientes, etc.) serão tratadas posteriormente em nível de aplicação.
