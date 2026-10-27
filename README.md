# Sistema de Vendas com Comissões, Metas e Performance

API REST desenvolvida com Node.js, Express e MySQL/MariaDB para gerenciamento de vendedores, vendas, cálculo automático de comissões e relatórios de desempenho.

## Tecnologias utilizadas

- Node.js
- Express
- MySQL/MariaDB
- mysql2
- dotenv
- Nodemon

## Funcionalidades

- Cadastro, consulta, atualização e desativação de vendedores.
- Listagem de vendedores ativos ou de todos os vendedores.
- Registro de vendas com validação de vendedor e região.
- Cálculo automático de comissões.
- Consulta de vendas por vendedor e região.
- Exclusão de vendas.
- Relatório de performance por período.
- Apuração de vendas, comissões e metas.
- Tratamento centralizado de erros.
- Uso de consultas SQL parametrizadas.

## Estrutura do projeto

```text
.
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── vendedoresController.js
│   │   ├── vendasController.js
│   │   └── relatoriosController.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── vendedoresRoutes.js
│   │   ├── vendasRoutes.js
│   │   └── relatoriosRoutes.js
│   ├── services/
│   │   ├── vendedoresService.js
│   │   ├── vendasService.js
│   │   └── relatoriosService.js
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   ├── calcularComissao.js
│   │   └── httpError.js
│   ├── app.js
│   └── server.js
├── schema.sql
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Pré-requisitos

- Node.js e npm instalados.
- MySQL ou MariaDB instalado e em execução.
- Banco de dados configurado com as tabelas definidas em `schema.sql`.

## Instalação

Clone o repositório e entre na pasta do projeto:

```bash
git clone <URL_DO_REPOSITORIO>
cd <PASTA_DO_PROJETO>
```

Instale as dependências:

```bash
npm install
```

## Configuração do banco de dados

Crie o banco e as tabelas executando o arquivo `schema.sql`.

No MariaDB, por exemplo:

```bash
sudo mariadb
```

Dentro do console SQL:

```sql
SOURCE /caminho/completo/para/schema.sql;
```

Substitua o caminho pelo local real do arquivo `schema.sql`.

O script deve criar o banco `db_vendas`, as tabelas necessárias e os dados de teste.

**Atenção:** execute o script com cuidado caso o banco já possua dados, pois a recriação de tabelas pode apagá-los, dependendo do conteúdo de `schema.sql`.

## Variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto, utilizando `.env.example` como referência:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=db_vendas
```

Ajuste o usuário, a senha, a porta e o endereço conforme sua instalação do banco de dados.

Não compartilhe o arquivo `.env` nem envie credenciais para o repositório.

## Executando a aplicação

Para iniciar a API:

```bash
npm start
```

Para executar em modo de desenvolvimento:

```bash
npm run dev
```

Por padrão, a API estará disponível em:

```text
http://localhost:3000
```

O endpoint de saúde pode ser consultado em:

```bash
curl http://localhost:3000/health
```

## Endpoints

Todas as requisições com corpo JSON devem utilizar o cabeçalho:

```http
Content-Type: application/json
```

### Vendedores

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/vendedores` | Cadastra um vendedor |
| GET | `/vendedores` | Lista vendedores |
| GET | `/vendedores/:id` | Consulta um vendedor |
| PUT | `/vendedores/:id` | Atualiza um vendedor |
| PATCH | `/vendedores/:id/desativar` | Desativa um vendedor |

#### Cadastrar vendedor

```http
POST /vendedores
```

Exemplo de corpo:

```json
{
  "nome": "João Silva",
  "meta_mensal": 20000,
  "percentual_comissao": 5,
  "id_regiao": 1
}
```

Os campos devem corresponder aos nomes aceitos pelo endpoint e às colunas existentes no banco. Se o cadastro de vendedor utilizar outros campos obrigatórios, informe-os também.

#### Listar vendedores

```bash
curl http://localhost:3000/vendedores
```

Para filtrar vendedores ativos, caso o endpoint ofereça esse filtro:

```bash
curl "http://localhost:3000/vendedores?ativos=true"
```

Para consultar um vendedor específico:

```bash
curl http://localhost:3000/vendedores/1
```

#### Atualizar vendedor

```http
PUT /vendedores/1
```

Exemplo de corpo:

```json
{
  "meta_mensal": 25000,
  "percentual_comissao": 6
}
```

Envie os campos aceitos pela implementação atual do endpoint.

#### Desativar vendedor

```bash
curl -X PATCH http://localhost:3000/vendedores/1/desativar
```

A desativação mantém o histórico de vendas do vendedor.

### Vendas

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/vendas` | Registra uma venda |
| GET | `/vendas` | Lista vendas |
| GET | `/vendas/vendedor/:id` | Consulta vendas de um vendedor |
| GET | `/vendas/regiao/:id` | Consulta vendas de uma região |
| DELETE | `/vendas/:id` | Exclui uma venda |

