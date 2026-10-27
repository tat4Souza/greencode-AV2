# AV2 | Técnicas de Programação

<p align="center">
  <img width="180" height="180" alt="♻️" src="https://github.com/user-attachments/assets/1f47d965-9605-42b7-b80f-b7eea9d559b6" />

  <h2 align="center">Greencode</h2>
</p>

<p align="center">
  | <a href="#papeis">Papéis</a> |
  <a href="#executar">Como testar</a> |
  <a href="#estrutura">Estrutura</a> |
  <a href="#decisoes">Decisões de Arquitetura</a> |
  <a href="#regras">Regras de Negócio</a> |
  <a href="#banco">Banco de Dados</a> |
  <a href="#conclusao">Considerações Finais</a> |
</p>

O **Greencode** evoluiu de um sistema de linha de comando (CLI) com persistência em arquivos criptografados para um **servidor monolítico** que utiliza uma **API RESTful**, desenvolvida em Node.js, TypeScript, Fastify e Prisma ORM, com persistência em **PostgreSQL**.
Seu propósito continua sendo rastrear o fluxo completo de equipamentos obsoletos — desde a chegada dos lotes até o destino final (desmonte, reciclagem ou reuso) —, agora atendendo a múltiplos usuários simultâneos, com autenticação por JWT, controle de concorrência otimista e documentação interativa via Swagger.

---

## 💻 Tecnologias utilizadas

