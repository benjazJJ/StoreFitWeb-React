import type { PropsWithChildren } from 'react'
import BarraNavegacion from '../components/comunes/BarraNavegacion'
import PiePagina from '../components/comunes/PiePagina'

type Props = PropsWithChildren<{ onBuscar?: (q?: string) => void }>

export default function SitioLayout({ children, onBuscar }: Props) {
  return (
    <div className="d-flex flex-column min-vh-100"> 
      <BarraNavegacion onBuscar={onBuscar} />
      <main className="container my-4 flex-grow-1"> 
        {children}
      </main>
      <PiePagina />
    </div>
  )
}
