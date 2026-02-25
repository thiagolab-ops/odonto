'use client'

import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, CheckCircle, Clock, X, CheckCheck, CheckCircle2, Car } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

export default function PedidosTab() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Todos')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Modal de confirmação
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)

  useEffect(() => {
    fetchBookings()
    const interval = setInterval(fetchBookings, 10000) // 10s pra não pesar muito
    return () => clearInterval(interval)
  }, [])

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings')
      if (!res.ok) throw new Error('Falha na API')

      const data = await res.json()

      // Filtra por data selecionada se estiver no modo calendário
      setBookings(data)
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
      toast.error('Não foi possível carregar os agendamentos em tempo real.')
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error()

      toast.success(`Status atualizado para: ${newStatus}`)

      // Update local state immediately for snappy UI
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))
    } catch (error) {
      toast.error('Erro ao atualizar status na API')
    }
  }

  const openConfirmModal = (booking: any) => {
    setSelectedBooking(booking)
    setShowConfirmModal(true)
  }

  const handleConfirmBooking = () => {
    if (selectedBooking) {
      updateBookingStatus(selectedBooking.id, 'CONFIRMED')
      setShowConfirmModal(false)
      setSelectedBooking(null)
    }
  }

  const handleCompleteBooking = (bookingId: string) => {
    if (confirm('Tem certeza que este agendamento foi concluído?')) {
      updateBookingStatus(bookingId, 'COMPLETED')
    }
  }

  const handleCancelBooking = (bookingId: string) => {
    if (confirm('Deseja realmente CANCELAR este agendamento?')) {
      updateBookingStatus(bookingId, 'CANCELLED')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
      case 'CONFIRMED': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'COMPLETED': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'CANCELLED': return 'bg-red-500/20 text-red-500 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const statuses = ['Todos', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

  const filteredBookings = filter === 'Todos'
    ? bookings
    : bookings.filter(b => b.status === filter)

  if (loading) {
    return <div className="text-white text-center py-12">Carregando agendamentos...</div>
  }

  return (
    <>
      <div className="bg-gray-800 rounded-xl border border-primary/30 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold text-white">Agendamentos</h2>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-900 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'calendar' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Calendário Diário
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="flex flex-col">
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${filter === status
                    ? 'bg-primary text-black'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                >
                  {status === 'PENDING' ? 'Pendentes' :
                    status === 'CONFIRMED' ? 'Confirmados' :
                      status === 'COMPLETED' ? 'Concluídos' :
                        status === 'CANCELLED' ? 'Cancelados' : 'Todos'}

                  {status !== 'Todos' && (
                    <span className="ml-2 bg-gray-900/40 px-2 py-0.5 rounded-full text-xs">
                      {bookings.filter(b => b.status === status).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum agendamento encontrado nesta categoria.</p>
              ) : (
                filteredBookings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-white font-bold text-lg flex items-center gap-2">
                          {booking.service}
                        </h4>
                        <p className="text-gray-400 text-sm mt-1">
                          Solicitado em: {new Date(booking.createdAt).toLocaleString('pt-BR')}
                        </p>
                        <div className="mt-3 bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center gap-3 w-fit">
                          <Clock className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-xs text-primary/70 font-bold uppercase tracking-wider mb-0.5">Data/Hora Agendada</p>
                            <p className="text-primary font-bold text-lg leading-none">
                              {new Date(booking.date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(booking.status)}`}>
                          {booking.status === 'PENDING' ? 'PENDENTE' : booking.status === 'CONFIRMED' ? 'CONFIRMADO' : booking.status === 'COMPLETED' ? 'CONCLUÍDO' : 'CANCELADO'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 border-t border-gray-600 pt-4">
                      <div>
                        <h5 className="text-gray-300 font-semibold mb-2 text-sm uppercase tracking-wider">Cliente:</h5>
                        <div className="flex flex-col gap-1">
                          {booking.user ? (
                            <p className="text-white font-medium flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-primary"></span>
                              {booking.user.name || 'Sem Nome'}
                            </p>
                          ) : (
                            <p className="text-gray-400 italic">Usuário Deletado</p>
                          )}
                          <p className="text-gray-400 text-sm">
                            Telefone: <span className="text-white bg-gray-800 px-2 py-0.5 rounded">{booking.user?.email.split('@')[0]}</span>
                          </p>
                        </div>
                      </div>

                      {booking.vehicle && (
                        <div>
                          <h5 className="text-gray-300 font-semibold mb-2 text-sm uppercase tracking-wider flex items-center gap-1">
                            <Car className="w-4 h-4" /> Veículo Solicitado:
                          </h5>
                          <div className="bg-gray-800 p-3 rounded-lg border border-gray-600 h-full flex flex-col justify-center">
                            <p className="text-white font-bold">{booking.vehicle.brand} {booking.vehicle.model}</p>
                            <p className="text-primary text-sm font-bold">{booking.vehicle.year}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {booking.status === 'PENDING' && (
                      <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 gap-3">
                        <Button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="w-full bg-transparent border-2 border-gray-500 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500 text-gray-400 font-bold py-6 rounded-lg transition"
                        >
                          <X className="w-5 h-5 mr-2" /> REJEITAR
                        </Button>
                        <Button
                          onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                          className="w-full bg-[#D4AF37] hover:bg-[#B8962E] text-black font-black py-6 rounded-lg transition"
                        >
                          <CheckCircle2 className="w-5 h-5 mr-2 text-black" /> CONFIRMAR
                        </Button>
                      </div>
                    )}

                    {booking.status === 'CONFIRMED' && (
                      <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 gap-3">
                        <Button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="w-full bg-transparent border border-gray-600 hover:bg-gray-600 text-gray-300 font-bold py-4 rounded-lg transition"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => handleCompleteBooking(booking.id)}
                          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-lg transition shadow-[0_0_15px_rgba(22,163,74,0.3)]"
                        >
                          Finalizar Atendimento
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )
                )
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setDate(newDate.getDate() - 1)
                  setSelectedDate(newDate)
                }}
                className="p-2 hover:bg-gray-600 rounded text-white"
              >
                &larr; Anterior
              </button>
              <h3 className="text-xl font-bold text-primary">
                {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </h3>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setDate(newDate.getDate() + 1)
                  setSelectedDate(newDate)
                }}
                className="p-2 hover:bg-gray-600 rounded text-white"
              >
                Próximo &rarr;
              </button>
            </div>

            <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
              {Array.from({ length: 11 }, (_, i) => i + 8).map(hour => {
                const hourBookings = bookings.filter(b => {
                  if (!b.date) return false
                  const date = new Date(b.date)
                  return date.getDate() === selectedDate.getDate() &&
                    date.getMonth() === selectedDate.getMonth() &&
                    date.getFullYear() === selectedDate.getFullYear() &&
                    date.getHours() === hour
                })

                return (
                  <div key={hour} className="flex border-b border-gray-800 min-h-[80px]">
                    <div className="w-20 lg:w-32 bg-gray-800/50 p-4 flex items-start justify-center text-gray-400 font-bold border-r border-gray-800 shrink-0">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className="flex-1 p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {hourBookings.length === 0 ? (
                        <div className="text-gray-600 text-sm italic flex items-center p-2 opacity-50">Livre</div>
                      ) : (
                        hourBookings.map(b => (
                          <div
                            key={b.id}
                            className={`p-3 rounded-lg border flex flex-col gap-1 ${b.status === 'CONFIRMED'
                              ? 'bg-blue-500/10 border-blue-500/30'
                              : b.status === 'COMPLETED' ? 'bg-green-500/10 border-green-500/30'
                                : b.status === 'CANCELLED' ? 'bg-red-500/10 border-red-500/30'
                                  : 'bg-primary/10 border-primary/30'
                              }`}
                          >
                            <p className="font-bold text-white text-sm truncate flex items-center justify-between gap-2">
                              <span>{b.user?.name || 'Visitante'}</span>
                              {b.status === 'CONFIRMED' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                              {b.status === 'COMPLETED' && <CheckCheck className="w-4 h-4 text-green-400" />}
                            </p>
                            <p className="text-gray-300 text-xs font-semibold">{b.service}</p>
                            <p className="text-gray-500 text-[10px] truncate">
                              {b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : 'Sem Veículo Específico'}
                            </p>

                            {b.status === 'PENDING' && (
                              <button onClick={() => updateBookingStatus(b.id, 'CONFIRMED')} className="mt-2 w-full text-[10px] uppercase font-bold bg-primary text-black py-1 rounded hover:bg-primary-dark">
                                Confirmar
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
