import { NextRequest, NextResponse } from "next/server";
import { withProfessor } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";

export const POST = withProfessor(async (
  _request: NextRequest,
  userId: string,
  props: { params: Promise<{ id: string }> }
) => {
  const params = await props.params;
  try {
    const prova = await prisma.prova.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!prova) {
      return NextResponse.json(
        { error: "Prova não encontrada" },
        { status: 404 }
      );
    }

    if (prova.publicada) {
      return NextResponse.json(
        { error: "Prova já está publicada" },
        { status: 400 }
      );
    }

    const provaAtualizada = await prisma.prova.update({
      where: { id: params.id },
      data: {
        publicada: true,
        dataPublicacao: new Date(),
      },
    });

    return NextResponse.json({
      message: "Prova publicada com sucesso",
      prova: provaAtualizada,
    });
  } catch (error) {
    console.error("Erro ao publicar prova:", error);
    return NextResponse.json(
      { error: "Erro ao publicar prova" },
      { status: 500 }
    );
  }
});

export const DELETE = withProfessor(async (
  _request: NextRequest,
  userId: string,
  props: { params: Promise<{ id: string }> }
) => {
  const params = await props.params;
  try {
    const prova = await prisma.prova.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!prova) {
      return NextResponse.json(
        { error: "Prova não encontrada" },
        { status: 404 }
      );
    }

    if (!prova.publicada) {
      return NextResponse.json(
        { error: "Prova não está publicada" },
        { status: 400 }
      );
    }

    const provaAtualizada = await prisma.prova.update({
      where: { id: params.id },
      data: {
        publicada: false,
        dataPublicacao: null,
      },
    });

    return NextResponse.json({
      message: "Prova despublicada com sucesso",
      prova: provaAtualizada,
    });
  } catch (error) {
    console.error("Erro ao despublicar prova:", error);
    return NextResponse.json(
      { error: "Erro ao despublicar prova" },
      { status: 500 }
    );
  }
});
