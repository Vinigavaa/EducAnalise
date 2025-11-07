import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {SessionAuthProvider} from "../components/session-auth";
import Header from "./(public)/_components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionAuthProvider>
          <Header />
          <div className="pt-20">
            {children}
          </div>
        </SessionAuthProvider>
      </body>
    </html>
  );
}
