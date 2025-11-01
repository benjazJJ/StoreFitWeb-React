export default function BarraNavegacion({ onBuscar }: { onBuscar?: (q?: string) => void }) {
  const manejarSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q')?.toString().trim()
    onBuscar?.(q)
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <a className="navbar-brand" href="#">
          <span className="sf-brand">StoreFit</span> <span className="fw-semibold">Web</span>
        </a>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navStoreFit">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navStoreFit">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><a className="nav-link active" href="#">Inicio</a></li>
            <li className="nav-item"><a className="nav-link" href="#">Productos</a></li>
            <li className="nav-item"><a className="nav-link" href="#">Nosotros</a></li>
            <li className="nav-item"><a className="nav-link" href="#">Contacto</a></li>
          </ul>

          <form className="d-flex" role="search" onSubmit={manejarSubmit}>
            <input className="form-control me-2" type="search" name="q" placeholder="Buscar producto..." />
            <button className="btn btn-outline-info" type="submit">Buscar</button>
          </form>
        </div>
      </div>
    </nav>
  )
}
