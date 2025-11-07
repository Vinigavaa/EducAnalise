# Autenticação com Auth.js (Next-Auth) e Google Provider

## Índice
1. [Visão Geral](#visão-geral)
2. [Por que usar Auth.js?](#por-que-usar-authjs)
3. [Arquitetura da Solução](#arquitetura-da-solução)
4. [Passo a Passo da Implementação](#passo-a-passo-da-implementação)
5. [Componentes e Arquivos](#componentes-e-arquivos)
6. [Fluxo de Autenticação](#fluxo-de-autenticação)
7. [Configuração do Google OAuth](#configuração-do-google-oauth)
8. [Variáveis de Ambiente](#variáveis-de-ambiente)

---

## Visão Geral

Este projeto utiliza **Auth.js (Next-Auth v5)** para gerenciar autenticação de usuários através do **Google OAuth 2.0**. A solução integra-se perfeitamente com Next.js 15, utilizando **Prisma** como ORM para persistência de dados em banco MySQL.

**Principais características:**
- Autenticação OAuth com Google
- Persistência de sessões em banco de dados
- Integração total com Next.js App Router
- TypeScript para type-safety
- Server Actions para operações seguras

---

## Por que usar Auth.js?

### Vantagens

**1. Segurança Robusta**
- Gerenciamento automático de tokens e sessões
- Proteção contra CSRF (Cross-Site Request Forgery)
- Criptografia de dados sensíveis
- Validação automática de tokens OAuth

**2. Facilidade de Implementação**
- Configuração mínima necessária
- Suporte nativo para múltiplos providers (Google, GitHub, etc.)
- Integração direta com Next.js

**3. Experiência do Usuário**
- Login social (não precisa criar senha)
- Sessões persistentes
- Autenticação rápida e confiável

**4. Escalabilidade**
- Suporte para múltiplos adapters (Prisma, MongoDB, etc.)
- Pode crescer para suportar milhares de usuários
- Fácil adicionar novos providers de autenticação

---

## Arquitetura da Solução

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Header Component (Login Button)                     │  │
│  │  - Usa useSession() para verificar usuário           │  │
│  │  - Chama handleRegister("google") no clique          │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SessionAuthProvider                                  │  │
│  │  - Wraps toda a aplicação                            │  │
│  │  - Fornece contexto de sessão globalmente            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      SERVER ACTIONS                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  handleRegister(provider)                            │  │
│  │  - Server Action que inicia OAuth flow               │  │
│  │  - Chama signIn() do Auth.js                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      AUTH.JS CORE                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/auth/[...nextauth]/route.ts                    │  │
│  │  - GET/POST handlers                                 │  │
│  │  - Processa callbacks OAuth                          │  │
│  │  - Gerencia sessões                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  auth.ts (Configuração)                              │  │
│  │  - Define providers (Google)                         │  │
│  │  - Configura PrismaAdapter                           │  │
│  │  - Exporta auth, signIn, signOut                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              GOOGLE OAUTH (Provider Externo)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - Usuário faz login no Google                       │  │
│  │  - Google valida credenciais                         │  │
│  │  - Retorna tokens de acesso                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  PRISMA ADAPTER + DATABASE                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Prisma Client                                        │  │
│  │  - Salva User na tabela 'users'                      │  │
│  │  - Salva Account na tabela 'accounts'               │  │
│  │  - Salva Session na tabela 'sessions'               │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MySQL Database                                       │  │
│  │  - users (dados do usuário)                          │  │
│  │  - accounts (tokens OAuth)                           │  │
│  │  - sessions (sessões ativas)                         │  │
│  │  - verification_tokens (verificações)                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Passo a Passo da Implementação

### Passo 1: Instalação de Dependências

```bash
npm install next-auth@beta @auth/prisma-adapter @prisma/client
npm install -D prisma
```

**Pacotes instalados:**
- `next-auth@beta` (v5.0.0-beta.29) - Biblioteca de autenticação
- `@auth/prisma-adapter` (v2.11.0) - Adapter para integrar Auth.js com Prisma
- `@prisma/client` - Cliente Prisma para operações no banco
- `prisma` - CLI do Prisma (dev dependency)

---

### Passo 2: Configuração do Prisma Schema

Criamos o arquivo `prisma/schema.prisma` com os modelos necessários para Auth.js:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma/client"
}

// Modelo de Usuário
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  status        Boolean?   @default(true)

  // Relacionamentos Auth.js
  accounts      Account[]
  sessions      Session[]

  @@map("users")
}

// Contas OAuth (Google, GitHub, etc.)
model Account {
  id                String  @id @default(cuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

// Sessões Ativas
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

// Tokens de Verificação (para email verification)
model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

**Por que esses modelos?**
- **User**: Armazena dados básicos do usuário (nome, email, foto do perfil)
- **Account**: Armazena tokens e informações do provider OAuth (Google)
- **Session**: Gerencia sessões ativas dos usuários
- **VerificationToken**: Usado para verificação de email (se habilitado)

Após criar o schema, rodamos:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

### Passo 3: Criar o Cliente Prisma Singleton

Criamos `src/lib/prisma.ts` para evitar múltiplas instâncias do PrismaClient:

```typescript
import { PrismaClient } from "../generated/prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
    // Em produção, cria nova instância
    prisma = new PrismaClient();
} else {
    // Em desenvolvimento, usa singleton para evitar múltiplas conexões
    let globalWithPrisma = global as typeof globalThis & {
        prisma: PrismaClient;
    }

    if(!globalWithPrisma.prisma){
        globalWithPrisma.prisma = new PrismaClient();
    }

    prisma = globalWithPrisma.prisma;
}

export default prisma;
```

**Por que isso é importante?**
- Em desenvolvimento, Next.js recarrega módulos frequentemente (Hot Module Replacement)
- Sem singleton, criaríamos dezenas de conexões com o banco
- Isso causaria erro: "Too many connections"
- O singleton garante uma única instância compartilhada

---

### Passo 4: Configurar Auth.js

Criamos `src/lib/auth.ts` com a configuração principal:

```typescript
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import prisma from "./prisma"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  ],
})
```

**Explicação de cada parte:**

- **`PrismaAdapter(prisma)`**: Conecta Auth.js ao banco de dados via Prisma
  - Salva automaticamente usuários, contas e sessões
  - Gerencia toda a persistência de dados

- **`trustHost: true`**: Confia no host atual
  - Necessário para Next.js 15
  - Evita erros de URL mismatch em desenvolvimento

- **`providers: [Google({...})]`**: Define providers de autenticação
  - Atualmente apenas Google
  - Fácil adicionar outros: `GitHub`, `Discord`, `Credentials`, etc.

- **Exportações:**
  - `handlers`: GET/POST para rotas de API
  - `signIn`: Função para iniciar login
  - `signOut`: Função para logout
  - `auth`: Função para obter sessão atual

---

### Passo 5: Criar Rota de API do Auth.js

Criamos `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import {handlers} from '@/lib/auth'

export const {GET, POST } = handlers;
```

**O que faz este arquivo?**
- Define os **Route Handlers** do Next.js 15
- `[...nextauth]` é um **catch-all route** que captura:
  - `/api/auth/signin` - Página de login
  - `/api/auth/signout` - Página de logout
  - `/api/auth/callback/google` - Callback do Google OAuth
  - `/api/auth/session` - Endpoint para verificar sessão
  - `/api/auth/csrf` - Token CSRF
  - E outros endpoints necessários

**Por que é necessário?**
- Auth.js precisa de endpoints HTTP para processar requisições OAuth
- Esses endpoints lidam com o fluxo completo de autenticação
- Sem eles, o login não funcionaria

---

### Passo 6: Criar SessionProvider Component

Criamos `src/components/session-auth.tsx`:

```typescript
"use client"
import { SessionProvider } from "next-auth/react";

export function SessionAuthProvider({children}: {children: React.ReactNode}) {
    return(
        <SessionProvider>
            {children}
        </SessionProvider>
    )
}
```

**Por que este componente?**
- `SessionProvider` é um **React Context Provider**
- Disponibiliza dados da sessão para toda a aplicação
- Permite usar `useSession()` hook em qualquer componente
- Marcado como `"use client"` porque usa React Context (client-side only)

**O que ele fornece?**
- `session`: Dados do usuário atual
- `status`: Estado da autenticação ("loading", "authenticated", "unauthenticated")
- `update()`: Função para atualizar sessão

---

### Passo 7: Envolver App com SessionProvider

Modificamos `src/app/layout.tsx`:

```typescript
import {SessionAuthProvider} from "../components/session-auth";

export default function RootLayout({ children }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionAuthProvider>
           {children}
        </SessionAuthProvider>
      </body>
    </html>
  );
}
```

**Por que no Root Layout?**
- Garante que **toda a aplicação** tenha acesso à sessão
- Permite usar `useSession()` em qualquer página ou componente
- Centraliza o gerenciamento de estado de autenticação

---

### Passo 8: Criar Server Action para Login

Criamos `src/app/(public)/_actions/login.ts`:

```typescript
"use server"

import { signIn } from '../../../lib/auth'

export async function handleRegister(provider: string) {
  await signIn(provider, { redirectTo: "/dashboard" })
}
```

**O que é uma Server Action?**
- Função que roda **exclusivamente no servidor**
- Marcada com `"use server"`
- Pode ser chamada diretamente do client-side
- Segura (não expõe lógica sensível ao cliente)

**Por que usar Server Action aqui?**
- `signIn()` deve rodar no servidor para segurança
- Evita expor chaves secretas no client-side
- Permite configurar redirect após login
- Next.js 15 otimiza essas chamadas automaticamente

---

### Passo 9: Criar Componente de UI para Login

Modificamos `src/app/(public)/_components/header.tsx`:

```typescript
"use client"

import { useSession } from "next-auth/react"
import { handleRegister } from "../_actions/login"
import { Button } from "@/components/ui/button"

export function Header() {
  const { data: session, status } = useSession()

  return (
    <header>
      {status === "loading" && <p>Carregando...</p>}

      {status === "authenticated" && (
        <Button onClick={() => window.location.href = "/dashboard"}>
          Painel de Controle
        </Button>
      )}

      {status === "unauthenticated" && (
        <Button onClick={() => handleRegister("google")}>
          Entrar com Google
        </Button>
      )}
    </header>
  )
}
```

**Como funciona?**

1. **`useSession()`**: Hook que retorna dados da sessão
   - `data`: Objeto com dados do usuário (ou null)
   - `status`: Estado atual ("loading" | "authenticated" | "unauthenticated")

2. **Renderização Condicional:**
   - `loading`: Mostra "Carregando..." enquanto verifica sessão
   - `authenticated`: Mostra botão para dashboard
   - `unauthenticated`: Mostra botão "Entrar com Google"

3. **Ao clicar "Entrar com Google":**
   - Chama `handleRegister("google")`
   - Server Action inicia OAuth flow
   - Redireciona para Google
   - Após login, volta para `/dashboard`

---

### Passo 10: Criar Utility para Sessão Server-Side

Criamos `src/lib/getSession.ts`:

```typescript
import {auth} from "./auth"

export default auth;
```

**Quando usar?**
- Em **Server Components**
- Em **API Routes**
- Em **Server Actions**
- Sempre que precisar da sessão no servidor

**Exemplo de uso:**

```typescript
// Em uma Server Component
import getSession from "@/lib/getSession"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/")
  }

  return <div>Olá, {session.user.name}!</div>
}
```

**Por que não usar `useSession()` aqui?**
- `useSession()` é um hook React (client-side only)
- Server Components não podem usar hooks
- `auth()` é uma função async que roda no servidor

---

### Passo 11: Definir Types TypeScript

Criamos `src/types/types.d.ts`:

```typescript
import {DefaultSession} from "next-auth"

declare module "next-auth" {
    interface Session {
        user: User & DefaultSession["user"];
    }
}

interface User{
    id: string,
    name: string,
    email: string,
    emailVerified?: null | string | boolean,
    image?: string,
    stripe_customer_id?: string,
    status: boolean,
}
```

**Por que estender tipos?**
- Auth.js tem tipos padrão básicos
- Nosso banco tem campos extras (status, stripe_customer_id)
- TypeScript precisa conhecer esses campos
- Evita erros de tipo ao acessar `session.user.status`

**Module Augmentation:**
- `declare module "next-auth"` estende o módulo existente
- Adiciona campos customizados à interface `Session`
- Mantém compatibilidade com tipos originais

---

## Componentes e Arquivos

### Estrutura de Diretórios

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts              ← API Route Handler
│   ├── (public)/
│   │   ├── _actions/
│   │   │   └── login.ts                  ← Server Action (signIn)
│   │   └── _components/
│   │       └── header.tsx                ← UI de Login
│   └── layout.tsx                        ← SessionProvider wrapper
├── components/
│   └── session-auth.tsx                  ← SessionProvider component
├── lib/
│   ├── auth.ts                           ← Configuração Auth.js
│   ├── prisma.ts                         ← Prisma client singleton
│   └── getSession.ts                     ← Utility para sessão
└── types/
    └── types.d.ts                        ← TypeScript definitions

prisma/
├── schema.prisma                         ← Database schema
└── migrations/                           ← Migrações SQL
```

---

### Detalhamento de Cada Arquivo

#### 1. `src/lib/auth.ts` - Coração do Sistema

```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({...})
```

**Responsabilidades:**
- Define configuração central do Auth.js
- Configura providers (Google)
- Conecta Prisma Adapter
- Exporta funções essenciais

**Por que é útil?**
- Centraliza toda lógica de autenticação
- Fácil adicionar novos providers
- Mantém código organizado e manutenível

---

#### 2. `src/app/api/auth/[...nextauth]/route.ts` - Endpoints HTTP

```typescript
export const {GET, POST } = handlers;
```

**Responsabilidades:**
- Expõe endpoints necessários para OAuth
- Processa callbacks do Google
- Gerencia sessões e cookies

**Por que é útil?**
- Auth.js precisa de endpoints HTTP funcionais
- Implementa OAuth 2.0 protocol automaticamente
- Lida com segurança (CSRF, validação de tokens)

---

#### 3. `src/components/session-auth.tsx` - Context Provider

```typescript
export function SessionAuthProvider({children}) {
    return <SessionProvider>{children}</SessionProvider>
}
```

**Responsabilidades:**
- Envolve app com React Context
- Disponibiliza sessão globalmente
- Gerencia estado de autenticação

**Por que é útil?**
- Permite usar `useSession()` em qualquer componente
- Evita prop drilling (passar props por múltiplos níveis)
- Atualiza UI automaticamente quando sessão muda

---

#### 4. `src/app/(public)/_actions/login.ts` - Server Action

```typescript
export async function handleRegister(provider: string) {
  await signIn(provider, { redirectTo: "/dashboard" })
}
```

**Responsabilidades:**
- Inicia fluxo OAuth de forma segura
- Redireciona usuário após login
- Roda exclusivamente no servidor

**Por que é útil?**
- Mantém lógica sensível no servidor
- Fácil chamar do client-side
- Type-safe com TypeScript

---

#### 5. `src/lib/prisma.ts` - Database Client

```typescript
let prisma: PrismaClient;
// Singleton pattern
export default prisma;
```

**Responsabilidades:**
- Fornece cliente Prisma para toda a app
- Evita múltiplas conexões de banco
- Otimizado para development e production

**Por que é útil?**
- Previne "Too many connections" error
- Melhora performance
- Padrão recomendado pelo Prisma

---

#### 6. `src/lib/getSession.ts` - Server-Side Session

```typescript
import {auth} from "./auth"
export default auth;
```

**Responsabilidades:**
- Obtém sessão em Server Components
- Verifica autenticação no servidor
- Alternativa ao `useSession()` hook

**Por que é útil?**
- Server Components não podem usar hooks
- Permite proteger páginas no servidor
- Mais seguro que verificar no client

---

#### 7. `src/app/layout.tsx` - Root Layout

```typescript
<SessionAuthProvider>
  {children}
</SessionAuthProvider>
```

**Responsabilidades:**
- Envolve toda aplicação com SessionProvider
- Garante acesso global à sessão

**Por que é útil?**
- Configuração única
- Funciona para toda a aplicação
- Facilita gerenciamento de estado

---

#### 8. `prisma/schema.prisma` - Database Schema

```prisma
model User {...}
model Account {...}
model Session {...}
model VerificationToken {...}
```

**Responsabilidades:**
- Define estrutura das tabelas
- Estabelece relacionamentos
- Gera tipos TypeScript automaticamente

**Por que é útil?**
- Schema como fonte única da verdade
- Migrações automáticas
- Type-safety no código

---

## Fluxo de Autenticação

### Fluxo Completo do Login

```
1. USUÁRIO CLICA "ENTRAR COM GOOGLE"
   ↓
   Header.tsx chama handleRegister("google")

2. SERVER ACTION EXECUTA
   ↓
   login.ts chama signIn("google", {redirectTo: "/dashboard"})

3. AUTH.JS REDIRECIONA PARA GOOGLE
   ↓
   URL: https://accounts.google.com/o/oauth2/auth?
        client_id=...&
        redirect_uri=http://localhost:3000/api/auth/callback/google&
        scope=openid email profile&
        response_type=code

4. USUÁRIO FAZ LOGIN NO GOOGLE
   ↓
   - Insere email/senha
   - Autoriza aplicação
   - Google gera authorization code

5. GOOGLE REDIRECIONA DE VOLTA
   ↓
   URL: http://localhost:3000/api/auth/callback/google?code=ABC123

6. AUTH.JS PROCESSA CALLBACK
   ↓
   /api/auth/[...nextauth]/route.ts (handler POST)
   - Troca code por access_token
   - Busca dados do usuário no Google
   - Retorna: {name, email, image, id}

7. PRISMA ADAPTER SALVA NO BANCO
   ↓
   PrismaAdapter automaticamente:

   a) Verifica se usuário já existe (por email)
   b) Se NÃO existe:
      - INSERT INTO users (id, name, email, image, emailVerified)
   c) Se SIM existe:
      - UPDATE users SET name=..., image=... WHERE email=...
   d) INSERT INTO accounts (
      userId, provider="google",
      providerAccountId, access_token,
      refresh_token, expires_at
   )
   e) INSERT INTO sessions (
      userId, sessionToken, expires
   )

8. AUTH.JS CRIA COOKIE DE SESSÃO
   ↓
   Set-Cookie: next-auth.session-token=eyJhbG...;
               HttpOnly; Secure; SameSite=Lax

9. USUÁRIO REDIRECIONADO PARA /DASHBOARD
   ↓
   Browser agora tem cookie com sessionToken

10. SESSÃO ATIVA
    ↓
    - useSession() retorna {user: {...}, status: "authenticated"}
    - Header.tsx mostra "Painel de Controle"
    - Páginas protegidas podem acessar session.user
```

---

### Fluxo de Verificação de Sessão

```
USUÁRIO CARREGA PÁGINA
↓
1. Browser envia cookie automaticamente
   Cookie: next-auth.session-token=eyJhbG...

2. SessionProvider faz fetch
   ↓
   GET /api/auth/session

3. Auth.js verifica sessionToken
   ↓
   SELECT * FROM sessions
   WHERE sessionToken = 'eyJhbG...'
   AND expires > NOW()

4. Se sessão válida:
   ↓
   SELECT users.* FROM users
   JOIN sessions ON sessions.userId = users.id
   WHERE sessions.sessionToken = 'eyJhbG...'

5. Retorna dados do usuário
   ↓
   Response: {
     user: {
       id: "clx...",
       name: "João Silva",
       email: "joao@gmail.com",
       image: "https://lh3.googleusercontent.com/..."
     },
     expires: "2025-11-26T00:00:00.000Z"
   }

6. useSession() atualiza
   ↓
   status: "authenticated"
   data: {user: {...}}

7. UI renderiza baseado na sessão
   ↓
   {session && <Dashboard />}
```

---

### Fluxo de Logout

```
USUÁRIO CLICA "SAIR"
↓
1. Componente chama signOut()
   import {signOut} from "next-auth/react"
   onClick={() => signOut({redirectTo: "/"})}

2. Auth.js deleta sessão
   ↓
   DELETE FROM sessions
   WHERE sessionToken = 'eyJhbG...'

3. Remove cookie
   ↓
   Set-Cookie: next-auth.session-token=;
               Max-Age=0; Expires=Thu, 01 Jan 1970

4. Redireciona para página inicial
   ↓
   window.location.href = "/"

5. useSession() atualiza
   ↓
   status: "unauthenticated"
   data: null

6. Header mostra "Entrar com Google" novamente
```

---

## Configuração do Google OAuth

### Passo a Passo no Google Cloud Console

#### 1. Criar Projeto

1. Acesse: https://console.cloud.google.com/
2. Clique em "Novo Projeto"
3. Nome: "EducAnalise" (ou nome desejado)
4. Clique em "Criar"

---

#### 2. Ativar APIs

1. No menu lateral: **APIs & Serviços** → **Biblioteca**
2. Busque: "Google+ API" ou "People API"
3. Clique em **Ativar**

---

#### 3. Configurar Tela de Consentimento OAuth

1. **APIs & Serviços** → **Tela de consentimento OAuth**
2. Escolha: **Externo** (para qualquer usuário Google) ou **Interno** (apenas sua organização)
3. Clique em **Criar**

**Preencha os campos:**
- **Nome do app**: EducAnalise
- **E-mail de suporte**: seu-email@gmail.com
- **Domínios autorizados**: `localhost:3000` (desenvolvimento)
- **E-mail de contato**: seu-email@gmail.com

4. Clique em **Salvar e Continuar**

**Escopos:**
- Adicione: `userinfo.email` e `userinfo.profile`
- Clique em **Salvar e Continuar**

5. **Usuários de teste** (modo desenvolvimento):
   - Adicione seus e-mails de teste
   - Clique em **Salvar e Continuar**

---

#### 4. Criar Credenciais OAuth 2.0

1. **APIs & Serviços** → **Credenciais**
2. Clique em: **+ Criar Credenciais** → **ID do cliente OAuth**
3. Tipo de aplicativo: **Aplicativo da Web**

**Preencha:**
- **Nome**: EducAnalise Web Client
- **Origens JavaScript autorizadas**:
  - `http://localhost:3000`
  - `https://seu-dominio.com` (produção)
- **URIs de redirecionamento autorizados**:
  - `http://localhost:3000/api/auth/callback/google`
  - `https://seu-dominio.com/api/auth/callback/google`

4. Clique em **Criar**

---

#### 5. Copiar Credenciais

Você receberá:
- **ID do cliente**: `72044618884-jn0r6jti7o7vna6is17e06gv7uak995d.apps.googleusercontent.com`
- **Chave secreta do cliente**: `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`

**⚠️ IMPORTANTE:** Nunca compartilhe essas credenciais publicamente!

---

## Variáveis de Ambiente

### Arquivo `.env`

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="mysql://root:root@localhost:3306/educanalise"

# Google OAuth Credentials
AUTH_GOOGLE_ID="72044618884-jn0r6jti7o7vna6is17e06gv7uak995d.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="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"

# NextAuth Secret (gerado com: openssl rand -base64 32)
AUTH_SECRET="13R5DMFBCRh5NcHWfLkFfojKw/ylh2GdM0cgMuWr+bE="
```

---

### Explicação de Cada Variável

#### `DATABASE_URL`
**O que é:** String de conexão com banco MySQL

**Formato:** `mysql://USER:PASSWORD@HOST:PORT/DATABASE`

**Exemplo:**
```
mysql://root:root@localhost:3306/educanalise
```

**Componentes:**
- `mysql://` - Tipo de banco
- `root` - Usuário do banco
- `root` - Senha do usuário
- `localhost` - Host (servidor local)
- `3306` - Porta padrão MySQL
- `educanalise` - Nome do database

---

#### `AUTH_GOOGLE_ID`
**O que é:** Client ID do Google OAuth

**Onde obter:** Google Cloud Console → Credenciais

**Formato:** `NUMBERS-RANDOM_STRING.apps.googleusercontent.com`

**Para que serve:**
- Identifica sua aplicação no Google
- Público (pode estar no client-side)
- Usado para iniciar OAuth flow

---

#### `AUTH_GOOGLE_SECRET`
**O que é:** Client Secret do Google OAuth

**Onde obter:** Google Cloud Console → Credenciais

**Formato:** `GOCSPX-RANDOM_STRING`

**Para que serve:**
- Autentica sua aplicação no Google
- **PRIVADO** (nunca expor no client-side)
- Usado para trocar authorization code por tokens

**⚠️ Segurança:**
- NUNCA commitar no Git
- NUNCA expor no frontend
- Rotacionar se comprometido

---

#### `AUTH_SECRET`
**O que é:** Chave secreta para criptografia de tokens

**Como gerar:**
```bash
openssl rand -base64 32
```

Ou no Node.js:
```javascript
require('crypto').randomBytes(32).toString('base64')
```

**Para que serve:**
- Assina JWTs (JSON Web Tokens)
- Criptografa cookies de sessão
- Previne falsificação de tokens

**⚠️ Segurança:**
- Deve ser diferente em cada ambiente
- Nunca reutilizar entre projetos
- Mudar essa chave invalida todas as sessões ativas

---

### Arquivo `.env.example`

Crie também um `.env.example` (sem valores reais):

```env
# Database
DATABASE_URL="mysql://user:password@host:port/database"

# Google OAuth Credentials
AUTH_GOOGLE_ID="your-google-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# NextAuth Secret (generate with: openssl rand -base64 32)
AUTH_SECRET="your-random-secret-key"
```

**Por que `.env.example`?**
- Pode ser commitado no Git
- Serve como documentação
- Ajuda outros devs a configurar o projeto

---

### Segurança de Variáveis de Ambiente

#### No `.gitignore`

Certifique-se de ter:

```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

#### Em Produção (Vercel/Netlify)

Configure as variáveis no painel do provedor:

**Vercel:**
1. Projeto → Settings → Environment Variables
2. Adicione cada variável
3. Selecione ambientes (Production, Preview, Development)

**Render/Railway/Fly.io:**
- Interface similar para adicionar secrets

---

## Testando a Autenticação

### 1. Rodar Migrações

```bash
npx prisma migrate dev
```

Verifica se as tabelas foram criadas:

```bash
npx prisma studio
```

---

### 2. Iniciar Servidor

```bash
npm run dev
```

Acesse: http://localhost:3000

---

### 3. Testar Login

1. Clique em "Entrar com Google"
2. Selecione conta Google
3. Autorize a aplicação
4. Deve redirecionar para `/dashboard`

---

### 4. Verificar Banco de Dados

No Prisma Studio (`npx prisma studio`):

**Tabela `users`:**
- Deve ter 1 registro com seus dados do Google

**Tabela `accounts`:**
- Deve ter 1 registro com provider "google"
- `access_token` e `refresh_token` preenchidos

**Tabela `sessions`:**
- Deve ter 1 sessão ativa
- `expires` no futuro

---

### 5. Testar Logout

1. Implemente botão de logout:

```typescript
import {signOut} from "next-auth/react"

<button onClick={() => signOut({redirectTo: "/"})}>
  Sair
</button>
```

2. Clique no botão
3. Deve voltar para página inicial
4. `useSession()` deve mostrar `status: "unauthenticated"`

---

## Próximos Passos

### Adicionar Mais Providers

```typescript
// src/lib/auth.ts
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Discord from "next-auth/providers/discord"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
    }),
  ],
})
```

---

### Proteger Rotas com Middleware

Crie `middleware.ts` na raiz:

```typescript
import { auth } from "./src/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isAuthenticated = !!req.auth
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard")

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/api/admin/:path*"],
}
```

---

### Adicionar Roles e Permissões

Estenda o schema:

```prisma
model User {
  // ... campos existentes
  role      String @default("USER") // "USER" | "ADMIN"
}
```

No `auth.ts`:

```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.role = user.role // Adiciona role à sessão
      }
      return session
    },
  },
  // ... resto da config
})
```

Uso:

```typescript
const session = await auth()
if (session?.user?.role !== "ADMIN") {
  return <div>Acesso negado</div>
}
```

---

## Conclusão

Você implementou um sistema completo de autenticação com:

- Autenticação OAuth 2.0 com Google
- Persistência de sessões em MySQL via Prisma
- Gerenciamento de estado com React Context
- Server-side session verification
- Type-safety com TypeScript
- Integração total com Next.js 15

**Benefícios desta arquitetura:**
- Seguro (tokens no servidor, não no client)
- Escalável (fácil adicionar providers)
- Manutenível (código organizado e modular)
- Type-safe (TypeScript end-to-end)
- Performático (sessões persistentes, sem JWT overhead)

---

## Recursos Adicionais

- **Documentação Auth.js:** https://authjs.dev/
- **Next.js + Auth.js Guide:** https://authjs.dev/getting-started/installation?framework=next.js
- **Prisma Adapter:** https://authjs.dev/reference/adapter/prisma
- **Google OAuth Setup:** https://developers.google.com/identity/protocols/oauth2

---

**Criado com Auth.js v5 + Next.js 15 + Prisma**
