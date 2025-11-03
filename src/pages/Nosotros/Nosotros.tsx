import Mision from "../../components/nosotros/Mision";
import Vision from "../../components/nosotros/Vision";
import QuienesSomos from "../../components/nosotros/QuienesSomos";

export default function Nosotros() {
  return (
    <>
      {/* Título tipo “pill” con degradé */}
      <header className="mb-5">
        <span
          className="d-inline-block px-4 py-2 rounded-4 fw-bold"
          style={{ background: "var(--sf-grad-acc)", color: "#fff", letterSpacing: ".5px" }}
        >
          NOSOTROS
        </span>
      </header>

      <Mision />
      <Vision />
      <QuienesSomos />
    </>
  );
}