'use client'

import * as React from 'react'

type Toast = { id: string; title: string; description?: string; type?: 'success' | 'error' }

const ToastContext = React.createContext<{
  push: (toast: Omit<Toast, 'id'>) => void
} | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  function push(toast: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).slice(2, 9)
    setToasts((t) => [...t, { id, ...toast }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 4000)
  }

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed right-4 top-4 flex max-w-xs flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-md p-3 shadow-md text-sm text-white ${t.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}
          >
            <div className="font-medium">{t.title}</div>
            {t.description && <div className="text-xs opacity-90">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
