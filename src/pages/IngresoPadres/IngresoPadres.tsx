import { useMemo, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import "./IngresoPadres.css";

interface Representante {
    id: number;
    nombres: string;
    apellidos: string;
    identificacion: string;
    telefono: string;
    correo: string;
    parentesco: string;
    estudiante: string;
    curso: string;
}

type RepresentanteForm = Omit<Representante, "id">;

const STORAGE_KEY = "representantesRegistrados";

const representantesIniciales: Representante[] = [
    {
        id: 1,
        nombres: "María Elena",
        apellidos: "García López",
        identificacion: "0912345678",
        telefono: "099 123 4567",
        correo: "maria.garcia@email.com",
        parentesco: "Madre",
        estudiante: "Juan Andrés Pérez García",
        curso: "7.º EGB - A",
    },
    {
        id: 2,
        nombres: "Carlos Alberto",
        apellidos: "Mendoza Ruiz",
        identificacion: "0923456789",
        telefono: "098 765 4321",
        correo: "carlos.mendoza@email.com",
        parentesco: "Padre",
        estudiante: "Sofía Mendoza Vera",
        curso: "5.º EGB - B",
    },
];

const formularioVacio: RepresentanteForm = {
    nombres: "",
    apellidos: "",
    identificacion: "",
    telefono: "",
    correo: "",
    parentesco: "",
    estudiante: "",
    curso: "",
};

function cargarRepresentantes(): Representante[] {
    try {
        const guardados = localStorage.getItem(STORAGE_KEY);
        return guardados ? JSON.parse(guardados) : representantesIniciales;
    } catch {
        return representantesIniciales;
    }
}

export default function IngresoPadres() {
    const autenticado = localStorage.getItem("usuarioAutenticado") === "true";
    const [representantes, setRepresentantes] =
        useState<Representante[]>(cargarRepresentantes);
    const [formulario, setFormulario] =
        useState<RepresentanteForm>(formularioVacio);
    const [editandoId, setEditandoId] = useState<number | null>(null);
    const [busqueda, setBusqueda] = useState("");
    const [mensaje, setMensaje] = useState("");

    const representantesFiltrados = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();
        if (!texto) return representantes;

        return representantes.filter((representante) =>
            [
                representante.nombres,
                representante.apellidos,
                representante.identificacion,
                representante.estudiante,
                representante.curso,
            ]
                .join(" ")
                .toLowerCase()
                .includes(texto),
        );
    }, [busqueda, representantes]);

    if (!autenticado) return <Navigate to="/login" replace />;

    function actualizarCampo(
        campo: keyof RepresentanteForm,
        valor: string,
    ) {
        setFormulario((actual) => ({ ...actual, [campo]: valor }));
        setMensaje("");
    }

    function guardarEnStorage(lista: Representante[]) {
        setRepresentantes(lista);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    }

    function guardarRepresentante(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const datos = Object.fromEntries(
            Object.entries(formulario).map(([clave, valor]) => [
                clave,
                valor.trim(),
            ]),
        ) as unknown as RepresentanteForm;

        if (editandoId !== null) {
            guardarEnStorage(
                representantes.map((representante) =>
                    representante.id === editandoId
                        ? { ...representante, ...datos }
                        : representante,
                ),
            );
            setMensaje("Los datos del representante se actualizaron correctamente.");
        } else {
            guardarEnStorage([
                ...representantes,
                { id: Date.now(), ...datos },
            ]);
            setMensaje("El representante fue registrado correctamente.");
        }

        setFormulario(formularioVacio);
        setEditandoId(null);
    }

    function editarRepresentante(representante: Representante) {
        const { id, ...datos } = representante;
        setEditandoId(id);
        setFormulario(datos);
        setMensaje("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function cancelarEdicion() {
        setEditandoId(null);
        setFormulario(formularioVacio);
        setMensaje("");
    }

    function eliminarRepresentante(representante: Representante) {
        if (
            window.confirm(
                `¿Deseas eliminar a ${representante.nombres} ${representante.apellidos}?`,
            )
        ) {
            guardarEnStorage(
                representantes.filter((item) => item.id !== representante.id),
            );
        }
    }

    return (
        <MainLayout>
            <div className="parent-entry-page">
                <header className="parent-entry-heading">
                    <div>
                        <p className="parent-entry-eyebrow">Gestión estudiantil</p>
                        <h1>Registro de padres de familia</h1>
                        <p>
                            Registra los datos del representante y relaciónalo con un
                            estudiante.
                        </p>
                    </div>

                    <Link to="/home" className="parent-entry-back">
                        <i className="bi bi-arrow-left"></i>
                        Volver al inicio
                    </Link>
                </header>

                <section className="parent-entry-form-card">
                    <div className="parent-entry-card-title">
                        <span><i className="bi bi-person-plus-fill"></i></span>
                        <div>
                            <p>{editandoId ? "Actualización de información" : "Nuevo registro"}</p>
                            <h2>{editandoId ? "Editar representante" : "Datos del representante"}</h2>
                        </div>
                    </div>

                    <form onSubmit={guardarRepresentante}>
                        <fieldset>
                            <legend>Información personal</legend>
                            <div className="parent-entry-grid">
                                <label>
                                    <span>Nombres *</span>
                                    <input required value={formulario.nombres} onChange={(e) => 
                                        actualizarCampo("nombres", e.target.value)} placeholder="Ingrese los nombres" />
                                </label>
                                <label>
                                    <span>Apellidos *</span>
                                    <input required value={formulario.apellidos} onChange={(e) => 
                                        actualizarCampo("apellidos", e.target.value)} placeholder="Ingrese los apellidos" />
                                </label>
                                <label>
                                    <span>Cédula de identidad *</span>
                                    <input required inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={formulario.identificacion} onChange={(e) => 
                                        actualizarCampo("identificacion", e.target.value.replace(/\D/g, ""))} placeholder="10 dígitos" />
                                </label>
                                <label>
                                    <span>Parentesco *</span>
                                    <select required value={formulario.parentesco} onChange={(e) => 
                                        actualizarCampo("parentesco", e.target.value)}>
                                        <option value="">Seleccione</option>
                                        <option>Madre</option>
                                        <option>Padre</option>
                                        <option>Representante legal</option>
                                        <option>Otro familiar</option>
                                    </select>
                                </label>
                            </div>
                        </fieldset>

                        <fieldset>
                            <legend>Datos de contacto</legend>
                            <div className="parent-entry-grid">
                                <label>
                                    <span>Teléfono *</span>
                                    <input required type="tel" value={formulario.telefono} onChange={(e) => 
                                        actualizarCampo("telefono", e.target.value)} placeholder="Ej. 099 123 4567" />
                                </label>
                                <label>
                                    <span>Correo electrónico *</span>
                                    <input required type="email" value={formulario.correo} onChange={(e) => 
                                        actualizarCampo("correo", e.target.value)} placeholder="correo@ejemplo.com" />
                                </label>
                            </div>
                        </fieldset>

                        <fieldset>
                            <legend>Estudiante asociado</legend>
                            <div className="parent-entry-grid">
                                <label>
                                    <span>Nombre del estudiante *</span>
                                    <input required value={formulario.estudiante} onChange={(e) => 
                                        actualizarCampo("estudiante", e.target.value)} placeholder="Nombres y apellidos" />
                                </label>
                                <label>
                                    <span>Curso y paralelo *</span>
                                    <select required value={formulario.curso} onChange={(e) => 
                                        actualizarCampo("curso", e.target.value)}>
                                        <option value="">Seleccione un curso</option>
                                        <option>1.º EGB - A</option><option>2.º EGB - A</option>
                                        <option>3.º EGB - A</option><option>4.º EGB - A</option>
                                        <option>5.º EGB - A</option><option>5.º EGB - B</option>
                                        <option>6.º EGB - A</option><option>7.º EGB - A</option>
                                    </select>
                                </label>
                            </div>
                        </fieldset>

                        {mensaje && <div className="parent-entry-message"><i className="bi bi-check-circle-fill"></i>{mensaje}</div>}

                        <div className="parent-entry-form-actions">
                            {editandoId && <button type="button" className="parent-entry-secondary" onClick={cancelarEdicion}>Cancelar</button>}
                            <button type="submit" className="parent-entry-primary">
                                <i className={`bi ${editandoId ? "bi-check-lg" : "bi-floppy-fill"}`}></i>
                                {editandoId ? "Guardar cambios" : "Registrar representante"}
                            </button>
                        </div>
                    </form>
                </section>

                <section className="parent-entry-list-card">
                    <div className="parent-entry-list-header">
                        <div>
                            <p className="parent-entry-eyebrow">Registros</p>
                            <h2>Representantes registrados</h2>
                            <span>{representantesFiltrados.length} resultados</span>
                        </div>
                        <label className="parent-entry-search">
                            <i className="bi bi-search"></i>
                            <span className="parent-entry-sr-only">Buscar representante</span>
                            <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar representante o estudiante..." />
                        </label>
                    </div>

                    <div className="parent-entry-table-wrapper">
                        <table className="parent-entry-table">
                            <thead><tr><th>Representante</th><th>Contacto</th><th>Estudiante</th><th>Parentesco</th><th>Acciones</th></tr></thead>
                            <tbody>
                                {representantesFiltrados.map((representante) => (
                                    <tr key={representante.id}>
                                        <td><div className="parent-entry-person">
                                            <span>{representante.nombres.charAt(0)}{representante.apellidos.charAt(0)}</span><div><strong>
                                                {representante.nombres} {representante.apellidos}</strong><small>C.I. {representante.identificacion}</small></div></div></td>
                                        <td><div className="parent-entry-contact">
                                            <span>{representante.telefono}</span><small>{representante.correo}</small></div></td>
                                        <td><strong>{representante.estudiante}</strong>
                                        <small className="parent-entry-course">{representante.curso}</small></td>
                                        <td><span className="parent-entry-relation">{representante.parentesco}</span></td>
                                        <td><div className="parent-entry-actions">
                                            <button onClick={() => editarRepresentante(representante)} aria-label="Editar representante">
                                                <i className="bi bi-pencil-square"></i></button><button onClick={() => 
                                                    eliminarRepresentante(representante)} aria-label="Eliminar representante"><i className="bi bi-trash3"></i></button></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!representantesFiltrados.length && <div className="parent-entry-empty"><i className="bi bi-people">
                            </i><h3>No hay resultados</h3><p>Intenta buscar con otros datos.</p></div>}
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
