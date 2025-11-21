import React, { PropsWithChildren } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProductsProvider } from './context/ProductsContext';
import { StockProvider } from './context/StockContext';
import { CartProvider } from './context/CartContext';
import { OrdersProvider } from './context/OrdersContext';
import { ReportsProvider } from './context/ReportsContext';
import { MessagesProvider } from './context/MessagesContext';
import { ProveedorTema } from './context/ThemeContext';

type Options = Omit<RenderOptions, 'wrapper'> & { routerProps?: MemoryRouterProps };

function AllProviders({ children, routerProps }: PropsWithChildren<{ routerProps?: MemoryRouterProps }>) {
  return (
    <MemoryRouter {...routerProps}>
      <AuthProvider>
        <ProductsProvider>
          <StockProvider>
            <CartProvider>
              <OrdersProvider>
                <ReportsProvider>
                  <MessagesProvider>
                    <ProveedorTema>
                      {children}
                    </ProveedorTema>
                  </MessagesProvider>
                </ReportsProvider>
              </OrdersProvider>
            </CartProvider>
          </StockProvider>
        </ProductsProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

export function renderWithProviders(ui: React.ReactElement, options?: Options) {
  const { routerProps, ...renderOptions } = options || {};
  return render(ui, {
    wrapper: (props) => <AllProviders routerProps={routerProps} {...props} />,
    ...renderOptions,
  });
}
