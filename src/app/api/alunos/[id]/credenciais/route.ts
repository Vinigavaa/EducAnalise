import { NextRequest, NextResponse } from "next/server";
import { withProfessor } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@/generated/prisma";

function generatePassword(length: number = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function generateUsername(nomeAluno: string, turmaId: string): string {
  const nomeNormalizado = nomeAluno
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 15);

  const sufixo = turmaId.substring(0, 4);
  return `${nomeNormalizado}.${sufixo}`;
}

// GET /api/alunos/[id]/credenciais - Verificar se aluno tem credenciais
export const GET = withProfessor(async (
  _request: NextRequest,
  userId: string,
  props: { params: Promise<{ id: string }> }
) => {
  const params = await props.params;
  try {
    const aluno = await prisma.aluno.findFirst({
      where: {
        id: params.id,
        turma: {
          userId,
        },
      },
      include: {
        userAccount: {
          include: {
            alunoCredential: {
              select: {
                username: true,
                mustChangePassword: true,
                lastLogin: true,
              },
            },
          },
        },
      },
    });

    if (!aluno) {
      return NextResponse.json(
        { error: "Aluno não encontrado" },
        { status: 404 }
      );
    }

    const hasCredentials = !!aluno.userAccount?.alunoCredential;

    return NextResponse.json({
      hasCredentials,
      credentials: hasCredentials
        ? {
            username: aluno.userAccount!.alunoCredential!.username,
            mustChangePassword: aluno.userAccount!.alunoCredential!.mustChangePassword,
            lastLogin: aluno.userAccount!.alunoCredential!.lastLogin,
          }
        : null,
    });
  } catch (error) {
    console.error("Erro ao verificar credenciais:", error);
    return NextResponse.json(
      { error: "Erro ao verificar credenciais" },
      { status: 500 }
    );
  }
});

// POST /api/alunos/[id]/credenciais - Criar credenciais para aluno
export const POST = withProfessor(async (
  _request: NextRequest,
  userId: string,
  props: { params: Promise<{ id: string }> }
) => {
  const params = await props.params;
  try {
    const aluno = await prisma.aluno.findFirst({
      where: {
        id: params.id,
        turma: {
          userId,
        },
      },
      include: {
        turma: true,
        userAccount: true,
      },
    });

    if (!aluno) {
      return NextResponse.json(
        { error: "Aluno não encontrado" },
        { status: 404 }
      );
    }

    if (aluno.userAccount) {
      return NextResponse.json(
        { error: "Aluno já possui credenciais" },
        { status: 400 }
      );
    }

    const username = generateUsername(aluno.nome, aluno.turmaId);
    const tempPassword = generatePassword(8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Verificar se username já existe
    const existingUsername = await prisma.alunoCredential.findUnique({
      where: { username },
    });

    const finalUsername = existingUsername
      ? `${username}${Math.floor(Math.random() * 1000)}`
      : username;

    // Criar User e AlunoCredential em uma transação
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.users.create({
        data: {
          name: aluno.nome,
          role: UserRole.ALUNO,
          alunoId: aluno.id,
        },
      });

      const credential = await tx.alunoCredential.create({
        data: {
          userId: newUser.id,
          username: finalUsername,
          passwordHash,
          mustChangePassword: true,
        },
      });

      return { user: newUser, credential };
    });

    return NextResponse.json({
      message: "Credenciais criadas com sucesso",
      username: result.credential.username,
      tempPassword,
    });
  } catch (error) {
    console.error("Erro ao criar credenciais:", error);
    return NextResponse.json(
      { error: "Erro ao criar credenciais" },
      { status: 500 }
    );
  }
});

// DELETE /api/alunos/[id]/credenciais - Remover credenciais do aluno
export const DELETE = withProfessor(async (
  _request: NextRequest,
  userId: string,
  props: { params: Promise<{ id: string }> }
) => {
  const params = await props.params;
  try {
    const aluno = await prisma.aluno.findFirst({
      where: {
        id: params.id,
        turma: {
          userId,
        },
      },
      include: {
        userAccount: true,
      },
    });

    if (!aluno) {
      return NextResponse.json(
        { error: "Aluno não encontrado" },
        { status: 404 }
      );
    }

    if (!aluno.userAccount) {
      return NextResponse.json(
        { error: "Aluno não possui credenciais" },
        { status: 400 }
      );
    }

    // Deletar User (cascade deleta AlunoCredential)
    await prisma.users.delete({
      where: { id: aluno.userAccount.id },
    });

    return NextResponse.json({
      message: "Credenciais removidas com sucesso",
    });
  } catch (error) {
    console.error("Erro ao remover credenciais:", error);
    return NextResponse.json(
      { error: "Erro ao remover credenciais" },
      { status: 500 }
    );
  }
});

// PATCH /api/alunos/[id]/credenciais - Resetar senha do aluno
export const PATCH = withProfessor(async (
  _request: NextRequest,
  userId: string,
  props: { params: Promise<{ id: string }> }
) => {
  const params = await props.params;
  try {
    const aluno = await prisma.aluno.findFirst({
      where: {
        id: params.id,
        turma: {
          userId,
        },
      },
      include: {
        userAccount: {
          include: {
            alunoCredential: true,
          },
        },
      },
    });

    if (!aluno) {
      return NextResponse.json(
        { error: "Aluno não encontrado" },
        { status: 404 }
      );
    }

    if (!aluno.userAccount?.alunoCredential) {
      return NextResponse.json(
        { error: "Aluno não possui credenciais" },
        { status: 400 }
      );
    }

    const tempPassword = generatePassword(8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    await prisma.alunoCredential.update({
      where: { id: aluno.userAccount.alunoCredential.id },
      data: {
        passwordHash,
        mustChangePassword: true,
      },
    });

    return NextResponse.json({
      message: "Senha resetada com sucesso",
      username: aluno.userAccount.alunoCredential.username,
      tempPassword,
    });
  } catch (error) {
    console.error("Erro ao resetar senha:", error);
    return NextResponse.json(
      { error: "Erro ao resetar senha" },
      { status: 500 }
    );
  }
});
