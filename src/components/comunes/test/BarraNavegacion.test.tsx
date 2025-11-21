import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import BarraNavegacion from '../BarraNavegacion';
import { renderWithProviders } from '../../../test-utils';

const { mockUseCart, mockUseAuth } = vi.hoisted(() => ({ mockUseCart: vi.fn(), mockUseAuth: vi.fn() }));

vi.mock('../../../context/CartContext', () => ({
  __esModule: true,
  useCart: () => mockUseCart(),
  CartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../../context/AuthContext', () => ({
  __esModule: true,
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

type CartMock = {
  items: { id: number; nombre: string; precio: number; qty: number; talla?: string }[];
  count: number;
  total: number;
  add: ReturnType<typeof vi.fn>;
  setQty: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
};

type AuthMock = {
  usuarios: any[];
  sesion: { correo: string; rut: string; nombre: string; isAdmin?: boolean } | null;
  registrarUsuario: ReturnType<typeof vi.fn>;
  iniciarSesion: ReturnType<typeof vi.fn>;
  cerrarSesion: ReturnType<typeof vi.fn>;
};

const baseCart = (overrides?: Partial<CartMock>) => ({
  items: [],
  count: 0,
  total: 0,
  add: vi.fn(),
  setQty: vi.fn(),
  remove: vi.fn(),
  clear: vi.fn(),
  ...overrides,
});

const baseAuth = (overrides?: Partial<AuthMock>) => ({
  usuarios: [],
  sesion: null,
  registrarUsuario: vi.fn(),
  iniciarSesion: vi.fn(),
  cerrarSesion: vi.fn(),
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  mockUseCart.mockReset();
  mockUseCart.mockReturnValue(baseCart());
  mockUseAuth.mockReset();
  mockUseAuth.mockReturnValue(baseAuth());
});

afterEach(() => {
  cleanup();
});

describe('BarraNavegacion', () => {
  it('renderiza enlaces base y permite alternar tema', () => {
    mockUseCart.mockReturnValue(baseCart());
    mockUseAuth.mockReturnValue(baseAuth());
    renderWithProviders(<BarraNavegacion />);

    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Productos')).toBeInTheDocument();

    const nav = screen.getByRole('navigation');
    expect(nav.className).toContain('navbar-light');

    const toggle = screen.getByTitle('Cambiar tema');
    fireEvent.click(toggle);
    expect(nav.className).toContain('navbar-dark');
  });

  it('muestra el badge de carrito cuando hay items', async () => {
    mockUseCart.mockReturnValue(baseCart({ count: 3 }));
    mockUseAuth.mockReturnValue(baseAuth());

    renderWithProviders(<BarraNavegacion />);

    const links = screen.getAllByLabelText('Carrito');
    const linkWithBadge = links.find(l => l.querySelector('.badge'));
    expect(linkWithBadge).toBeTruthy();
    expect(linkWithBadge?.textContent).toContain('3');
  });

  it('no muestra badge cuando el carrito esta vacio', async () => {
    mockUseAuth.mockReturnValue(baseAuth());
    mockUseCart.mockReturnValue(baseCart({ count: 0 }));
    renderWithProviders(<BarraNavegacion />);

    const links = screen.getAllByLabelText('Carrito');
    const linkWithBadge = links.find(l => l.querySelector('.badge'));
    expect(linkWithBadge).toBeUndefined();
  });

  it('muestra enlace de admin solo cuando el usuario es admin', async () => {
    mockUseAuth.mockReturnValue(baseAuth({ sesion: { correo: 'admin@storefit.cl', rut: '0', nombre: 'Admin', isAdmin: true } }));
    renderWithProviders(<BarraNavegacion />);

    await waitFor(() => expect(screen.getByText('Admin Dashboard')).toBeInTheDocument());
  });

  it('muestra opciones de login/registro cuando no hay sesion', () => {
    mockUseAuth.mockReturnValue(baseAuth({ sesion: null }));
    renderWithProviders(<BarraNavegacion />);

    expect(screen.getByText(/Iniciar sesi/i)).toBeInTheDocument();
    expect(screen.getByText(/Crear cuenta/i)).toBeInTheDocument();
  });

  it('ejecuta cerrarSesion al hacer click en el menu de logout', () => {
    const cerrarSesion = vi.fn();
    mockUseAuth.mockReturnValue(baseAuth({ sesion: { correo: 'u@test.cl', rut: '1', nombre: 'User' }, cerrarSesion }));
    renderWithProviders(<BarraNavegacion />);

    fireEvent.click(screen.getByText(/Cerrar/i));
    expect(cerrarSesion).toHaveBeenCalledTimes(1);
  });
});
