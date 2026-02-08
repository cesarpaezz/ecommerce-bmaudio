# 🎛️ E-commerce BM Audio - Arquitetura Completa

## Visão Geral

Este documento descreve a arquitetura completa para um e-commerce de equipamentos de áudio, baseado no site [bmaudio.com.br](https://bmaudio.com.br).

---

## 📐 Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Next.js 14)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Loja      │  │   Carrinho  │  │   Checkout  │  │   Painel Admin      │ │
│  │   Pública   │  │   & Compra  │  │   Pagamento │  │   (Dashboard)       │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS/REST API
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (Node.js + NestJS)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Auth      │  │   Produtos  │  │   Pedidos   │  │   Integrações       │ │
│  │   Module    │  │   & Estoque │  │   & Vendas  │  │   Externas          │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Prisma ORM
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BANCO DE DADOS (PostgreSQL)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Users     │  │   Products  │  │   Orders    │  │   Inventory         │ │
│  │   Roles     │  │   Categories│  │   Payments  │  │   Stock History     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológica

### Frontend
| Tecnologia | Propósito | Por que escolhi |
|------------|-----------|-----------------|
| **Next.js 14** | Framework React | SSR, SEO otimizado, App Router |
| **TypeScript** | Tipagem estática | Menos bugs, melhor DX |
| **Tailwind CSS** | Estilização | Fácil customização, classes utilitárias |
| **Shadcn/ui** | Componentes | Bonitos, acessíveis, modificáveis |
| **React Query** | Gerenciamento de estado | Cache, revalidação automática |
| **Zustand** | Estado global | Simples, leve, sem boilerplate |

### Backend
| Tecnologia | Propósito | Por que escolhi |
|------------|-----------|-----------------|
| **NestJS** | Framework | Arquitetura modular, TypeScript nativo |
| **Prisma** | ORM | Type-safe, migrations fáceis |
| **PostgreSQL** | Banco de dados | Robusto, ACID, JSON support |
| **Redis** | Cache/Sessions | Performance, filas de emails |
| **JWT + Refresh Tokens** | Autenticação | Seguro, stateless |

### Infraestrutura
| Serviço | Propósito | Custo Estimado |
|---------|-----------|----------------|
| **Vercel** | Hospedagem Frontend | Gratuito (hobby) / $20/mês (pro) |
| **Railway** | Backend + DB | ~$5-20/mês |
| **Cloudflare** | CDN + DNS | Gratuito |
| **Resend** | Emails transacionais | Gratuito até 3k/mês |

---

## 💰 Custo Total Estimado

### Cenário Inicial (até 1000 pedidos/mês)
- **Hospedagem**: ~$25/mês (Vercel Pro + Railway)
- **Domínio**: ~R$40/ano
- **Email**: Gratuito (Resend free tier)
- **SSL**: Gratuito (via Vercel/Cloudflare)

**Total: ~R$150-200/mês**

### Cenário Crescimento (1000-10000 pedidos/mês)
- **Hospedagem**: ~$50-100/mês
- **CDN**: ~$20/mês
- **Banco dedicado**: ~$30/mês

**Total: ~R$500-800/mês**

---

## 🔒 Segurança Implementada

1. **Autenticação**
   - JWT com refresh tokens (rotação automática)
   - Passwords com bcrypt (12 rounds)
   - Rate limiting (100 req/15min para login)

2. **Autorização**
   - RBAC (Role-Based Access Control)
   - Roles: `CUSTOMER`, `ADMIN`, `SUPER_ADMIN`
   - Guards em todas as rotas protegidas

3. **Dados**
   - HTTPS obrigatório
   - Sanitização de inputs
   - Prepared statements (via Prisma)
   - Validação com class-validator

4. **Infraestrutura**
   - CORS configurado
   - Helmet.js para headers HTTP
   - Rate limiting global

---

## 📦 Integrações Recomendadas (Sem Taxa por Venda)

### ERPs/Gestão (Mensalidade Fixa)
| Plataforma | Mensalidade | Recursos |
|------------|-------------|----------|
| **Bling** | R$99/mês | NF-e, estoque, financeiro |
| **Tiny ERP** | R$99/mês | NF-e, estoque, integração marketplaces |
| **eGestor** | R$79/mês | Básico, bom para começar |

### Pagamentos
| Gateway | Taxa por Transação | Observação |
|---------|-------------------|------------|
| **Stripe** | 2.9% + R$0.40 | Melhor DX, internacional |
| **Pagar.me** | A partir de 2.49% | Nacional, bom suporte |
| **Asaas** | 2.99% (Pix grátis) | Bom para boletos |

> ⚠️ **Nota**: Gateways de pagamento cobram por transação, não há como evitar. A alternativa é negociar taxas melhores com volume.

---

## 📁 Estrutura de Pastas

```
ecommerce-bmaudio/
├── apps/
│   ├── web/                    # Frontend Next.js
│   │   ├── app/               # App Router
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── lib/               # Utilitários
│   │   └── styles/            # CSS global
│   │
│   └── api/                    # Backend NestJS
│       ├── src/
│       │   ├── modules/       # Módulos de domínio
│       │   ├── common/        # Shared (guards, pipes, etc)
│       │   └── config/        # Configurações
│       └── prisma/            # Schema e migrations
│
├── packages/
│   ├── types/                  # Tipos compartilhados
│   └── utils/                  # Funções utilitárias
│
├── docs/                       # Documentação
├── docker-compose.yml          # Dev environment
└── turbo.json                  # Monorepo config
```

---

## 🚀 Próximos Passos

1. **[02-SETUP-AMBIENTE.md](./02-SETUP-AMBIENTE.md)** - Configurar ambiente de desenvolvimento
2. **[03-INFRAESTRUTURA.md](./03-INFRAESTRUTURA.md)** - Deploy e hospedagem
3. **[04-INTEGRACOES.md](./04-INTEGRACOES.md)** - Configurar integrações
5. **[05-DESENVOLVIMENTO.md](./05-DESENVOLVIMENTO.md)** - Guia de desenvolvimento
