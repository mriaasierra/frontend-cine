'use client'

import { useAuth } from '@/src/context/AuthContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  UserCircle,
  Film,
  DoorOpen,
  Calendar,
  Package,
  ArrowRightLeft,
  ShoppingCart,
  QrCode,
  Clapperboard
} from 'lucide-react'

const gerenteLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/clientes', label: 'Clientes', icon: UserCircle },
  { href: '/admin/peliculas', label: 'Películas', icon: Film },
  { href: '/admin/salas', label: 'Salas', icon: DoorOpen },
  { href: '/admin/funciones', label: 'Funciones', icon: Calendar },
  { href: '/admin/inventario', label: 'Inventario', icon: Package },
  { href: '/admin/movimientos', label: 'Movimientos', icon: ArrowRightLeft }
]

const empleadoLinks = [
  { href: '/empleado/pos', label: 'Punto de Venta', icon: ShoppingCart },
  { href: '/empleado/validar', label: 'Validar Reservas', icon: QrCode }
]

export function Sidebar() {
  const { isGerente } = useAuth()
  const pathname = usePathname()
  
  const links = isGerente ? gerenteLinks : empleadoLinks

  return (
    <aside className="w-64 bg-slate-900 dark:bg-slate-950 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 dark:border-slate-800">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Clapperboard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-white text-lg">CinemaHub</h2>
          <p className="text-xs text-slate-400">{isGerente ? 'Administración' : 'Empleado'}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {links.map(link => {
            const Icon = link.icon
            const isActive = pathname === link.href
            
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="px-4 py-3 bg-slate-800/50 dark:bg-slate-900/50 rounded-lg">
          <p className="text-xs text-slate-400 mb-1">Estado del Sistema</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm text-emerald-400">Operativo</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
