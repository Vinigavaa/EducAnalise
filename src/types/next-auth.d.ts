import { UserRole } from "@/generated/prisma";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      alunoId?: string | null;
      mustChangePassword?: boolean;
    };
  }

  interface User {
    id: string;
    role: UserRole;
    alunoId?: string | null;
    mustChangePassword?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    alunoId?: string | null;
    mustChangePassword?: boolean;
  }
}
