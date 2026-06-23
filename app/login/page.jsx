'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/context/AuthContext'
import { Clapperboard, Lock, Mail, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(email, password)
      if (user.role === 'GERENTE') {
        router.push('/admin/dashboard')
      } else {
        router.push('/empleado/pos')
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Credenciales incorrectas. Intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async (quickEmail, quickPassword) => {
    setEmail(quickEmail)
    setPassword(quickPassword)
    setError('')
    setLoading(true)

    try {
      const user = await login(quickEmail, quickPassword)
      if (user.role === 'GERENTE') {
        router.push('/admin/dashboard')
      } else {
        router.push('/empleado/pos')
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al iniciar sesión rápida.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-violet-600/10 blur-[120px]" />

      <div className="w-full max-w-md p-8 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl relative z-10">
        
        {/* Header/Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3 animate-pulse">
            <Clapperboard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            CinemaHub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Sistema de Gestión y Punto de Venta
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-900/50 rounded-xl flex items-start gap-3 text-red-200 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">Error de autenticación</p>
              <p className="opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@cinelux.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Quick Logins for Testing */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Accesos Rápidos (Demo)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLogin('gerente@cinelux.com', 'admin123')}
              disabled={loading}
              className="py-2.5 px-3 bg-slate-950/40 hover:bg-slate-950 border border-slate-800/60 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-all text-center hover:border-blue-500/40"
            >
              💼 Rol Gerente
            </button>
            <button
              onClick={() => handleQuickLogin('empleado@cinelux.com', 'admin123')}
              disabled={loading}
              className="py-2.5 px-3 bg-slate-950/40 hover:bg-slate-950 border border-slate-800/60 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-all text-center hover:border-violet-500/40"
            >
              🍿 Rol Empleado
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
