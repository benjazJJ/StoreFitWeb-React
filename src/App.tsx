import { Routes, Route, Navigate } from "react-router-dom";
import type React from 'react';
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
import MisCompras from "./pages/Perfil/MisCompras";
import AdminProductos from "./pages/Admin/ProductosAdmin";
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductsProvider } from './context/ProductsContext';
import { StockProvider } from './context/StockContext';
import { CartProvider } from './context/CartContext';
import { OrdersProvider } from './context/OrdersContext';

import { ProveedorTema } from './context/ThemeContext';
import ProductoDetalle from "./pages/Productos/ProductoDetalle";
import Checkout from "./pages/Carrito/Checkout";

// Ruta protegida para admin usando estado global (useState en AuthContext)
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { sesion } = useAuth()
  return sesion?.isAdmin ? <>{children}</> : <Navigate to="/InicioSesion" replace />
}

export default function App() {
  return (
    // Proveedores de estado compartido basados en useState
    <AuthProvider>
      <ProductsProvider>
        <StockProvider>
          <CartProvider>
            <OrdersProvider>
            <ProveedorTema>
              <Routes>
                <Route path="/" element={<SitioLayout />}>
                  <Route index element={<Inicio />} />
                  <Route path="/productos" element={<Productos />} />
                  <Route path="/productos/:id" element={<ProductoDetalle/>} />
                  <Route path="Checkout" element={<Checkout />} />
                  <Route path="Registro" element={<Registro />} />
                  <Route path="InicioSesion" element={<InicioSesion />} />
                  <Route path="Perfil" element={<Pageperfil />} />
                  <Route path="MisCompras" element={<MisCompras />} />
                  <Route path="Contacto" element={<Contacto />} />
                  <Route path="Carrito" element={<Carrito />} />
                  <Route path="Nosotros" element={<Nosotros />} />
                  <Route path="Blog" element={<Blog />} />
                  <Route path="Admin" element={<AdminRoute><AdminProductos /></AdminRoute>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </ProveedorTema>
            </OrdersProvider>
          </CartProvider>
        </StockProvider>
      </ProductsProvider>
    </AuthProvider>
  )
}
