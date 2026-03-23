# BeautyFlow

BeautyFlow e uma aplicacao para agendamento de servicos em barbearias e saloes de beleza. O projeto combina uma landing page em React com area do cliente, calendario de agendamento e backend local para autenticacao com Google.

## Stack

- React 19
- Vite 8
- TypeScript
- Tailwind CSS 4
- React Router
- Lucide React
- Express
- Passport + Google OAuth 2.0
- Prisma
- Prisma Postgres
- `@prisma/adapter-pg`
- `pg`

## Recursos principais

- Landing page responsiva com foco comercial
- Area do cliente com login e cadastro por e-mail
- Login com Google via backend Express
- Callback `/auth-success` para salvar JWT no navegador
- Calendario com datas, horarios e servicos com preco
- Prisma configurado para Postgres remoto

## Estrutura

```text
src/
  components/
  context/
  data/
  pages/
server/
  auth/
  prisma/
  routes/
prisma/
public/
```

## Variaveis de ambiente

Use o arquivo `.env.example` como base.

## Como rodar localmente

1. Instale as dependencias:

```bash
npm install
```

2. Gere o client e sincronize o schema:

```bash
npx prisma generate
npx prisma db push
```

3. Rode o frontend:

```bash
npm run dev
```

4. Em outro terminal, rode o backend:

```bash
npm run dev:server
```

## Scripts

```bash
npm run dev
npm run dev:server
npm run build
npm run prisma:generate
npm run prisma:push
```

## Rotas principais

- `/` landing page
- `/cliente-acesso` login e cadastro
- `/auth-success` callback do Google no frontend
- `/cliente-agendamento` area protegida do cliente
- `/api/health` healthcheck do backend
- `/api/auth/google` inicio do OAuth Google
- `/api/auth/google/callback` callback do OAuth Google

## Google OAuth

Configure no Google Cloud Console:

- Authorized JavaScript origin: `http://localhost:5173`
- Authorized redirect URI: `http://localhost:3000/api/auth/google/callback`

Sem `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`, o botao de Google redireciona de volta para a tela de login com erro controlado.

## Deploy

O frontend pode ser publicado na Vercel como app Vite comum.

Para o login com Google funcionar em producao, o backend Express precisa estar publicado em um host proprio ou adaptado para funcoes serverless. Depois disso, atualize:

- `BACKEND_URL`
- `FRONTEND_URL`
- `VITE_API_URL`
- redirect URI no Google Cloud

## Observacoes

- O login por e-mail ainda esta em modo local no navegador.
- O login com Google ja usa backend real com JWT.
- O banco atual usa Postgres remoto via `@prisma/adapter-pg`.
