'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, Users, MonitorPlay } from 'lucide-react'
import { roomsApi } from '@/src/services/api'
import { useToast } from '@/src/context/ToastContext'
import { Modal } from '@/src/components/ui/Modal'

function RoomForm({ room, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    room_number: room?.room_number || '',
    total_capacity: room?.total_capacity || '',
    room_type: room?.room_type || '2D',
    room_status: room?.room_status || 'Disponible'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Número de Sala</label>
          <input
            type="number"
            value={formData.room_number}
            onChange={(e) => setFormData({ ...formData, room_number: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Capacidad Total</label>
          <input
            type="number"
            value={formData.total_capacity}
            onChange={(e) => setFormData({ ...formData, total_capacity: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Sala</label>
          <select
            value={formData.room_type}
            onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="2D">2D</option>
            <option value="3D">3D</option>
            <option value="VIP">VIP</option>
            <option value="IMAX">IMAX</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
          <select
            value={formData.room_status}
            onChange={(e) => setFormData({ ...formData, room_status: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Disponible">Disponible</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Fuera de servicio">Fuera de servicio</option>
          </select>
        </div>
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
    // TODO: Connect to backend endpoint: GET /api/rooms
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const data = await roomsApi.getAll()
      setRooms(data)
    } catch (err) {
      error('Error al cargar salas')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (formData) => {
    try {
      // TODO: Connect to backend endpoint: POST /api/rooms
      const newRoom = await roomsApi.create(formData)
      setRooms([...rooms, newRoom])
      setIsModalOpen(false)
      success('Sala creada exitosamente')
    } catch (err) {
      error('Error al crear sala')
    }
  }

  const handleUpdate = async (formData) => {
    try {
      // TODO: Connect to backend endpoint: PUT /api/rooms/:id
      await roomsApi.update(editingRoom.room_id, formData)
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
      // TODO: Connect to backend endpoint: DELETE /api/rooms/:id
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
    'Disponible': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Mantenimiento': 'bg-amber-100 text-amber-700 border-amber-200',
    'Fuera de servicio': 'bg-red-100 text-red-700 border-red-200'
  }

  const typeColors = {
    '2D': 'bg-slate-700',
    '3D': 'bg-blue-600',
    'VIP': 'bg-amber-500',
    'IMAX': 'bg-red-600'
  }

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
          <h1 className="text-2xl font-bold text-slate-800">Salas</h1>
          <p className="text-slate-500">Gestión de salas de proyección</p>
        </div>
        <button
          onClick={() => { setEditingRoom(null); setIsModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Sala
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar salas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map(room => (
          <div 
            key={room.room_id} 
            className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
              room.room_status !== 'Disponible' ? 'opacity-75' : ''
            }`}
          >
            <div className={`h-2 ${typeColors[room.room_type]}`} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${typeColors[room.room_type]} rounded-xl flex items-center justify-center`}>
                    <MonitorPlay className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-800">Sala {room.room_number}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColors[room.room_status]}`}>
                      {room.room_status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditingRoom(room); setIsModalOpen(true) }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(room.room_id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Tipo</p>
                  <p className="font-semibold text-slate-800">{room.room_type}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                    <Users className="w-3 h-3" />
                    Capacidad
                  </div>
                  <p className="font-semibold text-slate-800">{room.total_capacity} asientos</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
