"use client";
import { useState } from "react";
import Link from "next/link";

export default function TreatmentList({ treatments }: { treatments: any[] }) {
    const [search, setSearch] = useState("");

    const filtered = treatments.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-screen-xl mx-auto w-full px-4 pb-24">
            {/* Busca */}
            <div className="relative flex items-center w-full max-w-md mx-auto my-6 h-12 rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary transition-all">
                <span className="material-symbols-outlined absolute left-4 text-slate-400">search</span>
                <input
                    type="text"
                    placeholder="Buscar tratamentos (ex: clareamento)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-full bg-transparent pl-12 pr-4 outline-none text-slate-700 placeholder-slate-400"
                />
            </div>

            {/* Grid de Cards (Ajustado para Desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((t) => (
                    <Link href={`/tratamentos/${t.id}`} key={t.id} className="group flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1 overflow-hidden">

                        {/* Foto (Altura Fixa, não gigante) */}
                        <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-slate-100">
                            <img
                                src={t.images?.[0] || "/placeholder.jpg"}
                                alt={t.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
                                <span className="text-xs font-bold text-primary">{t.tags?.[0] || "Tratamento"}</span>
                            </div>
                        </div>

                        {/* Conteúdo do Card */}
                        <div className="p-5 flex flex-col flex-1">
                            <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-2">{t.title}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
                                {t.description}
                            </p>

                            <div className="flex items-end justify-between pt-4 border-t border-slate-100 mt-auto">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">A partir de</span>
                                    <span className="text-lg font-black text-slate-900">R$ {t.price.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm font-bold text-primary group-hover:text-blue-600 transition-colors">
                                    Detalhes <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </div>
                            </div>
                        </div>

                    </Link>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 text-slate-500">
                    <span className="material-symbols-outlined text-4xl mb-3 opacity-50">search_off</span>
                    <p>Nenhum tratamento encontrado para &quot;{search}&quot;.</p>
                </div>
            )}
        </div>
    );
}
