import { describe, expect, it, afterEach, vi } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import PiePagina from '../PiePagina';
import { renderWithProviders } from '../../../test-utils';

afterEach(() => cleanup());

describe('PiePagina', () => {
  it('muestra el año actual y lema', () => {
    renderWithProviders(<PiePagina />);

    expect(screen.getByText(/StoreFit/)).toBeInTheDocument();
    expect(screen.getByText(/La calidad/i)).toBeInTheDocument();
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  it('sigue renderizando aunque getFullYear devuelva NaN', () => {
    const spy = vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(NaN as any);

    expect(() => renderWithProviders(<PiePagina />)).not.toThrow();
    expect(screen.getByText(/StoreFit/)).toBeInTheDocument();

    spy.mockRestore();
  });
});
