# Guia Completo de CRUD - Do Zero ao Funcionamento Total

## Índice
1. [O que é CRUD?](#o-que-é-crud)
2. [Arquitetura do Projeto](#arquitetura-do-projeto)
3. [Fluxo Completo de Dados](#fluxo-completo-de-dados)
4. [Passo a Passo: Criando um CRUD do Zero](#passo-a-passo-criando-um-crud-do-zero)
5. [Exemplos Práticos](#exemplos-práticos)
6. [Debugging e Troubleshooting](#debugging-e-troubleshooting)

---

## O que é CRUD?

CRUD é um acrônimo para as quatro operações básicas de persistência de dados:

- **C**reate (Criar) - Inserir novos registros no banco de dados
- **R**ead (Ler) - Buscar e visualizar registros existentes
- **U**pdate (Atualizar) - Modificar registros existentes
- **D**elete (Deletar) - Remover registros do banco de dados

### Por que CRUD é importante?

Praticamente toda aplicação web precisa armazenar e manipular dados. O CRUD é o padrão fundamental para isso. Quando você domina CRUD, você consegue construir qualquer sistema que precise salvar informações.

---

## Arquitetura do Projeto

O projeto usa uma arquitetura moderna baseada em Next.js 15 com App Router. Aqui está como tudo se conecta:

```
┌─────────────────────────────────────────────────────────────┐
│                      NAVEGADOR (Cliente)                     │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │  Páginas (UI)  │  │  Formulários   │  │    Listagem    │ │
│  │   page.tsx     │  │  prova-form    │  │  prova-list    │ │
│  └────────┬───────┘  └────────┬───────┘  └────────┬───────┘ │
│           │                   │                    │         │
└───────────┼───────────────────┼────────────────────┼─────────┘
            │                   │                    │
            │   HTTP Request    │                    │
            │   (POST/PUT/      │                    │
            │    DELETE/GET)    │                    │
            ▼                   ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVIDOR (Next.js)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Routes (route.ts)                   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │  │   GET    │  │   POST   │  │   PUT    │  DELETE   │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘           │   │
│  └───────┼─────────────┼─────────────┼──────────────────┘   │
│          │             │             │                      │
│          │   ┌─────────▼─────────────▼──────┐               │
│          │   │   Validação (Zod Schema)     │               │
│          │   └─────────┬────────────────────┘               │
│          │             │                                    │
│          │   ┌─────────▼────────────────────┐               │
│          └───►   Autenticação (Auth.js)     │               │
│              └─────────┬────────────────────┘               │
│                        │                                    │
│              ┌─────────▼────────────────────┐               │
│              │    Prisma ORM (Cliente)      │               │
│              └─────────┬────────────────────┘               │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         │  SQL Queries
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  BANCO DE DADOS (PostgreSQL)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Turmas  │  │  Provas  │  │  Alunos  │  │  Notas   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Fluxo Completo de Dados

Vamos entender o que acontece quando um usuário cria uma nova prova:

### 1. **Usuário Preenche o Formulário**

**Arquivo**: `src/components/provas/prova-form.tsx`

```typescript
// O usuário preenche os campos:
// - Nome: "Prova de Matemática"
// - Turma: "3º Ano A"
// - Ano Letivo: 2024
// - Peso: 10
// - Tipo: "COMUM"
// - Data: "15/03/2024"
```

**O que acontece aqui:**
- React Hook Form gerencia o estado do formulário
- Cada campo é validado em tempo real pelo Zod
- Se houver erros, mensagens aparecem abaixo dos campos

### 2. **Usuário Clica em "Criar Prova"**

**Arquivo**: `src/components/provas/prova-form.tsx` (linha 83-116)

```typescript
const onSubmit = async (data: ProvaInput) => {
  // 1. Marca que está carregando (botão fica desabilitado)
  setIsLoading(true);

  try {
    // 2. Define a URL da API
    const url = "/api/provas";  // POST para criar
    const method = "POST";

    // 3. Faz a requisição HTTP
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",  // Diz que enviamos JSON
      },
      body: JSON.stringify(data),  // Converte objeto para JSON
    });

    // 4. Converte resposta para objeto JavaScript
    const result = await response.json();

    // 5. Verifica se houve erro
    if (!response.ok) {
      throw new Error(result.error);
    }

    // 6. Sucesso! Redireciona para lista de provas
    router.push("/provas");
    router.refresh();  // Atualiza os dados da página

  } catch (err) {
    // 7. Se deu erro, mostra mensagem
    setError(err.message);
  }
};
```

**O que acontece aqui:**
- Os dados do formulário são convertidos para JSON
- Uma requisição HTTP POST é enviada para `/api/provas`
- O navegador espera a resposta do servidor
- Se der certo, redireciona para a lista
- Se der erro, mostra mensagem de erro

### 3. **Servidor Recebe a Requisição**

**Arquivo**: `src/app/api/provas/route.ts` (função POST)

```typescript
export async function POST(request: NextRequest) {
  try {
    // PASSO 1: Verificar se o usuário está autenticado
    const session = await auth();

    if (!session || !session.user?.id) {
      // Não autenticado? Retorna erro 401
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // PASSO 2: Pegar os dados enviados pelo formulário
    const body = await request.json();
    // body = {
    //   nome: "Prova de Matemática",
    //   turmaId: "abc123",
    //   ano_letivo: 2024,
    //   peso: 10,
    //   tipo: "COMUM",
    //   data_prova: "2024-03-15"
    // }

    // PASSO 3: Converter data se vier como string
    if (body.data_prova && typeof body.data_prova === 'string') {
      body.data_prova = new Date(body.data_prova);
    }

    // PASSO 4: Validar os dados com Zod
    const validatedData = createProvaSchema.parse(body);
    // Se os dados não passarem na validação, Zod lança um erro
    // e cai no catch lá embaixo

    // PASSO 5: Verificar se a turma existe e pertence ao usuário
    const turma = await prisma.turma.findFirst({
      where: {
        id: validatedData.turmaId,
        userId: session.user.id,  // Importante: segurança!
      },
    });

    if (!turma) {
      // Turma não encontrada? Erro 404
      return NextResponse.json(
        { error: "Turma não encontrada" },
        { status: 404 }
      );
    }

    // PASSO 6: CRIAR A PROVA NO BANCO DE DADOS
    const novaProva = await prisma.prova.create({
      data: {
        nome: validatedData.nome,
        turmaId: validatedData.turmaId,
        ano_letivo: validatedData.ano_letivo,
        peso: validatedData.peso,
        tipo: validatedData.tipo,
        data_prova: validatedData.data_prova,
      },
      include: {
        turma: {
          select: {
            id: true,
            nome: true,
            ano_letivo: true,
          },
        },
      },
    });

    // PASSO 7: Retornar sucesso com os dados criados
    return NextResponse.json(novaProva, { status: 201 });
    // Status 201 = Created (criado com sucesso)

  } catch (error) {
    // TRATAMENTO DE ERROS

    if (error instanceof z.ZodError) {
      // Erro de validação do Zod
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    // Erro genérico
    console.error("Erro ao criar prova:", error);
    return NextResponse.json(
      { error: "Erro ao criar prova" },
      { status: 500 }
    );
  }
}
```

**O que acontece aqui:**
1. Verifica autenticação (só usuário logado pode criar)
2. Pega os dados enviados pelo cliente
3. Valida os dados com Zod Schema
4. Verifica permissões (usuário só pode criar prova em turma dele)
5. Cria o registro no banco via Prisma
6. Retorna os dados criados para o cliente

### 4. **Prisma Comunica com o Banco**

Quando executamos `prisma.prova.create()`, o Prisma:

```typescript
// 1. Prisma gera uma query SQL
const sql = `
  INSERT INTO "Prova" (
    id, nome, turmaId, ano_letivo, peso, tipo, data_prova,
    criado_em, atualizado_em
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
  ) RETURNING *;
`;

// 2. Executa a query no PostgreSQL
// 3. Recebe o registro criado de volta
// 4. Converte para objeto JavaScript
// 5. Retorna para nosso código
```

### 5. **Banco de Dados Salva os Dados**

**Tabela "Prova" no PostgreSQL:**

```
| id      | nome                  | turmaId | ano_letivo | peso | tipo   | data_prova | criado_em           |
|---------|-----------------------|---------|------------|------|--------|------------|---------------------|
| xyz789  | Prova de Matemática  | abc123  | 2024       | 10   | COMUM  | 2024-03-15 | 2024-01-15 10:30:00|
```

### 6. **Resposta Volta para o Cliente**

O servidor retorna JSON:

```json
{
  "id": "xyz789",
  "nome": "Prova de Matemática",
  "turmaId": "abc123",
  "ano_letivo": 2024,
  "peso": 10,
  "tipo": "COMUM",
  "data_prova": "2024-03-15T00:00:00.000Z",
  "turma": {
    "id": "abc123",
    "nome": "3º Ano A",
    "ano_letivo": 2024
  }
}
```

### 7. **Interface Atualiza**

O navegador:
1. Recebe a resposta de sucesso
2. Redireciona para `/provas`
3. A página recarrega os dados do banco
4. O usuário vê a nova prova na lista

---

## Passo a Passo: Criando um CRUD do Zero

Vamos criar um CRUD completo para "Matérias" como exemplo prático.

### PASSO 1: Definir o Schema do Banco (Prisma)

**Arquivo**: `prisma/schema.prisma`

```prisma
model Materia {
  id           String   @id @default(cuid())
  nome         String   // Ex: "Matemática", "Português"
  codigo       String   @unique  // Ex: "MAT101"
  carga_horaria Int     // Ex: 60 horas
  descricao    String?  // Opcional
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  criado_em    DateTime @default(now())
  atualizado_em DateTime @updatedAt

  // Relações com outras tabelas
  notas        Nota[]

  @@index([userId])
}
```

**O que cada campo significa:**
- `@id` = Chave primária
- `@default(cuid())` = Gera ID único automaticamente
- `@unique` = Valor não pode repetir no banco
- `String?` = Campo opcional (pode ser null)
- `@relation` = Define relacionamento entre tabelas
- `onDelete: Cascade` = Se deletar user, deleta matérias dele
- `@@index` = Cria índice para buscas mais rápidas

**Executar migration:**
```bash
npx prisma migrate dev --name add_materia
```

Isso cria a tabela no banco de dados.

### PASSO 2: Criar Schema de Validação (Zod)

**Arquivo**: `src/lib/validations/materia.ts`

```typescript
import { z } from "zod";

// Schema de validação
export const materiaSchema = z.object({
  nome: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),

  codigo: z
    .string()
    .min(3, "Código deve ter no mínimo 3 caracteres")
    .max(20, "Código deve ter no máximo 20 caracteres")
    .regex(/^[A-Z0-9]+$/, "Código deve conter apenas letras maiúsculas e números"),

  carga_horaria: z
    .number()
    .int("Carga horária deve ser um número inteiro")
    .min(1, "Carga horária deve ser maior que 0")
    .max(1000, "Carga horária não pode exceder 1000 horas"),

  descricao: z
    .string()
    .max(500, "Descrição muito longa")
    .optional()
    .nullable(),
});

// Schema para criação (todos os campos obrigatórios exceto opcionais)
export const createMateriaSchema = materiaSchema;

// Schema para atualização (todos os campos opcionais)
export const updateMateriaSchema = materiaSchema.partial();

// Tipos TypeScript gerados automaticamente
export type MateriaInput = z.infer<typeof materiaSchema>;
export type CreateMateriaInput = z.infer<typeof createMateriaSchema>;
export type UpdateMateriaInput = z.infer<typeof updateMateriaSchema>;
```

**Por que Zod é importante:**
- Valida dados no servidor (segurança)
- Gera tipos TypeScript automaticamente
- Mensagens de erro customizadas
- Validação de padrões (regex)

### PASSO 3: Criar API Routes

#### 3.1 Listar e Criar (GET e POST)

**Arquivo**: `src/app/api/materias/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createMateriaSchema } from "@/lib/validations/materia";
import { z } from "zod";

// ============================================
// GET /api/materias - Listar todas as matérias
// ============================================
export async function GET(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // 2. Buscar matérias do usuário no banco
    const materias = await prisma.materia.findMany({
      where: {
        userId: session.user.id,  // Apenas matérias do usuário logado
      },
      include: {
        _count: {
          select: {
            notas: true,  // Conta quantas notas cada matéria tem
          },
        },
      },
      orderBy: {
        nome: "asc",  // Ordena por nome alfabeticamente
      },
    });

    // 3. Retornar lista
    return NextResponse.json(materias, { status: 200 });

  } catch (error) {
    console.error("Erro ao buscar matérias:", error);
    return NextResponse.json(
      { error: "Erro ao buscar matérias" },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/materias - Criar nova matéria
// ============================================
export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // 2. Pegar dados do corpo da requisição
    const body = await request.json();

    // 3. Validar dados
    const validatedData = createMateriaSchema.parse(body);

    // 4. Verificar se já existe matéria com mesmo código
    const materiaExistente = await prisma.materia.findFirst({
      where: {
        codigo: validatedData.codigo,
        userId: session.user.id,
      },
    });

    if (materiaExistente) {
      return NextResponse.json(
        { error: "Já existe uma matéria com este código" },
        { status: 409 }  // 409 = Conflict
      );
    }

    // 5. Criar matéria no banco
    const novaMateria = await prisma.materia.create({
      data: {
        nome: validatedData.nome,
        codigo: validatedData.codigo,
        carga_horaria: validatedData.carga_horaria,
        descricao: validatedData.descricao,
        userId: session.user.id,  // Associa ao usuário logado
      },
      include: {
        _count: {
          select: {
            notas: true,
          },
        },
      },
    });

    // 6. Retornar matéria criada
    return NextResponse.json(novaMateria, { status: 201 });

  } catch (error) {
    // Tratamento de erros
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Erro ao criar matéria:", error);
    return NextResponse.json(
      { error: "Erro ao criar matéria" },
      { status: 500 }
    );
  }
}
```

#### 3.2 Buscar, Atualizar e Deletar (GET, PUT, DELETE por ID)

**Arquivo**: `src/app/api/materias/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateMateriaSchema } from "@/lib/validations/materia";
import { z } from "zod";

// ============================================
// GET /api/materias/[id] - Buscar uma matéria
// ============================================
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Buscar matéria específica
    const materia = await prisma.materia.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,  // Segurança: apenas se for do usuário
      },
      include: {
        notas: {
          include: {
            aluno: {
              select: {
                id: true,
                nome: true,
              },
            },
            prova: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
        _count: {
          select: {
            notas: true,
          },
        },
      },
    });

    if (!materia) {
      return NextResponse.json(
        { error: "Matéria não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(materia, { status: 200 });

  } catch (error) {
    console.error("Erro ao buscar matéria:", error);
    return NextResponse.json(
      { error: "Erro ao buscar matéria" },
      { status: 500 }
    );
  }
}

// ============================================
// PUT /api/materias/[id] - Atualizar matéria
// ============================================
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verificar se matéria existe e pertence ao usuário
    const materiaExistente = await prisma.materia.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!materiaExistente) {
      return NextResponse.json(
        { error: "Matéria não encontrada" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateMateriaSchema.parse(body);

    // Se está alterando o código, verificar duplicação
    if (validatedData.codigo && validatedData.codigo !== materiaExistente.codigo) {
      const codigoDuplicado = await prisma.materia.findFirst({
        where: {
          codigo: validatedData.codigo,
          userId: session.user.id,
          NOT: {
            id: params.id,  // Excluir a própria matéria
          },
        },
      });

      if (codigoDuplicado) {
        return NextResponse.json(
          { error: "Já existe uma matéria com este código" },
          { status: 409 }
        );
      }
    }

    // Atualizar no banco
    const materiaAtualizada = await prisma.materia.update({
      where: {
        id: params.id,
      },
      data: {
        ...(validatedData.nome && { nome: validatedData.nome }),
        ...(validatedData.codigo && { codigo: validatedData.codigo }),
        ...(validatedData.carga_horaria !== undefined && { carga_horaria: validatedData.carga_horaria }),
        ...(validatedData.descricao !== undefined && { descricao: validatedData.descricao }),
      },
      include: {
        _count: {
          select: {
            notas: true,
          },
        },
      },
    });

    return NextResponse.json(materiaAtualizada, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar matéria:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar matéria" },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/materias/[id] - Deletar matéria
// ============================================
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verificar se existe e pertence ao usuário
    const materiaExistente = await prisma.materia.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            notas: true,
          },
        },
      },
    });

    if (!materiaExistente) {
      return NextResponse.json(
        { error: "Matéria não encontrada" },
        { status: 404 }
      );
    }

    // Deletar do banco (cascade delete vai deletar notas relacionadas)
    await prisma.materia.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(
      {
        message: "Matéria excluída com sucesso",
        notasExcluidas: materiaExistente._count.notas,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Erro ao excluir matéria:", error);
    return NextResponse.json(
      { error: "Erro ao excluir matéria" },
      { status: 500 }
    );
  }
}
```

### PASSO 4: Criar Componente de Formulário

**Arquivo**: `src/components/materias/materia-form.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { materiaSchema, type MateriaInput } from "@/lib/validations/materia";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface MateriaFormProps {
  materia?: {
    id: string;
    nome: string;
    codigo: string;
    carga_horaria: number;
    descricao: string | null;
  };
  onSuccess?: () => void;
}

