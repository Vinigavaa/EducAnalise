import { NextRequest, NextResponse } from "next/server";
import { withAluno } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const trocarSenhaSchema = z.object({
  senhaAtual: z.string().optional(),
  novaSenha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

// POST /api/aluno/trocar-senha - Trocar senha do aluno
export const POST = withAluno(async (
  request: NextRequest,
  userId: string,
  _alunoId: string
) => {
  try {
    const body = await request.json();
    const { senhaAtual, novaSenha } = trocarSenhaSchema.parse(body);

    // Buscar credenciais do aluno
    const credential = await prisma.alunoCredential.findUnique({
      where: { userId },
    });

    if (!credential) {
      return NextResponse.json(
        { error: "Credenciais não encontradas" },
        { status: 404 }
      );
    }

    // Se não é o primeiro acesso, validar senha atual
    if (!credential.mustChangePassword) {
      if (!senhaAtual) {
        return NextResponse.json(
          { error: "Senha atual é obrigatória" },
          { status: 400 }
        );
      }

      const senhaCorreta = await bcrypt.compare(senhaAtual, credential.passwordHash);
      if (!senhaCorreta) {
        return NextResponse.json(
          { error: "Senha atual incorreta" },
          { status: 400 }
        );
      }
    }

    // Hash da nova senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualizar senha
    await prisma.alunoCredential.update({
      where: { userId },
      data: {
        passwordHash: novaSenhaHash,
        mustChangePassword: false,
      },
    });

    return NextResponse.json({
      message: "Senha alterada com sucesso",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Erro ao trocar senha:", error);
    return NextResponse.json(
      { error: "Erro ao trocar senha" },
      { status: 500 }
    );
  }
});
