'use client'

import { useState, useEffect } from 'react'
import { Search, ArrowUpCircle, ArrowDownCircle, RefreshCw, User, Clock } from 'lucide-react'
import { movementsApi } from '@/src/services/api'
import { useToast } from '@/src/context/ToastContext'

export default function Movimientos() {
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Pagination & Filtering state
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const { error } = useToast()

  useEffect(() => {
    fetchMovements()
  }, [page, filterType])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchMovements()
    }, 300)
    return () => clearTimeout(delayDebounce)
  }, [searchTerm])

  const fetchMovements = async () => {
    try {
      setLoading(true)
      const res = await movementsApi.getAll({
        page,
        limit,
        type: filterType || undefined,
        search: searchTerm || undefined
      })
      
      if (res && res.data) {
        setMovements(res.data)
        setTotal(res.pagination.total)
        setTotalPages(res.pagination.totalPages)
      } else {
        setMovements(res || [])
        setTotal(res?.length || 0)
        setTotalPages(1)
      }
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  const handleTypeChange = (e) => {
    setFilterType(e.target.value)
    setPage(1)
  }

  const typeIcons = {
    'Entrada': ArrowDownCircle,
    'Salida': ArrowUpCircle,
    'Ajuste': RefreshCw
  }

  const typeStyles = {
    'Entrada': 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40',
    'Salida': 'bg-blue-950/40 text-blue-400 border border-blue-900/40',
    'Ajuste': 'bg-amber-950/40 text-amber-400 border border-amber-900/40'
  }

  if (loading && movements.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Movimientos</h1>
        <p className="text-sm text-slate-400 mt-1">Historial de movimientos de entrada y salida de inventario</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950/40 border border-emerald-900/30 rounded-xl">
              <ArrowDownCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Entradas Registradas</p>
              <p className="text-xl font-bold text-white mt-0.5">
                {movements.filter(m => m.type === 'Entrada').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-950/40 border border-blue-900/30 rounded-xl">
              <ArrowUpCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Salidas Registradas</p>
              <p className="text-xl font-bold text-white mt-0.5">
                {movements.filter(m => m.type === 'Salida').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-950/40 border border-amber-900/30 rounded-xl">
              <RefreshCw className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Ajustes Registrados</p>
              <p className="text-xl font-bold text-white mt-0.5">
                {movements.filter(m => m.type === 'Ajuste').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por producto o usuario..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
          />
        </div>
        <select
          value={filterType}
          onChange={handleTypeChange}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer text-sm min-w-[180px]"
        >
          <option value="">Todos los tipos</option>
          <option value="Entrada">Entradas</option>
          <option value="Salida">Salidas</option>
          <option value="Ajuste">Ajustes</option>
        </select>
      </div>

      {/* Timeline */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800/80 overflow-hidden shadow-lg">
        <div className="divide-y divide-slate-800/40">
          {movements.map((movement) => {
            const Icon = typeIcons[movement.type] || RefreshCw
            const { date, time } = formatDateTime(movement.created_at)
            
            return (
              <div key={movement.movement_id} className="p-5 hover:bg-slate-850/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl ${typeStyles[movement.type] || typeStyles['Ajuste']}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white text-base">
                          {movement.type}: {movement.item_name}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 font-medium bg-slate-950/60 border border-slate-850 px-2 py-0.5 rounded-md inline-block">
                          Motivo: {movement.reason}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`font-bold text-lg ${
                          movement.type === 'Entrada' ? 'text-emerald-400' : 
                          movement.type === 'Salida' ? 'text-blue-400' : 'text-amber-400'
                        }`}>
                          {movement.type === 'Entrada' ? '+' : movement.type === 'Salida' ? '-' : ''}
                          {Math.abs(movement.quantity)}
                        </p>
                        <p className="text-xxs text-slate-500 uppercase tracking-wider font-bold">unidades</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 border-t border-slate-800/40 pt-2.5">
                      <span className="flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        Registrado por: <span className="text-slate-300 font-semibold">{movement.user_name}</span>
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {date} a las {time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {movements.length === 0 && (
            <div className="p-12 text-center">
              <RefreshCw className="w-12 h-12 text-slate-700 mx-auto mb-3 animate-spin duration-1000" />
              <p className="text-slate-400 font-medium">No hay movimientos registrados</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 text-slate-400 mt-6">
          <p className="text-sm">
            Mostrando página <span className="font-semibold text-white">{page}</span> de <span className="font-semibold text-white">{totalPages}</span> ({total} movimientos en total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-900 border border-slate-800/80 rounded-xl hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors text-sm font-medium"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-slate-900 border border-slate-800/80 rounded-xl hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors text-sm font-medium"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

