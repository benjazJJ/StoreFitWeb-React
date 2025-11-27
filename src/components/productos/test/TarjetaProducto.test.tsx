import { describe, expect, it, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import TarjetaProducto from '../TarjetaProducto';
import { renderWithProviders } from '../../../test-utils';
import { slugify } from '../../../utils/slug';
import type { Producto } from '../../../types/Producto';

const mockProducto: Producto = {
  id: 99,
  nombre: 'Polera Test',
  precio: 19990,
  categoria: 'Poleras',
  imagen: '/img/test.png',
};

afterEach(() => cleanup());

describe('TarjetaProducto', () => {
  it('muestra la informacion y el link a detalle', () => {
    const { container } = renderWithProviders(<TarjetaProducto producto={mockProducto} />, { routerProps: { initialEntries: ['/#/productos'] } });

    expect(container.textContent).toContain(mockProducto.nombre);
    expect(container.textContent).toContain(mockProducto.categoria);
    const price = mockProducto.precio.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
    expect(container.textContent).toContain(price);

    const links = Array.from(container.querySelectorAll('a'));
    const hrefs = links.map(l => l.getAttribute('href'));
    expect(hrefs).toContain(`/productos/${slugify(mockProducto.nombre)}`);
  });

  it('usa placeholder cuando no hay imagen', () => {
    const sinImagen: Producto = { ...mockProducto, imagen: undefined, nombre: 'Sin Imagen' };
    const { container } = renderWithProviders(<TarjetaProducto producto={sinImagen} />, { routerProps: { initialEntries: ['/#/productos'] } });

    const img = container.querySelector('img[alt="Sin Imagen"]') as HTMLImageElement;
    expect(img?.getAttribute('src')).toBe('/img/placeholder.svg');
  });

  it('mantiene link aunque falte categoria o precio', () => {
    // Precio 0 para evitar NaN en render, aun si la props viniera incompleta
    const incompleto: Producto = { id: 100, nombre: 'Incompleto', categoria: '', precio: 0 as any };
    const { container } = renderWithProviders(<TarjetaProducto producto={incompleto} />, { routerProps: { initialEntries: ['/#/productos'] } });

    const links = Array.from(container.querySelectorAll('a'));
    const hrefs = links.map(l => l.getAttribute('href'));
    expect(hrefs).toContain(`/productos/${slugify(incompleto.nombre)}`);
  });
});
