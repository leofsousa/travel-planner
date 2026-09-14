# Travel Planner

Sistema web para planejamento e acompanhamento de viagens corporativas. A aplicação centraliza solicitações de viagem, hóspedes, hotéis, reservas, tarefas, cotações e indicadores operacionais.

> Documentação baseada no estado atual do código. Ajuste as instruções de banco, permissões e operação conforme o ambiente de produção.

## Visão geral

O Travel Planner permite:

- criar e editar solicitações de viagem;
- associar hotel, passagem e aluguel de carro a cada solicitação;
- acompanhar solicitações por status em um quadro Kanban;
- planejar quartos, hóspedes, trechos de voo e locações;
- registrar custos e cotações;
- controlar tarefas operacionais;
- gerenciar cadastros de hóspedes e hotéis;
- consultar métricas e exportar dados para XLSX;
- gerar textos de e-mail para financeiro e colaborador.

## Stack

- [Next.js](https://nextjs.org/) `13.5.1` com App Router;
- React `18.2` e TypeScript `5.2`;
- Tailwind CSS `3.3`;
- Supabase Auth e Supabase Database;
- `@dnd-kit` para arrastar e soltar no dashboard;
- `xlsx` para exportação de relatórios;
- `date-fns` para manipulação de datas.

## Pré-requisitos

- Node.js compatível com Next.js 13;
- npm;
- um projeto Supabase configurado;
- banco Supabase com as tabelas e relacionamentos esperados pela aplicação;
- usuário criado no Supabase Auth.

O repositório não contém, atualmente, migrações SQL ou um arquivo `.env.example`. O schema do banco precisa ser preparado separadamente antes da execução completa.

## Instalação

Clone o projeto e instale as dependências:

```bash
npm install
```

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-publicavel
```

As variáveis são usadas pelo cliente Supabase do navegador e pelo middleware de autenticação. Não coloque chaves secretas ou service role no código do frontend.

## Executando localmente

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Depois, acesse [http://localhost:3000](http://localhost:3000). O middleware redireciona usuários não autenticados para `/login`.

Para gerar e executar a versão de produção:

```bash
npm run build
npm run start
```

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Gera o build de produção. |
| `npm run start` | Inicia o servidor de produção após o build. |
| `npm run lint` | Executa o lint configurado pelo Next.js. |

Não há script de testes automatizados configurado neste momento.

## Rotas da aplicação

| Rota | Descrição |
| --- | --- |
| `/login` | Login com e-mail e senha via Supabase Auth. |
| `/` | Dashboard principal com solicitações agrupadas por status. |
| `/requests/new` | Cadastro de uma nova solicitação de viagem. |
| `/requests/[id]` | Detalhes, planejamento, tarefas, cotações e ações da solicitação. |
| `/requests/[id]/edit` | Edição dos dados básicos e serviços da solicitação. |
| `/requests` | Rota existente, atualmente com conteúdo provisório. |
| `/control-panel` | Métricas, filtro mensal e exportação do painel. |
| `/guests` | Cadastro e manutenção de hóspedes. |
| `/hotels` | Cadastro e manutenção de hotéis. |

## Funcionalidades

### Dashboard de solicitações

Na página inicial, as solicitações são exibidas em três colunas:

- **A Fazer** (`pending`);
- **Em Andamento** (`in_progress`);
- **Concluídas** (`completed`).

É possível buscar por nome do evento ou local, filtrar por mês da data inicial e filtrar pela existência de hotel, passagem ou carro. Os contadores acompanham os filtros aplicados. Uma solicitação pode ter o status alterado arrastando o cartão para outra coluna ou usando o seletor na tela de detalhes.

### Solicitações de viagem

O formulário de criação e edição possui os dados gerais:

- nome do evento;
- local;
- data de início;
- data de fim.

Os serviços são opcionais e podem ser habilitados individualmente:

- **Hotel:** hóspedes associados e observações;
- **Passagem (aérea/ônibus):** data de ida, data de volta e observações;
- **Carro:** uma ou mais locações, datas, condutores e observações.

Uma nova solicitação começa com status **A Fazer** e recebe tarefas operacionais padrão. A tela de detalhes permite editar, excluir, atualizar o status, consultar os planejamentos e abrir a geração de e-mail.

### Planejamento de hotel

O planejamento de hotel permite selecionar um hotel cadastrado por autocomplete, preencher check-in e check-out e administrar quartos. Cada quarto pode ter tipo, períodos de hospedagem, valor de diária e hóspedes associados.

Tipos de quarto previstos na interface: individual, duplo, triplo e quádruplo. O custo é calculado a partir das diárias e o salvamento ocorre automaticamente após alterações.

### Planejamento de voos

É possível adicionar, editar e remover trechos com origem, destino, data, horário, companhia, número do voo e observações. As alterações são salvas automaticamente.

O custo de voos ainda não é calculado pelo código atual e permanece como `0` no resumo de custos.

### Planejamento de carros

O planejamento de carros suporta múltiplas locações. Cada locação pode registrar fornecedor, período, horários, veículo, categoria, valor total e observações. O total considera o valor informado ou, quando aplicável, a diária multiplicada pelo número de dias.

### Tarefas

Ao criar uma solicitação, são incluídas tarefas padrão para reserva de hotel, envio de e-mail, reserva de carro e emissão de passagem. A tarefa de passagem possui as subtarefas compra, check-in e envio ao passageiro.

Na tela de detalhes, as tarefas podem ser marcadas, desmarcadas e reinicializadas. O progresso é persistido no banco.

### Cotações

As cotações podem ser registradas para hotel, passagem e carro, com fornecedor, descrição, valor, moeda e informações complementares. A aplicação permite selecionar uma cotação e excluir registros existentes.

### Geração de e-mails

O sistema monta textos de reserva para dois públicos:

- financeiro;
- colaborador.

O conteúdo pode incluir hotel, quartos, hóspedes, carro, custos e pagamento antecipado. O usuário pode copiar o texto ou abrir o cliente de e-mail padrão usando `mailto:`. O sistema não envia e-mails diretamente por um servidor.

### Painel de controle

O painel `/control-panel` calcula, para todas as viagens ou para um mês selecionado:

- total de viagens;
- viagens por status;
- cidades atendidas;
- hotéis mais utilizados;
- quantidade de quartos;
- quantidade de voos;
- quantidade de locações de carro;
- custo total calculado.

O resultado pode ser exportado para uma planilha XLSX.

### Cadastros

#### Hóspedes

O cadastro permite criar, editar e excluir hóspedes com nome completo, documento e e-mail. O documento é usado para evitar duplicidades quando informado. A listagem é ordenada por nome e possui cache local de cinco minutos.

#### Hotéis

O cadastro permite criar, editar e excluir hotéis com nome, cidade, estado, endereço, telefone, e-mail e website. A aplicação bloqueia duplicidade de nome na mesma cidade e oferece busca por cidade para o autocomplete do planejamento.

## Autenticação e proteção de rotas

A autenticação é feita pelo Supabase Auth com `signInWithPassword`.

- `/login` é a rota pública;
- as demais rotas são protegidas pelo `middleware.ts`;
- usuários sem sessão são enviados para `/login?redirect=...`;
- usuários autenticados que visitam `/login` são enviados para `/`;
- o menu lateral oferece logout;
- não há cadastro, recuperação de senha ou administração de usuários na aplicação.

## Persistência no Supabase

Os serviços acessam diretamente o Supabase pelo cliente configurado em `lib/supabase/client.ts`. As principais tabelas referenciadas são:

```text
requests
request_hotels
hotel_guests
request_flights
request_cars
car_rentals
rental_drivers
hotel_planning
rooms
room_guests
flight_planning
car_planning
quotations
guests
hotels
```

Os relacionamentos devem permitir consultar uma solicitação junto com seus serviços, hóspedes, quartos, planejamentos e locações. As políticas de Row Level Security do Supabase também precisam permitir as operações desejadas para os usuários autenticados.

## Estrutura do projeto

```text
app/                  Rotas e páginas do App Router
components/           Componentes reutilizáveis e seções de planejamento
contexts/             Contexto de autenticação
hooks/                Hooks customizados
lib/services/         Acesso e operações sobre os dados
lib/supabase/         Cliente Supabase para o navegador
lib/utils/            Funções utilitárias
types/                Tipos compartilhados
public/               Arquivos públicos
middleware.ts         Proteção e renovação da sessão
```

## Pontos conhecidos do estado atual

- A rota `/requests` ainda exibe apenas o título “Solicitações” e não lista registros.
- Não há migrações SQL ou seed incluídos no repositório.
- Não há testes automatizados configurados.
- O custo de passagens permanece zerado no resumo e nos cálculos do painel.
- A geração de e-mail abre o cliente local via `mailto:`; não existe envio transacional integrado.
- O acesso ao banco ocorre pelo cliente Supabase e depende das políticas de autenticação e RLS configuradas no projeto.

## Arquivos de referência

- `app/page.tsx`: dashboard principal;
- `app/requests/new/page.tsx`: criação de solicitações;
- `app/requests/[id]/page.tsx`: detalhes e operação da solicitação;
- `app/control-panel/page.tsx`: métricas e exportação;
- `app/guests/page.tsx` e `components/guest-table.tsx`: hóspedes;
- `app/hotels/page.tsx` e `app/hotels/components/hotel-table.tsx`: hotéis;
- `lib/services/request-service.ts`: operações de solicitações;
- `lib/services/guest-service.ts`: operações de hóspedes;
- `lib/services/hotel-service.ts`: operações de hotéis;
- `middleware.ts`: proteção de rotas.
