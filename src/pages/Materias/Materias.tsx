import { useEffect, useMemo, useState, type FormEvent } from "react";
import MainLayout from "../../layouts/MainLayout";
import BackHomeButton from "../../components/common/BackHomeButton";
import Card from "../../components/common/Card";
import { api, getApiErrorMessage } from "../../api/client";
import "./Materias.css";

interface Materia {
  id: number;
  nombre: string;
  descripcion: string;
  docente?: { nombres: string; apellidos: string } | null;
  docentes?: Array<{ id: number; nombres: string; apellidos: string }>;
}

const formularioInicial = { nombre: "", descripcion: "" };

function Materias() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    api.get<Materia[]>("/materias")
      .then(setMaterias)
      .catch((problema) => setError(getApiErrorMessage(problema)));
  }, []);

  const materiasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return materias.filter((materia) =>
      !texto ||
      `${materia.nombre} ${materia.descripcion} ${(materia.docentes ?? []).map((docente) => `${docente.nombres} ${docente.apellidos}`).join(" ")}`
        .toLowerCase()
        .includes(texto),
    );
  }, [busqueda, materias]);

  function limpiar() {
    setFormulario(formularioInicial);
    setEditandoId(null);
    setError("");
  }

  async function guardar(evento: FormEvent) {
    evento.preventDefault();
    setGuardando(true);
    setError("");
    setMensaje("");
    const datos = {
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim(),
    };

    try {
      const guardada = editandoId === null
        ? await api.post<Materia>("/materias", datos)
        : await api.put<Materia>(`/materias/${editandoId}`, datos);
      setMaterias((actuales) =>
        editandoId === null
          ? [...actuales, guardada]
          : actuales.map((materia) => materia.id === editandoId ? guardada : materia),
      );
      setMensaje(editandoId === null
        ? "Materia registrada correctamente."
        : "Materia actualizada correctamente.");
      limpiar();
    } catch (problema) {
      setError(getApiErrorMessage(problema));
    } finally {
      setGuardando(false);
    }
  }

  function editar(materia: Materia) {
    setEditandoId(materia.id);
    setFormulario({ nombre: materia.nombre, descripcion: materia.descripcion });
    setMensaje("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function eliminar(materia: Materia) {
    if (materia.docentes?.length) {
      setError("No puede eliminar una materia asignada a uno o más docentes.");
      return;
    }
    if (!window.confirm(`¿Deseas eliminar la materia "${materia.nombre}"?`)) return;
    try {
      await api.delete(`/materias/${materia.id}`);
      setMaterias((actuales) => actuales.filter((item) => item.id !== materia.id));
      setMensaje("Materia eliminada correctamente.");
    } catch (problema) {
      setError(getApiErrorMessage(problema));
    }
  }

  return (
    <MainLayout>
      <div className="subjects-page">
        <header className="subjects-header">
          <div>
            <p>Gestión académica</p>
            <h1>Materias</h1>
            <span>Crea el catálogo de materias que después podrás asignar a los docentes.</span>
          </div>
          <BackHomeButton />
        </header>

        {mensaje && <p className="subjects-message" role="status">{mensaje}</p>}
        {error && <p className="subjects-message subjects-message--error" role="alert">{error}</p>}

        <Card as="section" className="subjects-form-card">
          <div className="subjects-card-title">
            <i className="bi bi-journal-plus" />
            <div>
              <p>{editandoId === null ? "Nueva materia" : "Edición"}</p>
              <h2>{editandoId === null ? "Crear materia" : "Actualizar materia"}</h2>
            </div>
          </div>
          <form onSubmit={guardar} className="subjects-form">
            <label>
              <span>Nombre de la materia</span>
              <input required maxLength={100} placeholder="Ej. Matemáticas" value={formulario.nombre} onChange={(e) => setFormulario((actual) => ({ ...actual, nombre: e.target.value }))} />
            </label>
            <label className="subjects-description">
              <span>Descripción</span>
              <textarea required maxLength={300} rows={3} placeholder="Describe el contenido de la materia" value={formulario.descripcion} onChange={(e) => setFormulario((actual) => ({ ...actual, descripcion: e.target.value }))} />
            </label>
            <div className="subjects-form-actions">
              {editandoId !== null && <button type="button" className="subjects-secondary" onClick={limpiar}>Cancelar</button>}
              <button disabled={guardando} className="subjects-primary">{guardando ? "Guardando…" : editandoId === null ? "Crear materia" : "Guardar cambios"}</button>
            </div>
          </form>
        </Card>

        <Card as="section" className="subjects-list-card">
          <div className="subjects-list-header">
            <div><p>Catálogo</p><h2>Materias creadas</h2></div>
            <label className="subjects-search"><i className="bi bi-search" /><input type="search" aria-label="Buscar materias" placeholder="Buscar materia o docente" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} /></label>
          </div>
          <div className="subjects-table-wrapper">
            <table>
              <thead><tr><th>Materia</th><th>Descripción</th><th>Docentes asignados</th><th>Acciones</th></tr></thead>
              <tbody>
                {materiasFiltradas.map((materia) => (
                  <tr key={materia.id}>
                    <td><strong>{materia.nombre}</strong></td>
                    <td>{materia.descripcion}</td>
                    <td>{materia.docentes?.length ? materia.docentes.map((docente) => `${docente.nombres} ${docente.apellidos}`).join(", ") : "Sin asignar"}</td>
                    <td><div className="subjects-actions"><button onClick={() => editar(materia)} aria-label={`Editar ${materia.nombre}`}><i className="bi bi-pencil-square" /></button><button className="subjects-delete" onClick={() => eliminar(materia)} aria-label={`Eliminar ${materia.nombre}`}><i className="bi bi-trash3" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!materiasFiltradas.length && <p className="subjects-empty">No existen materias registradas.</p>}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}

export default Materias;
