import { describe, expect, it, vi, afterEach } from 'vitest';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import CuadriculaProductos from '../CuadriculaProductos';
import type { Producto } from '../../../types/Producto';

const mockLista: Producto[] = [
  { id: 1, nombre: 'Item Uno', precio: 5000, categoria: 'Test', imagen: '/img/1.png' },
  { id: 2, nombre: 'Item Dos', precio: 7000, categoria: 'Test', imagen: '/img/2.png' },
];

afterEach(() => cleanup());

describe('CuadriculaProductos', () => {
  it('renderiza tarjetas y dispara el alert al ver detalle', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    render(<CuadriculaProductos productos={mockLista} />);

    expect(screen.getAllByRole('img')).toHaveLength(mockLista.length);
    const btn = screen.getAllByRole('button', { name: /ver detalle/i })[0];
    fireEvent.click(btn);
    expect(alertSpy).toHaveBeenCalledWith(`Detalle de: ${mockLista[0].nombre}`);

    alertSpy.mockRestore();
  });

  it('muestra lista vacia sin romper cuando no hay productos', () => {
    const { container } = render(<CuadriculaProductos productos={[]} />);
    expect(container.querySelectorAll('article').length).toBe(0);
  });

  it('renderiza sin romper aunque falte precio/categoria', () => {
    // Precio/categoría faltantes → se setea precio 0 para evitar NaN al formatear
    const datosIncompletos: Producto[] = [{ id: 3, nombre: 'Sin Cat', precio: 0 as any, categoria: undefined as any }];
    const { container } = render(<CuadriculaProductos productos={datosIncompletos} />);
    expect(container.querySelectorAll('article').length).toBe(1);
    expect(container.textContent).toContain('Sin Cat');
  });
});
