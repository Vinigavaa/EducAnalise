import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Usa apenas a configuração leve (sem Prisma, bcrypt, etc.)
// A lógica de autorização está no callback 'authorized' em auth.config.ts
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|svg|ico|webp|css|js|woff|woff2|ttf|eot)$).*)",
  ],
};
