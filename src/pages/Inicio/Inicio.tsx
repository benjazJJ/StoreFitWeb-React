import { Link } from "react-router-dom";

type Destacado = {
  id: string;
  nombre: string;
  precio: number;
  tag?: "Nuevo" | "Edición limitada";
  emoji?: string;
};

const COLECCION_URBAN_MOTION: Destacado[] = [
  { id: "ux-001", nombre: "Chaqueta Térmica Alpine", precio: 49990, tag: "Nuevo", emoji: "🧥" },
  { id: "ux-002", nombre: "Sneakers RunX Pro", precio: 69990, tag: "Edición limitada", emoji: "👟" },
  { id: "ux-003", nombre: "Top AeroFit Mujer", precio: 25990, tag: "Nuevo", emoji: "🏃‍♀️" },
];

export default function Inicio() {
  return (
    <>
      {/* Hero */}
      <header className="mb-5">
        <div className="sf-hero--textual rounded-4 p-4 p-md-5">
          <div className="sf-hero-content">
            <span className="sf-pill mb-2 d-inline-block">Colección 2025</span>
            <h1 className="display-5 fw-bold mb-2">
              Urban <span className="sf-brand">Motion</span>
            </h1>
            <p className="lead mb-4">
              Tecnología textil y diseño urbano para moverte dentro y fuera del gimnasio.
            </p>

            <div className="d-flex flex-wrap gap-2">
              <Link to="/productos" className="btn btn-primary btn-lg">Ver colección</Link>
              <a href="#marca" className="btn btn-outline-light btn-lg">Cómo lo hacemos</a>
            </div>
          </div>
        </div>
      </header>

      {/* Destacados */}
      <section className="container mb-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="m-0">Nuevos Lanzamientos</h2>
          <Link to="/productos" className="btn btn-outline-secondary btn-sm">Ver catálogo</Link>
        </div>

        <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-3">
          {COLECCION_URBAN_MOTION.map((it) => (
            <div className="col" key={it.id}>
              <article className="sf-tile card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div className="sf-emoji">{it.emoji ?? "✨"}</div>
                    {it.tag && <span className="badge sf-badge-grad">{it.tag}</span>}
                  </div>

                  <h6 className="mb-1">{it.nombre}</h6>
                  <div className="text-muted small mb-3">Colección Urban Motion</div>

                  <strong className="mb-3">
                    {it.precio.toLocaleString("es-CL", { style: "currency", currency: "CLP" })}
                  </strong>

                  <button className="btn btn-outline-secondary btn-sm mt-auto" disabled>
                    Próximamente
                  </button>
                </div>
              </article>
            </div>
          ))}
        </div>
      </section>

      {/* Marca */}
      <section id="marca" className="container mb-5">
        <div className="sf-brand-block rounded-4 p-4 p-md-5">
          <div className="row g-4 align-items-center">
            <div className="col-lg-5">
              <h3 className="fw-bold mb-2">Más que ropa. Un movimiento.</h3>
              <p className="mb-4">
                En StoreFit combinamos rendimiento, estilo y responsabilidad. Diseñamos en Chile,
                producimos con materiales de alta durabilidad y buscamos minimizar nuestro impacto.
              </p>
              <Link to="/productos" className="btn btn-accent">Explorar ahora</Link>
            </div>

            <div className="col-lg-7">
              <div className="row g-3 row-cols-1 row-cols-sm-3">
                <div className="col">
                  <div className="sf-pill-feature h-100">
                    <div className="fs-3 mb-2">🌱</div>
                    <h6 className="mb-1">Sostenibilidad</h6>
                    <small className="text-muted">Telas recicladas y procesos responsables.</small>
                  </div>
                </div>
                <div className="col">
                  <div className="sf-pill-feature h-100">
                    <div className="fs-3 mb-2">⚡</div>
                    <h6 className="mb-1">Rendimiento</h6>
                    <small className="text-muted">DryFlex de secado rápido.</small>
                  </div>
                </div>
                <div className="col">
                  <div className="sf-pill-feature h-100">
                    <img
                      src="/img/flag-cl.svg"
                      alt="Chile"
                      className="mb-2"
                      width={32}
                      height={21}
                      decoding="async"
                      loading="lazy"
                    />
                    <h6 className="mb-1">Diseño local</h6>
                    <small className="text-muted">Inspirado en nuestro entorno urbano.</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
