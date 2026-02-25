'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Chatbot from '@/components/chatbot'
import { useCart } from '@/lib/cart-context'
import { toast } from '@/hooks/use-toast'

interface Category {
    id: string
    name: string
    order: number
}

interface Service {
    id: string
    name: string
    price: number
    duration: number
    description: string
    categoryId?: string
    categoryRef?: {
        name: string
    }
}

export default function ServicosPage() {
    const router = useRouter()

    const { items, addItem } = useCart()
    const selectedCount = items.reduce((acc, item) => acc + item.quantity, 0)

    const [categories, setCategories] = useState<Category[]>([])
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState<string>('Todos')

    useEffect(() => {
        fetch('/api/cardapio')
            .then(res => res.json())
            .then(data => {
                setCategories(data.categories || [])
                setServices(data.services || [])
                setLoading(false)
            })
            .catch(error => {
                console.error("Erro ao carregar cardápio:", error)
                setLoading(false)
            })
    }, [])

    const handleAddService = (id: string, name: string, price: number) => {
        addItem({
            id,
            name,
            price,
            quantity: 1
        })
        toast({ title: 'Adicionado!', description: `${name} foi adicionado aos selecionados.` })
    }

    // Filtragem de Serviços
    const filteredServices = services.filter(service => {
        if (activeCategory === 'Todos') return true;
        return service.categoryRef?.name === activeCategory || false;
    })

    // Agrupamento por Categoria (para exibir na tela)
    const groupedServices: Record<string, Service[]> = {}

    // Se estivemos em "Todos", agrupamos por categoria, se não, apenas a filtrada
    if (activeCategory === 'Todos') {
        // Inicializa chaves de categorias
        categories.forEach(cat => groupedServices[cat.name] = [])
        filteredServices.forEach(service => {
            const catName = service.categoryRef?.name || 'Outros'
            if (!groupedServices[catName]) groupedServices[catName] = []
            groupedServices[catName].push(service)
        })
    } else {
        groupedServices[activeCategory] = filteredServices
    }


    return (
        <div className="relative flex min-h-screen w-full flex-col max-w-4xl mx-auto bg-surface-dark shadow-2xl overflow-hidden font-display text-slate-100">

            {/* HEADER */}
            <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-background-dark/95 backdrop-blur-md border-b border-white/5">
                <button
                    onClick={() => router.push('/')}
                    className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors text-slate-300"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                </button>

                <h1 className="font-heading text-lg font-bold tracking-widest text-white">
                    AGENDAMENTO
                </h1>

                <button
                    onClick={() => router.push('/checkout')}
                    className="p-2 -mr-2 rounded-full hover:bg-white/5 transition-colors text-slate-300 relative"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-days"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
                    {selectedCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-background-dark">
                            {selectedCount}
                        </span>
                    )}
                </button>
            </header>

            {/* FILTROS (Pílulas) */}
            <div className="sticky top-[69px] z-40 bg-surface-dark/95 backdrop-blur-md pb-4 pt-4 border-b border-white/5">
                <div className="flex gap-2 overflow-x-auto px-6 scrollbar-hide snap-x">
                    <button
                        onClick={() => setActiveCategory('Todos')}
                        className={`snap-center flex-shrink-0 px-5 py-2 rounded-full font-bold text-sm tracking-wide transition-all ${activeCategory === 'Todos' ? 'bg-primary text-background-dark' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                    >
                        Todos
                    </button>
                    {!loading && categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.name)}
                            className={`snap-center flex-shrink-0 px-5 py-2 rounded-full font-bold text-sm tracking-wide transition-all ${activeCategory === cat.name ? 'bg-primary text-background-dark' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* LISTA DE SERVIÇOS */}
            <main className="flex-1 px-6 py-6 overflow-y-auto pb-32 space-y-8">
                {loading ? (
                    <div className="text-center text-slate-500 py-10 animate-pulse">Carregando serviços...</div>
                ) : Object.keys(groupedServices).length === 0 || services.length === 0 ? (
                    <div className="text-center text-slate-500 py-10">Nenhum serviço disponível no momento.</div>
                ) : (
                    Object.keys(groupedServices).map(categoryName => {
                        const srvs = groupedServices[categoryName]
                        if (!srvs || srvs.length === 0) return null

                        return (
                            <div key={categoryName}>
                                <h2 className="font-heading text-xl font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2 mt-4 md:mt-8">
                                    <span className="h-px bg-white/10 flex-1"></span>
                                    {categoryName}
                                    <span className="h-px bg-white/10 flex-1"></span>
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {srvs.map(service => (
                                        <div key={service.id} className="bg-background-dark/50 border border-white/5 rounded-xl p-4 flex gap-4 transition-all hover:border-primary/30">
                                            <div className="w-20 h-20 bg-black/40 rounded-lg flex-shrink-0 flex items-center justify-center text-primary border border-white/5">
                                                {categoryName.toLowerCase().includes('barba') ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wind"><path d="M12.8 19.6A2 2 0 1 0 14 16H2" /><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2" /><path d="M9.8 4.4A2 2 0 1 1 11 8H2" /></svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-scissors"><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" x2="8.12" y1="4" y2="15.88" /><line x1="14.47" x2="20" y1="14.48" y2="20" /><line x1="8.12" x2="12" y1="8.12" y2="12" /></svg>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="font-heading font-bold text-slate-100 tracking-wide text-lg leading-tight uppercase">{service.name}</h3>
                                                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{service.description || 'Preço imperdível'}</p>
                                                </div>
                                                <div className="flex items-end justify-between mt-3">
                                                    <div>
                                                        <p className="font-bold text-primary text-lg">R$ {service.price.toFixed(2).replace('.', ',')}</p>
                                                        <p className="text-[10px] text-slate-500">{service.duration} min</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAddService(service.id, service.name, service.price)}
                                                        className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-primary hover:bg-primary hover:text-background-dark transition-colors border border-white/10"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })
                )}
            </main>

            {/* FLOATING ACTION BAR (Para ver o carrinho) */}
            {selectedCount > 0 && (
                <div className="absolute bottom-6 left-6 right-6 z-50 animate-fade-in-up md:right-auto md:w-[calc(896px-3rem)]">
                    <Link href="/checkout" className="group flex items-center justify-between bg-primary p-4 rounded-xl shadow-[0_8px_30px_rgb(245,159,10,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-background-dark/20 flex items-center justify-center text-background-dark font-bold text-sm">
                                {selectedCount}
                            </div>
                            <span className="font-heading font-bold tracking-widest uppercase text-background-dark text-sm">
                                Ver Selecionados
                            </span>
                        </div>
                        <div className="text-background-dark">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right group-hover:translate-x-1 transition-transform"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </div>
                    </Link>
                </div>
            )}

            <Chatbot />
        </div>
    )
}
