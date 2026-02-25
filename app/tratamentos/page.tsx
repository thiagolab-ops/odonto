import { prisma } from "@/lib/db";
import Link from "next/link";
import TreatmentList from "../_components/TreatmentList";

export default async function TratamentosPage() {
    const treatments = await prisma.treatment.findMany({
        where: { status: "AVAILABLE" }
    });

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Header Centralizado - max-w-screen-xl */}
            <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3">
                <div className="max-w-screen-xl mx-auto w-full flex items-center justify-between">
                    <Link href="/" className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 text-slate-900 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <h1 className="text-lg font-bold text-slate-900">Tratamentos</h1>
                    <div className="size-10"></div> {/* Espaçador */}
                </div>
            </header>

            {/* Grid Client Component com Busca */}
            <TreatmentList treatments={treatments} />
        </div>
    );
}
