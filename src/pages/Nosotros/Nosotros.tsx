import CuadriculaProductos from '../../components/productos/CuadriculaProductos'

export default function Nosotros() {
  return (
    <>
      <header className="mb-4">
        <div className="sf-hero rounded-3 p-4">
          <h1 className="mb-2">Bienvenido/a a <b className="sf-brand">StoreFit</b></h1>
          <p className="text-muted m-0">Ropa deportiva de alto rendimiento con un diseño más moderno.</p>
        </div>
      </header>

      <CuadriculaProductos />
    </>
  )
}
