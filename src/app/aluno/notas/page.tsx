import { ListaNotas } from "@/components/aluno/lista-notas";

export default function AlunoNotasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Minhas Notas</h1>
        <p className="text-muted-foreground">
          Veja suas notas em todas as provas
        </p>
      </div>
      <ListaNotas />
    </div>
  );
}
