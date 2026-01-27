import type { Metadata } from "next";
import { Fustat } from "next/font/google";
import "./globals.css";
import {SessionAuthProvider} from "../components/session-auth";
import Header from "./(public)/_components/header";

const fustat = Fustat({
  variable: "--font-fustat",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "EducAnalise - Sistema de Análise Educacional",
  description: "Gerencie turmas, alunos e acompanhe o desempenho escolar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${fustat.variable} antialiased`}
      >
        <SessionAuthProvider>
          <Header />
          {children}
        </SessionAuthProvider>
      </body>
    </html>
  );
}
