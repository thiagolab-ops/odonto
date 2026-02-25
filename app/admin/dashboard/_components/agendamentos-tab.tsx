'use client'

import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, CheckCircle, Clock, X, CheckCheck, CheckCircle2, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

export default function AgendamentosTab() {
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold text-slate-800">Agenda da Clínica</h2>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-colors shadow-sm ${viewMode === 'list' ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-colors shadow-sm ${viewMode === 'calendar' ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
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
                  className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-all shadow-sm border border-slate-200 ${filter === status
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {status === 'PENDING' ? 'Pendentes' :
                    status === 'CONFIRMED' ? 'Confirmados' :
                      status === 'COMPLETED' ? 'Concluídos' :
                        status === 'CANCELLED' ? 'Cancelados' : 'Todos'}

                  {status !== 'Todos' && (
                    <span className="ml-2 bg-slate-100 px-2 py-0.5 rounded-full text-xs text-slate-700 border border-slate-200">
                      {bookings.filter(b => b.status === status).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredBookings.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Nenhum agendamento encontrado nesta categoria.</p>
              ) : (
                filteredBookings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-slate-900 font-bold text-lg flex items-center gap-2">
                          {booking.service}
                        </h4>
                        <p className="text-slate-500 text-sm mt-1">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 border-t border-slate-200 pt-4 mt-2">
                      <div>
                        <h5 className="text-slate-500 font-bold mb-2 text-sm uppercase tracking-wider">Paciente:</h5>
                        <div className="flex flex-col gap-1">
                          {booking.user ? (
                            <p className="text-slate-900 font-bold flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-primary"></span>
                              {booking.user.name || 'Sem Nome'}
                            </p>
                          ) : (
                            <p className="text-slate-400 italic">Paciente Deletado</p>
                          )}
                          <p className="text-slate-600 text-sm font-medium">
                            Telefone: <span className="text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">{booking.user?.email.split('@')[0]}</span>
                          </p>
                        </div>
                      </div>

                      {booking.treatment && (
                        <div>
                          <h5 className="text-slate-500 font-bold mb-2 text-sm uppercase tracking-wider flex items-center gap-1">
                            <Activity className="w-4 h-4 text-primary" /> Procedimento:
                          </h5>
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col justify-center">
                            <p className="text-slate-900 font-bold">{booking.treatment.title}</p>
                            <p className="text-primary text-sm font-bold">R$ {booking.treatment.price.toFixed(2)}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {booking.status === 'PENDING' && (
                      <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-3">
                        <Button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="w-full bg-white border border-red-200 hover:bg-red-50 text-red-500 font-bold py-6 rounded-xl transition shadow-sm"
                        >
                          <X className="w-5 h-5 mr-2" /> REJEITAR
                        </Button>
                        <Button
                          onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                          className="w-full bg-primary hover:bg-blue-600 text-white font-black py-6 rounded-xl transition shadow-sm"
                        >
                          <CheckCircle2 className="w-5 h-5 mr-2" /> CONFIRMAR
                        </Button>
                      </div>
                    )}

                    {booking.status === 'CONFIRMED' && (
                      <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-3">
                        <Button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-4 rounded-xl transition shadow-sm"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => handleCompleteBooking(booking.id)}
                          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition shadow-sm"
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
            <div className="flex items-center justify-between bg-white border border-slate-200 shadow-sm p-4 rounded-xl">
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setDate(newDate.getDate() - 1)
                  setSelectedDate(newDate)
                }}
                className="p-2 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-bold"
              >
                &larr; Anterior
              </button>
              <h3 className="text-xl font-black text-slate-800">
                {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </h3>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setDate(newDate.getDate() + 1)
                  setSelectedDate(newDate)
                }}
                className="p-2 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-bold"
              >
                Próximo &rarr;
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
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
                  <div key={hour} className="flex border-b border-slate-100 min-h-[80px]">
                    <div className="w-20 lg:w-32 bg-slate-50 p-4 flex items-start justify-center text-slate-500 font-bold border-r border-slate-100 shrink-0">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className="flex-1 p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {hourBookings.length === 0 ? (
                        <div className="text-slate-400 text-sm italic flex items-center p-2 opacity-80">Horário Livre</div>
                      ) : (
                        hourBookings.map(b => (
                          <div
                            key={b.id}
                            className={`p-3 rounded-xl border flex flex-col gap-1 shadow-sm ${b.status === 'CONFIRMED'
                              ? 'bg-blue-50 border-blue-200'
                              : b.status === 'COMPLETED' ? 'bg-green-50 border-green-200'
                                : b.status === 'CANCELLED' ? 'bg-red-50 border-red-200'
                                  : 'bg-white border-slate-200'
                              }`}
                          >
                            <p className="font-bold text-slate-800 text-sm truncate flex items-center justify-between gap-2">
                              <span>{b.user?.name || 'Visitante'}</span>
                              {b.status === 'CONFIRMED' && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                              {b.status === 'COMPLETED' && <CheckCheck className="w-4 h-4 text-green-500" />}
                            </p>
                            <p className="text-primary text-xs font-bold">{b.service}</p>
                            <p className="text-slate-500 text-[10px] truncate font-medium">
                              {b.treatment ? b.treatment.title : 'Sem Procedimento Específico'}
                            </p>

                            {b.status === 'PENDING' && (
                              <button onClick={() => updateBookingStatus(b.id, 'CONFIRMED')} className="mt-2 w-full text-[10px] uppercase font-black bg-primary text-white py-1.5 rounded-lg hover:bg-blue-600 transition shadow-sm">
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
