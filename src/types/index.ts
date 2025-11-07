// Tipos para Turma
export interface Turma {
  id: string;
  nome: string;
  ano_letivo: number;
  userId: string | null;
  criado_em: Date;
  atualizado_em: Date;
}

export interface TurmaWithCounts extends Turma {
  _count: {
    alunos: number;
    provas?: number;
  };
}

export interface TurmaWithAlunos extends Turma {
  alunos: Aluno[];
  _count: {
    alunos: number;
    provas: number;
  };
}

// Tipos para Aluno
export interface Aluno {
  id: string;
  nome: string;
  turmaId: string;
  criado_em: Date;
  atualizado_em: Date;
}

export interface AlunoWithTurma extends Aluno {
  turma: {
    id: string;
    nome: string;
    ano_letivo: number;
  };
}

// Tipos para API Responses
export interface ApiError {
  error: string;
  details?: unknown;
}

export interface ApiSuccess<T = unknown> {
  message?: string;
  data?: T;
}
