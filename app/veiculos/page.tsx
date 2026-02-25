"use client"
import Link from 'next/link'
import { useState, useMemo, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function SearchFocusEffect({ inputRef }: { inputRef: React.RefObject<HTMLInputElement> }) {
    const searchParams = useSearchParams()

    useEffect(() => {
        if (searchParams?.get("search") === "focus" && inputRef.current) {
            inputRef.current.focus()
        }
    }, [searchParams, inputRef])

    return null
}

export default function VeiculosPage() {
    const [activeFilter, setActiveFilter] = useState<string>('Todos')
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [vehicles, setVehicles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const searchInputRef = useRef<HTMLInputElement>(null)

    const filterOptions = ['Todos', 'Sedan', 'SUV', 'Hatch', 'Coupé', 'Elétrico']

    useEffect(() => {
        fetch('/api/veiculos')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Filter to only AVAILABLE or allow RESERVED to show as well? 
                    // Let's bring all but prioritize design. The user requested:
                    // "busque os dados da tabela Vehicle no Prisma ... mapeie os cards dinamicamente"
                    setVehicles(data)
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const filteredCars = useMemo(() => {
        return vehicles.filter((car) => {
            const matchesFilter = activeFilter === 'Todos' || car.category === activeFilter
            const searchLower = searchQuery.toLowerCase()
            const matchesSearch =
                car.brand.toLowerCase().includes(searchLower) ||
                car.model.toLowerCase().includes(searchLower) ||
                car.year.toString().includes(searchLower)

            return matchesFilter && matchesSearch
        })
    }, [vehicles, activeFilter, searchQuery])

    return (
        <div className="relative flex h-full min-h-screen w-full max-w-screen-md flex-col overflow-x-hidden bg-white dark:bg-[#181511] shadow-2xl mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-20 flex flex-col bg-white/95 dark:bg-[#181511]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#393328]">
                <div className="flex items-center justify-between px-4 py-4">
                    <Link href="/" className="flex size-10 items-center justify-center rounded-full text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-[#27231b] transition-colors">
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </Link>
                    <h2 className="font-header text-2xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">Nossos Carros</h2>
                    {/* Placeholder div to balance flex-between since removing calendar */}
                    <div className="size-10"></div>
                </div>

                {/* Search Bar */}
                <div className="px-4 pb-4">
                    <Suspense fallback={null}>
                        <SearchFocusEffect inputRef={searchInputRef} />
                    </Suspense>
                    <div className="relative flex items-center w-full h-12 rounded-full bg-surface-dark border border-surface-border text-white px-4 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                        <span className="material-symbols-outlined text-text-secondary mr-2">search</span>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Buscar marca, modelo ou ano..."
                            className="bg-transparent border-none outline-none w-full text-sm placeholder-text-secondary/70 focus:ring-0"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {/* Filters */}
            <div className="sticky top-[132px] z-10 flex gap-3 overflow-x-auto px-4 py-4 bg-white dark:bg-[#181511] scrollbar-hide hide-scrollbar shadow-sm">
                {filterOptions.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`shrink-0 rounded-full px-6 py-2 text-sm font-medium transition-all active:scale-95 ${activeFilter === filter
                            ? 'bg-primary text-[#181511] font-bold shadow-[0_0_15px_rgba(245,159,10,0.4)]'
                            : 'border border-slate-200 dark:border-[#393328] bg-white dark:bg-[#27231b] text-slate-600 dark:text-[#baaf9c] hover:border-primary hover:text-primary'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Car List */}
            <main className="flex flex-col gap-4 p-4 pb-24 min-h-[50vh]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4 pt-10">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-text-secondary font-medium">Carregando catálogo...</p>
                    </div>
                ) : filteredCars.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4 pt-10">
                        <span className="material-symbols-outlined text-6xl text-text-secondary">directions_car</span>
                        <p className="text-text-secondary font-medium">Nenhum veículo disponível no momento.</p>
                    </div>
                ) : (
                    filteredCars.map((car) => {
                        const isUnavailable = car.status !== "AVAILABLE";
                        return (
                            <Link href={`/veiculos/${car.id}`} key={car.id} className={`@container group cursor-pointer ${isUnavailable ? 'opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300' : ''}`}>
                                <div className="flex flex-col overflow-hidden rounded-2xl bg-slate-50 dark:bg-[#27231b] shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-transform hover:-translate-y-1">
                                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url("${car.images?.[0] || ''}")` }}></div>
                                        {isUnavailable ? (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <span className="border-2 border-white px-4 py-1 text-sm font-bold uppercase text-white tracking-widest">{car.status === "RESERVED" ? "Reservado" : "Vendido"}</span>
                                            </div>
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#27231b] via-transparent to-transparent opacity-80"></div>
                                        )}
                                        {!isUnavailable && (
                                            <div className="absolute top-3 right-3 rounded-full bg-black/40 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                                                {car.year}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col p-4 @xl:p-6">
                                        <div className="mb-1 flex items-center justify-between">
                                            <h3 className="font-header text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">{car.brand} {car.model}</h3>
                                            <span className="material-symbols-outlined text-slate-400 cursor-pointer group-hover:text-primary">arrow_forward</span>
                                        </div>
                                        <div className="mb-4 flex flex-wrap gap-2">
                                            <span className="text-xs font-medium text-slate-500 dark:text-[#baaf9c]">{car.category}</span>
                                        </div>
                                        <div className="flex items-end justify-between gap-4">
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-[#baaf9c]">{isUnavailable ? 'Vendido por' : 'A partir de'}</p>
                                                <p className={`font-header text-2xl font-bold ${isUnavailable ? 'text-slate-400 dark:text-slate-500 line-through text-xl' : 'text-primary'}`}>
                                                    R$ {car.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                            {isUnavailable ? (
                                                <button className="flex h-10 items-center justify-center rounded-full bg-slate-200 dark:bg-[#393328]/50 px-4 text-sm font-bold text-slate-400 dark:text-slate-600 cursor-not-allowed" onClick={(e) => e.preventDefault()}>
                                                    Indisponível
                                                </button>
                                            ) : (
                                                <button className="flex h-10 items-center justify-center rounded-full bg-white dark:bg-[#393328] px-4 text-sm font-bold text-slate-900 dark:text-white transition-colors hover:bg-primary hover:text-[#181511]">
                                                    Detalhes
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })
                )}
            </main>
        </div>
    )
}
