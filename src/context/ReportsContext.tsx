import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { Producto } from '../types/Producto'

export type ReportType = 'producto_creado' | 'producto_actualizado' | 'producto_eliminado'

export type ReportEntry = {
  id: string
  type: ReportType
  at: string
  by?: string
  producto: Partial<Producto> & { id?: number }
  prev?: Partial<Producto>
  next?: Partial<Producto>
}

type ReportsContextType = {
  entries: ReportEntry[]
  add: (e: Omit<ReportEntry, 'id' | 'at'>) => ReportEntry
  clear: () => void
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined)

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<ReportEntry[]>([])

  const add = useCallback((e: Omit<ReportEntry, 'id' | 'at'>) => {
    const entry: ReportEntry = { ...e, id: cryptoRandom(), at: new Date().toISOString() }
    setEntries(prev => [entry, ...prev])
    return entry
  }, [])

  const clear = useCallback(() => setEntries([]), [])

  const value = useMemo<ReportsContextType>(() => ({ entries, add, clear }), [entries, add, clear])

  return (
    <ReportsContext.Provider value={value}>
      {children}
    </ReportsContext.Provider>
  )
}

export function useReports() {
  const ctx = useContext(ReportsContext)
  if (!ctx) throw new Error('useReports debe usarse dentro de <ReportsProvider>')
  return ctx
}

function cryptoRandom() {
  try {
    // @ts-ignore
    const a = crypto.getRandomValues(new Uint32Array(2))
    return `${a[0].toString(16)}${a[1].toString(16)}`
  } catch {
    return Math.random().toString(16).slice(2)
  }
}

