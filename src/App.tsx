import { Routes, Route, Navigate } from "react-router-dom";
import SitioLayout from "./layouts/SitioLayout";

// Pages
import Inicio from "./pages/Inicio/Inicio";
import Productos from "./pages/Productos/Productos";
import Registro from "./pages/Registro/Registro";
import InicioSesion from "./pages/InicioSesion/InicioSesion";
import Contacto from "./pages/Contacto/Contacto";
import Carrito from "./pages/Carrito/Carrito";
import Nosotros from "./pages/Nosotros/Nosotros";
import Blog from "./pages/Blog/Blog";

import { CarritoProveedor } from './context/CarritoContext'
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <CarritoProveedor>
        <Routes>
          <Route path="/" element={<SitioLayout />}>
          <Route index element={<Inicio />} />
          <Route path="Productos" element={<Productos />} />
          <Route path="Registro" element={<Registro />} />
          <Route path="InicioSesion" element={<InicioSesion />} />
          <Route path="Contacto" element={<Contacto />} />
          <Route path="Carrito" element={<Carrito />} />
          <Route path="Nosotros" element={<Nosotros />} />
          <Route path="Blog" element={<Blog />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </CarritoProveedor>
    </ThemeProvider>
  )
}
