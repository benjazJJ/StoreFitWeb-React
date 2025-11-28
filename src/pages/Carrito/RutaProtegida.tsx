import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function RutaProtegida({ children }: Props) {
  const { sesion } = useAuth();
  const location = useLocation();

  // si NO hay sesión en el contexto => al login
  if (!sesion) {
    return (
      <Navigate
        to="/InicioSesion"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // hay sesión, dejamos pasar
  return <>{children}</>;
}
