import React, { createContext, useContext, useState, useEffect } from 'react';

type Tema = 'light' | 'dark';

interface TipoContextoTema {
    tema: Tema;
    alternarTema: () => void;
}

const ContextoTema = createContext<TipoContextoTema | undefined>(undefined);

export function ProveedorTema({ children }: { children: React.ReactNode }) {
    const [tema, setTema] = useState<Tema>(() => {
        const temaGuardado = localStorage.getItem('theme');
        document.documentElement.setAttribute('data-theme', temaGuardado || 'light');
        return (temaGuardado as Tema) || 'light';
    });

    useEffect(() => {
        localStorage.setItem('theme', tema);
        document.documentElement.setAttribute('data-theme', tema);
    }, [tema]);

    const alternarTema = () => {
        setTema(actual => {
            const siguiente = actual === 'light' ? 'dark' : 'light';
            console.log('Cambiando tema a:', siguiente);
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
