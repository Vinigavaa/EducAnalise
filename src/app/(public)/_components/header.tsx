"use client"
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { handleRegister } from "../_actions/login";
import { Button } from "@/components/ui/button";
import { ChartPie, GraduationCap, Menu, Home } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SiGoogle } from "react-icons/si";

export default function Header() {
    const { data: session, status } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    // Rotas públicas (sempre visíveis)
    const publicNavItems = [
        { href: "/", label: "Início", icon: Home },
    ]

    // Rotas autenticadas (só aparecem quando logado)
    const authNavItems = [
        { href: "/turmas", label: "Turmas", icon: GraduationCap },
        { href: "/dashboard", label: "Dashboard", icon: ChartPie },
    ]

    const NavLinks = () => (
        <>
            {/* Rotas públicas */}
            {publicNavItems.map((item) => (
                <Button
                    key={item.href}
                    onClick={() => setIsOpen(false)}
                    asChild
                    variant="ghost"
                    className="justify-start my-1 mx-4">
                    <Link href={item.href} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                </Button>
            ))}

            {/* Rotas autenticadas */}
            {session && (
                <>
                    <div className="border-t border-zinc-200 my-2" />
                    {authNavItems.map((item) => (
                        <Button
                            key={item.href}
                            onClick={() => setIsOpen(false)}
                            asChild
                            variant="ghost"
                            className="justify-start my-1 mx-4">
                            <Link href={item.href} className="flex items-center gap-2">
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        </Button>
                    ))}
                </>
            )}

            <div className="mt-4 pt-4 border-t border-zinc-200 mx-4">
                {session ? (
                    <div className="text-sm text-zinc-600 px-2 mb-2">
                        <p className="font-medium">{session.user?.name}</p>
                        <p className="text-xs text-zinc-500">{session.user?.email}</p>
                    </div>
                ) : (
                    <Button
                        onClick={() => {setIsOpen(false); handleLogin();}}
                        className="w-full bg-indigo-500 hover:bg-indigo-900 justify-center my-2"
                    >
                        <SiGoogle size={24} color="#ffffff" />
                        Entrar com Google
                    </Button>
                )}
            </div>
        </>
    )

    async function handleLogin() {
        await handleRegister("google")
    }

    return (
        <header className="fixed top-0 right-0 left-0 z-[999] py-4 px-4 bg-white shadow-sm">
            <div className="container mx-auto flex items-center justify-between" suppressHydrationWarning>
                <Link href={"/"} className="text-3xl font-bold text-zinc-900">
                    Educ<span className="text-indigo-700">Analise</span>
                </Link>
                <nav className="hidden md:flex items-center gap-4 text-zinc-900 font-medium">
                    {status === 'loading' ? (
                        <></>
                    ) : session ? (
                        <>
                            <Button asChild variant="ghost" className="hover:bg-indigo-50">
                                <Link href="/turmas" className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" />
                                    Turmas
                                </Link>
                            </Button>
                            <Button asChild variant="default" className="bg-indigo-500 hover:bg-indigo-900">
                                <Link href="/dashboard" className="flex items-center gap-2">
                                    <ChartPie className="h-4 w-4" />
                                    Dashboard
                                </Link>
                            </Button>
                        </>
                    ) : (
                        <Button onClick={handleLogin} variant="default" className="bg-indigo-500 hover:bg-indigo-900">
                            <SiGoogle size={24} color="#ffffff" />
                            Entrar com Google
                        </Button>
                    )}
                </nav>

                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon" className="hover:bg-emerald-50 transition-colors">
                            <Menu className="w-6 h-6 text-zinc-900" />
                        </Button>
                    </SheetTrigger>

                    <SheetContent side="right" className="w-[280px] sm:w-[340px] border-l border-zinc-200">
                        <SheetHeader className="space-y-2 pb-4 border-b border-zinc-100 text-center">
                            <SheetTitle className="text-2xl font-bold text-zinc-900 mt-15">
                                Menu
                            </SheetTitle>
                            <SheetDescription className="text-sm text-zinc-500">
                                Navegue pelas opções disponíveis
                            </SheetDescription>
                        </SheetHeader>

                        <nav className="flex flex-col gap-2 mt-6">
                            <NavLinks />
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    )
}