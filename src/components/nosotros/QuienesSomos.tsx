export default function QuienesSomos() {
  return (
    <section aria-labelledby="quienes" className="mb-4">
      <h2 id="quienes" className="fw-bold mb-4" style={{ letterSpacing: ".2px" }}>
        QUIÉNES SOMOS
      </h2>

      <div className="row g-4 align-items-center">
        {/* Imagen ≈25% */}
        <div className="col-12 col-md-4 col-lg-3">
          <img
            src="/img/HombreStoreFit.jpeg"
            alt="Fachada y vitrina de la tienda StoreFit"
            className="img-fluid rounded-3 border-soft"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Texto */}
        <div className="col-12 col-md-8 col-lg-9">
          <p>
            StoreFit es una marca deportiva creada por <strong>Benjamín Palma</strong> y{" "}
            <strong>Gustavo Espinoza</strong> en <em>Huechuraba, Santiago de Chile</em>. Nació con la idea de unir
            la moda deportiva con la tecnología digital, ofreciendo una tienda online que va más allá de la venta de
            ropa: buscamos motivar a cada cliente a llevar una vida equilibrada y activa.
          </p>
          <p>
            Desde nuestros inicios trabajamos con pasión para entregar indumentaria que acompañe tanto a quienes
            entrenan a diario como a quienes recién comienzan en el mundo del deporte. Creemos que la ropa deportiva
            no solo debe verse bien, sino también inspirar a alcanzar metas personales y cuidar la salud.
          </p>
        </div>
      </div>
    </section>
  );
}