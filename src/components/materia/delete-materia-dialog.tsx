"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteMateriaDialogProps {
    materiaId: string;
    nome: string;
}

export function DeleteMateriaDialog({materiaId, nome}: DeleteMateriaDialogProps){
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);

        try{
            const response = await fetch(`api/materias/${materiaId}`, {
                method: "DELETE",
            });

            if(!response.ok){
                throw new Error("Erro ao excluir matéria");
            }

            router.push("/materias");
            router.refresh();
        } catch {
            alert("Erro ao excluir matéria. Tente novamente.");
        } finally {
            setIsDeleting(false);
        }
    };

    return(
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" className="hover:bg-red-800">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir Matéria
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Essa ação não pode ser desfeita. Isso irá excluir a matéria <strong>&quot;{nome}&quot;</strong> permanentemente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? "Excluindo..." : "Sim, excluir turma"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>        
        </AlertDialog>
    );
}