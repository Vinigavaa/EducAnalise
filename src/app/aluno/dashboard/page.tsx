import { DashboardContent } from "@/components/aluno/dashboard-content";

export default function AlunoDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meu Dashboard</h1>
        <p className="text-muted-foreground">
          Acompanhe seu desempenho academico
        </p>
      </div>
      <DashboardContent />
    </div>
  );
}
