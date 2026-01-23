import type { Adapter, AdapterAccount, AdapterUser, AdapterSession } from "next-auth/adapters";
import type { PrismaClient } from "@/generated/prisma";

export function CustomPrismaAdapter(prisma: PrismaClient): Adapter {
  return {
    async createUser(data) {
      const user = await prisma.users.create({
        data: {
          name: data.name,
          email: data.email,
          emailVerified: data.emailVerified,
          image: data.image,
        },
      });
      return {
        id: user.id,
        name: user.name,
        email: user.email!,
        emailVerified: user.emailVerified,
        image: user.image,
      } as AdapterUser;
    },

    async getUser(id) {
      const user = await prisma.users.findUnique({ where: { id } });
      if (!user) return null;
      return {
        id: user.id,
        name: user.name,
        email: user.email!,
        emailVerified: user.emailVerified,
        image: user.image,
      } as AdapterUser;
    },

    async getUserByEmail(email) {
      const user = await prisma.users.findUnique({ where: { email } });
      if (!user) return null;
      return {
        id: user.id,
        name: user.name,
        email: user.email!,
        emailVerified: user.emailVerified,
        image: user.image,
      } as AdapterUser;
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const account = await prisma.accounts.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        include: { user: true },
      });
      if (!account?.user) return null;
      return {
        id: account.user.id,
        name: account.user.name,
        email: account.user.email!,
        emailVerified: account.user.emailVerified,
        image: account.user.image,
      } as AdapterUser;
    },

    async updateUser(data) {
      const user = await prisma.users.update({
        where: { id: data.id },
        data: {
          name: data.name,
          email: data.email,
          emailVerified: data.emailVerified,
          image: data.image,
        },
      });
      return {
        id: user.id,
        name: user.name,
        email: user.email!,
        emailVerified: user.emailVerified,
        image: user.image,
      } as AdapterUser;
    },

    async deleteUser(userId) {
      await prisma.users.delete({ where: { id: userId } });
    },

    async linkAccount(data) {
      await prisma.accounts.create({
        data: {
          userId: data.userId,
          type: data.type,
          provider: data.provider,
          providerAccountId: data.providerAccountId,
          refresh_token: data.refresh_token,
          access_token: data.access_token,
          expires_at: data.expires_at,
          token_type: data.token_type,
          scope: data.scope,
          id_token: data.id_token,
          session_state: data.session_state as string | null,
        },
      });
      return data as AdapterAccount;
    },

    async unlinkAccount({ providerAccountId, provider }) {
      await prisma.accounts.delete({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
      });
    },

    async createSession(data) {
      const session = await prisma.sessions.create({
        data: {
          sessionToken: data.sessionToken,
          userId: data.userId,
          expires: data.expires,
        },
      });
      return {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      } as AdapterSession;
    },

    async getSessionAndUser(sessionToken) {
      const session = await prisma.sessions.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!session) return null;
      return {
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        } as AdapterSession,
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email!,
          emailVerified: session.user.emailVerified,
          image: session.user.image,
        } as AdapterUser,
      };
    },

    async updateSession(data) {
      const session = await prisma.sessions.update({
        where: { sessionToken: data.sessionToken },
        data: {
          expires: data.expires,
        },
      });
      return {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      } as AdapterSession;
    },

    async deleteSession(sessionToken) {
      await prisma.sessions.delete({ where: { sessionToken } });
    },

    async createVerificationToken(data) {
      const token = await prisma.verification_tokens.create({
        data: {
          identifier: data.identifier,
          token: data.token,
          expires: data.expires,
        },
      });
      return {
        identifier: token.identifier,
        token: token.token,
        expires: token.expires,
      };
    },

    async useVerificationToken({ identifier, token }) {
      try {
        const verificationToken = await prisma.verification_tokens.delete({
          where: {
            identifier_token: {
              identifier,
              token,
            },
          },
        });
        return {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
          expires: verificationToken.expires,
        };
      } catch {
        return null;
      }
    },
  };
}
