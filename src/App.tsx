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
import UsuariosAdmin from "./pages/Admin/UsuariosAdmin";
import PedidosAdmin from "./pages/Admin/PedidosAdmin";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import MensajesAdmin from "./pages/Admin/MensajesAdmin";
import MensajesSoportePage from "./pages/soporte/MensajesSoportePage";
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductsProvider } from './context/ProductsContext';
import { StockProvider } from './context/StockContext';
import { CartProvider } from './context/CartContext';
import { OrdersProvider } from './context/OrdersContext';
import { ReportsProvider } from './context/ReportsContext';
import { MessagesProvider } from './context/MessagesContext';

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
            <ReportsProvider>
            <MessagesProvider>
            <ProveedorTema>
              <Routes>
                <Route path="/" element={<SitioLayout />}>
                  <Route index element={<Inicio />} />
                  <Route path="/productos" element={<Productos />} />
                  <Route path="/productos/:slug" element={<ProductoDetalle/>} />
                  <Route path="Checkout" element={<Checkout />} />
                  <Route path="Registro" element={<Registro />} />
                  <Route path="InicioSesion" element={<InicioSesion />} />
                  <Route path="Perfil" element={<Pageperfil />} />
                  <Route path="MisCompras" element={<MisCompras />} />
                  <Route path="Contacto" element={<Contacto />} />
                  <Route path="Carrito" element={<Carrito />} />
                  <Route path="/Mensajes" element={<MensajesSoportePage />} />
                  <Route path="Nosotros" element={<Nosotros />} />
                  <Route path="Blog" element={<Blog />} />
                  <Route path="Admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="Productos" element={<AdminProductos />} />
                    <Route path="Usuarios" element={<UsuariosAdmin />} />
                    <Route path="Pedidos" element={<PedidosAdmin />} />
                    <Route path="Mensajes" element={<MensajesAdmin />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </ProveedorTema>
            </MessagesProvider>
            </ReportsProvider>
            </OrdersProvider>
          </CartProvider>
        </StockProvider>
      </ProductsProvider>
    </AuthProvider>
  )
}
