import { ProvaForm } from "@/components/provas/prova-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NovaProvaPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nova Prova</h1>
        <p className="text-muted-foreground mt-1">
          Crie uma nova Prova para cadastrar notas de seus alunos!
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Prova</CardTitle>
        </CardHeader>
        <CardContent>
          <ProvaForm />
        </CardContent>
      </Card>
    </div>
  );
}
