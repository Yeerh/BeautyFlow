# BeautyFlow

Landing page premium para captação e agendamento de clientes em clínicas e lojas do segmento de estética.

## Visão geral

O projeto foi construído com foco em conversão, performance e deploy simples. A interface segue uma direção visual premium, com hero interativa, navegação animada, seções de serviços com CTA para WhatsApp, benefícios com imagens e planos comerciais.

## Stack utilizada

- React 19
- Vite 8
- TypeScript
- Tailwind CSS 4
- Lucide React
- Framer Motion
- `@paper-design/shaders-react` para o background animado da hero
- Componentes importados/adaptados a partir de `shadcn` e `21st.dev`

## Principais recursos

- Navbar em estilo tubelight
- Hero com shader animado e efeito typewriter
- Cards de serviços com imagem e CTA direto para WhatsApp
- Seção de benefícios com imagens
- Planos `Premium` e `Plus`
- Layout responsivo e pronto para deploy na Vercel

## Estrutura

```text
src/
  components/
    ui/
  data/
  App.tsx
  main.tsx
public/
  logo (2).png
  female-model-demonstrating-silber-bracelet.jpg
```

## Como rodar localmente

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
```

## Deploy na Vercel

1. Importe este repositório na Vercel.
2. Framework preset: `Vite`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Deploy.

O projeto não depende de variáveis de ambiente para funcionar.

## Observações

- As imagens de serviços e benefícios usam links externos.
- A imagem principal da hero e a logotipo estão em `public/`.
- O botão de serviços envia para o WhatsApp `+55 81 99238-8506` com mensagem pronta.
