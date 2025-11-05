import React, { createContext, useContext, useState, useEffect } from 'react';

type Tema = 'light' | 'dark';

interface TipoContextoTema {
    tema: Tema;
    alternarTema: () => void;
}

const ContextoTema = createContext<TipoContextoTema | undefined>(undefined);

export function ProveedorTema({ children }: { children: React.ReactNode }) {
    // Estado de tema del sitio usando useState (sin LocalStorage)
    // Se inicializa a 'light' por defecto y se sincroniza con el atributo data-theme del documento
    const [tema, setTema] = useState<Tema>('light');

    useEffect(() => {
        // Efecto: aplica el tema actual al atributo data-theme del <html>
        document.documentElement.setAttribute('data-theme', tema);
    }, [tema]);

    const alternarTema = () => {
        setTema(actual => {
            const siguiente = actual === 'light' ? 'dark' : 'light';
            return siguiente;
        });
    };

    return (
        <ContextoTema.Provider value={{ tema, alternarTema }}>
            {children}
        </ContextoTema.Provider>
    );
}

export function usarTema() {
    const contexto = useContext(ContextoTema);
    if (contexto === undefined) {
        throw new Error('usarTema debe usarse dentro de ProveedorTema');
    }
    return contexto;
}
