'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../services/api' // Asegúrate de que la ruta hacia tu api.js sea la correcta

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // 1. VERIFICAR SESIÓN ACTIVA AL CARGAR LA PÁGINA
  useEffect(() => {
    const verificarSesion = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        // Consultamos al endpoint /api/auth/me usando el servicio real
        const perfil = await authApi.getProfile()
        setUser({
          id: perfil.user_id,
          first_name: perfil.first_name,
          last_name: perfil.last_name,
          email: perfil.email,
          role: perfil.role_name, // Viene normalizado en MAYÚSCULAS desde api.js
          status: 'Activo'
        })
      } catch (error) {
        console.error('Sesión expirada o token inválido:', error)
        localStorage.removeItem('token')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    verificarSesion()
  }, [])

  // 2. FUNCIÓN DE LOGIN REAL
  const loginReal = async (email, password) => {
    try {
      const respuesta = await authApi.login(email, password)
      // respuesta.user ya contiene id, first_name, last_name y role en MAYÚSCULAS
      setUser(respuesta.user)
      return respuesta.user
    } catch (error) {
      // Re-lanzamos el error para que el formulario de login pueda mostrar el mensaje en pantalla
      throw error
    }
  }

  // 3. FUNCIÓN DE LOGOUT REAL
  const logoutReal = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  // Guardianes dinámicos basados en el usuario actual (usamos ?. para evitar errores si user es null)
  const isGerente = user?.role === 'GERENTE'
  const isEmpleado = user?.role === 'EMPLEADO'

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        setUser, 
        login: loginReal, 
        logout: logoutReal, 
        loading, 
        isGerente, 
        isEmpleado 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}