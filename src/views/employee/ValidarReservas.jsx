'use client'

import { useState } from 'react'
import { 
  QrCode, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock,
  Film,
  DoorOpen,
  User,
  Ticket,
  ArrowRight
} from 'lucide-react'
import { bookingsApi } from '@/src/services/api'
import { useToast } from '@/src/context/ToastContext'

export default function ValidarReservas() {
  const [bookingId, setBookingId] = useState('')
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(false)
  const [validated, setValidated] = useState(false)
  const { success, error } = useToast()

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!bookingId.trim()) {
      error('Ingrese un ID de reserva')
      return
    }

    setLoading(true)
    setBooking(null)
    setValidated(false)

    try {
      // TODO: Connect to backend endpoint: GET /api/bookings/:id
      const data = await bookingsApi.getById(bookingId)
      setBooking(data)
    } catch (err) {
      error('Reserva no encontrada')
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async () => {
    try {
      // TODO: Connect to backend endpoint: PATCH /api/bookings/:id/checkin
      await bookingsApi.checkIn(booking.booking_id)
      setValidated(true)
      success('Entrada validada correctamente')
    } catch (err) {
      error('Error al validar entrada')
    }
  }

  const handleClear = () => {
    setBookingId('')
    setBooking(null)
    setValidated(false)
  }

  const statusColors = {
    'Confirmada': 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    'Pendiente': 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    'Cancelada': 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    'Ingresado': 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <QrCode className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Validar Reservas</h1>
        <p className="text-slate-500 dark:text-slate-400">Escanee o ingrese el ID de reserva para validar la entrada</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          ID de Reserva
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="Ej: 1001"
              className="w-full pl-12 pr-4 py-4 text-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Buscar
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Booking Result */}
      {booking && (
        <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 overflow-hidden transition-all ${
          validated ? 'border-emerald-300 dark:border-emerald-600' : 'border-slate-200 dark:border-slate-700'
        }`}>
          {/* Status Header */}
          <div className={`px-6 py-4 ${validated ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {validated ? (
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                ) : booking.booking_status === 'Confirmada' ? (
                  <Ticket className="w-8 h-8 text-blue-500" />
                ) : booking.booking_status === 'Cancelada' ? (
                  <XCircle className="w-8 h-8 text-red-500" />
                ) : (
                  <Clock className="w-8 h-8 text-amber-500" />
                )}
                <div>
                  <p className="font-bold text-lg text-slate-800 dark:text-white">
                    Reserva #{booking.booking_id}
                  </p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${
                    validated ? statusColors['Ingresado'] : statusColors[booking.booking_status]
                  }`}>
                    {validated ? 'Ingresado' : booking.booking_status}
                  </span>
                </div>
              </div>
              {validated && (
                <div className="text-right">
                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold">Entrada Validada</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{new Date().toLocaleTimeString('es-MX')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Details */}
          <div className="p-6 space-y-6">
            {/* Customer */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-slate-500 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Cliente</p>
                <p className="font-semibold text-lg text-slate-800 dark:text-white">{booking.customer_name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{booking.customer_email}</p>
              </div>
            </div>

            {/* Movie & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Film className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">Película</span>
                </div>
                <p className="font-semibold text-slate-800 dark:text-white">{booking.movie_title}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">Horario</span>
                </div>
                <p className="font-semibold text-slate-800 dark:text-white">
                  {new Date(booking.screening_time).toLocaleString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: 'numeric',
                    month: 'short'
                  })}
                </p>
              </div>
            </div>

            {/* Room & Seats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <DoorOpen className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">Sala</span>
                </div>
                <p className="font-semibold text-slate-800 dark:text-white">Sala {booking.room_number}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Ticket className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">Asientos</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {booking.seats?.map(seat => (
                    <span key={seat} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded text-sm font-medium">
                      {seat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
            {booking.booking_status === 'Confirmada' && !validated ? (
              <div className="flex gap-3">
                <button
                  onClick={handleValidate}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-6 h-6" />
                  Marcar como Ingresado
                </button>
                <button
                  onClick={handleClear}
                  className="px-6 py-4 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                >
                  Limpiar
                </button>
              </div>
            ) : validated ? (
              <button
                onClick={handleClear}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
              >
                Validar Nueva Entrada
              </button>
            ) : booking.booking_status === 'Cancelada' ? (
              <div className="text-center py-2">
                <p className="text-red-600 dark:text-red-400 font-medium">Esta reserva ha sido cancelada</p>
                <button
                  onClick={handleClear}
                  className="mt-3 px-6 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                >
                  Buscar otra reserva
                </button>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-amber-600 dark:text-amber-400 font-medium">Esta reserva está pendiente de confirmación</p>
                <button
                  onClick={handleClear}
                  className="mt-3 px-6 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                >
                  Buscar otra reserva
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Instructions */}
      {!booking && !loading && (
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Instrucciones</h3>
          <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              Solicite al cliente su número de reserva o escanee el código QR
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              Ingrese el ID en el campo de búsqueda y presione Buscar
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              Verifique los datos del cliente y la reserva
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              Presione &quot;Marcar como Ingresado&quot; para validar la entrada
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
