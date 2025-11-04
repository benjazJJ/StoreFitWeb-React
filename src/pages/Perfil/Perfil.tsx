import { ChangeEvent, useEffect, useMemo, useState } from "react";
import type { PerfilUsuario } from "../../pages/Perfil/Page";

type Props = {
    value: PerfilUsuario;
    submitting?: boolean;
    onSubmit: (data: PerfilUsuario) => void;
    onCancel?: () => void;
    startReadonly?: boolean;
};

const REGIONES_DEMO = [
    {
        id: "13", nombre: "Región Metropolitana", comunas: [
            { id: "13101", nombre: "Santiago" },
            { id: "13114", nombre: "Providencia" },
            { id: "13123", nombre: "Las Condes" },
        ]
    },
    {
        id: "07", nombre: "Región del Maule", comunas: [
            { id: "07101", nombre: "Talca" },
            { id: "07103", nombre: "Curicó" },
        ]
    },
];

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
        () => REGIONES_DEMO.find(r => r.id === form.regionId) ?? null,
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
                        <button type="submit" className="btn primary" disabled={submitting || !dirty} title={!dirty ? "Sin cambios" : "Guardar"}>
                            {submitting ? "Guardando…" : "Guardar"}
                        </button>
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
                        {REGIONES_DEMO.map(r => (<option key={r.id} value={r.id}>{r.nombre}</option>))}
                    </select>
                    {errors.regionId && <small className="error">{errors.regionId}</small>}
                </div>

                <div className="field">
                    <label>Comuna <span>*</span></label>
                    <select value={form.comunaId} onChange={(e) => set("comunaId", e.target.value)} disabled={dis || !region}>
                        <option value="">{region ? "Selecciona…" : "Primero elige región"}</option>
                        {region?.comunas.map(c => (<option key={c.id} value={c.id}>{c.nombre}</option>))}
                    </select>
                    {errors.comunaId && <small className="error">{errors.comunaId}</small>}
                </div>

                <div className="field field-span-2">
                    <label>Dirección</label>
                    <input type="text" value={form.direccion} onChange={(e) => set("direccion", e.target.value)} placeholder="Calle 123, depto 45" maxLength={300} autoComplete="street-address" disabled={dis} />
                    {errors.direccion && <small className="error">{errors.direccion}</small>}
                </div>
            </section>

            {/* ACCIONES secundarias */}
            {editing && (
                <section className="perfil-actions">
                    {onCancel && (
                        <button type="button" className="btn" onClick={onCancel} disabled={submitting}>
                            Cancelar
                        </button>
                    )}
                    <button type="submit" className="btn primary" disabled={submitting || !dirty}>
                        {submitting ? "Guardando…" : "Guardar cambios"}
                    </button>
                </section>
            )}
        </form>
    );
}
