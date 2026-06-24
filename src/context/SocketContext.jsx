'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Definimos la URL de websocket. Si es en producción (Vercel) podemos adaptarlo
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000'
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('Conectado al servidor WebSocket')
      setIsConnected(true)
    }

    ws.onmessage = (event) => {
      console.log('Mensaje WebSocket recibido en frontend:', event.data)
    }

    ws.onclose = () => {
      console.log('Desconectado del servidor WebSocket')
      setIsConnected(false)
    }

    setSocket(ws)

    return () => {
      ws.close()
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