#### Registrar venda

```http
POST /vendas
```

Exemplo de corpo:

```json
{
  "id_vendedor": 1,
  "id_regiao": 1,
  "valor_venda": 1500,
  "tipo_cliente": "PF"
}
```

O exemplo pressupõe que os campos correspondam ao contrato implementado no projeto.

O sistema valida o vendedor, sua situação cadastral, a região, o tipo de cliente e o valor da venda. A comissão é calculada automaticamente durante o registro.

Os tipos de cliente utilizados são:

- `PF`: pessoa física.
- `PJ`: pessoa jurídica.

#### Listar vendas

```bash
curl http://localhost:3000/vendas
```

#### Consultar vendas por vendedor

```bash
curl http://localhost:3000/vendas/vendedor/1
```

#### Consultar vendas por região

```bash
curl http://localhost:3000/vendas/regiao/1
```

#### Excluir venda

```bash
curl -X DELETE http://localhost:3000/vendas/1
```

### Relatórios

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/relatorios/performance?inicio=YYYY-MM-DD&fim=YYYY-MM-DD` | Gera o relatório de performance |

#### Gerar relatório

```bash
curl -G http://localhost:3000/relatorios/performance \
  --data-urlencode "inicio=2026-10-01" \
  --data-urlencode "fim=2026-10-31"
```

O relatório retorna informações como:

- Período consultado.
- Quantidade total de vendas.
- Valor total vendido.
- Comissão média.
- Vendas agrupadas por região.
- Vendas agrupadas por tipo de cliente.
- Vendedor com maior valor vendido.
- Vendedor com maior comissão acumulada.
- Quantidade de vendedores que atingiram as metas, conforme os critérios da consulta.

As datas devem estar no formato `YYYY-MM-DD`. O período inicial não pode ser posterior ao período final.

## Regras de negócio

### Cálculo da comissão

A comissão é calculada com base no valor da venda, no percentual-base do vendedor, no tipo de cliente e na região.

| Critério | Bônus |
|---|---:|
| Pessoa física (PF) | +2% |
| Pessoa jurídica (PJ) | +3% |
| Região Norte | +1% |
| Região Nordeste | +1% |
| Região Sudeste | +0% |
| Região Sul | +0,5% |

O percentual total corresponde à soma do percentual-base com os bônus aplicáveis.

**Fórmula:**

```text
percentual_total = percentual_base + bonus_cliente + bonus_regiao

comissao = valor_venda * percentual_total / 100
```

Exemplo: para uma venda de R$ 1.000,00, com percentual-base de 5%, cliente PF e região Norte:

```text
Percentual total = 5% + 2% + 1% = 8%

Comissão = 1000 * 8 / 100 = R$ 80,00
```

### Validações

- O valor da venda deve ser positivo.
- O vendedor precisa existir e estar ativo.
- A região informada precisa existir.
- O tipo de cliente deve ser válido.
- Os campos obrigatórios precisam ser informados.
- As datas dos relatórios devem ser válidas e formar um período consistente.

## Tratamento de erros

A API retorna respostas JSON com mensagens de erro. Erros de validação e de recursos inexistentes devem retornar os respectivos códigos HTTP, como `400` e `404`. Erros inesperados são tratados pelo middleware centralizado.

Exemplo ilustrativo:

```json
{
  "erro": "Mensagem explicativa do erro"
}
```

O formato exato da resposta depende do middleware implementado.

## Testes manuais

As rotas podem ser testadas utilizando `curl`, Postman ou Insomnia.

Exemplo de sequência básica:

1. Cadastrar ou consultar um vendedor.
2. Registrar uma venda para um vendedor ativo.
3. Consultar a venda registrada.
4. Consultar vendas por vendedor e região.
5. Consultar o relatório de performance.
6. Testar dados inválidos e recursos inexistentes.

## Segurança e boas práticas

- Consultas ao banco utilizam parâmetros para reduzir riscos de SQL injection.
- Credenciais são configuradas por variáveis de ambiente.
- Erros são tratados em um middleware centralizado.
- O registro de venda utiliza transação para manter a consistência dos dados.

## Autor

Projeto acadêmico desenvolvido para a disciplina de Desenvolvimento Web II.
