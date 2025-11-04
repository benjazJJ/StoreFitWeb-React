export default function QuienesSomos() {
  return (
    <section aria-labelledby="quienes" className="ns-section ns-reveal">
      <h2 id="quienes" className="ns-title">QUIÉNES SOMOS</h2>

      <div className="ns-grid ns-grid--quienes">
        {/* Imagen ≈33% */}
        <div>
          <img
            src="/img/HombreStoreFit.jpeg"
            alt="Fachada y vitrina de la tienda StoreFit"
            className="ns-image"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Texto */}
        <div>
          <p className="ns-text">
            StoreFit es una marca deportiva creada por <strong>Benjamín Palma</strong> y{" "}
            <strong>Gustavo Espinoza</strong> en <em>Huechuraba, Santiago de Chile</em>. Nació con la idea de unir
            la moda deportiva con la tecnología digital, ofreciendo una tienda online que va más allá de la venta de
            ropa: buscamos motivar a cada cliente a llevar una vida equilibrada y activa.
          </p>
          <p className="ns-text">
            Desde nuestros inicios trabajamos con pasión para entregar indumentaria que acompañe tanto a quienes
            entrenan a diario como a quienes recién comienzan en el mundo del deporte. Creemos que la ropa deportiva
            no solo debe verse bien, sino también inspirar a alcanzar metas personales y cuidar la salud.
          </p>
        </div>
      </div>
    </section>
  );
}
