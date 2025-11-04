import { Routes, Route, Navigate } from "react-router-dom";
import SitioLayout from "./layouts/SitioLayout";

// Páginas
import Inicio from "./pages/Inicio/Inicio";
import Productos from "./pages/Productos/Productos";
import Registro from "./pages/Registro/Registro";
import InicioSesion from "./pages/InicioSesion/InicioSesion";
import Contacto from "./pages/Contacto/Contacto";
import Carrito from "./pages/Carrito/Carrito";
import Nosotros from "./pages/Nosotros/Nosotros";
import Blog from "./pages/Blog/Blog";
import Pageperfil from "./pages/Perfil/Page";
import AdminProductos from "./pages/Admin/ProductosAdmin";
import { esAdminSesion } from "./services/auth";

import { ProveedorTema } from './context/ThemeContext';
import ProductoDetalle from "./pages/Productos/ProductoDetalle";

export default function App() {
  return (
    <ProveedorTema>
      <Routes>
        <Route path="/" element={<SitioLayout />}>
          <Route index element={<Inicio />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/:id" element={<ProductoDetalle/>} />
          <Route path="Registro" element={<Registro />} />
          <Route path="InicioSesion" element={<InicioSesion />} />
          <Route path="Perfil" element={<Pageperfil />} />
          <Route path="Contacto" element={<Contacto />} />
          <Route path="Carrito" element={<Carrito />} />
          <Route path="Nosotros" element={<Nosotros />} />
          <Route path="Blog" element={<Blog />} />
          <Route path="Admin" element={esAdminSesion() ? <AdminProductos /> : <Navigate to="/InicioSesion" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ProveedorTema>
  )
}