export function MateriaForm({ materia, onSuccess }: MateriaFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!materia;

  // Configurar formulário com React Hook Form + Zod
  const form = useForm<MateriaInput>({
    resolver: zodResolver(materiaSchema),
    defaultValues: {
      nome: materia?.nome || "",
      codigo: materia?.codigo || "",
      carga_horaria: materia?.carga_horaria || 0,
      descricao: materia?.descricao || "",
    },
  });

  // Função executada ao submeter
  const onSubmit = async (data: MateriaInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = isEditing ? `/api/materias/${materia.id}` : "/api/materias";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao salvar matéria");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/materias");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar matéria");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Campo Nome */}
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Matéria</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Matemática, Português..."
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo Código */}
        <FormField
          control={form.control}
          name="codigo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: MAT101"
                  {...field}
                  disabled={isLoading}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormDescription>
                Código único da matéria (apenas letras maiúsculas e números)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo Carga Horária */}
        <FormField
          control={form.control}
          name="carga_horaria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carga Horária (horas)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ex: 60"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? 0 : parseInt(value));
                  }}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo Descrição (Opcional) */}
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva brevemente a matéria..."
                  {...field}
                  value={field.value || ""}
                  disabled={isLoading}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botões */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Salvando..."
              : isEditing
              ? "Atualizar Matéria"
              : "Criar Matéria"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### PASSO 5: Criar Página de Listagem

