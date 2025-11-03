export default function Vision() {
  return (
    <section aria-labelledby="vision" className="mb-5">
      <div className="row g-4 align-items-center">
        {/* Texto */}
        <div className="col-12 col-md-9 col-lg-9 order-md-1">
          <h2 id="vision" className="fw-bold mb-4" style={{ letterSpacing: ".2px" }}>
            VISIÓN
          </h2>
          <p>
            Buscamos ser la marca deportiva chilena líder en innovación y bienestar, reconocida en toda Latinoamérica
            por promover un estilo de vida activo. Aspiramos a que cada prenda sea un símbolo de motivación y
            superación personal, inspirando a las personas a entrenar, cuidarse y sentirse parte de una comunidad que
            valora la disciplina, la energía positiva y la constancia.
          </p>
        </div>

        {/* Imagen ≈25% (derecha en desktop) */}
        <div className="col-12 col-md-3 col-lg-3 order-md-2">
          <img
            src="/img/TiendaStoreFit.jpeg"
            alt="Showroom moderno de StoreFit con iluminación y prendas"
            className="img-fluid rounded-3 border-soft"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}