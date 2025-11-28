import type { Producto } from "../../types/Producto";
import TarjetaProducto from "./TarjetaProducto";

type Props = {
  productos?: Producto[];
};

export default function CuadriculaProductos({ productos = [] }: Props) {
  return (
    <div className="row g-4">
      {productos.map((p) => (
        <div key={p.id} className="col-12 col-sm-6 col-lg-4">
          <TarjetaProducto producto={p} />
        </div>
      ))}
    </div>
  );
}
