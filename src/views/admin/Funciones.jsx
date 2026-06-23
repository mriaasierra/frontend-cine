'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Trash2, Calendar, Clock, Film, DoorOpen } from 'lucide-react'
import { screeningsApi, moviesApi, roomsApi } from '@/src/services/api'
import { useToast } from '@/src/context/ToastContext'
import { Modal } from '@/src/components/ui/Modal'

function ScreeningForm({ movies, rooms, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    movie_id: '',
    room_id: '',
    date_time: ''
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const tempErrors = {}
    if (!formData.movie_id) tempErrors.movie_id = 'Debe seleccionar una película'
    if (!formData.room_id) tempErrors.room_id = 'Debe seleccionar una sala'
    if (!formData.date_time) {
      tempErrors.date_time = 'La fecha y hora son obligatorias'
    } else {
      const selectedDate = new Date(formData.date_time)
      const now = new Date()
      if (selectedDate <= now) {
        tempErrors.date_time = 'La función debe programarse en una fecha y hora futura'
      }
    }
    
    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit({
        movie_id: Number(formData.movie_id),
        room_id: Number(formData.room_id),
        date_time: formData.date_time
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-100">
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Película</label>
        <select
          value={formData.movie_id}
          onChange={(e) => setFormData({ ...formData, movie_id: e.target.value })}
          className={`w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all text-sm cursor-pointer ${
            errors.movie_id ? 'border-red-500' : 'border-slate-800'
          }`}
          required
        >
          <option value="">Seleccionar película</option>
          {movies.filter(m => m.status === 'Activa').map(movie => (
            <option key={movie.movie_id} value={movie.movie_id}>{movie.title}</option>
          ))}
        </select>
        {errors.movie_id && <p className="text-xs text-red-500 mt-1">{errors.movie_id}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Sala</label>
        <select
          value={formData.room_id}
          onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
          className={`w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all text-sm cursor-pointer ${
            errors.room_id ? 'border-red-500' : 'border-slate-800'
          }`}
          required
        >
          <option value="">Seleccionar sala</option>
          {rooms.filter(r => r.room_status === 'Disponible').map(room => (
            <option key={room.room_id} value={room.room_id}>
              Sala {room.room_number} ({room.room_type}) - {room.total_capacity} asientos
            </option>
          ))}
        </select>
        {errors.room_id && <p className="text-xs text-red-500 mt-1">{errors.room_id}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Fecha y Hora</label>
        <input
          type="datetime-local"
          value={formData.date_time}
          onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
          className={`w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all text-sm ${
            errors.date_time ? 'border-red-500' : 'border-slate-800'
          }`}
          required
        />
        {errors.date_time && <p className="text-xs text-red-500 mt-1">{errors.date_time}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/60 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded-xl transition-colors text-sm font-semibold"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/10 transition-all active:scale-[0.98]"
        >
          Programar Función
        </button>
      </div>
    </form>
  )
}

export default function Funciones() {
  const [screenings, setScreenings] = useState([])
  const [movies, setMovies] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { success, error } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [screeningsData, moviesData, roomsData] = await Promise.all([
        screeningsApi.getAll(),
        moviesApi.getAll(),
        roomsApi.getAll()
      ])
      
      const moviesList = moviesData?.data || moviesData || []
      setMovies(moviesList)
      setRooms(roomsData || [])
      setScreenings(screeningsData || [])
    } catch (err) {
      error('Error al cargar datos de funciones')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (formData) => {
    try {
      const newScreening = await screeningsApi.create(formData)
      const movie = movies.find(m => m.movie_id === formData.movie_id)
      const room = rooms.find(r => r.room_id === formData.room_id)
      setScreenings([...screenings, { 
        ...newScreening, 
        movie_title: movie?.title,
        room_number: room?.room_number,
        room_type: room?.room_type
      }])
      setIsModalOpen(false)
      success('Función programada exitosamente')
    } catch (err) {
      error(err.message || 'Error al programar función')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar esta función?')) return
    try {
      await screeningsApi.delete(id)
      setScreenings(screenings.filter(s => s.screening_id !== id))
      success('Función eliminada exitosamente')
    } catch (err) {
      error('Error al eliminar función')
    }
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' }),
      time: date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const filteredScreenings = screenings.filter(screening =>
    `${screening.movie_title} Sala ${screening.room_number}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupedScreenings = filteredScreenings.reduce((acc, screening) => {
    const date = new Date(screening.date_time).toLocaleDateString('es-MX', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(screening)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Funciones</h1>
          <p className="text-sm text-slate-400 mt-1">Programación y horarios de las películas activas</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all font-semibold"
        >
          <Plus className="w-5 h-5" />
          Nueva Función
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar funciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
        />
      </div>

      <div className="space-y-8">
        {Object.entries(groupedScreenings).map(([date, dayScreenings]) => (
          <div key={date} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800/60 pb-2">
              <Calendar className="w-5 h-5 text-blue-500 shrink-0" />
              <h2 className="font-bold text-lg text-white capitalize">{date}</h2>
              <span className="text-xs text-slate-500 font-semibold">({dayScreenings.length} funciones)</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dayScreenings.map(screening => {
                const { time } = formatDateTime(screening.date_time)
                return (
                  <div 
                    key={screening.screening_id}
                    className="bg-slate-900 rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between hover:border-slate-700/60 shadow-lg group transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-2xl font-black text-white">{time}</p>
                            <p className="text-xxs text-slate-500 uppercase tracking-wider font-bold">Hora de inicio</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(screening.screening_id)}
                          className="p-2 bg-red-950/30 border border-red-900/30 text-red-400 hover:text-white hover:bg-red-900/80 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Eliminar función"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-slate-800/60 mt-2">
                        <div className="flex items-center gap-2.5 text-slate-300">
                          <Film className="w-4 h-4 text-slate-500 shrink-0" />
                          <span className="font-semibold text-sm line-clamp-1">{screening.movie_title}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-400 text-xs">
                          <DoorOpen className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>Sala: <span className="text-slate-300 font-semibold">{screening.room_number}</span></span>
                          <span className="px-2 py-0.5 bg-slate-950 border border-slate-850 rounded text-xxs font-bold text-slate-400">
                            {screening.room_type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {Object.keys(groupedScreenings).length === 0 && (
          <div className="text-center py-12 bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl">
            <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No hay funciones programadas</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Programar Nueva Función"
      >
        <ScreeningForm
          movies={movies}
          rooms={rooms}
          onSubmit={handleCreate}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
