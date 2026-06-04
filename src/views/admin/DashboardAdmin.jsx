'use client'

import { useState, useEffect } from 'react'
import { 
  CalendarCheck, 
  Film, 
  DoorOpen, 
  TrendingUp,
  AlertTriangle,
  Clock,
  Users
} from 'lucide-react'
import { dashboardApi } from '@/src/services/api'

function StatCard({ title, value, icon: Icon, trend, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    purple: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{value}</p>
          {trend && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    'Confirmada': 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
    'Pendiente': 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
    'Cancelada': 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
    'Ingresado': 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
      {status}
    </span>
  )
}

export default function DashboardAdmin() {
  const [stats, setStats] = useState(null)
  const [recentBookings, setRecentBookings] = useState([])
  const [roomOccupancy, setRoomOccupancy] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Connect to backend endpoints
    const fetchDashboardData = async () => {
      try {
        const [statsData, bookingsData, occupancyData, stockData] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRecentBookings(),
          dashboardApi.getRoomOccupancy(),
          dashboardApi.getLowStock()
        ])
        
        setStats(statsData)
        setRecentBookings(bookingsData)
        setRoomOccupancy(occupancyData)
        setLowStock(stockData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

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
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Resumen general del sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Reservas Activas" 
          value={stats?.activeBookings || 0}
          icon={CalendarCheck}
          trend="+12% vs ayer"
          color="blue"
        />
        <StatCard 
          title="Películas en Cartelera" 
          value={stats?.moviesPlaying || 0}
          icon={Film}
          color="emerald"
        />
        <StatCard 
          title="Salas Disponibles" 
          value={stats?.availableRooms || 0}
          icon={DoorOpen}
          color="amber"
        />
        <StatCard 
          title="Ventas del Día" 
          value={`$${(stats?.todaySales || 0).toLocaleString()}`}
          icon={TrendingUp}
          trend="+8% vs ayer"
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              Reservas Recientes (Web)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Película</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Asientos</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Tiempo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {recentBookings.map(booking => (
                  <tr key={booking.booking_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-3 text-sm font-mono text-slate-600 dark:text-slate-300">#{booking.booking_id}</td>
                    <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-200">{booking.customer_name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{booking.movie_title}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{booking.seats}</td>
                    <td className="px-4 py-3"><StatusBadge status={booking.status} /></td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{booking.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Room Occupancy */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              Ocupación de Salas
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {roomOccupancy.map(room => (
              <div key={room.room_number}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Sala {room.room_number} <span className="text-slate-400 dark:text-slate-500">({room.room_type})</span>
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{room.occupied}/{room.capacity}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      room.percentage > 80 ? 'bg-red-500' : 
                      room.percentage > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${room.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Alertas de Stock Bajo
          </h2>
        </div>
        <div className="p-4">
          {lowStock.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-4">No hay alertas de stock</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {lowStock.map(item => (
                <div 
                  key={item.item_id}
                  className={`p-4 rounded-lg border ${
                    item.status === 'Crítico' 
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                      : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`font-medium ${
                        item.status === 'Crítico' ? 'text-red-800 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'
                      }`}>
                        {item.name}
                      </p>
                      <p className={`text-sm ${
                        item.status === 'Crítico' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        Stock: {item.stock} / Mín: {item.min_stock}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'Crítico' 
                        ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200' 
                        : 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
