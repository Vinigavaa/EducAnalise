import { MateriaCard } from "./materia-card";

//como deve ser a estrutura de uma materia
interface Materia{
    id: string,
    nome: string
}

//receberemos um findMany de busca do prisma com o nome "materias" que irá acontecer no componente de materias -> page.tsx
//onde ira salvar um array de objetos com todos esses dados recebidos
interface MateriaListaProps {
    materias: Materia[];
}

export function MateriaList({materias}: MateriaListaProps) {
 if(materias.length === 0){
    return(
        <div className="text-center py-12">
        <p className="text-muted-foreground text-lg mb-2">
          Nenhuma Matéria encontrada
        </p>
        <p className="text-sm text-muted-foreground">
          Crie sua primeira Matéria para começar
        </p>
      </div>
    );
 }

 return(
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materias.map((materia) => (
            <MateriaCard key={materia.id} materia={materia} />
          ))}
        </div>
 )
}