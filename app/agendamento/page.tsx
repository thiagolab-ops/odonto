"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Calendar } from 'lucide-react'

// Simple calendar component natively built using dates
const generateCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []

    // Pad beginning
    for (let i = 0; i < firstDay.getDay(); i++) {
        days.push(null)
    }

    // Days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i))
    }

    return days
}

const AVAILABLE_TIMES = [
    "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"
]

export default function AgendamentoPage() {
    const searchParams = useSearchParams()
    const urlVehicleId = searchParams.get('vehicleId')

    const [loading, setLoading] = useState(true)
    const [vehicles, setVehicles] = useState<any[]>([])

    // Form State
    const [service, setService] = useState('Test Drive')
    const [vehicleId, setVehicleId] = useState(urlVehicleId || '')
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedTime, setSelectedTime] = useState('')

    // User Data (Simple demo version)
    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    // Calendar state
    const today = new Date()
    const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const res = await fetch('/api/veiculos')
                if (res.ok) {
                    const data = await res.json()
                    setVehicles(data.filter((v: any) => v.status === 'AVAILABLE'))
                }
            } catch (err) {
                console.error("Failed to load vehicles", err)
            } finally {
                setLoading(false)
            }
        }
        fetchVehicles()
    }, [])

    const handleMonthChange = (offset: number) => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedDate || !selectedTime || !customerName || !customerPhone) {
            toast.error("Por favor, preencha todos os campos obrigatórios e selecione dia/horário.")
            return
        }

        setIsSubmitting(true)

        try {
            // Combine date and time into a single DateTime
            const [hours, minutes] = selectedTime.split(':').map(Number)
            const scheduledDateTime = new Date(selectedDate)
            scheduledDateTime.setHours(hours, minutes, 0, 0)

            const payload = {
                service,
                vehicleId: vehicleId || null,
                date: scheduledDateTime.toISOString(),
                customerName,
                customerPhone
            }

            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                setIsSuccess(true)
                toast.success("Agendamento confirmado!")
            } else {
                toast.error("Erro ao realizar agendamento.")
            }
        } catch (error) {
            toast.error("Erro de conexão ao servidor.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-4">
                <div className="bg-surface-dark border border-surface-border p-8 rounded-2xl max-w-md text-center">
                    <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl">check</span>
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase mb-2">Agendamento Solicitado!</h2>
                    <p className="text-text-secondary mb-8">
                        Seu pedido para <strong>{service}</strong> foi recebido. Um de nossos consultores entrará em contato em breve para confirmar os detalhes.
                    </p>
                    <Link href="/veiculos" className="bg-primary text-background-dark font-bold px-8 py-3 rounded-xl uppercase tracking-wider block hover:bg-primary-dark transition">
                        Voltar para a Vitrine
                    </Link>
                </div>
            </div>
        )
    }

    const calendarDays = generateCalendarDays(currentMonth.getFullYear(), currentMonth.getMonth())
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

    return (
        <div className="min-h-screen bg-background-dark text-white pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">

                <div className="text-center md:text-left">
                    <Link href="/veiculos" className="text-text-secondary hover:text-white flex items-center gap-2 mb-4 justify-center md:justify-start">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Voltar
                    </Link>
                    <h1 className="text-4xl font-black uppercase tracking-tight">Agendar <span className="text-primary">Visita</span></h1>
                    <p className="text-text-secondary mt-2">Escolha o serviço desejado, o veículo e o melhor horário para você.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* LEFTSIDE: FORM DETAILS */}
                    <form onSubmit={handleSubmit} className="bg-surface-dark border border-surface-border rounded-2xl p-6 flex flex-col gap-6">

                        <div>
                            <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">Serviço Desejado</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {["Test Drive", "Revisão", "Avaliação"].map(s => (
                                    <button
                                        type="button"
                                        key={s}
                                        onClick={() => setService(s)}
                                        className={`py-3 px-2 rounded-xl text-sm font-bold uppercase transition-all ${service === s ? 'bg-primary text-black shadow-[0_0_15px_rgba(245,159,10,0.3)]' : 'bg-background-dark border border-surface-border text-gray-400 hover:border-primary/50'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {(service === 'Test Drive' || service === 'Avaliação') && (
                            <div>
                                <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">Veículo de Interesse</label>
                                {loading ? (
                                    <div className="p-3 bg-background-dark rounded-xl border border-surface-border animate-pulse h-12"></div>
                                ) : (
                                    <select
                                        value={vehicleId}
                                        onChange={e => setVehicleId(e.target.value)}
                                        className="w-full bg-background-dark border border-surface-border rounded-xl p-3 text-white appearance-none focus:border-primary outline-none transition"
                                    >
                                        <option value="">Nenhum específico</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.year})</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-surface-border/50 pt-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">Seu Nome</label>
                                <input
                                    type="text"
                                    required
                                    value={customerName}
                                    onChange={e => setCustomerName(e.target.value)}
                                    placeholder="Ex: João Silva"
                                    className="w-full bg-background-dark border border-surface-border rounded-xl p-3 text-white focus:border-primary outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">Telefone (WhatsApp)</label>
                                <input
                                    type="tel"
                                    required
                                    value={customerPhone}
                                    onChange={e => setCustomerPhone(e.target.value)}
                                    placeholder="(11) 99999-9999"
                                    className="w-full bg-background-dark border border-surface-border rounded-xl p-3 text-white focus:border-primary outline-none transition"
                                />
                            </div>
                        </div>

                        {/* DESKTOP ONLY SUBMIT BUTTON (Optional layout positioning) */}
                        <div className="mt-auto pt-6 hidden md:block">
                            <button
                                type="submit"
                                disabled={isSubmitting || !selectedDate || !selectedTime}
                                className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Processando...' : 'Confirmar Agendamento'}
                            </button>
                        </div>
                    </form>

                    {/* RIGHTSIDE: CALENDAR & TIME */}
                    <div className="flex flex-col gap-6">

                        {/* CALENDAR */}
                        <div className="bg-surface-dark border border-surface-border rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold uppercase tracking-wider">Data</h3>
                                <div className="flex items-center gap-4 text-primary">
                                    <button onClick={() => handleMonthChange(-1)} className="hover:text-white transition"><span className="material-symbols-outlined">chevron_left</span></button>
                                    <span className="font-bold w-32 text-center text-white">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                                    <button onClick={() => handleMonthChange(1)} className="hover:text-white transition"><span className="material-symbols-outlined">chevron_right</span></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                                    <div key={d} className="text-xs text-text-secondary font-bold py-2">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center">
                                {calendarDays.map((date, i) => {
                                    if (!date) return <div key={i} className="p-2" />

                                    const isPast = date < new Date(today.setHours(0, 0, 0, 0))
                                    const isSelected = selectedDate?.toDateString() === date.toDateString()

                                    return (
                                        <button
                                            key={i}
                                            disabled={isPast}
                                            onClick={() => { setSelectedDate(date); setSelectedTime(''); }}
                                            className={`
                                                aspect-square flex items-center justify-center rounded-lg text-sm transition-all
                                                ${isPast ? 'text-gray-600 cursor-not-allowed' : 'hover:bg-primary/20'}
                                                ${isSelected ? 'bg-primary text-black font-bold shadow-[0_0_10px_rgba(245,159,10,0.5)]' : 'text-gray-300'}
                                            `}
                                        >
                                            {date.getDate()}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* TIME SLOTS */}
                        <div className="bg-surface-dark border border-surface-border rounded-2xl p-6">
                            <h3 className="font-bold uppercase tracking-wider mb-6">Horário</h3>
                            {selectedDate ? (
                                <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
                                    {AVAILABLE_TIMES.map(time => (
                                        <button
                                            key={time}
                                            type="button"
                                            onClick={() => setSelectedTime(time)}
                                            className={`
                                                py-2 rounded-lg text-sm font-bold transition-all
                                                ${selectedTime === time ? 'bg-primary text-black border border-primary' : 'bg-background-dark border border-surface-border text-gray-400 hover:border-primary/50'}
                                            `}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-text-secondary text-sm italic text-center py-6">
                                    Selecione uma data no calendário para ver os horários.
                                </p>
                            )}
                        </div>

                        {/* MOBILE ONLY SUBMIT BUTTON */}
                        <div className="md:hidden mt-4">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !selectedDate || !selectedTime}
                                className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Processando...' : 'Confirmar Agendamento'}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
