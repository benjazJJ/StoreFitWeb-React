import { Link, NavLink } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

export default function BarraNavegacion({ onBuscar }: { onBuscar?: (q?: string) => void }) {
  const { theme, toggleTheme } = useTheme();
  const manejarSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q')?.toString().trim()
    onBuscar?.(q)
  }

  return (
    <nav className={`navbar navbar-expand-lg ${theme === 'dark' ? 'navbar-dark' : 'navbar-light'}`}>
      <div className="container">
        <a className="navbar-brand" href="#">
          <span className="sf-brand">StoreFit</span> <span className="sf-brand fw-semibold">Web</span>
        </a>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navStoreFit">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navStoreFit">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><NavLink className="nav-link" to="/">Inicio</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/Productos">Productos</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/Nosotros">Nosotros</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/Contacto">Contacto</NavLink></li>
          </ul>

          <div className="nav-item dropdown d-flex align-items-center">
            <button
              className="theme-toggle mx-2"
              onClick={(e) => {
                e.preventDefault();
                toggleTheme();
                console.log('Tema actual:', theme);
              }}
              title="Cambiar tema"
            >
              <i
                className={`bi ${theme === 'light' ? 'bi-moon-fill' : 'bi-sun-fill'}`}
                style={{ color: theme === 'dark' ? 'white' : 'black' }}
              ></i>
            </button>
            <button
              className={
                theme === 'dark'
                  ? 'btn btn-outline-light dropdown-toggle d-flex align-items-center'
                  : 'btn btn-outline-secondary dropdown-toggle d-flex align-items-center'
              }
              id="userMenu"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-person-circle" style={{ fontSize: 20, color: theme === 'dark' ? 'white' : 'black' }}></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
              <li><Link className="dropdown-item" to="/InicioSesion">Iniciar sesión</Link></li>
              <li><Link className="dropdown-item" to="/Registro">Crear cuenta</Link></li>
              <li><Link className="dropdown-item" to="/Perfil">Ver perfil</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}
