import { ChangeEvent, useEffect, useMemo, useState } from "react";
import type { PerfilUsuario } from "../../pages/Perfil/Page";

type Props = {
    value: PerfilUsuario;
    submitting?: boolean;
    onSubmit: (data: PerfilUsuario) => void;
    onCancel?: () => void;
    startReadonly?: boolean;
};

const REGIONESPERFIL = [
    {
        slug: 'arica-y-parinacota',
        nombre: 'Arica y Parinacota',
        comunas: [
            { slug: 'arica', nombre: 'Arica' },
            { slug: 'camarones', nombre: 'Camarones' },
            { slug: 'putre', nombre: 'Putre' },
            { slug: 'general-lagos', nombre: 'General Lagos' }
        ]
    },

    {
        slug: 'tarapaca',
        nombre: 'Tarapacá',
        comunas: [
            { slug: 'iquique', nombre: 'Iquique' },
            { slug: 'alto-hospicio', nombre: 'Alto Hospicio' },
            { slug: 'pozo-almonte', nombre: 'Pozo Almonte' },
            { slug: 'huara', nombre: 'Huara' },
            { slug: 'pica', nombre: 'Pica' },
            { slug: 'camina', nombre: 'Camiña' },
            { slug: 'colchane', nombre: 'Colchane' }
        ]
    },

    {
        slug: 'antofagasta',
        nombre: 'Antofagasta',
        comunas: [
            { slug: 'antofagasta', nombre: 'Antofagasta' },
            { slug: 'mejillones', nombre: 'Mejillones' },
            { slug: 'sierra-gorda', nombre: 'Sierra Gorda' },
            { slug: 'taltal', nombre: 'Taltal' },
            { slug: 'calama', nombre: 'Calama' },
            { slug: 'ollague', nombre: 'Ollagüe' },
            { slug: 'san-pedro-de-atacama', nombre: 'San Pedro de Atacama' },
            { slug: 'tocopilla', nombre: 'Tocopilla' },
            { slug: 'maria-elena', nombre: 'María Elena' }
        ]
    },

    {
        slug: 'atacama',
        nombre: 'Atacama',
        comunas: [
            { slug: 'copiapo', nombre: 'Copiapó' },
            { slug: 'caldera', nombre: 'Caldera' },
            { slug: 'tierra-amarilla', nombre: 'Tierra Amarilla' },
            { slug: 'chanaral', nombre: 'Chañaral' },
            { slug: 'diego-de-almagro', nombre: 'Diego de Almagro' }
        ]
    },

    {
        slug: 'coquimbo',
        nombre: 'Coquimbo',
        comunas: [
            { slug: 'la-serena', nombre: 'La Serena' },
            { slug: 'coquimbo-ciudad', nombre: 'Coquimbo' },
            { slug: 'ovalle', nombre: 'Ovalle' },
            { slug: 'illapel', nombre: 'Illapel' },
            { slug: 'la-higuera', nombre: 'La Higuera' },
            { slug: 'canela', nombre: 'Canela' },
            { slug: 'los-vilos', nombre: 'Los Vilos' },
            { slug: 'salamanca', nombre: 'Salamanca' },
            { slug: 'andacollo', nombre: 'Andacollo' },
            { slug: 'vicuña', nombre: 'Vicuña' },
            { slug: 'paihuano', nombre: 'Paihuano' },
            { slug: 'monte-patria', nombre: 'Monte Patria' },
            { slug: 'punitaqui', nombre: 'Punitaqui' },
            { slug: 'combarbala', nombre: 'Combarbalá' },
            { slug: 'rio-hurtado', nombre: 'Río Hurtado' }
        ]
    },

    {
        slug: 'valparaiso',
        nombre: 'Valparaíso',
        comunas: [
            { slug: 'valparaiso-ciudad', nombre: 'Valparaíso' },
            { slug: 'vina-del-mar', nombre: 'Viña del Mar' },
            { slug: 'concon', nombre: 'Concón' },
            { slug: 'quilpue', nombre: 'Quilpué' },
            { slug: 'villa-alemana', nombre: 'Villa Alemana' },
            { slug: 'quillota', nombre: 'Quillota' },
            { slug: 'calle-larga', nombre: 'Calle Larga' },
            { slug: 'los-andes', nombre: 'Los Andes' },
            { slug: 'san-antonio', nombre: 'San Antonio' },
            { slug: 'cartagena', nombre: 'Cartagena' },
            { slug: 'isla-de-pascua', nombre: 'Isla de Pascua' }
        ]
    },

    {
        slug: 'metropolitana',
        nombre: 'Región Metropolitana de Santiago',
        comunas: [
            { slug: 'santiago', nombre: 'Santiago' },
            { slug: 'providencia', nombre: 'Providencia' },
            { slug: 'las-condes', nombre: 'Las Condes' },
            { slug: 'vitacura', nombre: 'Vitacura' },
            { slug: 'la-florida', nombre: 'La Florida' },
            { slug: 'maipu', nombre: 'Maipú' },
            { slug: 'puente-alto', nombre: 'Puente Alto' },
            { slug: 'nunoa', nombre: 'Ñuñoa' },
            { slug: 'la-reina', nombre: 'La Reina' },
            { slug: 'penalolen', nombre: 'Peñalolén' },
            { slug: 'quilicura', nombre: 'Quilicura' },
            { slug: 'conchali', nombre: 'Conchalí' },
            { slug: 'recoleta', nombre: 'Recoleta' },
            { slug: 'independencia', nombre: 'Independencia' },
            { slug: 'huechuraba', nombre: 'Huechuraba' },
            { slug: 'lo-prado', nombre: 'Lo Prado' },
            { slug: 'cerro-navia', nombre: 'Cerro Navia' },
            { slug: 'pudahuel', nombre: 'Pudahuel' },
            { slug: 'estacion-central', nombre: 'Estación Central' },
            { slug: 'san-joaquin', nombre: 'San Joaquín' },
            { slug: 'san-miguel', nombre: 'San Miguel' },
            { slug: 'la-cisterna', nombre: 'La Cisterna' },
            { slug: 'el-bosque', nombre: 'El Bosque' }
        ]
    },

    {
        slug: 'ohiggins',
        nombre: 'Libertador General Bernardo O’Higgins',
        comunas: [
            { slug: 'rancagua', nombre: 'Rancagua' },
            { slug: 'machali', nombre: 'Machalí' },
            { slug: 'graneros', nombre: 'Graneros' },
            { slug: 'san-fernando', nombre: 'San Fernando' },
            { slug: 'chimbarongo', nombre: 'Chimbarongo' },
            { slug: 'santa-cruz', nombre: 'Santa Cruz' },
            { slug: 'pichidegua', nombre: 'Pichidegua' },
            { slug: 'asociada', nombre: 'Nancagua' }
        ]
    },

    {
        slug: 'maule',
        nombre: 'Maule',
        comunas: [
            { slug: 'talca', nombre: 'Talca' },
            { slug: 'curauma', nombre: 'Curepto' },
            { slug: 'curico', nombre: 'Curicó' },
            { slug: 'linares', nombre: 'Linares' },
            { slug: 'maule-comuna', nombre: 'Maule' },
            { slug: 'constitucion', nombre: 'Constitución' },
            { slug: 'san-clemente', nombre: 'San Clemente' },
            { slug: 'pelarco', nombre: 'Pelarco' }
        ]
    },

    {
        slug: 'nuble',
        nombre: 'Ñuble',
        comunas: [
            { slug: 'chillan', nombre: 'Chillán' },
            { slug: 'chillan-viejo', nombre: 'Chillán Viejo' },
            { slug: 'bulnes', nombre: 'Bulnes' },
            { slug: 'yungay', nombre: 'Yungay' },
            { slug: 'san-carlos', nombre: 'San Carlos' }
        ]
    },

    {
        slug: 'biobio',
        nombre: 'Biobío',
        comunas: [
            { slug: 'concepcion', nombre: 'Concepción' },
            { slug: 'talcahuano', nombre: 'Talcahuano' },
            { slug: 'hualpen', nombre: 'Hualpén' },
            { slug: 'coronel', nombre: 'Coronel' },
            { slug: 'lota', nombre: 'Lota' },
            { slug: 'chiguayante', nombre: 'Chiguayante' },
            { slug: 'los-angeles', nombre: 'Los Ángeles' },
            { slug: 'mulchen', nombre: 'Mulchén' }
        ]
    },

    {
        slug: 'la-araucania',
        nombre: 'La Araucanía',
        comunas: [
            { slug: 'temuco', nombre: 'Temuco' },
            { slug: 'villarrica', nombre: 'Villarrica' },
            { slug: 'pucon', nombre: 'Pucón' },
            { slug: 'angol', nombre: 'Angol' },
            { slug: 'lautaro', nombre: 'Lautaro' }
        ]
    },

    {
        slug: 'los-rios',
        nombre: 'Los Ríos',
        comunas: [
            { slug: 'valdivia', nombre: 'Valdivia' },
            { slug: 'la-union', nombre: 'La Unión' },
            { slug: 'rio-bueno', nombre: 'Río Bueno' },
            { slug: 'lanco', nombre: 'Lanco' }
        ]
    },

    {
        slug: 'los-lagos',
        nombre: 'Los Lagos',
        comunas: [
            { slug: 'puerto-montt', nombre: 'Puerto Montt' },
            { slug: 'puerto-varas', nombre: 'Puerto Varas' },
            { slug: 'osorno', nombre: 'Osorno' },
            { slug: 'castro', nombre: 'Castro' },
            { slug: 'chonchi', nombre: 'Chonchi' },
            { slug: 'ancud', nombre: 'Ancud' }
        ]
    },

    {
        slug: 'aysen',
        nombre: 'Aysén del General Carlos Ibáñez del Campo',
        comunas: [
            { slug: 'coyhaique', nombre: 'Coyhaique' },
            { slug: 'aysen', nombre: 'Aysén' },
            { slug: 'cioh', nombre: 'Chile Chico' },
            { slug: 'cisnes', nombre: 'Cisnes' }
        ]
    },

    {
        slug: 'magallanes',
        nombre: 'Magallanes y de la Antártica Chilena',
        comunas: [
            { slug: 'punta-arenas', nombre: 'Punta Arenas' },
            { slug: 'porvenir', nombre: 'Porvenir' },
            { slug: 'rio-seco', nombre: 'Río Verde' },
            { slug: 'cabo-de-hornos', nombre: 'Cabo de Hornos (Navarino)' }
        ]
    }
]

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const telefonoOk = (v: string) => /^[0-9+\s-]{8,16}$/.test(v.trim());
const cleanRut = (v: string) => v.replace(/[.\-]/g, "").toUpperCase();
function validarRut(rut: string) {
    const r = cleanRut(rut);
    if (!/^[0-9]+[0-9K]$/.test(r)) return false;
    const cuerpo = r.slice(0, -1);
    const dv = r.slice(-1);
    let suma = 0, mul = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i], 10) * mul;
        mul = mul === 7 ? 2 : mul + 1;
    }
    const res = 11 - (suma % 11);
    const dig = res === 11 ? "0" : res === 10 ? "K" : String(res);
    return dig === dv;
}

