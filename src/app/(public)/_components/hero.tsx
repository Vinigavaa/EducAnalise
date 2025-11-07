import { BarChart3, Target } from "lucide-react"

export function Hero(){
    return(
        <section className="bg-white overflow-hidden mt-20 md:mt-24">
            <div className="container mx-auto px-4 py-12 md:py-20 lg:py-28">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

                    {/* Conteúdo de texto - Lado esquerdo */}
                    <div className="space-y-6 lg:space-y-8 text-center lg:text-left order-2 lg:order-1">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-800 leading-tight">
                                Sua escola <span className="text-indigo-600">digital</span> sempre com você
                            </h1>
                            <p className="text-lg md:text-xl text-zinc-800 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                Acessível a qualquer hora e em qualquer lugar, nossa plataforma amplia as possibilidades do ensino e torna a experiência educacional mais completa, organizada e interativa.
                            </p>
                        </div>

                        <div className="flex justify-center lg:justify-start">
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                Conheça as possibilidades
                            </button>
                        </div>
                    </div>

                    {/* Imagem e cards flutuantes - Lado direito */}
                    <div className="relative order-1 lg:order-2 px-6 md:px-0">
                        <div className="relative max-w-lg mx-auto">
                            {/* Imagem principal */}
                            <div className="rounded-3xl overflow-hidden shadow-2xl relative z-10">
                                <img
                                    src="/professor.jpg"
                                    alt="Professor em sala de aula"
                                    className="w-full h-auto object-cover"
                                />
                            </div>

                            {/* Card 1 - Mais controle e gestão (topo direito) */}
                            <div className="absolute -top-4 -right-4 md:-right-8 lg:-right-12 z-20
                                          bg-white rounded-2xl shadow-2xl p-4 md:p-5
                                          border-2 border-indigo-100 backdrop-blur-sm
                                          max-w-[180px] md:max-w-[220px]
                                          hover:scale-105 transition-transform duration-300">
                                <div className="flex items-start gap-3">
                                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2.5 md:p-3 rounded-xl shadow-lg shrink-0">
                                        <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm md:text-base font-bold text-indigo-700 leading-tight">
                                            Mais controle e gestão
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2 - Aplicando esforço nos pontos certos (base esquerda) */}
                            <div className="absolute -bottom-6 -left-4 md:-left-8 lg:-left-12 z-20
                                          bg-white rounded-2xl shadow-2xl p-4 md:p-5
                                          border-2 border-indigo-100 backdrop-blur-sm
                                          max-w-[200px] md:max-w-[240px]
                                          hover:scale-105 transition-transform duration-300">
                                <div className="flex items-start gap-3">
                                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2.5 md:p-3 rounded-xl shadow-lg shrink-0">
                                        <Target className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm md:text-base font-bold text-indigo-700 leading-tight">
                                            Aplicando esforço nos pontos certos
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Elemento decorativo - círculo gradiente */}
                            <div className="absolute -bottom-8 -right-8 w-32 h-32 md:w-40 md:h-40
                                          bg-gradient-to-br from-indigo-200/40 to-indigo-300/40
                                          rounded-full blur-3xl -z-10"></div>
                            <div className="absolute -top-8 -left-8 w-32 h-32 md:w-40 md:h-40
                                          bg-gradient-to-br from-indigo-200/30 to-purple-300/30
                                          rounded-full blur-3xl -z-10"></div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}