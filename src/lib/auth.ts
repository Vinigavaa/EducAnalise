import NextAuth from "next-auth";
import prisma from "./prisma";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { UserRole } from "@/generated/prisma";
import { CustomPrismaAdapter } from "./prisma-adapter";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: CustomPrismaAdapter(prisma),
  providers: [
    ...authConfig.providers,
    Credentials({
      id: "aluno-credentials",
      name: "Aluno",
      credentials: {
        username: { label: "Usuário", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const username = credentials.username as string;
        const password = credentials.password as string;

        const alunoCredential = await prisma.alunoCredential.findUnique({
          where: { username },
          include: {
            user: {
              include: {
                aluno: true,
              },
            },
          },
        });

        if (!alunoCredential) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(password, alunoCredential.passwordHash);

        if (!passwordMatch) {
          return null;
        }

        // Atualizar último login
        await prisma.alunoCredential.update({
          where: { id: alunoCredential.id },
          data: { lastLogin: new Date() },
        });

        return {
          id: alunoCredential.user.id,
          name: alunoCredential.user.aluno?.nome || alunoCredential.user.name,
          email: alunoCredential.user.email,
          image: alunoCredential.user.image,
          role: alunoCredential.user.role,
          alunoId: alunoCredential.user.alunoId,
          mustChangePassword: alunoCredential.mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || UserRole.PROFESSOR;
        token.alunoId = user.alunoId;
        token.mustChangePassword = user.mustChangePassword;
      }

      if (trigger === "update" && session) {
        if (session.mustChangePassword !== undefined) {
          token.mustChangePassword = session.mustChangePassword;
        }
      }

      // Para login com Google, buscar dados do usuário
      if (token.id && !token.role) {
        const dbUser = await prisma.users.findUnique({
          where: { id: token.id as string },
          select: { role: true, alunoId: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.alunoId = dbUser.alunoId;
        }
      }

      return token;
    },
  },
});
