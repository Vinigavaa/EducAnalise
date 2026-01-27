import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { UserRole } from "@/generated/prisma";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Rotas públicas - não requerem autenticação
  const publicRoutes = ["/", "/login", "/api/auth"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Se não está autenticado, redireciona para login
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const userRole = session.user.role;
  const mustChangePassword = session.user.mustChangePassword;

  // Rotas do aluno
  const isAlunoRoute = pathname.startsWith("/aluno");
  // Rotas do professor (protected)
  const isProfessorRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/turmas") ||
    pathname.startsWith("/provas") ||
    pathname.startsWith("/materias");

  // Aluno tentando acessar rota de professor
  if (userRole === UserRole.ALUNO && isProfessorRoute) {
    return NextResponse.redirect(new URL("/aluno/dashboard", request.url));
  }

  // Professor tentando acessar rota de aluno
  if (userRole === UserRole.PROFESSOR && isAlunoRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Aluno que precisa trocar senha é forçado para a página de trocar senha
  if (
    userRole === UserRole.ALUNO &&
    mustChangePassword &&
    pathname !== "/aluno/trocar-senha"
  ) {
    return NextResponse.redirect(new URL("/aluno/trocar-senha", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|svg|ico|webp|css|js|woff|woff2|ttf|eot)$).*)",
  ],
};
