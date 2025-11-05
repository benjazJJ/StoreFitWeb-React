import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

export default function UsuariosAdmin() {
  const { usuarios } = useAuth()

  return (
    <main className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="m-0">Usuarios registrados</h1>
        <Link to="/Admin" className="btn btn-outline-secondary btn-sm">Volver al dashboard</Link>
      </div>
      {usuarios.length === 0 ? (
        <div className="text-muted">No hay usuarios registrados en la sesión actual.</div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle table-hover">
            <thead>
              <tr>
                <th>RUT</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Región</th>
                <th>Comuna</th>
                <th>Dirección</th>
                <th>Creado</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td>{u.rut}</td>
                  <td>{u.nombre} {u.apellidos}</td>
                  <td>{u.correo}</td>
                  <td>{u.numeroTelefono}</td>
                  <td>{u.regionId}</td>
                  <td>{u.comunaId}</td>
                  <td>{u.direccion}</td>
                  <td>{new Date(u.createdAt).toLocaleString('es-CL')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
