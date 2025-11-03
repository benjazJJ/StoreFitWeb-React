import type { PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";
import BarraNavegacion from "../components/comunes/BarraNavegacion";
import PiePagina from "../components/comunes/PiePagina";

type Props = PropsWithChildren<{ onBuscar?: (q?: string) => void }>;

export default function SitioLayout({ children, onBuscar }: Props) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <BarraNavegacion onBuscar={onBuscar} />

      {/* Si viene children (uso antiguo), lo muestra; si no, renderiza la ruta anidada con Outlet */}
      <main className="container my-4 flex-grow-1">
        {children ?? <Outlet />}
      </main>

      <PiePagina />
    </div>
  );
}
