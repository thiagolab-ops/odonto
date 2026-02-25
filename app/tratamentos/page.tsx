import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function TratamentosPage() {
    const treatments = await prisma.treatment.findMany({
        where: { status: "AVAILABLE" }
    });

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24">
            {/* Centralizador para Desktop */}
            <div className="max-w-screen-md mx-auto w-full bg-white dark:bg-slate-900 min-h-screen shadow-2xl">

                {/* Header */}
                <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex justify-between items-center">
                    <Link href="/" className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Tratamentos</h1>
                    <div className="size-10"></div> {/* Espaçador */}
                </header>

                {/* Busca */}
                <div className="p-4">
                    <div className="relative flex items-center w-full h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <span className="material-symbols-outlined absolute left-4 text-slate-400">search</span>
                        <input type="text" placeholder="Buscar tratamentos..." className="w-full h-full bg-transparent pl-12 pr-4 outline-none text-slate-700 dark:text-slate-200" />
                    </div>
                </div>

                {/* Lista de Cards */}
                <div className="p-4 flex flex-col gap-4">
                    {treatments.map((t: any) => (
                        <div key={t.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex gap-4">
                                <div className="size-24 shrink-0 rounded-xl overflow-hidden bg-slate-100">
                                    <img src={t.images || "/placeholder.jpg"} alt={t.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col flex-1 justify-between py-1">
                                    <div>
                                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary mb-1">
                                            {t.tags || "Geral"}
                                        </span>
                                        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{t.title}</h3>
                                        <p className="text-sm text-slate-500 line-clamp-2 mt-1">{t.description}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400">A partir de</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">R$ {t.price.toFixed(2)}</span>
                                </div>
                                <Link href={`/tratamentos/${t.id}`} className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80">
                                    Ver detalhes <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </Link>
                            </div>
                        </div>
                    ))}
                    {treatments.length === 0 && <p className="text-center text-slate-500 py-10">Nenhum tratamento cadastrado.</p>}
                </div>

            </div>
        </div>
    );
}
