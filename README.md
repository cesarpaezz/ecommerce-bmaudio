# E-commerce BM Audio

Sistema completo de e-commerce para loja de equipamentos de áudio profissional.

## Tecnologias

### Backend
- **NestJS 10** - Framework Node.js
- **Prisma ORM** - Banco de dados
- **PostgreSQL 16** - Banco relacional
- **Redis 7** - Cache e sessões
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas

### Frontend
- **Next.js 14** - React framework (App Router)
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes UI
- **React Query** - Cache e estado servidor
- **Zustand** - Estado global

### Infraestrutura
- **Docker Compose** - Containers
- **Turborepo** - Monorepo
- **pnpm** - Gerenciador de pacotes

## Requisitos

- Node.js 18+
- pnpm 8+
- Docker e Docker Compose

## Instalação

### 1. Clone e instale dependências

```bash
cd ecommerce-bmaudio
pnpm install
```

### 2. Configure variáveis de ambiente

```bash
# Backend
cp apps/api/.env.example apps/api/.env

# Frontend
cp apps/web/.env.example apps/web/.env
```

### 3. Inicie os containers Docker

```bash
docker-compose up -d
```

Isso irá iniciar:
- PostgreSQL na porta 5432
- Redis na porta 6379

### 4. Execute as migrations do banco

```bash
pnpm db:migrate
```

### 5. Popule o banco com dados iniciais

```bash
pnpm db:seed
```

### 6. Inicie o projeto em desenvolvimento

```bash
pnpm dev
```

Acesse:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3333
- **Documentação API (Swagger)**: http://localhost:3333/api/docs

## Credenciais Padrão

Após rodar o seed, use estas credenciais para acessar o painel admin:

- **Email**: admin@bmaudio.com.br
- **Senha**: admin123

## Estrutura do Projeto

```
ecommerce-bmaudio/
├── apps/
│   ├── api/                 # Backend NestJS
│   │   ├── prisma/          # Schema e migrations
│   │   └── src/
│   │       ├── auth/        # Autenticação
│   │       ├── users/       # Usuários
│   │       ├── products/    # Produtos
│   │       ├── categories/  # Categorias
│   │       ├── cart/        # Carrinho
│   │       ├── orders/      # Pedidos
│   │       └── inventory/   # Estoque
│   │
│   └── web/                 # Frontend Next.js
│       ├── app/             # Rotas (App Router)
│       │   ├── admin/       # Painel admin
│       │   ├── produtos/    # Listagem produtos
│       │   ├── produto/     # Página produto
│       │   ├── carrinho/    # Carrinho
│       │   ├── conta/       # Área do cliente
│       │   └── ...
│       ├── components/      # Componentes React
│       └── lib/             # Utilitários
│
├── docker-compose.yml       # Containers
├── turbo.json              # Config Turborepo
└── package.json            # Scripts monorepo
```

## Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev          # Inicia frontend e backend

# Build
pnpm build        # Build de produção

# Banco de dados
pnpm db:migrate   # Executa migrations
pnpm db:studio    # Abre Prisma Studio
pnpm db:seed      # Popula banco inicial

# Lint
pnpm lint         # Verifica código
```

## Funcionalidades

### Loja (Frontend)
- [x] Homepage com produtos em destaque
- [x] Catálogo de produtos com filtros
- [x] Página de produto com variações
- [x] Carrinho de compras persistente
- [x] Busca de produtos
- [x] Cadastro e login de usuários
- [x] Área do cliente (pedidos, perfil)

### Painel Admin
- [x] Dashboard com estatísticas
- [x] CRUD de produtos
- [x] Gerenciamento de pedidos
- [x] Controle de estoque
- [x] Listagem de clientes

### Backend
- [x] API RESTful documentada
- [x] Autenticação JWT com refresh token
- [x] Controle de acesso por roles (RBAC)
- [x] Validação de dados
- [x] Upload de imagens
- [x] Controle de estoque com reserva

## Integrações de Pagamento

O sistema está preparado para integrar com gateways que cobram taxa fixa mensal:

- **Mercado Pago** - Checkout Pro
- **PagSeguro** - Checkout transparente
- **Stripe** - Checkout Sessions

Para integrar, adicione as credenciais no `.env` e implemente os webhooks.

## Personalização

### Cores e Tema

Edite `apps/web/app/globals.css` para alterar as variáveis CSS:

```css
:root {
  --primary: 222.2 47.4% 11.2%;  /* Cor principal */
  --accent: 210 40% 96.1%;        /* Cor de destaque */
}
```

### Logo e Informações

Edite os componentes:
- `apps/web/components/layout/header.tsx`
- `apps/web/components/layout/footer.tsx`

## Deploy

### Backend (Render, Railway, etc)

1. Configure variáveis de ambiente no painel
2. Build command: `pnpm install && pnpm build`
3. Start command: `cd apps/api && node dist/main`

### Frontend (Vercel)

1. Import o repositório
2. Framework: Next.js
3. Root: `apps/web`
4. Configure `NEXT_PUBLIC_API_URL`

## Licença

Proprietário - Todos os direitos reservados.
