'use client'

import { toast, Toaster } from 'sonner'

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="top-right" richColors />
    </>
  )
}

export function useToast() {
  return {
    push: ({ title, description, type }: { title: string; description?: string; type?: 'success' | 'error' }) => {
      if (type === 'error') {
        toast.error(title, {
          description
        })
      } else {
        toast.success(title, {
          description
        })
      }
    }
  }
}
