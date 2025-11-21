import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Vision from '../Vision';

describe('Vision', () => {
  it('muestra titulo y imagen de showroom', () => {
    render(<Vision />);

    expect(screen.getByRole('heading', { name: /VISI/i })).toBeInTheDocument();
    expect(screen.getByAltText(/Showroom moderno/i)).toBeInTheDocument();
  });

  it('no falla si se rompe la imagen', () => {
    render(<Vision />);
    const img = screen.getAllByAltText(/Showroom moderno/i)[0] as HTMLImageElement;
    img.onerror?.({} as any);
    expect(img).toBeInTheDocument();
  });
});
