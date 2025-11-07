import { Users, ClipboardCheck, TrendingUp, Database, Zap } from "lucide-react"

export function Features() {
    const features = [
        {
            icon: Users,
            title: "Gestão de alunos",
            description: "Acompanhe o desempenho individual e por turma, tudo em um só lugar."
        },
        {
            icon: ClipboardCheck,
            title: "Controle de provas",
            description: "Organize, aplique e revise avaliações com praticidade."
        },
        {
            icon: TrendingUp,
            title: "Relatórios e gráficos inteligentes",
            description: "Visualize indicadores de aprendizado e evolução ao longo do tempo."
        },
        {
            icon: Database,
            title: "Banco de provas centralizado",
            description: "Crie, salve e reutilize questões para otimizar tempo e estratégia."
        },
        {
            icon: Zap,
            title: "Quizzes interativos",
            description: "Engaje os alunos com exercícios dinâmicos e feedback imediato."
        }
    ]

    return (
        <section className="bg-white py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="bg-indigo-50 rounded-3xl p-8 md:p-12 lg:p-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                        {/* Conteúdo de texto - Lado esquerdo */}
                        <div className="space-y-8 order-1">
                            <div className="space-y-4">
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-800 leading-tight">
                                    Ferramentas que <span className="text-indigo-600">potencializam</span> a gestão escolar
                                </h2>
                                <p className="text-lg md:text-xl text-zinc-700 leading-relaxed">
                                    Gestão integrada para acompanhar o progresso, organizar avaliações, e tornar o processo de ensino mais estratégico, eficiente e conectado às necessidades dos alunos.
                                </p>
                            </div>

                            {/* Lista de vantagens */}
                            <div className="space-y-6">
                                {features.map((feature, index) => {
                                    const Icon = feature.icon
                                    return (
                                        <div
                                            key={index}
                                            className="flex items-start gap-4 group hover:translate-x-2 transition-transform duration-300"
                                        >
                                            <div className="bg-white p-3 rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300 shrink-0">
                                                <Icon className="w-6 h-6 text-indigo-600" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-lg text-zinc-800">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-zinc-600 leading-relaxed">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Imagem/Mockup - Lado direito */}
                        <div className="order-2 relative">
                            <div className="relative">
                                {/* Mockup principal */}
                                <div className="rounded-2xl overflow-hidden shadow-2xl bg-white">
                                    <img
                                        src="/features.jpg"
                                        alt="Dashboard da plataforma"
                                        className="w-full h-auto"
                                    />
                                </div>

                                {/* Elemento decorativo - círculo gradiente */}
                                <div className="absolute -bottom-8 -right-8 w-40 h-40 md:w-48 md:h-48
                                              bg-gradient-to-br from-indigo-300/50 to-indigo-400/50
                                              rounded-full blur-3xl -z-10"></div>
                                <div className="absolute -top-8 -left-8 w-40 h-40 md:w-48 md:h-48
                                              bg-gradient-to-br from-indigo-200/40 to-purple-300/40
                                              rounded-full blur-3xl -z-10"></div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}
