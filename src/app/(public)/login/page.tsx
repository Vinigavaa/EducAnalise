"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, User, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { FaGoogle } from "react-icons/fa";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const errorParam = searchParams.get("error");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === "CredentialsSignin" ? "Usuario ou senha incorretos" : null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [alunoCredentials, setAlunoCredentials] = useState({
    username: "",
    password: "",
  });

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: callbackUrl || "/dashboard" });
  };

  const handleAlunoSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("aluno-credentials", {
        username: alunoCredentials.username,
        password: alunoCredentials.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Usuario ou senha incorretos");
        setLoading(false);
        return;
      }

      router.push("/aluno/dashboard");
    } catch {
      setError("Erro ao fazer login");
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">EducAnalise</CardTitle>
        <CardDescription>
          Entre com sua conta para continuar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="professor" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="professor">Professor</TabsTrigger>
            <TabsTrigger value="aluno">Aluno</TabsTrigger>
          </TabsList>

          <TabsContent value="professor" className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground text-center">
              Professores acessam com sua conta Google
            </p>
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              <FaGoogle className="mr-2 h-4 w-4" />
              {loading ? "Entrando..." : "Entrar com Google"}
            </Button>
          </TabsContent>

          <TabsContent value="aluno" className="space-y-4 pt-4">
            <form onSubmit={handleAlunoSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="seu.usuario"
                    className="pl-10"
                    value={alunoCredentials.username}
                    onChange={(e) =>
                      setAlunoCredentials({
                        ...alunoCredentials,
                        username: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={alunoCredentials.password}
                    onChange={(e) =>
                      setAlunoCredentials({
                        ...alunoCredentials,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center">
              Suas credenciais sao fornecidas pelo professor
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function LoginFallback() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        </div>
        <CardTitle className="text-2xl">EducAnalise</CardTitle>
        <CardDescription>
          Carregando...
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <Suspense fallback={<LoginFallback />}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
