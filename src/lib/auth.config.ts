import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    //validacao do jwt acotence automatico pelo nextauth aqui so recebemos o auth object
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      const userRole = auth?.user?.role;

      // Se aluno acessar a página inicial, redirecionar para o dashboard do aluno
      if (pathname === "/" && isLoggedIn && userRole === "ALUNO") {
        return Response.redirect(new URL("/aluno/dashboard", nextUrl));
      }

      const publicRoutes = ["/", "/login", "/api/auth"];
      const isPublicRoute = publicRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
      );

      if (isPublicRoute) {
        return true;
      }

      if (!isLoggedIn) {
        // Redireciona para login quando não autorizado
        return Response.redirect(new URL("/login", nextUrl));
      }

      const mustChangePassword = auth.user.mustChangePassword;

      const isAlunoRoute = pathname.startsWith("/aluno");
      const isProfessorRoute =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/turmas") ||
        pathname.startsWith("/provas") ||
        pathname.startsWith("/materias");

      if (userRole === "ALUNO" && isProfessorRoute) {
        return Response.redirect(new URL("/aluno/dashboard", nextUrl));
      }

      if (userRole === "PROFESSOR" && isAlunoRoute) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      if (
        userRole === "ALUNO" &&
        mustChangePassword &&
        pathname !== "/aluno/trocar-senha"
      ) {
        return Response.redirect(new URL("/aluno/trocar-senha", nextUrl));
      }

      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "PROFESSOR";
        token.alunoId = user.alunoId;
        token.mustChangePassword = user.mustChangePassword;
      }

      if (trigger === "update" && session) {
        if (session.mustChangePassword !== undefined) {
          token.mustChangePassword = session.mustChangePassword;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "PROFESSOR" | "ALUNO";
        session.user.alunoId = token.alunoId as string | null;
        session.user.mustChangePassword = token.mustChangePassword as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