![Static Badge](https://img.shields.io/badge/node-%235FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Static Badge](https://img.shields.io/badge/typescript-%233178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Static Badge](https://img.shields.io/badge/fastify-%23000000?style=for-the-badge&logo=fastify&logoColor=white)
![Static Badge](https://img.shields.io/badge/zod-%23408AFF?style=for-the-badge&logo=zod&logoColor=white)
![Static Badge](https://img.shields.io/badge/prisma-%232D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Static Badge](https://img.shields.io/badge/swagger-%2385EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![Static Badge](https://img.shields.io/badge/docker-%232496ED?style=for-the-badge&logo=docker&logoColor=white)
![Static Badge](https://img.shields.io/badge/postgresql-%234169E1?style=for-the-badge&logo=postgresql&logoColor=white)

### Usos no projeto

- **Node.js + TypeScript**: Runtime e tipagem estática (ESM, `strict`)
- **Fastify 5**: Servidor HTTP, hooks de autenticação e plugins
- **Zod 4 + fastify-type-provider-zod**: Validação e tipagem de entradas e saídas
- **Prisma 7 + PostgreSQL 16**: ORM, migrations versionadas e banco relacional
- **@fastify/jwt + bcryptjs**: Autenticação stateless e hash de senhas
- **@fastify/swagger + swagger-ui**: Documentação interativa da API (`/docs`)

### Compatibilidade do Sistema

Projetado e validado para execução nativa nos seguintes ambientes:

- **Windows**: Windows 10 ou superior.
- **Linux**: Ubuntu 24.04.3 LTS ou superior (e distribuições derivadas).

**Pré-requisitos:** Node.js 22 LTS (mínimo 20.19, exigência do Prisma 7), com npm e Docker com Docker Compose (para o PostgreSQL).

---

## 👥 Papéis e Permissões do Sistema <a id="papeis"></a>

A API aplica Controle de Acesso Baseado em Papéis (RBAC): cada rota exige o papel adequado e **todas as funcionalidades de cada conta ficam restritas ao escopo que lhe pertence**. Uma conta que tente acessar algo fora do seu escopo recebe `403 Forbidden`. O **Administrador** é o único papel com acesso a todos os recursos.

| Papel                               | O que faz na plataforma                                                                                                                  | Rotas permitidas                                                                                                                    |
| :---------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| **ADMIN** (Administrador)           | Gestão de contas de acesso, parametrização global (alíquota de impostos e depreciação) e acesso a todas as funcionalidades da plataforma | Todas                                                                                                                               |
| **OPERADOR** (Operador de Cadastro) | Cadastra e gerencia organizações clientes e seus contratos                                                                               | `/api/organizations` e `/api/organizations/:id/contract` (Todas inclusas na divisão 'Organizations' do swagger)                     |
| **GESTOR** (Gestor de Almoxarifado) | Controla o recebimento de lotes, a triagem e a movimentação de equipamentos                                                              | `/api/batches`, `/api/equipments` e `/api/equipments/:id/movements` (Todas inclusas na divisão 'Batches' e 'Equipments' do swagger) |
| **AUDITOR**                         | Escopo exclusivo de relatórios (somente leitura)                                                                                         | `/api/reports` (Todas inclusas na divisão 'Reports')                                                                                |

Além das rotas acima, **todo usuário autenticado** pode usar `POST /api/auth/logout` e `PATCH /api/auth/password`. `POST /api/auth/login` é a única rota pública (além de `/healthcheck` e `/docs`).

**OBS**: A rota de healthcheck serve para verificar a saúde da API e certificar-se de que ela está rodando adequadamente.

### 🔑 Usuários de demonstração (criados pelo seed)

| Papel    | E-mail                   | Senha        |
| :------- | :----------------------- | :----------- |
| ADMIN    | `admin@greencode.com`    | `Admin@1234` |
| OPERADOR | `operador@greencode.com` | `Demo@1234`  |
| GESTOR   | `gestor@greencode.com`   | `Demo@1234`  |
| AUDITOR  | `auditor@greencode.com`  | `Demo@1234`  |

> 💡 O Administrador inicial é criado pelo **seed**, pois `POST /api/users` exige um ADMIN autenticado. As credenciais do ADMIN podem ser trocadas pelas variáveis `ADMIN_EMAIL` e `ADMIN_PASSWORD` (e a senha dos demais usuários por `SEED_USER_PASSWORD`) no `.env`, antes de executar o seed.

<br>

---

## 🚀 Como testar <a id="executar"></a>

### 1. Subir o banco de dados (Docker)

```bash
docker compose up -d
```

### 2. Criar o arquivo de ambiente

```bash
# Linux / macOS
cp .env.example .env

# Windows (PowerShell ou CMD)
copy .env.example .env
```

| Variável                         | Descrição                                             | Padrão                                                     |
| :------------------------------- | :---------------------------------------------------- | :--------------------------------------------------------- |
| `DATABASE_URL`                   | String de conexão do PostgreSQL                       | `postgresql://greenUser:green123@localhost:5432/greencode` |
| `JWT_SECRET`                     | Segredo de assinatura dos tokens (mín. 16 caracteres) | — (obrigatório)                                            |
| `JWT_EXPIRES_IN`                 | Validade do token                                     | `30m`                                                      |
| `PORT`                           | Porta do servidor (configurável)                      | `3000`                                                     |
| `HOST`                           | Interface de escuta                                   | `0.0.0.0`                                                  |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credenciais do administrador criado no seed           | `admin@greencode.com` / `Admin@1234`                       |
| `SEED_USER_PASSWORD`             | Senha dos demais usuários do seed                     | `Demo@1234`                                                |

> As variáveis são validadas com Zod na inicialização: se alguma estiver ausente ou inválida, o servidor encerra informando o problema.

### 3. Executar o passo a passo

#### I.) Banco no ar

```bash
docker compose up -d
```

#### II.) Instala tudo (o build e as migrations precisam das devDependencies)

```bash
npm ci
```

#### III.) Aplica as migrations

```bash
npm run db:deploy
```

#### IV.) Popula os dados de demonstração

```bash
npm run db:seed
```

#### V.) Compila: limpa dist, gera o client do Prisma e roda o tsc

```bash
npm run build
```

#### VI.) Simula o servidor de produção: remove as devDependencies

```bash
npm prune --omit=dev
```

#### VII.) Sobe a versão compilada

```bash
npm start
```

#### VIII.) Executa o script de teste da jornada

O script usa o `tsx`, uma devDependency removida no passo VI. Por isso, interrompa o servidor (`Ctrl+C`), restaure as dependências e suba o servidor novamente:

```bash
npm ci
npm start
```

Em **outro terminal**, com o servidor rodando, execute:

```bash
npm run test
```

> 💡 Os detalhes do que o script verifica estão na seção 7.

> 💡 Para voltar ao modo de desenvolvimento (`npm run dev`) depois do passo VI, execute `npm ci` novamente.

### 4. Verificar

| O que conferir          | Como                                                                                                                             |
| :---------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| Servidor no ar          | `GET http://localhost:3000/healthcheck`                                                                                          |
| Documentação interativa | Abrir `http://localhost:3000/docs`                                                                                               |
| Autenticação            | Em `POST /api/auth/login`, usar um usuário da tabela de credenciais; copiar o `accessToken` e clicar em **Authorize** no Swagger |
| Escopo por papel        | Logar com o AUDITOR e tentar `GET /api/batches` (deve retornar `403`); acessar `GET /api/reports/financial` (deve funcionar)     |
| Graceful shutdown       | Pressionar `Ctrl+C` no terminal: o servidor finaliza as conexões ativas e desconecta o Prisma antes de encerrar                  |
| Porta configurável      | `PORT=4000 npm start` (Linux) ou `$env:PORT=4000; npm start` (PowerShell)                                                        |

### 5. Scripts disponíveis

- `npm run dev`: Servidor em modo desenvolvimento (`tsx watch`);
- `npm run build`: Limpa `dist`, gera o client do Prisma e compila o TypeScript;
- `npm start`: Executa a versão compilada (`dist/app.js`);
- `npm run db:generate`: Gera o Prisma Client;
- `npm run db:migrate`: Cria/aplica migrations em desenvolvimento;
- `npm run db:deploy`: Aplica as migrations existentes (produção);
- `npm run db:seed`: Popula o banco com dados de demonstração;
- `npm run test`: Executa o script de teste da jornada completa pela API (requer o servidor rodando).

### 6. Massa de dados do seed

O seed cobre os cenários de validação do CLI e pode ser executado várias vezes (usuários, organizações e contratos não são duplicados; os lotes de demonstração são recriados).

- **Organizações:** uma com contrato válido, uma com contrato vencido, uma sem contrato e uma inativa.
- **Lotes:** em todos os status (`RECEBIDO`, `EM_TRIAGEM`, `TRIAGEM_CONCLUIDA`, `ENCAMINHADO`, `FINALIZADO`), incluindo um lote inativo.
- **Equipamentos:** nos 8 status de rastreamento e em diversos estados físicos.
- **Movimentações:** histórico coerente com o caminho de cada equipamento, incluindo quedas de estado físico com justificativa.
- **Configurações globais:** alíquota de 10% e depreciação de 15%.

### 7. O que é verificado no script de teste fornecido?

O script `scripts/jornada-teste.ts` percorre a jornada completa da aplicação por meio da API, do login do administrador até a remoção dos dados criados, e demonstra as principais regras cobradas na AV1 e na AV2. Ele serve como base de conferência: os cenários adicionais podem ser verificados pelo Swagger (`/docs`) ou acrescentando novos passos ao próprio script.

> Como executar (com o servidor no ar, em outro terminal, e o seed já executado; veja o passo VIII de "Como testar"):

```bash
npm run test
```

#### Como funciona:

- Cada passo imprime `[ OK ]` ou `[FALHOU]`, a rota chamada, o status HTTP recebido e a mensagem de erro devolvida pela API (quando houver);
- Ao final, o script exibe o total de passos aprovados e, em caso de falha, a lista do que falhou (o código de saída é diferente de zero);
- O script cria os próprios dados (CNPJs válidos e e-mails com um identificador único por execução), então pode ser executado várias vezes seguidas;
- Ao terminar, as organizações criadas são removidas (levando junto contratos, lotes e equipamentos). Permanecem no banco apenas dois usuários de teste: um operador (inativo) e um gestor.

São executados **110 passos**, divididos em **13 seções**:

#### I). Disponibilidade e autenticação

- Verifica se o servidor responde ao endpoint de saúde (`/healthcheck`);
- Confere se rotas protegidas são negadas sem token e com token inválido;
- Confere se as credenciais são validadas corretamente: login com senha incorreta, com usuário inexistente e sem e-mail são negados;
- Realiza o login do administrador e obtém o token JWT.

#### II). Administrador: contas de acesso

- Cria um usuário de cada papel disponível (OPERADOR, GESTOR e AUDITOR);
- Verifica se e-mails duplicados e papéis inexistentes na plataforma são rejeitados;
- Atualiza um usuário com a versão atual (permitido, pois ninguém alterou o registro nesse intervalo);
- Atualiza um usuário com uma versão antiga (erro de conflito, pois isso significa que outra requisição alterou o dado antes: controle de concorrência otimista).

#### III). Administrador: parâmetros globais

- Consulta as configurações globais do sistema;
- Verifica se alíquotas acima de 100% e negativas são rejeitadas;
- Atualiza a alíquota de impostos e confere o conflito ao reutilizar uma versão antiga;
- Restaura a alíquota original.

#### IV). Login dos demais perfis

- Autentica o operador, o gestor e o auditor com as contas criadas na seção anterior.

#### V). Controle de acesso por papel (RBAC)

- Verifica se cada perfil recebe `403` ao tentar acessar funcionalidades fora do seu escopo: o operador não acessa usuários nem cadastra lotes; o gestor não acessa organizações nem configurações globais; o auditor não acessa lotes nem cadastra organizações.

#### VI). Operador: organizações e contratos

- Verifica se CNPJs inválidos (dígitos repetidos e tamanho incorreto) e duplicados são rejeitados;
- Testa o cadastro de contrato com vencimento no passado (rejeitado);
- Cadastra uma organização com contrato válido e outra sem contrato (que pode permanecer ativa);
- Verifica a listagem com o filtro de contratos válidos;
- Atualiza uma organização com a versão atual (permitido) e com uma versão antiga (conflito).

#### VII). Gestor: recebimento de lotes

- Verifica se a criação de lote é recusada para organização inexistente ou sem contrato;
- Verifica se datas de entrada futuras ou anteriores a 90 dias são rejeitadas;
- Verifica se lote sem transportadora, equipamento com tipo inválido e equipamento com ano de fabricação futuro são rejeitados;
- Cadastra um lote com 2 equipamentos em uma única transação (ambos nascem em `AGUARDANDO_TRIAGEM`);
- Adiciona um equipamento avulso já em triagem (status inicial livre);
- Consulta o lote para conferir o peso total calculado.

#### VIII). Gestor: triagem e movimentação de equipamentos

- Verifica se o desmonte sem triagem é rejeitado;
- Coloca os equipamentos em triagem e confere o conflito ao movimentar com uma versão antiga;
- Verifica se a queda de duas ou mais categorias no estado físico é rejeitada sem justificativa e aceita com justificativa;
- Consulta o histórico para confirmar que as movimentações foram registradas automaticamente.

#### IX). Gestor: ciclo de vida do lote

- Verifica se pular etapas do lote é rejeitado;
- Avança o lote para `EM_TRIAGEM` e confere que concluir a triagem com equipamentos ainda em triagem é rejeitado;
- Avança os equipamentos e conclui a triagem do lote;
- Verifica se encaminhar o lote com equipamentos aguardando desmonte é rejeitado e, depois, encaminha o lote;
- Verifica se finalizar o lote com equipamentos ainda em desmonte é rejeitado e, depois, finaliza o lote;
- Confere que um lote finalizado não aceita novas movimentações de equipamentos.

#### X). Auditor: relatórios

- Consulta os relatórios por organização (no período), por status de rastreamento e financeiro;
- Verifica se um relatório sem o parâmetro obrigatório é rejeitado;
- Confere que o gestor não acessa os relatórios.

#### XI). Soft delete (inativar/reativar) e cascata

- Verifica se um usuário com registros vinculados não pode ser removido (a API orienta a inativá-lo);
- Cadastra e renova o contrato da segunda organização, que passa a poder receber lotes;
- Inativa um lote e confere que ele continua consultável, que seus equipamentos deixam de aparecer e que ele não pode ser editado; depois o reativa;
- Inativa uma organização e confere que seus lotes são inativados junto e que ela não recebe novos lotes; depois a reativa e confere que os lotes voltam a ficar ativos.

#### XII). Hard delete (remoção definitiva) e cascata

- Remove um equipamento, um lote, um contrato e uma organização e confirma que os registros não existem mais;
- Remove a primeira organização e confirma que seus lotes e equipamentos foram removidos em cascata.

#### XIII). Sessão, senha e ciclo de vida de usuários

- Verifica se a troca de senha com a senha atual incorreta é rejeitada;
- Troca a senha do auditor e confere que o token antigo deixa de valer (`tokenVersion`) e que o login com a nova senha funciona;
- Realiza o logout do gestor e confere que o token dele deixa de valer;
- Remove definitivamente um usuário sem registros vinculados;
- Inativa o operador e confere que ele não consegue mais fazer login e que o token dele deixa de valer;
- Verifica se o administrador é impedido de inativar a si mesmo.

<br>

---

## 🗂️ Estrutura Adotada <a id="estrutura"></a>

```
prisma/
├── schema.prisma        # Modelos e relacionamentos
├── migrations/          # Migrations versionadas (inclui constraints e triggers)
└── seed.ts              # Massa de dados de demonstração
src/
├── app.ts               # Servidor, plugins, error handler global e graceful shutdown
├── routes/              # Declaração das rotas, schemas e papéis exigidos
├── controllers/         # Camada HTTP: lê a requisição e devolve a resposta
├── services/            # Regras de negócio e tradução de erros
├── repositories/        # Único ponto de acesso ao banco (Prisma)
├── schemas/             # Schemas Zod (body, params, query e resposta)
├── middlewares/         # auth (JWT) e requireRole (papéis)
└── lib/                 # env, errors, prisma e validators
```

Fluxo de uma requisição:

```
Rota (valida com Zod + papel) → Controller → Service (regras) → Repository (Prisma) → PostgreSQL
```

**Por que separar _services_ de _repositories_?** Assim como indicado na estrutura monolítica, isso é feito para que **apenas uma camada se comunique com o banco**. Caso a ORM ou o próprio tipo de banco seja trocado, o arquivo de regras de negócio (service) não precisa ser refatorado: apenas os repositórios mudam.

**Por que separar _routes_ de _controllers_?** Para manter uma organização e um fluxo de leitura mais natural: a rota declara o contrato (caminho, schemas, papéis e documentação) e o controller cuida apenas de traduzir HTTP para chamadas de serviço, sem `try/catch` nem regras de negócio.

<br>

---

## 🧠 Decisões de Arquitetura e Trade-offs <a id="decisoes"></a>

### 1. Monólito em camadas (Controller → Service → Repository)

Para o estágio atual do empreendimento, o monólito prioriza simplicidade de implantação, facilidade de depuração e coesão do código. A divisão em camadas mantém o caminho aberto para uma futura extração de módulos, sem pagar o custo de microsserviços agora.

### 2. Documentação interativa e uso do Zod

A rota **`/docs`** exibe o Swagger UI com a documentação de **todas as rotas da API** (agrupadas por tag, com os papéis e os schemas de entrada e saída), e permite autenticar com o token e testar as requisições direto pelo navegador.

O **Zod** foi uma escolha muito conveniente porque trata o JSON em todos os pontos de contato da API:

- **Envio de dados** (`body`), **parâmetros de rota** (`params`) e **query strings** (`querystring`) são validados e convertidos antes de chegarem ao controller (ex.: `z.coerce.date()`, `z.stringbool()`, `z.uuid()`);
- **Respostas** (`response`) são serializadas por schema, o que garante o formato de saída e descarta campos não declarados (o `passwordHash`, por exemplo, nunca é enviado);
- Os **tipos TypeScript** são inferidos dos schemas (`z.infer`), então validação e tipagem nunca ficam desalinhadas;
- Os mesmos schemas alimentam o Swagger (`jsonSchemaTransform`), de modo que a **documentação é gerada a partir do código** e não fica desatualizada.

### 3. Tratamento de erros: handler global + `errors.ts`

O servidor possui um `setErrorHandler` **global** que centraliza a resposta de qualquer falha: erros de validação do Zod (`400`), erros tipados da aplicação, erros conhecidos do Prisma (`P2025` → `404`, `P2002` → `409`, `P2003` → `400`) e, por fim, qualquer erro inesperado (`500`). Com isso, controllers ficam sem `try/catch`.

Mesmo assim, mantive o arquivo **`errors.ts`** (`notFound`, `conflict`, `forbidden`, `notAuth`, `badRequest`). Ele existe para ter **uma tipificação mais precisa** e poder **controlar exatamente qual erro cada regra de negócio gera** no service (por exemplo, `409` para conflito de versão e `400` para violação de regra), em vez de depender apenas da tradução automática dos códigos do Prisma.

### 4. Autenticação com JWT e `tokenVersion` armazenado no banco

O token carrega `{ id, role, tv }`. A versão do token (`tokenVersion`) é armazenada na tabela de usuários e conferida a cada requisição. Com isso é possível **controlar o logout do usuário a partir de determinadas ações**, mesmo que o JWT ainda não tenha expirado:

- logout explícito (`POST /api/auth/logout`);
- troca de senha;
- alteração de papel ou de e-mail do usuário;
- inativação do usuário (a sessão também deixa de ser válida).

**Alternativa rejeitada:** manter uma _blacklist_ de tokens em tabela. Ela cresceria indefinidamente e exigiria limpeza; um único inteiro por usuário resolve o mesmo problema.

### 5. Controle de concorrência otimista (`version`)

Todos os modelos mutáveis possuem o campo `version`. Toda atualização exige a versão que o cliente leu e é executada como `updateMany({ where: { id, version } })` com incremento da versão; se nenhuma linha for afetada, a API responde `409 Conflict` pedindo para recarregar os dados. Assim evitam-se updates perdidos sem o custo de bloqueios pessimistas.

### 6. Transações (`$transaction`)

Operações que precisam ser "tudo ou nada":

- criação de um lote junto com seus equipamentos (_nested write_ atômico);
- mudança de status/estado físico de um equipamento **junto** com o registro da movimentação;
- inativação/reativação de uma organização junto com seus lotes;
- criação de um equipamento com cálculo da posição no lote.

### 7. Rastreabilidade em substituição a uma tabela de logs

Para manter a rastreabilidade que o _journal_ fornecia na AV1, admitiu-se o uso de **`createdAt`, `createdBy`, `updatedAt` e `updatedBy`** nos modelos, além do histórico completo de movimentações dos equipamentos. Isso já proporciona uma camada a mais de rastreabilidade.

**Alternativa rejeitada:** criar uma tabela nova de auditoria. Considerando o escopo do projeto, não vi a necessidade de criar um modelo a mais. Decisão tomada pois, na plataforma, o auditor (que mais se beneficiaria dessa estrutura) só tem acesso aos relatórios predeterminados na AV1 e nada mais.

### 8. Tabela de configurações globais não é 1 para 1 com o usuário

A tabela de configurações globais **não** é uma relação 1 para 1 com o usuário que a alterou. Se fosse (ex.: `updatedById` único), dois administradores mexendo ao mesmo tempo na primeira criação poderiam gerar **duas configurações**. Em vez disso, a tabela possui um **id fixo** protegido por um `CHECK` no banco, o que garante uma única linha, independentemente de quem a altere. Se dois administradores tentarem criar a configuração simultaneamente, o segundo recebe `409` e a edição concorrente é protegida pelo `version`.

<br>

---

## 📋 Regras de Negócio <a id="regras"></a>

### Cadastros e vínculos

- **CNPJ:** validação matemática dos dígitos verificadores e unicidade (também garantida por índice único no banco). Decidi usar uma biblioteca especializada na checagem ao invés de desenvolver a função por conta própria.
- **Contrato:** cada organização possui no máximo um contrato (opcional); a data de vencimento deve ser futura.
- **Organização sem contrato:** pode estar ativa, mas **lotes só podem ser cadastrados** para organizações **ativas** e com **contrato válido** (não vencido).
- **Lotes:** data de entrada não pode ser futura nem anterior a 90 dias.
- **Último administrador:** não pode ser inativado, removido nem ter o papel rebaixado.

### Soft delete e hard delete

| Entidade     | Soft delete (inativar/reativar) | Hard delete (remover) |
| :----------- | :-----------------------------: | :-------------------: |
| Usuário      |               ✅                |          ✅           |
| Organização  |               ✅                |          ✅           |
| Lote         |               ✅                |          ✅           |
| Contrato     |                —                |          ✅           |
| Equipamento  |                —                |          ✅           |
| Movimentação |                —                |          ✅           |

**Usuários, organizações e lotes são as únicas entidades com soft delete** (`PATCH /:id/deactivate` e `PATCH /:id/reactivate`, usando o campo `active`). Mesmo nelas, o **hard delete continua disponível** (`DELETE /:id`). As demais entidades possuem **apenas hard delete**.

### Cascata

Inativações e deleções são feitas **em cascata**, pois tudo deve ser apagado em conjunto caso o "pai" seja extinto:

- **Hard delete:** garantido pelo banco (`ON DELETE CASCADE`): remover uma organização remove seu contrato, lotes, equipamentos e movimentações; remover um lote remove seus equipamentos e movimentações, e assim por diante.
- **Soft delete:** inativar uma organização inativa, na mesma transação, todos os seus lotes; os equipamentos de lotes inativos deixam de aparecer nas consultas e nos relatórios (é possível listá-los com `active=false`).
- **Usuários ficam fora da cascata:** como são referenciados por quase todas as tabelas (`createdBy`, `updatedBy`, `performedBy`), a remoção definitiva de um usuário com registros vinculados é bloqueada (`409`) e a API orienta a **inativá-lo**.
- **Reativação:** **reativar uma organização reativa todos os lotes dela**, inclusive os que tenham sido inativados individualmente antes. Mantém-se a regra simétrica à inativação: o estado do "pai" se propaga a todos os filhos.

### Equipamentos

**Código de barras interno = `id`.** O identificador do equipamento (UUID, gerado pelo banco e único) cumpre o papel de código de barras interno. Um campo separado só duplicaria uma informação que já é única, imutável e indexada.

**Status livre na criação.** Ao cadastrar um equipamento **avulso** em um lote (`POST /api/batches/:id/equipments`), o status inicial pode ser informado. Isso foi intencional: um lote que ainda está em um estado aceitável para receber novos equipamentos pode receber um equipamento que **já esteja em um estágio mais avançado** do processo; restringir o status inicial atrapalharia o uso real. Já a criação de equipamentos **junto com o lote** só permite o estado inicial (`AGUARDANDO_TRIAGEM`). O lote em si continua restringindo a adição de equipamentos: só aceita novos itens enquanto estiver em `RECEBIDO` ou `EM_TRIAGEM`.

**Transição de status do equipamento permitidas** (`PATCH /api/equipments/:id/status`):

| De                                                               | Para                                                             |
| :--------------------------------------------------------------- | :--------------------------------------------------------------- |
| `AGUARDANDO_TRIAGEM`                                             | `EM_TRIAGEM`                                                     |
| `EM_TRIAGEM`                                                     | `AGUARDANDO_DESMONTE`, `DESCARTE_SEGURO`                         |
| `AGUARDANDO_DESMONTE`                                            | `EM_DESMONTE`                                                    |
| `EM_DESMONTE`                                                    | `PECAS_REAPROVEITADAS`, `MATERIAL_RECICLAVEL`, `DESCARTE_SEGURO` |
| `PECAS_REAPROVEITADAS`, `MATERIAL_RECICLAVEL`, `DESCARTE_SEGURO` | `BAIXA_DEFINITIVA`                                               |

Como o equipamento só chega a `AGUARDANDO_DESMONTE` saindo de `EM_TRIAGEM`, a regra do AV1 ("só vai para desmonte após a triagem completa") é garantida pelo próprio mapa de transições.

**Estado físico:** a ordem é `NOVO → BOM_ESTADO → USADO_LEVE → USADO_MODERADO → DANIFICADO_LEVE → DANIFICADO_GRAVE → INSERVIVEL`. Quando o estado cai **duas ou mais categorias**, a **justificativa textual é obrigatória**.

**Movimentações automáticas:** toda mudança de status ou de estado físico gera automaticamente uma movimentação, na mesma transação da atualização. Não existe rota para criar movimentações manualmente.

**Histórico imutável (por isso `Movement` não possui `version`).** Uma movimentação nunca é editada: ela só é inserida (e, no máximo, removida). Como não há atualização, não há conflito de escrita a controlar, então o campo de versionamento otimista seria inútil. A imutabilidade é imposta por um trigger no banco.

### Status do lote

O lote avança de forma linear: `RECEBIDO → EM_TRIAGEM → TRIAGEM_CONCLUIDA → ENCAMINHADO → FINALIZADO`. Além da ordem, a mudança de status só é permitida se os equipamentos do lote respeitarem uma **regra mínima** (função `assertBatchStatusRules`).

Os status posteriores a `EM_DESMONTE` (`PECAS_REAPROVEITADAS`, `MATERIAL_RECICLAVEL`, `DESCARTE_SEGURO` e `BAIXA_DEFINITIVA`) são considerados **destinos finais**, pois são eles que levam o lote a `ENCAMINHADO` ou `FINALIZADO`. Um lote `RECEBIDO` não pode ter equipamentos que tenham avançado dos estados iniciais do processo.

| Status do lote      | Regra mínima para os equipamentos                                                 |
| :------------------ | :-------------------------------------------------------------------------------- |
| `RECEBIDO`          | Nenhum equipamento em destino final                                               |
| `EM_TRIAGEM`        | Nenhum equipamento ainda em `AGUARDANDO_TRIAGEM`                                  |
| `TRIAGEM_CONCLUIDA` | Nenhum equipamento em `AGUARDANDO_TRIAGEM` ou `EM_TRIAGEM`                        |
| `ENCAMINHADO`       | Nenhum equipamento em `AGUARDANDO_TRIAGEM`, `EM_TRIAGEM` ou `AGUARDANDO_DESMONTE` |
| `FINALIZADO`        | Todos em destino final (nenhum em triagem, aguardando desmonte ou em desmonte)    |

Além disso, **um lote sem equipamentos não pode mudar de status**: é exigido pelo menos um equipamento para sair de `RECEBIDO`. Essa verificação é explícita porque `some` aplicado a uma lista vazia retorna `false` (nenhum violador) e, sem ela, um lote vazio poderia avançar até `FINALIZADO`.

**Por que `some`?** As regras são escritas com `Array.some`: para que o status de um lote seja alterado, **todos** os equipamentos precisam respeitar a regra mínima, e `some` procura justamente por **ao menos um equipamento que a viole**. Como retorna `true` ou `false`, é perfeito para essa validação: se existir um violador, a mudança é bloqueada com uma mensagem explicando o motivo.

### Relatórios (`/api/reports`, ADMIN e AUDITOR)

- `GET /api/reports/organizations/:id?start=&end=` — total de lotes e equipamentos de uma organização no período;
- `GET /api/reports/equipments-by-status?status=` — equipamentos por status de rastreamento;
- `GET /api/reports/financial` — receita mensal bruta dos contratos válidos, impostos, receita líquida e coeficiente de depreciação (valores vindos das configurações globais).

<br>

---

## 🗄️ Banco de Dados <a id="banco"></a>

O schema (`prisma/schema.prisma`) define os modelos `User`, `Organization`, `Contract`, `Batch`, `Equipment`, `Movement` e `SystemSetting`, com as migrations versionadas em `prisma/migrations`.

```
Organization 1 ── 0..1 Contract
Organization 1 ── N Batch
Batch        1 ── N Equipment
Equipment    1 ── N Movement
```

> 💡 Mantive o banco de dados em português, por mais que o resto do código esteja em inglês. Essa decisão foi feita visando meu costume em montar bancos de dados nesse padrão (devido as aulas da professora Juliana).

### Restrições de unicidade

- `Organization.cnpj` e `User.email` únicos;
- `Contract.orgId` único (um contrato por organização);
- `Equipment (batchId, batchPosition)` único (posição sequencial dentro do lote).

### Constraints (`CHECK`)

- `version >= 0` em todos os modelos versionados;
- contrato: vencimento posterior à assinatura e valor mensal `>= 0`;
- equipamento: peso `> 0`, ano de fabricação `>= 1970` e posição `>= 1`;
- configurações: alíquota entre 0 e 100, depreciação `> 0` e **id fixo** (uma única linha).

### Triggers

| Trigger                          | Regra imposta pelo banco                                                                                                         |
| :------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `trg_lote_inativo_imutavel`      | Um lote inativo não pode ser alterado (apenas reativado)                                                                         |
| `trg_equipamento_lote_ativo`     | Equipamentos não podem ser inseridos nem alterados em lote inativo (a remoção continua liberada, para o hard delete e a cascata) |
| `trg_lote_data_entrada`          | A data de entrada do lote não pode ser futura nem anterior a 90 dias                                                             |
| `trg_movimentacao_justificativa` | Queda de duas ou mais categorias no estado físico exige justificativa                                                            |
| `trg_movimentacao_imutavel`      | Movimentações não podem ser alteradas (histórico imutável)                                                                       |

Essas regras também são validadas nos _services_ (para devolver mensagens claras ao usuário); o banco atua como **rede de segurança**, impedindo que estados inconsistentes sejam persistidos mesmo que a regra seja burlada.

<br>

---

## 🔐 Segurança e Credenciais Fixas <a id="seguranca"></a>

- Senhas são armazenadas com **bcrypt** (substituindo o SHA-256 do CLI, conforme previsto nas considerações da AV1); o texto puro nunca é persistido nem retornado pela API.
- Os arquivos **`.env.example` e `docker-compose.yml` possuem credenciais fixas** (usuário e senha do PostgreSQL e um `JWT_SECRET` de exemplo) e os usuários do seed têm senhas conhecidas, documentadas acima. Isso foi feito **exclusivamente para facilitar a avaliação e a execução local**. Em um ambiente real, essas credenciais devem ser trocadas, o `.env` real não deve ser versionado (já está no `.gitignore`) e os segredos devem vir de um cofre ou de variáveis protegidas do servidor.

<br>

---

## 📝 Considerações Finais <a id="conclusao"></a>

A migração do CLI para o servidor manteve o núcleo do domínio e o reposicionou em uma arquitetura em camadas: as regras de negócio permaneceram isoladas e foram apenas conectadas a uma interface HTTP, enquanto a persistência passou a ser responsabilidade exclusiva dos repositórios.

| Decisão                                              | Alternativa considerada                | Por que a escolha atual                                       |
| :--------------------------------------------------- | :------------------------------------- | :------------------------------------------------------------ |
| `version` otimista em cada modelo                    | Bloqueio pessimista                    | Menor custo e sem travar registros; conflitos viram `409`     |
| `tokenVersion` no usuário                            | Blacklist de tokens / sessões em banco | Um inteiro resolve logout e invalidação sem tabela que cresce |
| `createdBy`/`updatedBy` + histórico de movimentações | Tabela de auditoria genérica           | Auditor só acessa relatórios; tabela de logs seria _overkill_ |
| Código de barras = `id`                              | Campo separado de código de barras     | Evita duplicar um identificador já único e imutável           |
| Singleton com id fixo nas configurações              | `updatedById` único                    | Impede duas configurações por concorrência na criação         |
| Validação no service + trigger no banco              | Apenas um dos dois                     | Mensagens amigáveis na API e integridade garantida no banco   |
| Monólito em camadas                                  | Microsserviços                         | Simplicidade de implantação e depuração no estágio atual      |

**Evolução natural:** os repositórios isolados permitem trocar a ORM ou o banco sem tocar nas regras; os controllers finos permitem expor as mesmas regras por outro canal (CLI, mensageria); e o front-end SPA pode consumir a API diretamente a partir da documentação em `/docs`.

<br>

---

<sub>Taís Souza · 2º DSM · Fatec SJC · 2026-2</sub>

---
