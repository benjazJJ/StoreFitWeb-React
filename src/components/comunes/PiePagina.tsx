export default function PiePagina() {
  return (
    <footer className="sf-footer py-4 mt-5">
      <div className="container d-flex justify-content-between flex-wrap gap-2">
        <span> © {new Date().getFullYear()} StoreFit. Todos los derechos reservados.</span>
        <span className="small">La calidad no es opción, es compromiso.</span>
      </div>
    </footer>
  )
}

