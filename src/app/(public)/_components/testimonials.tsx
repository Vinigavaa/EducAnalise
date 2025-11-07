"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Star, Instagram } from "lucide-react"

export function Testimonials() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)

    const testimonials = [
        {
            id: 1,
            name: "Maria Silva",
            role: "Coordenadora Pedagógica",
            content: "A EducAnalise transformou completamente a forma como acompanhamos o desempenho dos alunos. Os relatórios são claros e nos ajudam a tomar decisões mais assertivas.",
            rating: 5,
            instagram: "@mariasilva.edu"
        },
        {
            id: 2,
            name: "João Santos",
            role: "Professor de Matemática",
            content: "Ferramenta incrível! Consigo organizar minhas provas, acompanhar o progresso da turma e identificar onde os alunos têm mais dificuldade. Essencial para minha rotina.",
            rating: 5,
            instagram: "@prof.joaosantos"
        },
        {
            id: 3,
            name: "Ana Paula Costa",
            role: "Diretora Escolar",
            content: "A plataforma trouxe muito mais eficiência para nossa gestão. Conseguimos visualizar dados importantes e criar estratégias pedagógicas baseadas em evidências reais.",
            rating: 5,
            instagram: "@anapaulacosta"
        },
        {
            id: 4,
            name: "Carlos Mendes",
            role: "Professor de Português",
            content: "Uso diariamente! A facilidade de criar quizzes e acompanhar o engajamento dos alunos em tempo real fez toda a diferença nas minhas aulas.",
            rating: 5,
            instagram: "@prof.carlosmendes"
        }
    ]

    const nextSlide = () => {
        if (!isAnimating) {
            setIsAnimating(true)
            setCurrentIndex((prev) => (prev + 1) % testimonials.length)
            setTimeout(() => setIsAnimating(false), 500)
        }
    }

    const prevSlide = () => {
        if (!isAnimating) {
            setIsAnimating(true)
            setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
            setTimeout(() => setIsAnimating(false), 500)
        }
    }

    const goToSlide = (index: number) => {
        if (!isAnimating && index !== currentIndex) {
            setIsAnimating(true)
            setCurrentIndex(index)
            setTimeout(() => setIsAnimating(false), 500)
        }
    }

    // Auto-play a cada 5 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide()
        }, 5000)

        return () => clearInterval(interval)
    }, [currentIndex])

    return (
        <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-white py-16 md:py-24 relative overflow-hidden">
            {/* Elementos decorativos de fundo */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-20 -left-20 w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 -right-20 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl"></div>
                <svg className="absolute bottom-0 left-0 w-full opacity-10" viewBox="0 0 1440 320">
                    <path
                        fill="#6366f1"
                        fillOpacity="0.3"
                        d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,101.3C1248,85,1344,75,1392,69.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ></path>
                </svg>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Título */}
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-800 mb-4">
                        Palavra de quem já é <span className="text-indigo-600">EducAnalise</span>
                    </h2>
                    <p className="text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto">
                        Veja o que educadores e gestores escolares estão dizendo sobre nossa plataforma
                    </p>
                </div>

                {/* Carrossel */}
                <div className="max-w-4xl mx-auto">
                    <div className="relative">
                        {/* Card do depoimento */}
                        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 min-h-[350px] md:min-h-[320px] flex flex-col justify-between">
                            {/* Ícones de estrelas animados */}
                            <div className="flex justify-center gap-2 mb-6">
                                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`transform transition-all duration-500 ${
                                            isAnimating ? 'scale-0 rotate-180' : 'scale-100 rotate-0'
                                        }`}
                                        style={{ transitionDelay: `${i * 100}ms` }}
                                    >
                                        <Star className="w-6 h-6 md:w-7 md:h-7 fill-indigo-500 text-indigo-500" />
                                    </div>
                                ))}
                            </div>

                            {/* Conteúdo do depoimento */}
                            <div className={`transition-all duration-500 ${
                                isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                            }`}>
                                <p className="text-lg md:text-xl text-zinc-700 text-center leading-relaxed mb-8 italic">
                                    &ldquo;{testimonials[currentIndex].content}&rdquo;
                                </p>

                                {/* Informações do autor */}
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-white text-2xl font-bold">
                                            {testimonials[currentIndex].name.charAt(0)}
                                        </span>
                                    </div>
                                    <div className="text-center">
                                        <h4 className="font-bold text-lg text-zinc-800">
                                            {testimonials[currentIndex].name}
                                        </h4>
                                        <p className="text-indigo-600 font-medium">
                                            {testimonials[currentIndex].role}
                                        </p>
                                        <div className="flex items-center justify-center gap-1 mt-2 text-zinc-500 text-sm">
                                            <Instagram className="w-4 h-4" />
                                            <span>{testimonials[currentIndex].instagram}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botões de navegação - Desktop */}
                        <button
                            onClick={prevSlide}
                            className="hidden md:flex absolute top-1/2 -left-6 -translate-y-1/2 bg-white hover:bg-indigo-50 text-indigo-600 w-12 h-12 rounded-full shadow-lg items-center justify-center transition-all duration-300 hover:scale-110"
                            aria-label="Depoimento anterior"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <button
                            onClick={nextSlide}
                            className="hidden md:flex absolute top-1/2 -right-6 -translate-y-1/2 bg-white hover:bg-indigo-50 text-indigo-600 w-12 h-12 rounded-full shadow-lg items-center justify-center transition-all duration-300 hover:scale-110"
                            aria-label="Próximo depoimento"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Indicadores de navegação */}
                    <div className="flex justify-center gap-3 mt-8">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`transition-all duration-300 rounded-full ${
                                    index === currentIndex
                                        ? 'w-8 bg-indigo-600'
                                        : 'w-3 bg-indigo-300 hover:bg-indigo-400'
                                } h-3`}
                                aria-label={`Ir para depoimento ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Botões de navegação - Mobile */}
                    <div className="flex md:hidden justify-center gap-4 mt-6">
                        <button
                            onClick={prevSlide}
                            className="bg-white hover:bg-indigo-50 text-indigo-600 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300"
                            aria-label="Depoimento anterior"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <button
                            onClick={nextSlide}
                            className="bg-white hover:bg-indigo-50 text-indigo-600 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300"
                            aria-label="Próximo depoimento"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
