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

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Película</label>
        <select
          value={formData.movie_id}
          onChange={(e) => setFormData({ ...formData, movie_id: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Seleccionar película</option>
          {movies.filter(m => m.status === 'Activa').map(movie => (
            <option key={movie.movie_id} value={movie.movie_id}>{movie.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Sala</label>
        <select
          value={formData.room_id}
          onChange={(e) => setFormData({ ...formData, room_id: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Seleccionar sala</option>
          {rooms.filter(r => r.room_status === 'Disponible').map(room => (
            <option key={room.room_id} value={room.room_id}>
              Sala {room.room_number} ({room.room_type}) - {room.total_capacity} asientos
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Fecha y Hora</label>
        <input
          type="datetime-local"
          value={formData.date_time}
          onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
    // TODO: Connect to backend endpoints
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [screeningsData, moviesData, roomsData] = await Promise.all([
        screeningsApi.getAll(),
        moviesApi.getAll(),
        roomsApi.getAll()
      ])
      setScreenings(screeningsData)
      setMovies(moviesData)
      setRooms(roomsData)
    } catch (err) {
      error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (formData) => {
    try {
      // TODO: Connect to backend endpoint: POST /api/screenings
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
      error('Error al programar función')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar esta función?')) return
    try {
      // TODO: Connect to backend endpoint: DELETE /api/screenings/:id
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

  // Group by date
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Funciones</h1>
          <p className="text-slate-500">Programación de funciones</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Función
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar funciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {Object.entries(groupedScreenings).map(([date, dayScreenings]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-slate-800 capitalize">{date}</h2>
              <span className="text-sm text-slate-500">({dayScreenings.length} funciones)</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dayScreenings.map(screening => {
                const { time } = formatDateTime(screening.date_time)
                return (
                  <div 
                    key={screening.screening_id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-800">{time}</p>
                          <p className="text-xs text-slate-500">Hora de inicio</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(screening.screening_id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Film className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{screening.movie_title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <DoorOpen className="w-4 h-4 text-slate-400" />
                        <span>Sala {screening.room_number}</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">
                          {screening.room_type}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {Object.keys(groupedScreenings).length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No hay funciones programadas</p>
          </div>
        )}
      </div>

      {/* Modal */}
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
