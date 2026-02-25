'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { toast } from '@/hooks/use-toast'
import { mockCategories, mockServices, mockSettings } from '@/lib/mock-data'

export default function CardapioPage() {
  const [services, setServices] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [discount, setDiscount] = useState(0)
  const [selectedFilter, setSelectedFilter] = useState<string>('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const { items, addItem } = useCart()
  const itemCount = items?.length || 0

  useEffect(() => {
    fetchCardapio()
  }, [])

  const fetchCardapio = async () => {
    try {
      const res = await fetch('/api/cardapio')
      if (!res.ok) throw new Error('API Error')
      const data = await res.json()
      setServices(data.services || [])
      setCategories(data.categories || [])
      setDiscount(data.discount || 0)
    } catch (error) {
      // Fallback
      setServices(mockServices)
      setCategories(mockCategories)
      setDiscount(mockSettings.discountActive ? mockSettings.discountPercentage : 0)
    } finally {
      setLoading(false)
    }
  }

  const filters = ['Todos', 'Promoção', 'Novidade', 'Mais Buscado']

  const filteredServices = services.filter(service => {
    let matchesFilter = true
    if (selectedFilter !== 'Todos') {
      if (selectedFilter === 'Novidade') matchesFilter = service.isNew
      else if (selectedFilter === 'Mais Buscado') matchesFilter = service.isBestSeller
    }
    let matchesSearch = true
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase()
      matchesSearch = service.name.toLowerCase().includes(lowerTerm) || service.description.toLowerCase().includes(lowerTerm)
    }
    return matchesFilter && matchesSearch
  })

  const getServicesByCategory = (categoryName: string) => {
    return filteredServices.filter(p => p.category === categoryName)
  }

  const handleAddToCart = (service: any) => {
    const price = discount > 0 ? service.price * (1 - discount / 100) : service.price
    addItem({
      id: service.id,
      name: service.name,
      price: price,
      quantity: 1,
      imageUrl: service.imageUrl,
    })
    toast({
      title: 'Serviço selecionado!',
      description: `${service.name} foi adicionado à sua lista.`,
      className: 'bg-white border-primary text-primary font-medium'
    })
  }

  const getServicePriceDisplay = (service: any) => {
    if (discount > 0) {
      const discountedPrice = service.price * (1 - discount / 100)
      return (
        <div className="flex flex-col">
          <span className="text-xs text-text-secondary line-through">R$ {service.price.toFixed(2)}</span>
          <span className="font-sans text-lg font-semibold text-text-main">
            R$ {discountedPrice.toFixed(2)}
          </span>
        </div>
      )
    }
    return (
      <div className="flex flex-col">
        <span className="text-xs text-text-secondary">Preço</span>
        <span className="font-sans text-lg font-semibold text-text-main">
          R$ {service.price.toFixed(2)}
        </span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
      </div>
    )
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-display antialiased selection:bg-primary selection:text-white flex justify-center">
      <div className="relative flex flex-col w-full max-w-screen-md lg:max-w-screen-lg min-h-screen shadow-2xl bg-white dark:bg-stone-900 border-x border-transparent dark:border-stone-800 overflow-x-hidden pb-24">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-white/95 px-6 py-4 backdrop-blur-md dark:bg-stone-900/95 border-b border-gray-100 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center justify-center rounded-full p-2 text-text-main hover:bg-black/5 dark:text-white dark:hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-text-main dark:text-white">
              Bela Estética
            </h1>
          </div>

          {/* Botão de Carrinho Top-Right */}
          <Link
            href="/carrinho"
            className="relative flex items-center justify-center h-10 w-10 rounded-full bg-primary text-white shadow-sm hover:scale-105 active:scale-95 transition-transform"
            aria-label="Finalizar Agendamento"
          >
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white dark:border-stone-900">
                {itemCount}
              </span>
            )}
          </Link>
        </header>

        {/* Search & Filters */}
        <div className="px-6 pt-4 pb-2">
          <h2 className="mb-1 text-3xl font-medium leading-tight text-text-main dark:text-gray-100">
            Rituais de <span className="italic text-primary">Beleza</span>
          </h2>
          <div className="relative mt-6">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              className="w-full rounded-2xl border-none bg-white py-3 pl-12 pr-4 text-sm shadow-sm ring-1 ring-gray-100 focus:ring-primary dark:bg-stone-900 dark:ring-stone-800 dark:text-white"
              placeholder="Buscar tratamento..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex w-full gap-3 overflow-x-auto px-6 py-6 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`whitespace-nowrap px-6 py-2.5 text-sm font-medium transition-all ${selectedFilter === filter
                ? 'rounded-full bg-primary text-white shadow-[0_4px_20px_-2px_rgba(212,175,53,0.08)]'
                : 'rounded-full border border-gray-200 bg-white text-text-main hover:border-primary/50 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-300'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Lista de Serviços (Cards) */}
        <main className="flex flex-col gap-6 px-6 pb-8">
          {categories.map((category) => {
            const categoryServices = getServicesByCategory(category.name)
            if (categoryServices.length === 0) return null

            return (
              <section key={category.id} className="space-y-4">
                <h2 className="text-xl font-light text-gray-800 dark:text-stone-300 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {category.name}
                </h2>

                <div className="flex flex-col gap-4">
                  {categoryServices.map((service, idx) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-white dark:bg-stone-900 p-5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform border border-transparent dark:border-stone-800"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary overflow-hidden relative">
                            {service.imageUrl ? (
                              <Image
                                src={service.imageUrl}
                                alt={service.name}
                                fill
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <span className="material-symbols-outlined">spa</span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-text-main dark:text-white leading-tight">
                              {service.name}
                            </h3>
                            <p className="text-xs text-text-secondary dark:text-stone-400 mt-0.5 line-clamp-1">
                              {service.description || 'Renovação e bem-estar'}
                            </p>
                          </div>
                        </div>
                        <button className="rounded-full p-2 text-gray-300 hover:text-primary transition-colors shrink-0">
                          <span className="material-symbols-outlined">favorite</span>
                        </button>
                      </div>

                      <div className="h-[1px] w-full bg-gray-50 dark:bg-stone-800/50"></div>

                      <div className="flex items-center justify-between">
                        {getServicePriceDisplay(service)}

                        <button
                          onClick={() => handleAddToCart(service)}
                          disabled={!service.isAvailable}
                          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-[#b08d2b] transition-colors disabled:opacity-50"
                        >
                          Agendar
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )
          })}
          {filteredServices.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              Nenhum serviço encontrado com esses filtros.
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

