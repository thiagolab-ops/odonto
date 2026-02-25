import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function TratamentosPage({ searchParams }: { searchParams: { q?: string } }) {
    // Garantir que a propriedade status exista e usar o nome correto (prisma.treatment.findMany)
    const treatments = await prisma.treatment.findMany({
        where: { status: "AVAILABLE" }
    });

    return (
        <main className="min-h-screen bg-background-light pb-24">
            <header className="sticky top-0 z-20 flex items-center justify-between bg-white px-4 py-4 shadow-sm">
                <Link href="/" className="flex size-10 items-center justify-center rounded-full text-secondary hover:bg-slate-100 transition-colors">
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </Link>
                <h2 className="font-display text-xl font-bold text-secondary">Nossos Tratamentos</h2>
                <div className="size-10"></div> {/* Espaçador */}
            </header>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {treatments.map((t) => (
                    <Link href={`/tratamentos/${t.id}`} key={t.id} className="block group">
                        <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 transition-transform hover:-translate-y-1">
                            <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                                {t.images && t.images.length > 0 && <img src={t.images[0]} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                            </div>
                            <div className="p-4">
                                <h3 className="font-display text-lg font-bold text-secondary">{t.title}</h3>
                                <p className="text-sm text-text-muted mb-3">{t.duration}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-primary font-bold">R$ {t.price.toFixed(2)}</span>
                                    <span className="text-sm font-semibold text-primary">Detalhes &rarr;</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
                {treatments.length === 0 && <p className="text-center text-text-muted mt-10">Nenhum tratamento cadastrado.</p>}
            </div>
        </main>
    );
}
