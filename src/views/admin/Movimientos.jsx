'use client'

import { useState, useEffect } from 'react'
import { Search, ArrowUpCircle, ArrowDownCircle, RefreshCw, User, Clock } from 'lucide-react'
import { movementsApi } from '@/src/services/api'
import { useToast } from '@/src/context/ToastContext'

export default function Movimientos() {
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const { error } = useToast()

  useEffect(() => {
    // TODO: Connect to backend endpoint: GET /api/movements
    fetchMovements()
  }, [])

  const fetchMovements = async () => {
    try {
      const data = await movementsApi.getAll()
      setMovements(data)
    } catch (err) {
      error('Error al cargar movimientos')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          movement.user_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filterType || movement.type === filterType
    return matchesSearch && matchesType
  })

  const typeIcons = {
    'Entrada': ArrowDownCircle,
    'Salida': ArrowUpCircle,
    'Ajuste': RefreshCw
  }

  const typeStyles = {
    'Entrada': 'bg-emerald-100 text-emerald-700',
    'Salida': 'bg-blue-100 text-blue-700',
    'Ajuste': 'bg-amber-100 text-amber-700'
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
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Movimientos</h1>
        <p className="text-slate-500">Historial de movimientos de inventario</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <ArrowDownCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Entradas Hoy</p>
              <p className="text-xl font-bold text-slate-800">
                {movements.filter(m => m.type === 'Entrada').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ArrowUpCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Salidas Hoy</p>
              <p className="text-xl font-bold text-slate-800">
                {movements.filter(m => m.type === 'Salida').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <RefreshCw className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Ajustes Hoy</p>
              <p className="text-xl font-bold text-slate-800">
                {movements.filter(m => m.type === 'Ajuste').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por producto o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos los tipos</option>
          <option value="Entrada">Entradas</option>
          <option value="Salida">Salidas</option>
          <option value="Ajuste">Ajustes</option>
        </select>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="divide-y divide-slate-200">
          {filteredMovements.map((movement, index) => {
            const Icon = typeIcons[movement.type]
            const { date, time } = formatDateTime(movement.created_at)
            
            return (
              <div key={movement.movement_id} className="p-4 hover:bg-slate-50">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${typeStyles[movement.type]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-800">
                          {movement.type}: {movement.item_name}
                        </p>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {movement.reason}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`font-bold text-lg ${
                          movement.type === 'Entrada' ? 'text-emerald-600' : 
                          movement.type === 'Salida' ? 'text-blue-600' : 'text-amber-600'
                        }`}>
                          {movement.type === 'Entrada' ? '+' : movement.type === 'Salida' ? '-' : ''}
                          {Math.abs(movement.quantity)}
                        </p>
                        <p className="text-xs text-slate-400">unidades</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {movement.user_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {date} a las {time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {filteredMovements.length === 0 && (
            <div className="p-8 text-center">
              <RefreshCw className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No hay movimientos registrados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
