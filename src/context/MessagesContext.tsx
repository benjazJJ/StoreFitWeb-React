import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

export type Message = {
  id: string
  nombre: string
  correo: string
  asunto: string
  mensaje: string
  fecha: string
  leido: boolean
  userKey?: string
  respuesta?: string        // <- NUEVO: texto de respuesta del soporte
}

type MessagesContextType = {
  messages: Message[]
  addMessage: (input: Omit<Message, 'id' | 'fecha' | 'leido' | 'respuesta'>) => Message
  markRead: (id: string, leido?: boolean) => void
  responder: (id: string, respuesta: string) => void   // <- NUEVO
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined)

function rid() {
  try {
    // @ts-ignore
    const a = crypto.getRandomValues(new Uint32Array(2))
    return `${a[0].toString(16)}${a[1].toString(16)}`
  } catch {
    return Math.random().toString(16).slice(2)
  }
}

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])

  const addMessage = useCallback(
    (input: Omit<Message, 'id' | 'fecha' | 'leido' | 'respuesta'>) => {
      const msg: Message = {
        ...input,
        id: rid(),
        fecha: new Date().toISOString(),
        leido: false,
      }
      setMessages((prev) => [msg, ...prev])
      return msg
    },
    []
  )

  const markRead = useCallback((id: string, leido: boolean = true) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, leido } : m)))
  }, [])

  const responder = useCallback((id: string, respuesta: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              respuesta,
              leido: true,
            }
          : m
      )
    )
  }, [])

  const value = useMemo<MessagesContextType>(
    () => ({ messages, addMessage, markRead, responder }),
    [messages, addMessage, markRead, responder]
  )

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>
}

export function useMessages() {
  const ctx = useContext(MessagesContext)
  if (!ctx) throw new Error('useMessages debe usarse dentro de <MessagesProvider>')
  return ctx
}
