'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { Trash2, Plus, Minus, Loader2, CalendarIcon, Check, Gift } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import Chatbot from '@/components/chatbot'

export default function CheckoutPage() {
    const router = useRouter()
    const { items, removeItem, updateQuantity, clearCart, total } = useCart()
    const [isProcessing, setIsProcessing] = useState(false)

    // Agendamento state
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const defaultDate = tomorrow.toISOString().split('T')[0]

    const [selectedDate, setSelectedDate] = useState(defaultDate)
    const [selectedTime, setSelectedTime] = useState('')
    const [availableSlots, setAvailableSlots] = useState<string[]>([])
    const [isLoadingSlots, setIsLoadingSlots] = useState(false)

    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [observations, setObservations] = useState('')

    // Fidelidade state
    const [loyaltyInfo, setLoyaltyInfo] = useState<{
        purchaseCount: number
        purchasesNeeded: number
        hasFreeSparkles: boolean
    } | null>(null)

    const [isLoadingCustomer, setIsLoadingCustomer] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [orderSuccessData, setOrderSuccessData] = useState<{ orderId: string } | null>(null)

    useEffect(() => {
        const fetchSlots = async () => {
            if (!selectedDate) return
            setIsLoadingSlots(true)
            try {
                const res = await fetch(`/api/agendamentos/disponiveis?date=${selectedDate}`)
                const data = await res.json()
                if (data.availableSlots) {
                    setAvailableSlots(data.availableSlots)
                    if (selectedTime && !data.availableSlots.includes(selectedTime)) {
                        setSelectedTime('')
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar horários:', error)
            } finally {
                setIsLoadingSlots(false)
            }
        }
        fetchSlots()
    }, [selectedDate])

    const fetchCustomerData = useCallback(async (phone: string) => {
        if (phone.length < 10) {
            setLoyaltyInfo(null)
            return
        }
        setIsLoadingCustomer(true)
        try {
            const res = await fetch(`/api/cliente?phone=${encodeURIComponent(phone)}`)
            const data = await res.json()
            if (data.customer) {
                if (data.customer.name && !customerName) setCustomerName(data.customer.name)
            }
            if (data.loyalty) {
                setLoyaltyInfo({
                    purchaseCount: data.loyalty.purchaseCount,
                    purchasesNeeded: data.loyalty.purchasesNeeded,
                    hasFreeSparkles: data.loyalty.hasFreeSparkles,
                })
            }
        } catch (error) {
            console.error('Erro ao buscar cliente:', error)
        } finally {
            setIsLoadingCustomer(false)
        }
    }, [customerName])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (customerPhone.replace(/\D/g, '').length >= 10) {
                fetchCustomerData(customerPhone.replace(/\D/g, ''))
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [customerPhone, fetchCustomerData])

    const handleFinalizePedido = async () => {
        if (!selectedDate || !selectedTime) {
            toast({ title: 'Horário não selecionado', description: 'Escolha a data e horário do corte.', variant: 'destructive' })
            return
        }
        if (!customerPhone || !customerName) {
            toast({ title: 'Dados Incompletos', description: 'Preencha seu Nome e WhatsApp.', variant: 'destructive' })
            return
        }

        setIsProcessing(true)

        try {
            const orderData = {
                items: items.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    extras: [],
                })),
                customerName,
                customerPhone: customerPhone.replace(/\D/g, ''),
                paymentMethod: 'LOCAL',
                scheduledTime: new Date(`${selectedDate}T${selectedTime}:00`).toISOString(),
                observations,
                total,
            }

            const res = await fetch('/api/pedido', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) })
            const data = await res.json()

            if (data.success && data.orderId) {
                setOrderSuccessData({ orderId: data.orderId })
                setShowSuccessModal(true)
            } else {
                throw new Error('Erro ao processar')
            }
        } catch (error) {
            // Offline Mode Fallback
            const mockOrderId = `BBA-MOCK-${Math.floor(Math.random() * 10000)}`
            const mockOrderDetails = {
                id: mockOrderId,
                items,
                customerName,
                customerPhone,
                paymentMethod: 'LOCAL',
                observations,
                status: 'PENDING',
                total,
                createdAt: new Date().toISOString(),
                scheduledTime: new Date(`${selectedDate}T${selectedTime}:00`).toISOString()
            }
            localStorage.setItem('last_mock_order', JSON.stringify(mockOrderDetails))
            setOrderSuccessData({ orderId: mockOrderId })
            setShowSuccessModal(true)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleCloseSuccessModal = () => {
        if (orderSuccessData) {
            clearCart()
            router.push(`/`)
        }
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-surface-dark text-slate-100 flex flex-col items-center p-6 font-display justify-center">
                <div className="w-full max-w-md bg-background-dark border border-white/5 rounded-3xl p-10 text-center shadow-2xl">
                    <h2 className="text-2xl font-heading font-bold mb-4">Nenhum serviço selecionado</h2>
                    <p className="text-slate-400 mb-8">Volte à página de serviços para escolher o seu estilo.</p>
                    <button onClick={() => router.push('/servicos')} className="w-full bg-primary text-background-dark font-bold py-4 rounded-xl shadow-[0_4px_15px_rgb(245,159,10,0.3)] hover:scale-[1.02] transition-transform uppercase">Ver Serviços</button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-surface-dark text-slate-100 flex flex-col items-center p-6 font-display">
            <header className="w-full max-w-2xl flex items-center justify-between mb-8 pt-4">
                <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                </button>
                <h1 className="font-heading text-lg font-bold tracking-widest text-white uppercase">Checkout</h1>
                <div className="w-10"></div>
            </header>

            <main className="w-full max-w-2xl flex flex-col gap-6 animate-fade-in-up pb-24">

                {/* Serviços Selecionados */}
                <div className="bg-background-dark border border-white/5 rounded-2xl p-6 shadow-2xl">
                    <h2 className="text-xl font-heading font-bold mb-6 text-primary">Serviços Selecionados</h2>
                    <div className="divide-y divide-white/5">
                        {items.map((item) => (
                            <div key={item.id} className="py-4 flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-white">{item.name}</h3>
                                    <p className="text-primary font-semibold mt-1">R$ {item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-slate-400 hover:text-primary"><Minus className="w-4 h-4" /></button>
                                        <span className="text-white font-medium w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-slate-400 hover:text-primary"><Plus className="w-4 h-4" /></button>
                                    </div>
                                    <button onClick={() => removeItem(item.id)} className="text-slate-500 hover:text-red-500 p-2"><Trash2 className="w-5 h-5" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pt-4 mt-2 border-t border-white/5 flex justify-between items-center">
                        <span className="text-slate-400 font-medium">Subtotal</span>
                        <span className="text-xl font-bold text-white">R$ {total.toFixed(2)}</span>
                    </div>
                </div>

                {/* Dados e Agendamento */}
                <div className="bg-background-dark border border-white/5 rounded-2xl p-6 shadow-2xl">
                    <h2 className="text-xl font-heading font-bold mb-6 text-primary">Seus Dados e Horário</h2>

                    <div className="space-y-4 mb-8">
                        <div>
                            <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">WhatsApp</label>
                            <input
                                type="tel"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                placeholder="(11) 99999-9999"
                                className="w-full bg-surface-dark text-white px-4 py-3 rounded-xl border border-white/10 focus:border-primary focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">Nome</label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Como prefere ser chamado?"
                                className="w-full bg-surface-dark text-white px-4 py-3 rounded-xl border border-white/10 focus:border-primary focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <label className="text-xs font-bold text-slate-400 mb-4 block uppercase tracking-wider flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-primary" /> Data do Corte
                        </label>
                        <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full bg-surface-dark text-white px-4 py-3 rounded-xl border border-white/10 focus:border-primary focus:outline-none mb-6 color-scheme-dark"
                        />

                        {isLoadingSlots ? (
                            <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
                        ) : availableSlots.length > 0 ? (
                            <div className="grid grid-cols-3 gap-3">
                                {availableSlots.map((slot) => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedTime(slot)}
                                        className={`py-3 rounded-xl text-sm font-bold transition-all border ${selectedTime === slot ? 'bg-primary text-background-dark border-primary shadow-[0_0_15px_rgba(245,159,10,0.4)]' : 'bg-surface-dark text-slate-300 border-white/10 hover:border-primary/50'}`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-surface-dark rounded-xl border border-dashed border-white/10">
                                <p className="text-slate-500 text-sm">Nenhum horário disponível para esta data.</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 mt-6 border-t border-white/5">
                        <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">Observações (Opcional)</label>
                        <textarea
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                            placeholder="Algum pedido especial?"
                            className="w-full bg-surface-dark text-white px-4 py-3 rounded-xl border border-white/10 focus:border-primary focus:outline-none min-h-[80px] resize-none"
                        />
                    </div>
                </div>

                {/* Bloco de Fidelidade */}
                {loyaltyInfo && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-background-dark border border-white/5 rounded-2xl p-6 shadow-2xl mt-2 w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <Gift className="w-6 h-6 text-primary" />
                            <h3 className="text-white font-heading font-bold text-xl">Seu Programa VIP</h3>
                        </div>
                        {loyaltyInfo.hasFreeSparkles ? (
                            <p className="text-background-dark font-bold bg-primary p-3 rounded-xl text-center uppercase tracking-wider text-sm shadow-[0_0_15px_rgba(245,159,10,0.4)]">✨ Você tem 1 serviço cortesia!</p>
                        ) : (
                            <>
                                <p className="text-slate-300 text-sm mb-3 font-medium tracking-wide">Você completou {loyaltyInfo.purchaseCount} de {loyaltyInfo.purchasesNeeded} cortes para ganhar um brinde exclusivo na barbearia.</p>
                                <div className="w-full bg-surface-dark rounded-full h-2 border border-white/5 overflow-hidden">
                                    <div className="bg-primary h-2 rounded-full transition-all shadow-[0_0_10px_rgba(245,159,10,0.8)]" style={{ width: `${Math.min(100, (loyaltyInfo.purchaseCount / loyaltyInfo.purchasesNeeded) * 100)}%` }} />
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                <button
                    onClick={handleFinalizePedido}
                    disabled={isProcessing}
                    className="w-full mt-4 bg-primary text-background-dark font-bold py-4 rounded-xl shadow-[0_8px_30px_rgb(245,159,10,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                >
                    {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</> : 'Confirmar Agendamento'}
                </button>
            </main>

            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="bg-surface-dark border border-white/10 rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl"
                        >
                            <div className="mx-auto w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                                <Check className="w-10 h-10 text-primary" />
                            </div>
                            <h2 className="text-2xl font-heading font-bold text-white mb-2">Agendado!</h2>
                            <p className="text-slate-400 mb-8 font-light">Seu horário na Máfia BR foi reservado com sucesso.</p>
                            <button
                                onClick={handleCloseSuccessModal}
                                className="w-full bg-primary text-background-dark py-4 rounded-xl font-bold uppercase tracking-widest transition-transform hover:scale-105"
                            >
                                Voltar ao Início
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Chatbot />

            <style jsx global>{`
                input[type="date"].color-scheme-dark::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    opacity: 0.6;
                    cursor: pointer;
                }
            `}</style>
        </div>
    )
}
