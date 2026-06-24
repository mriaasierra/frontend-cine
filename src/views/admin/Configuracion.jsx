'use client'

import { useState } from 'react'
import { useAuth } from '@/src/context/AuthContext'
import { authApi } from '@/src/services/api'
import { 
  ArrowLeft, Lock, Eye, EyeOff, Bell, BellOff, Globe, Moon, Sun,
  Shield, CheckCircle2, AlertCircle, Loader2, Trash2, LogOut, Mail
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/src/context/ThemeContext'

export default function Configuracion() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState(null)

  // Preferences state (client-side only)
  const [notifications, setNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)

  // Delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordMessage(null)

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMessage({ type: 'error', text: 'Las contraseñas nuevas no coinciden' })
      return
    }

    if (passwordForm.new_password.length < 6) {
      setPasswordMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' })
      return
    }

    setIsChangingPassword(true)
    try {
      await authApi.updateProfile({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      })
      setPasswordMessage({ type: 'success', text: '¡Contraseña actualizada exitosamente!' })
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.message || 'Error al cambiar la contraseña' })
    }
    setIsChangingPassword(false)
  }

  if (!user) return null

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Configuración</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Seguridad y preferencias de tu cuenta</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Change Password */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Cambiar Contraseña</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Asegura tu cuenta con una contraseña fuerte</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  Contraseña actual
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  Confirmar nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    placeholder="Repite la nueva contraseña"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password status message */}
              {passwordMessage && (
                <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                  passwordMessage.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                }`}>
                  {passwordMessage.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium">{passwordMessage.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full py-3 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar Contraseña'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400" />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Notificaciones</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Controla cómo recibes alertas</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Push */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-3">
                  {notifications ? (
                    <Bell className="w-5 h-5 text-amber-500" />
                  ) : (
                    <BellOff className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">Notificaciones push</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Alertas en tiempo real</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    notifications ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
                    notifications ? 'left-6' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">Notificaciones por email</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Resúmenes y alertas al correo</p>
                  </div>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    emailNotifications ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
                    emailNotifications ? 'left-6' : 'left-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Apariencia</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Personaliza la interfaz</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-amber-500" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">Tema</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isDarkMode ? 'Modo oscuro activado' : 'Modo claro activado'}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 p-1 bg-slate-200 dark:bg-slate-600 rounded-lg">
                <button
                  onClick={() => { if (isDarkMode) toggleTheme() }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    !isDarkMode ? 'bg-amber-500 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { if (!isDarkMode) toggleTheme() }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isDarkMode ? 'bg-amber-500 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info & Danger Zone */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400" />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Cuenta</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Información y acciones de cuenta</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Rol</p>
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">{user.role}</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Estado</p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">{user.status || 'Activo'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Zona de peligro</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Acciones irreversibles</p>
                </div>
                <button
                  onClick={() => {
                    logout()
                    router.push('/login')
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
