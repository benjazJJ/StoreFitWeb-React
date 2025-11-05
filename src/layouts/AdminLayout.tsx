import { NavLink, Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="container py-4">
      <header className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h1 className="m-0">Panel de administración</h1>
          <small className="text-muted">Gestiona productos, usuarios, pedidos, reportes y mensajes</small>
        </div>
        <nav className="d-flex flex-wrap gap-2">
          <NavLink to="/Admin" end className={({isActive}) => `btn ${isActive ? 'btn-primary' : 'btn-outline-secondary'}`}>Dashboard</NavLink>
          <NavLink to="/Admin/Productos" className={({isActive}) => `btn ${isActive ? 'btn-primary' : 'btn-outline-secondary'}`}>Productos</NavLink>
          <NavLink to="/Admin/Usuarios" className={({isActive}) => `btn ${isActive ? 'btn-primary' : 'btn-outline-secondary'}`}>Usuarios</NavLink>
          <NavLink to="/Admin/Pedidos" className={({isActive}) => `btn ${isActive ? 'btn-primary' : 'btn-outline-secondary'}`}>Pedidos</NavLink>
          <NavLink to="/Admin/Reportes" className={({isActive}) => `btn ${isActive ? 'btn-primary' : 'btn-outline-secondary'}`}>Reportes</NavLink>
          <NavLink to="/Admin/Mensajes" className={({isActive}) => `btn ${isActive ? 'btn-primary' : 'btn-outline-secondary'}`}>Mensajes</NavLink>
        </nav>
      </header>

      <Outlet />
    </div>
  )
}
