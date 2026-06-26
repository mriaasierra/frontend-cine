'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, Users, MonitorPlay } from 'lucide-react'
import { roomsApi } from '@/src/services/api'
import { useToast } from '@/src/context/ToastContext'
import { Modal } from '@/src/components/ui/Modal'

// Diccionarios de mapeo para sincronizar el Frontend con las restricciones de la Base de Datos
const dbToFrontStatus = {
  'disponible': 'Disponible',
  'ocupada': 'Mantenimiento',
  'limpieza': 'Fuera de servicio'
}

const frontToDbStatus = {
  'Disponible': 'disponible',
  'Mantenimiento': 'ocupada',
  'Fuera de servicio': 'limpieza'
}

function RoomForm({ room, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    room_number: room?.room_number || '',
    total_capacity: room?.total_capacity || '',
    room_type: room?.room_type || '2D',
    room_status: room?.room_status || 'Disponible'
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const tempErrors = {}
    if (!formData.room_number || Number(formData.room_number) <= 0) {
      tempErrors.room_number = 'Número de sala inválido'
    }
    if (!formData.total_capacity || Number(formData.total_capacity) <= 0) {
      tempErrors.total_capacity = 'La capacidad debe ser mayor a 0'
    }
    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit({
        ...formData,
        room_number: Number(formData.room_number).toString(),
        total_capacity: Number(formData.total_capacity)
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-100">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Número de Sala</label>
          <input
            type="number"
            value={formData.room_number}
            onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
            className={`w-full px-3 py-2 bg-slate-950 border rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all text-sm ${
              errors.room_number ? 'border-red-500' : 'border-slate-800'
            }`}
            required
          />
          {errors.room_number && <p className="text-xs text-red-500 mt-1">{errors.room_number}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Capacidad Total</label>
          <input
            type="number"
            value={formData.total_capacity}
            onChange={(e) => setFormData({ ...formData, total_capacity: e.target.value })}
            className={`w-full px-3 py-2 bg-slate-950 border rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all text-sm ${
              errors.total_capacity ? 'border-red-500' : 'border-slate-800'
            }`}
            required
          />
          {errors.total_capacity && <p className="text-xs text-red-500 mt-1">{errors.total_capacity}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Tipo de Sala</label>
          <select
            value={formData.room_type}
            onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all text-sm cursor-pointer"
          >
            <option value="2D">2D</option>
            <option value="3D">3D</option>
            <option value="VIP">VIP</option>
            <option value="IMAX">IMAX</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Estado</label>
          <select
            value={formData.room_status}
            onChange={(e) => setFormData({ ...formData, room_status: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all text-sm cursor-pointer"
          >
            <option value="Disponible">Disponible</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Fuera de servicio">Fuera de servicio</option>
          </select>
        </div>
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
          {room ? 'Actualizar' : 'Crear Sala'}
        </button>
      </div>
    </form>
  )
}

export default function Salas() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const { success, error } = useToast()

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const data = await roomsApi.getAll()
      // Traducimos los estados técnicos ('disponible', 'ocupada', 'limpieza') a los nombres estéticos del front
      const mappedRooms = (data || []).map(room => ({
        ...room,
        room_status: dbToFrontStatus[room.room_status] || room.room_status
      }))
      setRooms(mappedRooms)
    } catch (err) {
      error('Error al cargar salas')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (formData) => {
    try {
      // Traducimos el estado al valor exacto en minúsculas que la BD requiere
      const apiPayload = {
        ...formData,
        room_status: frontToDbStatus[formData.room_status] || formData.room_status
      }
      const newRoom = await roomsApi.create(apiPayload)
      
      // Mapeamos la respuesta técnica de vuelta a la etiqueta visual antes de guardarla en el array local
      const mappedNewRoom = {
        ...newRoom,
        room_status: dbToFrontStatus[newRoom.room_status] || formData.room_status
      }
      
      setRooms([...rooms, mappedNewRoom])
      setIsModalOpen(false)
      success('Sala creada exitosamente')
    } catch (err) {
      error('Error al crear sala')
    }
  }

  const handleUpdate = async (formData) => {
    try {
      // Traducimos el estado de la interfaz ('Mantenimiento', etc.) al término técnico de la BD ('ocupada', 'limpieza')
      const apiPayload = {
        ...formData,
        room_status: frontToDbStatus[formData.room_status] || formData.room_status
      }
      await roomsApi.update(editingRoom.room_id, apiPayload)
      
      setRooms(rooms.map(r => r.room_id === editingRoom.room_id ? { ...r, ...formData } : r))
      setIsModalOpen(false)
      setEditingRoom(null)
      success('Sala actualizada exitosamente')
    } catch (err) {
      error('Error al actualizar sala')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar esta sala?')) return
    try {
      await roomsApi.delete(id)
      setRooms(rooms.filter(r => r.room_id !== id))
      success('Sala eliminada exitosamente')
    } catch (err) {
      error('Error al eliminar sala')
    }
  }

  const filteredRooms = rooms.filter(room =>
    `Sala ${room.room_number} ${room.room_type}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statusColors = {
    'Disponible': 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40',
    'Mantenimiento': 'bg-amber-950/40 text-amber-400 border border-amber-900/40',
    'Fuera de servicio': 'bg-red-950/40 text-red-400 border border-red-900/40'
  }

  const typeColors = {
    '2D': 'bg-slate-800 border-slate-700',
    '3D': 'bg-blue-600 border-blue-500',
    'VIP': 'bg-gradient-to-r from-amber-500 to-yellow-600 border-amber-500',
    'IMAX': 'bg-red-600 border-red-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Salas</h1>
          <p className="text-sm text-slate-400 mt-1">Gestión de salas de proyección y tipos de sala</p>
        </div>
        <button
          onClick={() => { setEditingRoom(null); setIsModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all font-semibold"
        >
          <Plus className="w-5 h-5" />
          Nueva Sala
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar salas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
        />
      </div>

      {/* Grid */}
      {filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map(room => (
            <div 
              key={room.room_id} 
              className={`bg-slate-900 rounded-2xl border border-slate-805 overflow-hidden group hover:border-slate-700/60 shadow-lg transition-all ${
                room.room_status !== 'Disponible' ? 'opacity-75' : ''
              }`}
            >
              <div className={`h-1.5 ${typeColors[room.room_type] || 'bg-slate-800'}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center">
                      <MonitorPlay className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-white">Sala {room.room_number}</h3>
                      <span className={`inline-block px-2 py-0.5 rounded text-xxs font-bold uppercase mt-1 ${statusColors[room.room_status] || 'bg-slate-800 text-slate-400'}`}>
                        {room.room_status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditingRoom(room); setIsModalOpen(true) }}
                      className="p-2 bg-slate-950/40 border border-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Editar sala"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(room.room_id)}
                      className="p-2 bg-red-950/30 border border-red-900/30 text-red-400 hover:text-white hover:bg-red-900/80 rounded-lg transition-colors"
                      title="Eliminar sala"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800/60 mt-2">
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-3">
                    <p className="text-xxs text-slate-500 font-bold uppercase mb-1">Tipo</p>
                    <p className="font-semibold text-slate-200 text-sm">{room.room_type}</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-3">
                    <div className="flex items-center gap-1 text-xxs text-slate-500 font-bold uppercase mb-1">
                      <Users className="w-3.5 h-3.5" />
                      Capacidad
                    </div>
                    <p className="font-semibold text-slate-200 text-sm">{room.total_capacity} asientos</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl">
          <p className="text-slate-400">No se encontraron salas para los criterios especificados.</p>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingRoom(null) }}
        title={editingRoom ? 'Editar Sala' : 'Nueva Sala'}
      >
        <RoomForm
          room={editingRoom}
          onSubmit={editingRoom ? handleUpdate : handleCreate}
          onCancel={() => { setIsModalOpen(false); setEditingRoom(null) }}
        />
      </Modal>
    </div>
  )
}