**Arquivo**: `src/app/(protected)/materias/page.tsx`

```typescript
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MateriaList } from "@/components/materias/materia-list";

export default async function MateriasPage() {
  // Verificar autenticação
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  // Buscar matérias do banco
  const materiasRaw = await prisma.materia.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      _count: {
        select: {
          notas: true,
        },
      },
    },
    orderBy: {
      nome: "asc",
    },
  });

  // Converter para formato serializável
  const materias = materiasRaw.map(materia => ({
    ...materia,
    carga_horaria: Number(materia.carga_horaria),
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-800">Minhas Matérias</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as matérias do seu sistema
          </p>
        </div>
        <Button asChild className="bg-indigo-500">
          <Link href="/materias/nova">
            <Plus className="mr-2 h-4 w-4" />
            Nova Matéria
          </Link>
        </Button>
      </div>

      <MateriaList materias={materias} />
    </div>
  );
}
```

### PASSO 6: Criar Componente de Listagem

**Arquivo**: `src/components/materias/materia-list.tsx`

```typescript
"use client";

import { MateriaCard } from "./materia-card";

interface Materia {
  id: string;
  nome: string;
  codigo: string;
  carga_horaria: number;
  descricao: string | null;
  _count: {
    notas: number;
  };
}

interface MateriaListProps {
  materias: Materia[];
}

export function MateriaList({ materias }: MateriaListProps) {
  if (materias.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg mb-2">
          Nenhuma matéria encontrada
        </p>
        <p className="text-sm text-muted-foreground">
          Crie sua primeira matéria para começar
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {materias.map((materia) => (
        <MateriaCard key={materia.id} materia={materia} />
      ))}
    </div>
  );
}
```

