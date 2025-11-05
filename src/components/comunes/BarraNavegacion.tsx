import { Link, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { usarTema } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function BarraNavegacion({ onBuscar }: { onBuscar?: (q?: string) => void }) {
  const { tema, alternarTema } = usarTema();              // Estado de tema con useState
  const { sesion, cerrarSesion } = useAuth();             // Estado de autenticación con useState
  const { count } = useCart();                            // Estado de carrito con useState
  const [isAdmin, setIsAdmin] = useState<boolean>(!!sesion?.isAdmin); // Flag admin derivado de sesión

  useEffect(() => { setIsAdmin(!!sesion?.isAdmin) }, [sesion]); // Sincroniza flag cuando cambia la sesión

  const manejarSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q')?.toString().trim()
    onBuscar?.(q)
  }

  return (
    <nav className={`navbar navbar-expand-lg ${tema === 'dark' ? 'navbar-dark' : 'navbar-light'}`}>
      <div className="container">
        <a className="navbar-brand" href="#">
          <span className="sf-brand">StoreFit</span>
        </a>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navStoreFit">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navStoreFit">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><NavLink className="nav-link" to="/">Inicio</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/productos">Productos</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/Nosotros">Nosotros</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/Contacto">Contacto</NavLink></li>
            <li className="nav-item">
              <NavLink className="nav-link d-flex align-items-center gap-1" to="/Carrito" aria-label="Carrito">
                <i className="bi bi-cart"></i>
                <span>Carrito</span>
                {count > 0 && <span className="badge bg-secondary ms-1">{count}</span>}
              </NavLink>
            </li>
          </ul>

          <div className="nav-item dropdown d-flex align-items-center">
            <button
              className="theme-toggle mx-2"
              onClick={(e) => {
                e.preventDefault();
                alternarTema();
              }}
              title="Cambiar tema"
            >
              <i
                className={`bi ${tema === 'light' ? 'bi-moon-fill' : 'bi-sun-fill'}`}
                style={{ color: tema === 'dark' ? 'white' : 'black' }}
              ></i>
            </button>
            <button
              className={
                tema === 'dark'
                  ? 'btn btn-outline-light dropdown-toggle d-flex align-items-center'
                  : 'btn btn-outline-secondary dropdown-toggle d-flex align-items-center'
              }
              id="userMenu"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-person-circle" style={{ fontSize: 20, color: tema === 'dark' ? 'white' : 'black' }}></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
              {!sesion && <li><Link className="dropdown-item" to="/InicioSesion">Iniciar sesión</Link></li>}
              {!sesion && <li><Link className="dropdown-item" to="/Registro">Crear cuenta</Link></li>}
              {sesion && <li><Link className="dropdown-item" to="/Perfil">Ver perfil</Link></li>}
              {sesion && <li><Link className="dropdown-item" to="/MisCompras">Mis compras</Link></li>}
              {sesion && (
                <li>
                  <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); cerrarSesion(); }}>
                    Cerrar sesión
                  </a>
                </li>
              )}
              {isAdmin && (
                <li><Link className="dropdown-item" to="/Admin">Admin Dashboard</Link></li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}
