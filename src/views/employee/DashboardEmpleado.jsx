'use client'

import { useState, useEffect } from 'react'
import { 
  Film, 
  Clock, 
  DoorOpen,
  ShoppingCart,
  CreditCard,
  X
} from 'lucide-react'
import { moviesApi, screeningsApi, seatsApi, bookingsApi, customersApi } from '@/src/services/api'
import { useToast } from '@/src/context/ToastContext'

// Seat selection grid component
function SeatGrid({ totalSeats = 80, occupiedSeats = [], selectedSeats, onSeatSelect }) {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  const seatsPerRow = Math.ceil(totalSeats / rows.length)

  return (
    <div className="p-4">
      {/* Screen */}
      <div className="mb-8">
        <div className="h-2 bg-gradient-to-r from-slate-300 dark:from-slate-600 via-slate-400 dark:via-slate-500 to-slate-300 dark:to-slate-600 rounded-full mx-8" />
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2">PANTALLA</p>
      </div>

      {/* Seats */}
      <div className="space-y-2">
        {rows.map(row => (
          <div key={row} className="flex items-center gap-2">
            <span className="w-6 text-sm font-medium text-slate-500 dark:text-slate-400">{row}</span>
            <div className="flex gap-1 flex-1 justify-center">
              {Array.from({ length: seatsPerRow }, (_, i) => {
                const seatNumber = `${row}${i + 1}`
                const isOccupied = occupiedSeats.includes(seatNumber)
                const isSelected = selectedSeats.includes(seatNumber)
                
                return (
                  <button
                    key={seatNumber}
                    onClick={() => !isOccupied && onSeatSelect(seatNumber)}
                    disabled={isOccupied}
                    className={`w-8 h-8 rounded-t-lg text-xs font-medium transition-all ${
                      isOccupied 
                        ? 'bg-slate-300 dark:bg-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed' 
                        : isSelected
                          ? 'bg-blue-600 text-white shadow-lg scale-110'
                          : 'bg-slate-700 dark:bg-slate-600 text-slate-300 hover:bg-blue-500 hover:text-white'
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
            <span className="w-6 text-sm font-medium text-slate-500 dark:text-slate-400">{row}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-700 dark:bg-slate-600 rounded-t-lg" />
          <span className="text-slate-500 dark:text-slate-400">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-t-lg" />
          <span className="text-slate-500 dark:text-slate-400">Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-300 dark:bg-slate-500 rounded-t-lg" />
          <span className="text-slate-500 dark:text-slate-400">Ocupado</span>
        </div>
      </div>
    </div>
  )
}

export default function DashboardEmpleado() {
  const [movies, setMovies] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [screenings, setScreenings] = useState([])
  const [selectedScreening, setSelectedScreening] = useState(null)
  const [occupiedSeats, setOccupiedSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState('movies') // movies, times, seats, checkout

  // Order state
  const [selectedSeats, setSelectedSeats] = useState([])
  const [customerData, setCustomerData] = useState({ first_name: '', last_name: '', email: '', phone: '' })
  
  const ticketPrice = 85 // Base ticket price
  const { success, error } = useToast()

  useEffect(() => {
    // TODO: Connect to backend endpoint: GET /api/movies
    fetchMovies()
  }, [])

  const fetchMovies = async () => {
    try {
      const data = await moviesApi.getAll()
      setMovies(data.filter(m => m.status === 'Activa'))
    } catch (err) {
      error('Error al cargar películas')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectMovie = async (movie) => {
    setSelectedMovie(movie)
    setStep('times')
    try {
      // TODO: Connect to backend endpoint: GET /api/screenings?movie_id=:id
      const data = await screeningsApi.getByMovieId(movie.movie_id)
      setScreenings(data)
    } catch (err) {
      error('Error al cargar horarios')
    }
  }

  const handleSelectScreening = async (screening) => {
    setSelectedScreening(screening)
    setStep('seats')
    try {
      // TODO: Connect to backend endpoint: GET /api/seats/availability/:screeningId
      const occupied = await seatsApi.getAvailability(screening.screening_id)
      setOccupiedSeats(occupied)
    } catch (err) {
      error('Error al cargar disponibilidad')
    }
  }

  const handleSeatSelect = (seatNumber) => {
    setSelectedSeats(prev => 
      prev.includes(seatNumber)
        ? prev.filter(s => s !== seatNumber)
        : [...prev, seatNumber]
    )
  }

  const handleCheckout = () => {
    if (selectedSeats.length === 0) {
      error('Seleccione al menos un asiento')
      return
    }
    setStep('checkout')
  }

  const handleProcessPayment = async () => {
    if (!customerData.first_name || !customerData.last_name) {
      error('Ingrese los datos del cliente')
      return
    }

    try {
      // TODO: Connect to backend endpoints
      // 1. Create or find customer: POST /api/customers
      // 2. Create booking: POST /api/bookings
      // 3. Assign seats: POST /api/seats/assign
      
      const customer = await customersApi.create(customerData)
      const booking = await bookingsApi.create({
        customer_id: customer.customer_id,
        screening_id: selectedScreening.screening_id,
        user_id: 1 // Current logged user
      })
      await seatsApi.assign(booking.booking_id, selectedSeats)

      success(`Venta completada - Reserva #${booking.booking_id}`)
      
      // Reset state
      setSelectedMovie(null)
      setSelectedScreening(null)
      setSelectedSeats([])
      setCustomerData({ first_name: '', last_name: '', email: '', phone: '' })
      setStep('movies')
    } catch (err) {
      error('Error al procesar la venta')
    }
  }

  const handleBack = () => {
    if (step === 'times') {
      setSelectedMovie(null)
      setStep('movies')
    } else if (step === 'seats') {
      setSelectedScreening(null)
      setSelectedSeats([])
      setStep('times')
    } else if (step === 'checkout') {
      setStep('seats')
    }
  }

  const handleClearOrder = () => {
    setSelectedMovie(null)
    setSelectedScreening(null)
    setSelectedSeats([])
    setCustomerData({ first_name: '', last_name: '', email: '', phone: '' })
    setStep('movies')
  }

  const subtotal = selectedSeats.length * ticketPrice
  const tax = subtotal * 0.16
  const total = subtotal + tax

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Left Column - Main Content (70%) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Punto de Venta</h1>
            <p className="text-slate-500 dark:text-slate-400">
              {step === 'movies' && 'Seleccione una película'}
              {step === 'times' && `${selectedMovie?.title} - Seleccione horario`}
              {step === 'seats' && 'Seleccione los asientos'}
              {step === 'checkout' && 'Complete la venta'}
            </p>
          </div>
          {step !== 'movies' && (
            <button
              onClick={handleBack}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              ← Volver
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Movies Grid */}
          {step === 'movies' && (
            <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto h-full">
              {movies.map(movie => (
                <button
                  key={movie.movie_id}
                  onClick={() => handleSelectMovie(movie)}
                  className="text-left bg-slate-50 dark:bg-slate-700 rounded-xl p-4 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:ring-2 hover:ring-blue-500 transition-all group"
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 rounded-lg mb-3 flex items-center justify-center">
                    <Film className="w-12 h-12 text-slate-500 dark:text-slate-400 group-hover:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-white line-clamp-2 mb-1">{movie.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Clock className="w-4 h-4" />
                    {movie.duration} min
                  </div>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs text-slate-600 dark:text-slate-300">
                    {movie.genre_name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Screenings / Times */}
          {step === 'times' && (
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <div className="w-16 h-20 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 rounded-lg flex items-center justify-center">
                  <Film className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-slate-800 dark:text-white">{selectedMovie?.title}</h2>
                  <p className="text-slate-500 dark:text-slate-400">{selectedMovie?.director} • {selectedMovie?.duration} min</p>
                </div>
              </div>

              <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Horarios Disponibles</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {screenings.map(screening => {
                  const time = new Date(screening.date_time).toLocaleTimeString('es-MX', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
                  return (
                    <button
                      key={screening.screening_id}
                      onClick={() => handleSelectScreening(screening)}
                      className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:ring-2 hover:ring-blue-500 transition-all text-left"
                    >
                      <p className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{time}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <DoorOpen className="w-4 h-4" />
                        Sala {screening.room_number}
                        <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs">
                          {screening.room_type}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Seat Selection */}
          {step === 'seats' && (
            <div className="p-6 overflow-y-auto h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <DoorOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      Sala {selectedScreening?.room_number} ({selectedScreening?.room_type})
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(selectedScreening?.date_time).toLocaleString('es-MX')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={selectedSeats.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continuar ({selectedSeats.length} asientos)
                </button>
              </div>

              <SeatGrid
                totalSeats={80}
                occupiedSeats={occupiedSeats}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
              />
            </div>
          )}

          {/* Checkout */}
          {step === 'checkout' && (
            <div className="p-6 overflow-y-auto h-full">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Datos del Cliente</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={customerData.first_name}
                    onChange={(e) => setCustomerData({ ...customerData, first_name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Apellido *</label>
                  <input
                    type="text"
                    value={customerData.last_name}
                    onChange={(e) => setCustomerData({ ...customerData, last_name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                    placeholder="Apellido"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                    placeholder="555-1234567"
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-3">Resumen de Compra</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Película</span>
                    <span className="font-medium text-slate-800 dark:text-white">{selectedMovie?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Horario</span>
                    <span className="font-medium text-slate-800 dark:text-white">
                      {new Date(selectedScreening?.date_time).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Asientos</span>
                    <span className="font-medium text-slate-800 dark:text-white">{selectedSeats.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Order Summary (30%) */}
      <div className="w-80 flex flex-col">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h2 className="font-semibold text-slate-800 dark:text-white">Orden Actual</h2>
            </div>
            {(selectedMovie || selectedSeats.length > 0) && (
              <button
                onClick={handleClearOrder}
                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Order Items */}
          <div className="flex-1 p-4 overflow-y-auto">
            {selectedMovie ? (
              <div className="space-y-4">
                {/* Movie */}
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-16 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 rounded flex items-center justify-center flex-shrink-0">
                      <Film className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-800 dark:text-white line-clamp-2">{selectedMovie.title}</h4>
                      {selectedScreening && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {new Date(selectedScreening.date_time).toLocaleString('es-MX', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: 'numeric',
                            month: 'short'
                          })} • Sala {selectedScreening.room_number}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Seats */}
                {selectedSeats.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Asientos seleccionados</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map(seat => (
                        <span 
                          key={seat}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                        >
                          {seat}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">{selectedSeats.length} x ${ticketPrice.toFixed(2)}</span>
                      <span className="font-medium text-slate-800 dark:text-white">${subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">Seleccione una película para comenzar</p>
              </div>
            )}
          </div>

          {/* Totals */}
          {selectedSeats.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                <span className="text-slate-800 dark:text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">IVA (16%)</span>
                <span className="text-slate-800 dark:text-white">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-800 dark:text-white">Total</span>
                <span className="text-blue-600 dark:text-blue-400">${total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Checkout Button */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={step === 'checkout' ? handleProcessPayment : handleCheckout}
              disabled={selectedSeats.length === 0}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              {step === 'checkout' ? 'Procesar Pago' : 'Cobrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
