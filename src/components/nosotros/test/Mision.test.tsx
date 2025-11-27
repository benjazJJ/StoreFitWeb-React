import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Mision from '../Mision';

describe('Mision', () => {
  it('muestra titulo y imagen descriptiva', () => {
    render(<Mision />);

    expect(screen.getByRole('heading', { name: /MISI/i })).toBeInTheDocument();
    expect(screen.getByAltText(/tienda StoreFit/i)).toBeInTheDocument();
  });

  it('se mantiene render si la imagen falla', () => {
    render(<Mision />);
    const img = screen.getAllByAltText(/tienda StoreFit/i)[0] as HTMLImageElement;
    img.onerror?.({} as any);
    expect(img).toBeInTheDocument();
  });
});
