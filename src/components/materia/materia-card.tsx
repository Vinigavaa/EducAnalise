"use client"

import { MoreVertical, Link } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card"
import { Button } from "../ui/button";

interface MateriaCardProps{
    materia: {
        id: string,
        nome: string;
    }
}

export function MateriaCard({materia}: MateriaCardProps){
    return(
        <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{materia.nome}</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardFooter className="gap-2 pt-3">
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/turmas/${materia.id}`}>Ver Detalhes</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href={`/turmas/${materia.id}/editar`}>Editar</Link>
        </Button>
      </CardFooter>
    </Card>
    )
}