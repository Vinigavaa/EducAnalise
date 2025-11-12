import { MateriaInput, materiaSchema } from "@/lib/validations/materia";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface MateriaFormProps {
    materia?: {
        id: string,
        nome: string
    }
    OnSucess?: () => void;
}

export function MateriaForm({materia, OnSucess}: MateriaFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    //o estado error pode ter dois tipos, string se houver erro e null se não houver, sempre inicia null
    const [error, setError] = useState<string | null>(null)

    const isEditing = !!materia;

    const form = useForm<MateriaInput>({
        resolver: zodResolver(materiaSchema),
        defaultValues: {
            nome: materia?.nome || "",
        }
    });

}