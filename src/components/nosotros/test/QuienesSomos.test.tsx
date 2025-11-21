import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import QuienesSomos from '../QuienesSomos';

describe('QuienesSomos', () => {
  it('renderiza titulo y parrafos', () => {
    render(<QuienesSomos />);

    expect(screen.getByRole('heading', { name: /QUI/i })).toBeInTheDocument();
    expect(screen.getByText(/StoreFit es una marca deportiva/i)).toBeInTheDocument();
    expect(screen.getByAltText(/vitrina de la tienda StoreFit/i)).toBeInTheDocument();
  });

  it('maneja falta de imagen sin colapsar (onerror)', () => {
    render(<QuienesSomos />);
    const img = screen.getAllByAltText(/vitrina de la tienda StoreFit/i)[0] as HTMLImageElement;
    img.onerror?.({} as any);
    expect(img).toBeInTheDocument();
  });
});
