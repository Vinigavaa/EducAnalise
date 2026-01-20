import { MateriaForm } from "@/components/materia/materia-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NovaMateriaPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nova Matéria</h1>
        <p className="text-muted-foreground mt-1">
          Crie uma nova matéria para gerenciar seus alunos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Turma</CardTitle>
        </CardHeader>
        <CardContent>
          <MateriaForm />
        </CardContent>
      </Card>
    </div>
    )
}