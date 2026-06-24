'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/src/context/AuthContext'
import { authApi } from '@/src/services/api'
import { 
  User, Camera, Mail, Shield, CheckCircle2, AlertCircle, 
  Loader2, ArrowLeft 
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Perfil() {
  const router = useRouter()
  const { user, setUser } = useAuth()
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  })
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      })
      setProfilePhotoPreview(user.profile_photo || null)
    }
  }, [user])

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'La imagen no puede superar los 2MB' })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setProfilePhotoPreview(event.target?.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const result = await authApi.updateProfile({
        ...formData,
        profile_photo: profilePhotoPreview,
      })

      // Update user in context
      setUser(prev => ({
        ...prev,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        profile_photo: profilePhotoPreview,
      }))

      setMessage({ type: 'success', text: '¡Perfil actualizado exitosamente!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error al actualizar el perfil' })
    }
    setIsSaving(false)
  }

  if (!user) return null

  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()

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
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Mi Perfil</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Administra tu información personal</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
        {/* Gold accent */}
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
        
        {/* Avatar Section */}
        <div className="flex flex-col items-center pt-8 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="relative group mb-4">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-600 border-4 border-amber-500/30 flex items-center justify-center">
              {profilePhotoPreview ? (
                <img
                  src={profilePhotoPreview}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">{initials}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2.5 rounded-full bg-amber-500 text-white shadow-lg hover:bg-amber-600 transition-all transform group-hover:scale-110"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
            {user.first_name} {user.last_name}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Shield className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">{user.role}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                <User className="w-4 h-4 inline-block mr-1" />
                Nombre
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                placeholder="Tu nombre"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                <User className="w-4 h-4 inline-block mr-1" />
                Apellido
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                placeholder="Tu apellido"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              <Mail className="w-4 h-4 inline-block mr-1" />
              Correo electrónico
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          {/* Status info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Rol</p>
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">{user.role}</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Estado</p>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">{user.status || 'Activo'}</p>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`flex items-center gap-3 p-4 rounded-lg border ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
