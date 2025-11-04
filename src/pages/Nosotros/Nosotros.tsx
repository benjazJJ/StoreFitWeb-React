import Mision from "../../components/nosotros/Mision";
import Vision from "../../components/nosotros/Vision";
import QuienesSomos from "../../components/nosotros/QuienesSomos";
import "../../styles/nosotros.css";

export default function Nosotros() {
  return (
    <div className="nosotros-page">
      <header className="ns-mb-5">
        <span className="ns-pill">NOSOTROS</span>
      </header>

      <Mision />
      <Vision />
      <QuienesSomos />
    </div>
  );
}
