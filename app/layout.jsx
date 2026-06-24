import { Analytics } from '@vercel/analytics/next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/src/context/AuthContext'
import { ToastProvider } from '@/src/context/ToastContext'
import { ThemeProvider } from '@/src/context/ThemeContext'
import { SocketProvider } from '@/src/context/SocketContext'

const geistSans = Geist({ 
  subsets: ['latin'],
  variable: '--font-geist-sans'
})

const geistMono = Geist_Mono({ 
  subsets: ['latin'],
  variable: '--font-geist-mono'
})

export const metadata = {
  title: 'CinemaHub - Sistema de Gestión',
  description: 'Panel administrativo y punto de venta para gestión de cine',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>
          <SocketProvider>
            <ThemeProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </ThemeProvider>
          </SocketProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
