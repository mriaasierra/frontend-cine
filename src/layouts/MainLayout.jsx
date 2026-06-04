'use client'

import { Sidebar } from '@/src/components/Sidebar'
import { Header } from '@/src/components/Header'
import { ToastContainer } from '@/src/components/ui/Toast'

export function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}
