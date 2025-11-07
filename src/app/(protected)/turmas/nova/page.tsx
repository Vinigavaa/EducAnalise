import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TurmaForm } from "@/components/turmas/turma-form";

export default function NovaTurmaPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nova Turma</h1>
        <p className="text-muted-foreground mt-1">
          Crie uma nova turma para gerenciar seus alunos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Turma</CardTitle>
        </CardHeader>
        <CardContent>
          <TurmaForm />
        </CardContent>
      </Card>
    </div>
  );
}
