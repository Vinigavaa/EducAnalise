import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/generated/prisma";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Handler = (
  request: NextRequest,
  userId: string,
  ...args: any[]
) => Promise<Response>;

type AlunoHandler = (
  request: NextRequest,
  userId: string,
  alunoId: string,
  ...args: any[]
) => Promise<Response>;

/**
 * Middleware para rotas autenticadas (qualquer usuário)
 */
export function withAuth(handler: Handler) {
  return async (request: NextRequest, ...args: any[]) => {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    return handler(request, session.user.id, ...args);
  };
}

/**
 * Middleware para rotas exclusivas de professores
 */
export function withProfessor(handler: Handler) {
  return async (request: NextRequest, ...args: any[]) => {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    if (session.user.role !== UserRole.PROFESSOR) {
      return NextResponse.json(
        { error: "Acesso restrito a professores" },
        { status: 403 }
      );
    }

    return handler(request, session.user.id, ...args);
  };
}

/**
 * Middleware para rotas exclusivas de alunos
 * Inclui o alunoId no contexto
 */
export function withAluno(handler: AlunoHandler) {
  return async (request: NextRequest, ...args: any[]) => {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    if (session.user.role !== UserRole.ALUNO) {
      return NextResponse.json(
        { error: "Acesso restrito a alunos" },
        { status: 403 }
      );
    }

    if (!session.user.alunoId) {
      return NextResponse.json(
        { error: "Aluno não encontrado" },
        { status: 404 }
      );
    }

    return handler(request, session.user.id, session.user.alunoId, ...args);
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
