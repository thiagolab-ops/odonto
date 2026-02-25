import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function TratamentoDetailsPage({ params }: { params: { id: string } }) {
    const treatment = await prisma.treatment.findUnique({
        where: { id: params.id }
    });

    if (!treatment) {
        notFound();
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24">
            {/* Centralizador para Desktop */}
            <div className="max-w-screen-md mx-auto w-full bg-white dark:bg-slate-900 min-h-screen shadow-2xl flex flex-col">

                {/* Header */}
                <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex justify-between items-center">
                    <Link href="/tratamentos" className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Detalhes</h1>
                    <div className="size-10"></div> {/* Espaçador */}
                </header>

                {/* Imagem Principal */}
                <div className="relative w-full h-64 bg-slate-100 dark:bg-slate-800">
                    {treatment.images && treatment.images.length > 0 ? (
                        <img src={treatment.images[0]} alt={treatment.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">Sem imagem</div>
                    )}
                </div>

                {/* Conteúdo */}
                <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-6">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{treatment.title}</h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{treatment.description}</p>

                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 mb-6 font-medium">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-slate-500 flex items-center gap-2"><span className="material-symbols-outlined text-lg">payments</span> Valor Base</span>
                                <span className="text-slate-900 dark:text-white font-bold">R$ {treatment.price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-slate-500 flex items-center gap-2"><span className="material-symbols-outlined text-lg">timer</span> Duração</span>
                                <span className="text-slate-900 dark:text-white font-bold">{treatment.duration}</span>
                            </div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-slate-500 flex items-center gap-2"><span className="material-symbols-outlined text-lg">medical_services</span> Anestesia</span>
                                <span className="text-slate-900 dark:text-white font-bold">{treatment.anesthesia}</span>
                            </div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-slate-500 flex items-center gap-2"><span className="material-symbols-outlined text-lg">health_and_safety</span> Recuperação</span>
                                <span className="text-slate-900 dark:text-white font-bold">{treatment.recovery}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 flex items-center gap-2"><span className="material-symbols-outlined text-lg">verified</span> Durabilidade</span>
                                <span className="text-slate-900 dark:text-white font-bold">{treatment.durability}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <Link
                            href={"/agendamento?treatmentId=" + treatment.id}
                            className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(7,182,213,0.3)] hover:scale-[1.02]"
                        >
                            Agendar Avaliação
                            <span className="material-symbols-outlined">event_available</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
