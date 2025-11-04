export default function Mision() {
  return (
    <section aria-labelledby="mision" className="ns-section ns-reveal">
      <h2 id="mision" className="ns-title">MISIÓN</h2>

      <div className="ns-grid ns-grid--mision">
        {/* Imagen ≈33% */}
        <div>
          <img
            src="/img/tiendaStoreFit1.jpeg"
            alt="Interior de tienda StoreFit con exhibición de prendas deportivas"
            className="ns-image"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Texto */}
        <div>
          <p className="ns-text">
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
