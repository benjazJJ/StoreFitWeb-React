export default function Mision() {
  return (
    <section aria-labelledby="mision" className="mb-5">
      <h2 id="mision" className="fw-bold mb-4" style={{ letterSpacing: ".2px" }}>
        MISIÓN
      </h2>

      <div className="row g-4 align-items-center">
        {/* Imagen ≈25% */}
        <div className="col-12 col-md-4 col-lg-3">
          <img
            src="/img/tiendaStoreFit1.jpeg"
            alt="Interior de tienda StoreFit con exhibición de prendas deportivas"
            className="img-fluid rounded-3 border-soft"
            loading="lazy"
            decoding="async"
          />
        </div>
        {/* Texto */}
        <div className="col-12 col-md-8 col-lg-9">
          <p>
            En StoreFit nuestra misión es impulsar un estilo de vida activo y saludable a través de ropa deportiva
            que no solo sea cómoda, accesible y de calidad, sino que también se convierta en una fuente de motivación
            para quienes la usan. Diseñamos cada prenda pensando en la funcionalidad, el rendimiento y el estilo,
            para acompañar tanto a deportistas experimentados como a quienes recién comienzan su camino hacia hábitos
            más saludables.
          </p>
        </div>
      </div>
    </section>
  );
}