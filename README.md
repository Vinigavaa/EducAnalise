# EducAnalise

Sistema de gestão educacional para professores gerenciarem turmas, alunos, provas e notas.

---

## Stack Tecnológica

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| Framework | Next.js | 15.5.6 |
| UI Library | React | 19.1.0 |
| Linguagem | TypeScript | 5 |
| Estilização | Tailwind CSS | 4 |
| Componentes | shadcn/ui + Radix UI | - |
| Banco de Dados | PostgreSQL (Neon) | - |
| ORM | Prisma | 6.19.0 |
| Autenticação | NextAuth v5 | 5.0.0-beta.30 |
| Formulários | React Hook Form | 7.65.0 |
| Validação | Zod | 4.1.12 |
| Ícones | Lucide React | 0.548.0 |

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) v18.17 ou superior
- [npm](https://www.npmjs.com/) v9 ou superior (vem com Node.js)
- [Git](https://git-scm.com/)

---

## Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/educanalise.git
cd educanalise
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Banco de Dados PostgreSQL
DATABASE_URL="postgresql://usuario:senha@host:5432/database?sslmode=require"

# Google OAuth (Console: https://console.cloud.google.com/)
AUTH_GOOGLE_ID="seu-google-client-id"
AUTH_GOOGLE_SECRET="seu-google-client-secret"

# Secret do NextAuth (gerar com: openssl rand -base64 32)
AUTH_SECRET="sua-chave-secreta-aqui"
```

### 4. Configurar o Banco de Dados

Gerar o cliente Prisma:

```bash
npx prisma generate
```

Sincronizar o schema com o banco de dados:

```bash
npx prisma db push
```

### 5. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## Comando Rápido (Tudo de Uma Vez)

```bash
npm install && npx prisma generate && npx prisma db push && npm run dev
```

---

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Compila para produção |
| `npm run start` | Inicia servidor de produção |
| `npm run lint` | Executa verificação de código |
| `npx prisma studio` | Abre interface visual do banco |
| `npx prisma generate` | Gera cliente Prisma |
| `npx prisma db push` | Sincroniza schema com banco |
| `npx prisma migrate dev` | Cria migration de desenvolvimento |

---

## Estrutura do Projeto

```
educanalise/
├── prisma/
│   └── schema.prisma           # Schema do banco de dados
├── src/
│   ├── app/                    # App Router (Next.js 15)
│   │   ├── (public)/           # Rotas públicas
│   │   ├── (protected)/        # Rotas autenticadas
│   │   │   ├── turmas/         # Gestão de turmas
│   │   │   ├── provas/         # Gestão de provas
│   │   │   └── materias/       # Gestão de matérias
│   │   └── api/                # API Routes
│   ├── components/
│   │   ├── ui/                 # Componentes shadcn/ui
│   │   ├── turmas/             # Componentes de turmas
│   │   ├── alunos/             # Componentes de alunos
│   │   ├── provas/             # Componentes de provas
│   │   └── materia/            # Componentes de matérias
│   ├── lib/
│   │   ├── auth.ts             # Configuração NextAuth
│   │   ├── prisma.ts           # Cliente Prisma
│   │   ├── utils.ts            # Utilitários
│   │   └── validations/        # Schemas Zod
│   └── generated/              # Código gerado (Prisma)
├── public/                     # Arquivos estáticos
├── .env                        # Variáveis de ambiente
├── package.json
├── tsconfig.json
└── README.md
```

---

## Configuração do Google OAuth

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione existente
3. Vá em **APIs e Serviços > Credenciais**
4. Clique em **Criar Credenciais > ID do cliente OAuth**
5. Selecione **Aplicativo Web**
6. Adicione as origens autorizadas:
   - `http://localhost:3000` (desenvolvimento)
   - `https://seu-dominio.com` (produção)
7. Adicione os URIs de redirecionamento:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://seu-dominio.com/api/auth/callback/google`
8. Copie o **Client ID** e **Client Secret** para o `.env`

---

## Banco de Dados (Neon)

Este projeto usa [Neon](https://neon.tech/) como banco PostgreSQL serverless.

### Criar Banco no Neon:

1. Acesse [neon.tech](https://neon.tech/) e crie uma conta
2. Crie um novo projeto
3. Copie a **Connection String** para `DATABASE_URL` no `.env`

### Formato da Connection String:

```
postgresql://usuario:senha@endpoint.neon.tech/neondb?sslmode=require
```

---

## Adicionar Componentes shadcn/ui

Para adicionar novos componentes:

```bash
# Exemplos
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add form
npx shadcn@latest add select
npx shadcn@latest add dialog
npx shadcn@latest add card
npx shadcn@latest add table
npx shadcn@latest add alert-dialog
npx shadcn@latest add calendar
npx shadcn@latest add popover
npx shadcn@latest add sheet
```

---

## Troubleshooting

### Erro: "Cannot find module '@prisma/client'"

```bash
npx prisma generate
```

### Erro: "Connection refused" no banco de dados

- Verifique se a `DATABASE_URL` está correta no `.env`
- Certifique-se de que o banco está acessível

### Erro: "Invalid client ID" no Google OAuth

- Verifique se `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET` estão corretos
- Confirme os URIs de redirecionamento no Google Console

### Limpar cache e reinstalar

```bash
rm -rf node_modules .next
npm install
npx prisma generate
npm run dev
```

---

## Deploy

### Vercel (Recomendado)

1. Conecte o repositório ao [Vercel](https://vercel.com/)
2. Configure as variáveis de ambiente no dashboard
3. Deploy automático a cada push

### Build para Produção

```bash
npm run build
npm run start
```

---

## Licença

MIT License - Veja [LICENSE](LICENSE) para mais detalhes.
