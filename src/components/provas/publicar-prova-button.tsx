"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

interface PublicarProvaButtonProps {
  provaId: string;
  publicada: boolean;
  provaNome: string;
}

export function PublicarProvaButton({
  provaId,
  publicada,
  provaNome,
}: PublicarProvaButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isPublicada, setIsPublicada] = useState(publicada);
  const router = useRouter();

  const handlePublicar = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/provas/${provaId}/publicar`, {
        method: "POST",
      });
      if (response.ok) {
        setIsPublicada(true);
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao publicar prova:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDespublicar = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/provas/${provaId}/publicar`, {
        method: "DELETE",
      });
      if (response.ok) {
        setIsPublicada(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao despublicar prova:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isPublicada) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" disabled={loading}>
            <EyeOff className="h-4 w-4 mr-2" />
            Despublicar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Despublicar prova?</AlertDialogTitle>
            <AlertDialogDescription>
              Os alunos não poderão mais ver suas notas da prova &quot;{provaNome}&quot;
              até que ela seja publicada novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDespublicar}>
              Despublicar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button onClick={handlePublicar} disabled={loading}>
      <Eye className="h-4 w-4 mr-2" />
      Publicar para Alunos
    </Button>
  );
}

export function StatusPublicacaoBadge({ publicada }: { publicada: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        publicada
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      }`}
    >
      {publicada ? (
        <>
          <Eye className="h-3 w-3 mr-1" />
          Publicada
        </>
      ) : (
        <>
          <EyeOff className="h-3 w-3 mr-1" />
          Rascunho
        </>
      )}
    </span>
  );
}
