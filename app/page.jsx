'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/context/AuthContext'

export default function Home() {
  const router = useRouter()
  const { user, loading, isGerente } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/login')
      return
    }

    // Redirect based on role
    if (isGerente) {
      router.push('/admin/dashboard')
    } else {
      router.push('/empleado/pos')
    }
  }, [user, loading, isGerente, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-slate-600">Cargando...</p>
      </div>
    </div>
  )
}
