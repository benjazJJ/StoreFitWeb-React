export default function Vision() {
  return (
    <section aria-labelledby="vision" className="ns-section ns-reveal">
      <h2 id="vision" className="ns-title">VISIÓN</h2>

      <div className="ns-grid ns-grid--vision">
        {/* Texto (izquierda en desktop) */}
        <div>
          <p className="ns-text">
            Buscamos ser la marca deportiva chilena líder en innovación y bienestar, reconocida en toda Latinoamérica
            por promover un estilo de vida activo. Aspiramos a que cada prenda sea un símbolo de motivación y
            superación personal, inspirando a las personas a entrenar, cuidarse y sentirse parte de una comunidad que
            valora la disciplina, la energía positiva y la constancia.
          </p>
        </div>

        {/* Imagen (derecha en desktop) */}
        <div>
          <img
            src="/img/TiendaStoreFit.jpeg"
            alt="Showroom moderno de StoreFit con iluminación y prendas"
            className="ns-image"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}
