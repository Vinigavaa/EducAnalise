"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { KeyRound, Trash2, RefreshCw, Copy, Check, Clock } from "lucide-react";

interface CredenciaisData {
  hasCredentials: boolean;
  credentials: {
    username: string;
    mustChangePassword: boolean;
    lastLogin: string | null;
  } | null;
}

interface GerenciarCredenciaisProps {
  alunoId: string;
  alunoNome: string;
}

export function GerenciarCredenciais({ alunoId, alunoNome }: GerenciarCredenciaisProps) {
  const [credenciais, setCredenciais] = useState<CredenciaisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [tempUsername, setTempUsername] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchCredenciais = async () => {
    try {
      const response = await fetch(`/api/alunos/${alunoId}/credenciais`);
      if (response.ok) {
        const data = await response.json();
        setCredenciais(data);
      }
    } catch (error) {
      console.error("Erro ao buscar credenciais:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredenciais();
  }, [alunoId]);

  const criarCredenciais = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/alunos/${alunoId}/credenciais`, {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setTempUsername(data.username);
        setTempPassword(data.tempPassword);
        await fetchCredenciais();
      }
    } catch (error) {
      console.error("Erro ao criar credenciais:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const removerCredenciais = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/alunos/${alunoId}/credenciais`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTempPassword(null);
        setTempUsername(null);
        await fetchCredenciais();
      }
    } catch (error) {
      console.error("Erro ao remover credenciais:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const resetarSenha = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/alunos/${alunoId}/credenciais`, {
        method: "PATCH",
      });
      if (response.ok) {
        const data = await response.json();
        setTempUsername(data.username);
        setTempPassword(data.tempPassword);
        await fetchCredenciais();
      }
    } catch (error) {
      console.error("Erro ao resetar senha:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const copyCredenciais = () => {
    const text = `Usuário: ${tempUsername}\nSenha: ${tempPassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Acesso do Aluno
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Acesso do Aluno
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tempPassword && tempUsername && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="font-medium text-green-800 dark:text-green-200 mb-2">
              Credenciais geradas:
            </p>
            <div className="space-y-1 font-mono text-sm">
              <p>
                <span className="text-muted-foreground">Usuário:</span>{" "}
                <span className="font-semibold">{tempUsername}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Senha:</span>{" "}
                <span className="font-semibold">{tempPassword}</span>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={copyCredenciais}
            >
              {copied ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? "Copiado!" : "Copiar"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Anote estas credenciais. A senha temporária não será exibida novamente.
            </p>
          </div>
        )}

        {credenciais?.hasCredentials ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm">
                <span className="text-muted-foreground">Usuário:</span>{" "}
                <span className="font-mono font-medium">
                  {credenciais.credentials?.username}
                </span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>{" "}
                {credenciais.credentials?.mustChangePassword ? (
                  <span className="text-yellow-600 dark:text-yellow-400">
                    Aguardando troca de senha
                  </span>
                ) : (
                  <span className="text-green-600 dark:text-green-400">
                    Ativo
                  </span>
                )}
              </p>
              {credenciais.credentials?.lastLogin && (
                <p className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Último acesso:</span>{" "}
                  {new Date(credenciais.credentials.lastLogin).toLocaleString(
                    "pt-BR"
                  )}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetarSenha}
                disabled={actionLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Resetar Senha
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={actionLoading}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover Acesso
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover acesso?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Isso removerá o acesso de {alunoNome} ao sistema. O aluno
                      não poderá mais fazer login.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={removerCredenciais}>
                      Remover
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Este aluno ainda não possui acesso ao sistema.
            </p>
            <Button onClick={criarCredenciais} disabled={actionLoading}>
              <KeyRound className="h-4 w-4 mr-2" />
              Criar Credenciais
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