export default function Perfil({ value, submitting, onSubmit, onCancel, startReadonly }: Props) {
    const [form, setForm] = useState<PerfilUsuario>(value);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [avatarPreview, setAvatarPreview] = useState<string>(value.avatar || "");
    const [editing, setEditing] = useState<boolean>(!startReadonly ? true : false);

    useEffect(() => {
        setForm(value);
        setAvatarPreview(value.avatar || "");
    }, [value]);

    const region = useMemo(
        () => REGIONESPERFIL.find(r => r.slug === form.regionId) ?? null,
        [form.regionId]
    );

    const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(value), [form, value]);

    function set<K extends keyof PerfilUsuario>(key: K, v: PerfilUsuario[K]) {
        setForm(prev => ({ ...prev, [key]: v }));
        setErrors(prev => ({ ...prev, [String(key)]: "" }));
    }

    function onAvatarChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setErrors(prev => ({ ...prev, avatar: "El archivo debe ser una imagen." }));
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = String(reader.result);
            setAvatarPreview(dataUrl);
            set("avatar", dataUrl);
        };
        reader.readAsDataURL(file);
    }

    function validate(): boolean {
        const e: Record<string, string> = {};
        if (!form.nombre.trim()) e.nombre = "Requerido.";
        if (!form.apellidos.trim()) e.apellidos = "Requerido.";
        if (!form.rut.trim()) e.rut = "Requerido.";
        else if (!validarRut(form.rut)) e.rut = "RUT no válido (sin puntos ni guion).";
        if (!form.correo.trim()) e.correo = "Requerido.";
        else if (!emailOk(form.correo)) e.correo = "Correo inválido.";
        if (form.telefono && !telefonoOk(form.telefono)) e.telefono = "Teléfono inválido.";
        if (form.direccion && form.direccion.length > 300) e.direccion = "Máximo 300 caracteres.";
        if (form.nombre.length > 50) e.nombre = "Máximo 50 caracteres.";
        if (form.apellidos.length > 100) e.apellidos = "Máximo 100 caracteres.";
        if (!form.regionId) e.regionId = "Selecciona una región.";
        if (!form.comunaId) e.comunaId = "Selecciona una comuna.";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!editing) return;
        if (!validate()) return;
        onSubmit({ ...form });
        setEditing(false);
    }

    function revertChanges() {
        setForm(value);                         // Restaura valores
        setAvatarPreview(value.avatar || "");   // Restaura avatar
        setErrors({});                          // Limpia errores
        setEditing(false);                      // sale de edición
    }


    useEffect(() => {
        if (!editing) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                revertChanges();
                if (dirty && !confirm("Descartar cambios?")) return;
                revertChanges();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [editing, value, dirty]); // Para restaurar



    const dis = !editing;

    return (
        <form className="perfil-card" onSubmit={handleSubmit} noValidate>
            {/* AVATAR + RESUMEN + lápiz */}
            <section className="perfil-top" style={{ position: "relative" }}>
                <div className="perfil-avatar">
                    <div className="avatar-wrapper">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" />
                        ) : (
                            <div className="avatar-placeholder" aria-hidden="true">👤</div>
                        )}
                    </div>
                    <label className={`btn-file ${dis ? "disabled" : ""}`} style={{ pointerEvents: dis ? "none" : "auto", opacity: dis ? .6 : 1 }}>
                        Cambiar foto
                        <input type="file" accept="image/*" onChange={onAvatarChange} />
                    </label>
                    {errors.avatar && <small className="error">{errors.avatar}</small>}
                </div>

                <div className="perfil-summary">
                    <h2>{form.nombre || "Tu nombre"} {form.apellidos}</h2>
                    <p className="muted">{form.correo || "correo@ejemplo.com"}</p>
                    <p className="muted">RUT: {form.rut || "—"}</p>
                </div>

                {/* Botón lápiz / guardar */}
                <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 8 }}>
                    {!editing ? (
                        <button type="button" className="btn" title="Editar" onClick={() => setEditing(true)}>
                            <i className="bi bi-pencil-square" /> Editar
                        </button>
                    ) : (
                        <>
                            <button type="button" className="btn" onClick={revertChanges} title="Salir sin guardar (Esc)">
                                Salir
                            </button>
                            <button
                                type="submit"
                                className="btn primary"
                                disabled={submitting || !dirty}
                                title={!dirty ? "Sin cambios" : "Guardar"}
                            >
                                {submitting ? "Guardando…" : "Guardar"}
                            </button>
                        </>
                    )}
                </div>

            </section>

            {/* FORMULARIO */}
            <section className="perfil-grid">
                <div className="field">
                    <label>Nombre <span>*</span></label>
                    <input type="text" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} maxLength={50} autoComplete="given-name" disabled={dis} />
                    {errors.nombre && <small className="error">{errors.nombre}</small>}
                </div>

                <div className="field">
                    <label>Apellidos <span>*</span></label>
                    <input type="text" value={form.apellidos} onChange={(e) => set("apellidos", e.target.value)} maxLength={100} autoComplete="family-name" disabled={dis} />
                    {errors.apellidos && <small className="error">{errors.apellidos}</small>}
                </div>

                <div className="field">
                    <label>RUT <span>*</span></label>
                    <input type="text" placeholder="19011022K" value={form.rut} onChange={(e) => set("rut", e.target.value.toUpperCase())} inputMode="text" disabled={dis} />
                    {errors.rut && <small className="error">{errors.rut}</small>}
                </div>

                <div className="field">
                    <label>Correo <span>*</span></label>
                    <input type="email" value={form.correo} onChange={(e) => set("correo", e.target.value)} autoComplete="email" maxLength={100} disabled={dis} />
                    {errors.correo && <small className="error">{errors.correo}</small>}
                </div>

                <div className="field">
                    <label>Teléfono</label>
                    <input type="tel" placeholder="+56 9 1234 5678" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} autoComplete="tel" disabled={dis} />
                    {errors.telefono && <small className="error">{errors.telefono}</small>}
                </div>

                <div className="field">
                    <label>Fecha de nacimiento</label>
                    <input type="date" value={form.fechaNacimiento || ""} onChange={(e) => set("fechaNacimiento", e.target.value)} disabled={dis} />
                </div>

                <div className="field">
                    <label>Región <span>*</span></label>
                    <select value={form.regionId} onChange={(e) => { const rid = e.target.value; set("regionId", rid); set("comunaId", ""); }} disabled={dis}>
                        <option value="">Selecciona…</option>
                        {REGIONESPERFIL.map(r => (<option key={r.slug} value={r.slug}>{r.nombre}</option>))}
                    </select>
                    {errors.regionId && <small className="error">{errors.regionId}</small>}
                </div>

                <div className="field">
                    <label>Comuna <span>*</span></label>
                    <select
                        value={form.comunaId}
                        onChange={(e) => set("comunaId", e.target.value)}
                        disabled={dis || !region}
                    >
                        <option value="">{region ? "Selecciona…" : "Primero elige región"}</option>
                        {region?.comunas.map((c) => (
                            <option key={c.slug} value={c.slug}>
                                {c.nombre}
                            </option>
                        ))}
                    </select>
                    {errors.comunaId && <small className="error">{errors.comunaId}</small>}
                </div>

                <div className="field field-span-2">
                    <label>Dirección</label>
                    <input type="text" value={form.direccion} onChange={(e) => set("direccion", e.target.value)} placeholder="Calle 123, depto 45" maxLength={300} autoComplete="street-address" disabled={dis} />
                    {errors.direccion && <small className="error">{errors.direccion}</small>}
                </div>
            </section>

        </form>
    );
}