### PASSO 7: Criar Card de Exibição

**Arquivo**: `src/components/materias/materia-card.tsx`

```typescript
"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, FileText, GraduationCap } from "lucide-react";

interface MateriaCardProps {
  materia: {
    id: string;
    nome: string;
    codigo: string;
    carga_horaria: number;
    descricao: string | null;
    _count: {
      notas: number;
    };
  };
}

export function MateriaCard({ materia }: MateriaCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{materia.nome}</CardTitle>
          <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
            {materia.codigo}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{materia.carga_horaria}h de carga horária</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GraduationCap className="h-4 w-4" />
          <span>{materia._count.notas} nota(s) cadastrada(s)</span>
        </div>

        {materia.descricao && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4 mt-0.5" />
            <p className="line-clamp-2">{materia.descricao}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-2 pt-3">
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/materias/${materia.id}`}>Ver Detalhes</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href={`/materias/${materia.id}/editar`}>Editar</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
```

---

## Exemplos Práticos

### Como fazer uma requisição GET (buscar dados)

```typescript
// No componente cliente
const [materias, setMaterias] = useState([]);

async function buscarMaterias() {
  const response = await fetch("/api/materias");
  const data = await response.json();
  setMaterias(data);
}
```

### Como fazer uma requisição POST (criar)

```typescript
async function criarMateria(dados) {
  const response = await fetch("/api/materias", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  const resultado = await response.json();
  return resultado;
}
```

### Como fazer uma requisição PUT (atualizar)

```typescript
async function atualizarMateria(id, dados) {
  const response = await fetch(`/api/materias/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  const resultado = await response.json();
  return resultado;
}
```

### Como fazer uma requisição DELETE (deletar)

```typescript
async function deletarMateria(id) {
  const response = await fetch(`/api/materias/${id}`, {
    method: "DELETE",
  });

  const resultado = await response.json();
  return resultado;
}
```

---

## Debugging e Troubleshooting

### Como ver o que está sendo enviado para a API

```typescript
console.log("Dados enviados:", JSON.stringify(dados, null, 2));
```

### Como ver erros no servidor

No arquivo de API route:

```typescript
catch (error) {
  console.error("ERRO DETALHADO:", {
    message: error.message,
    stack: error.stack,
    data: body,
  });
}
```

### Como testar API no navegador

Abra DevTools (F12) > Console:

```javascript
// Testar GET
fetch("/api/materias")
  .then(r => r.json())
  .then(console.log);

// Testar POST
fetch("/api/materias", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    nome: "Matemática",
    codigo: "MAT101",
    carga_horaria: 60,
  })
})
  .then(r => r.json())
  .then(console.log);
```

### Códigos de Status HTTP

- `200 OK` - Sucesso
- `201 Created` - Criado com sucesso
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Não autenticado
- `403 Forbidden` - Sem permissão
- `404 Not Found` - Não encontrado
- `409 Conflict` - Conflito (duplicação)
- `500 Internal Server Error` - Erro no servidor

---

## Checklist de um CRUD Completo

- [ ] Schema do Prisma definido
- [ ] Migration executada
- [ ] Schema de validação Zod criado
- [ ] API Route GET (listar) implementada
- [ ] API Route POST (criar) implementada
- [ ] API Route GET por ID (buscar um) implementada
- [ ] API Route PUT (atualizar) implementada
- [ ] API Route DELETE (deletar) implementada
- [ ] Componente de formulário criado
- [ ] Página de listagem criada
- [ ] Página de criação criada
- [ ] Página de edição criada
- [ ] Página de detalhes criada
- [ ] Componente de exclusão criado
- [ ] Tratamento de erros implementado
- [ ] Validação de permissões implementada
- [ ] Build passando sem erros

---

## Conclusão

Agora você tem um guia completo de como funciona um CRUD do início ao fim. Use este documento como referência sempre que precisar criar novas funcionalidades!

**Dicas finais:**
1. Sempre valide dados no servidor (nunca confie apenas no cliente)
2. Sempre verifique permissões (usuário só acessa seus dados)
3. Sempre trate erros adequadamente
4. Sempre teste cada endpoint antes de criar a interface
5. Use console.log generosamente durante desenvolvimento
