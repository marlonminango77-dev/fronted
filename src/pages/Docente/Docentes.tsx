import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

import "./Docentes.css";
import BackHomeButton from "../../components/common/BackHomeButton";
import Card from "../../components/common/Card";
import type { RolSistema } from "../../utils/rolesStorage";
import { api, getApiErrorMessage } from "../../api/client";

interface Docente {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  especialidad: string;
  titulo: string;
  telefono: string;
  correo: string;
  rolId: number | null;
  materiaIds: number[];
  cursos: string[];
}
interface DocenteApi extends Omit<Docente,"rolId"|"materiaIds">{rol?:{id:number}}
interface MateriaApi {
  id: number;
  nombre: string;
  docentes?: Array<{ id: number }>;
}

const formularioInicial = {
  cedula: "",
  nombres: "",
  apellidos: "",
  fechaNacimiento: "",
  especialidad: "",
  titulo: "",
  telefono: "",
  correo: "",
  rolId: "",
};

function Docentes() {
  void Navigate;
  const [parametros] = useSearchParams();
  const [docentes, setDocentes] =
    useState<Docente[]>([]);

  const [formulario, setFormulario] =
    useState(() => ({ ...formularioInicial, rolId: parametros.get("rol") ?? "" }));

  const [busqueda, setBusqueda] = useState("");

  const [mensaje, setMensaje] = useState("");

  const [paginaActual, setPaginaActual] = useState(1);

  const [editandoId, setEditandoId] =
    useState<number | null>(null);

  const docentesPorPagina = 10;
  const [rolesActivos, setRolesActivos] = useState<RolSistema[]>([]);
  const [materias, setMaterias] = useState<MateriaApi[]>([]);
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState<number[]>([]);
  const [cursosDisponibles, setCursosDisponibles] = useState<string[]>([]);
  const [cursosSeleccionados, setCursosSeleccionados] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<DocenteApi[]>("/docentes"),
      api.get<RolSistema[]>("/roles"),
      api.get<MateriaApi[]>("/materias"),
      api.get<Array<{ grado: string; paralelo: string; estado: string }>>("/alumnos"),
    ])
      .then(([lista, roles, listaMaterias, alumnos]) => {
        setDocentes(lista.map((docente) => ({
          ...docente,
          rolId: docente.rol?.id ?? null,
          materiaIds: listaMaterias
            .filter((materia) => materia.docentes?.some((asignado) => asignado.id === docente.id))
            .map((materia) => materia.id),
          cursos: docente.cursos ?? [],
        })));
        setRolesActivos(roles.filter((rol) => rol.estado === "Activo"));
        setMaterias(listaMaterias);
        setCursosDisponibles([...new Set(
          alumnos
            .filter((alumno) => alumno.estado === "Activo")
            .map((alumno) => `${alumno.grado}|${alumno.paralelo.toUpperCase()}`),
        )].sort());
      })
      .catch((error) => setMensaje(getApiErrorMessage(error)));
  }, []);

  const docentesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return docentes.filter(
      (docente) =>
        !termino ||
        `${docente.cedula} ${docente.nombres} ${docente.apellidos} ${docente.especialidad}`
          .toLowerCase()
          .includes(termino)
    );
  }, [busqueda, docentes]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(docentesFiltrados.length / docentesPorPagina)
  );

  const paginaVisible = Math.min(
    paginaActual,
    totalPaginas
  );

  const inicioPagina =
    (paginaVisible - 1) * docentesPorPagina;

  const docentesPaginados =
    docentesFiltrados.slice(
      inicioPagina,
      inicioPagina + docentesPorPagina
    );

  // ===========================================
// ACTUALIZAR CAMPOS DEL FORMULARIO
// ===========================================
function actualizarCampo(
  campo: keyof typeof formulario,
  valor: string
) {
  setFormulario((actual) => ({
    ...actual,
    [campo]: valor,
  }));
  setMensaje("");
}

function alternarMateria(id: number) {
  setMateriasSeleccionadas((actuales) =>
    actuales.includes(id)
      ? actuales.filter((materiaId) => materiaId !== id)
      : [...actuales, id],
  );
  setMensaje("");
}

function alternarCurso(curso: string) {
  setCursosSeleccionados((actuales) =>
    actuales.includes(curso)
      ? actuales.filter((item) => item !== curso)
      : [...actuales, curso],
  );
  setMensaje("");
}


async function registrarDocente(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const cedulaRepetida = docentes.some(
    (docente) =>
      docente.cedula === formulario.cedula.trim() &&
      docente.id !== editandoId
  );

  if (cedulaRepetida) {
    setMensaje("Ya existe un docente con esta cédula.");
    return;
  }

  const datosDocente = {
    ...formulario,
    cedula: formulario.cedula.trim(),
    nombres: formulario.nombres.trim(),
    apellidos: formulario.apellidos.trim(),
    especialidad: formulario.especialidad.trim(),
    titulo: formulario.titulo.trim(),
    telefono: formulario.telefono.trim(),
    correo: formulario.correo.trim(),
    rolId: formulario.rolId ? Number(formulario.rolId) : null,
  };

  try {
    const payload = { ...datosDocente, cursos: cursosSeleccionados, rol: { id: datosDocente.rolId } };
    let guardado: DocenteApi;
    if (editandoId !== null) {
      guardado = await api.put<DocenteApi>(`/docentes/${editandoId}`, payload);
    } else {
      guardado = await api.post<DocenteApi>("/docentes", payload);
    }
    const asignadas = await api.put<MateriaApi[]>(
      `/docentes/${guardado.id}/materias`,
      { materiaIds: materiasSeleccionadas },
    );
    const docenteCompleto: Docente = {
      ...guardado,
      rolId: guardado.rol?.id ?? null,
      materiaIds: asignadas.map((materia) => materia.id),
      cursos: cursosSeleccionados,
    };
    setDocentes((actuales) =>
      editandoId !== null
        ? actuales.map((docente) => docente.id === editandoId ? docenteCompleto : docente)
        : [...actuales, docenteCompleto],
    );
    setMaterias((actuales) => actuales.map((materia) => {
      const docentesMateria = materia.docentes ?? [];
      if (materiasSeleccionadas.includes(materia.id)) {
        return docentesMateria.some((docente) => docente.id === guardado.id)
          ? materia
          : { ...materia, docentes: [...docentesMateria, { id: guardado.id }] };
      }
      if (docentesMateria.some((docente) => docente.id === guardado.id)) {
        return { ...materia, docentes: docentesMateria.filter((docente) => docente.id !== guardado.id) };
      }
      return materia;
    }));
  } catch (error) { setMensaje(getApiErrorMessage(error)); return; }

  setFormulario(formularioInicial);
  setMateriasSeleccionadas([]);
  setCursosSeleccionados([]);
  setEditandoId(null);

  setMensaje(
    editandoId === null
      ? "Docente registrado correctamente."
      : "Información actualizada correctamente."
  );
}


function editarDocente(docente: Docente) {
  setFormulario({
    cedula: docente.cedula,
    nombres: docente.nombres,
    apellidos: docente.apellidos,
    fechaNacimiento: docente.fechaNacimiento,
    especialidad: docente.especialidad,
    titulo: docente.titulo,
    telefono: docente.telefono,
    correo: docente.correo,
    rolId: docente.rolId ? String(docente.rolId) : "",
  });
  setMateriasSeleccionadas(docente.materiaIds);
  setCursosSeleccionados(docente.cursos ?? []);

  setEditandoId(docente.id);
  setMensaje("");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}


async function eliminarDocente(docente: Docente) {
  if (
    window.confirm(
      `¿Deseas eliminar a ${docente.nombres} ${docente.apellidos}?`
    )
  ) {
    try {
      await api.delete(`/docentes/${docente.id}`);
      setDocentes((actuales) => actuales.filter((item) => item.id !== docente.id));
      setMensaje("Docente eliminado correctamente.");
    } catch (error) { setMensaje(getApiErrorMessage(error)); }
  }
}


return (
  <MainLayout>
    <div className="students-page">

      <header className="students-header">
        <div>
          <p className="students-label">Gestión de docentes</p>
          <h1>Registro de docentes</h1>
          <p>Administra la información del personal docente.</p>
        </div>

        <BackHomeButton/>
      </header>

      <Card as="section" className="students-form-card">

        <div className="students-card-title">
          <span>
            <i className="bi bi-person-badge-fill"></i>
          </span>

          <div>
            <p>{editandoId === null ? "Nuevo docente" : "Edición"}</p>

            <h2>
              {editandoId === null
                ? "Datos del docente"
                : "Actualizar docente"}
            </h2>
          </div>
        </div>

        <form onSubmit={registrarDocente}>

          <div className="students-form-grid">

            <label>
              <span>Cédula</span>

              <input
                required
                inputMode="numeric"
                maxLength={10}
                pattern="[0-9]{10}"
                placeholder="Ingrese la cédula"
                value={formulario.cedula}
                onChange={(e) =>
                  actualizarCampo("cedula", e.target.value)
                }
              />
            </label>

            <label>
              <span>Nombres</span>

              <input
                required
                maxLength={60}
                placeholder="Ingrese los nombres"
                value={formulario.nombres}
                onChange={(e) =>
                  actualizarCampo("nombres", e.target.value)
                }
              />
            </label>

            <label>
              <span>Apellidos</span>

              <input
                required
                maxLength={60}
                placeholder="Ingrese los apellidos"
                value={formulario.apellidos}
                onChange={(e) =>
                  actualizarCampo("apellidos", e.target.value)
                }
              />
            </label>

            <label>
              <span>Fecha de nacimiento</span>

              <input
                required
                type="date"
                value={formulario.fechaNacimiento}
                onChange={(e) =>
                  actualizarCampo("fechaNacimiento", e.target.value)
                }
              />
            </label>

            <label>
              <span>Especialidad</span>

              <input
                required
                placeholder="Ej. Matemáticas"
                value={formulario.especialidad}
                onChange={(e) =>
                  actualizarCampo("especialidad", e.target.value)
                }
              />
            </label>

            <label>
              <span>Título profesional</span>

              <input
                required
                placeholder="Licenciado en Educación"
                value={formulario.titulo}
                onChange={(e) =>
                  actualizarCampo("titulo", e.target.value)
                }
              />
            </label>

            <label>
              <span>Teléfono</span>

              <input
                required
                inputMode="tel"
                maxLength={10}
                pattern="[0-9]{10}"
                placeholder="0999999999"
                value={formulario.telefono}
                onChange={(e) =>
                  actualizarCampo("telefono", e.target.value)
                }
              />
            </label>

            <label>
              <span>Rol asignado</span>
              <select required value={formulario.rolId} onChange={(e) => actualizarCampo("rolId", e.target.value)}>
                <option value="">Seleccione un rol</option>
                {rolesActivos.map((rol) => <option key={rol.id} value={rol.id}>{rol.nombre}</option>)}
              </select>
            </label>

            <label>
              <span>Correo electrónico</span>

              <input
                required
                type="email"
                placeholder="docente@escuela.edu.ec"
                value={formulario.correo}
                onChange={(e) =>
                  actualizarCampo("correo", e.target.value)
                }
              />
            </label>

          </div>

          <fieldset className="teachers-subjects">
            <div className="teachers-subjects-heading">
              <div>
                <legend>Materias asignadas</legend>
                <p>Selecciona las materias y cursos que tendrá a cargo el docente.</p>
              </div>
              <span>{materiasSeleccionadas.length} seleccionadas</span>
            </div>
            <div className="teachers-subjects-grid">
              {materias.map((materia) => {
                const otrosDocentes = (materia.docentes ?? [])
                  .filter((docente) => docente.id !== editandoId).length;
                return (
                  <label
                    key={materia.id}
                    className={[
                      materiasSeleccionadas.includes(materia.id)
                        ? "teachers-subject--selected"
                        : "",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      checked={materiasSeleccionadas.includes(materia.id)}
                      onChange={() => alternarMateria(materia.id)}
                    />
                    <span>
                      <strong>{materia.nombre}</strong>
                      <small>{otrosDocentes ? `${otrosDocentes} docente(s) adicional(es)` : "Disponible"}</small>
                    </span>
                  </label>
                );
              })}
              {!materias.length && (
                <p className="teachers-subjects-empty">
                  Primero registra materias y cursos en el módulo Materias.
                </p>
              )}
            </div>
          </fieldset>

          <fieldset className="teachers-subjects">
            <div className="teachers-subjects-heading">
              <div>
                <legend>Cursos asignados</legend>
                <p>El docente solo podrá consultar y modificar información de estos cursos.</p>
              </div>
              <span>{cursosSeleccionados.length} seleccionados</span>
            </div>
            <div className="teachers-subjects-grid">
              {cursosDisponibles.map((curso) => (
                <label
                  key={curso}
                  className={cursosSeleccionados.includes(curso)
                    ? "teachers-subject--selected"
                    : ""}
                >
                  <input
                    type="checkbox"
                    checked={cursosSeleccionados.includes(curso)}
                    onChange={() => alternarCurso(curso)}
                  />
                  <span>
                    <strong>{curso.replace("|", " ")}</strong>
                    <small>Curso registrado</small>
                  </span>
                </label>
              ))}
              {!cursosDisponibles.length && (
                <p className="teachers-subjects-empty">
                  Primero registra estudiantes para crear los cursos disponibles.
                </p>
              )}
            </div>
          </fieldset>

          <div className="students-form-actions">

            {mensaje && (
              <p
                className={
                  mensaje.startsWith("Ya")
                    ? "students-message students-message--error"
                    : "students-message"
                }
              >
                {mensaje}
              </p>
            )}

            <button
              type="submit"
              className="students-save-button"
            >
              <i className="bi bi-check-lg"></i>

              {editandoId === null
                ? "Registrar docente"
                : "Guardar cambios"}
            </button>

          </div>

        </form>

      </Card>
            <Card as="section" className="students-list-card">

        <div className="students-list-header">

          <div>
            <p className="students-label">Registros</p>
            <h2>Docentes registrados</h2>
          </div>

          <label className="students-search">
            <i className="bi bi-search"></i>

            <input
              type="search"
              placeholder="Buscar por nombre, cédula o especialidad"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </label>

        </div>

        <div className="students-filters">

          <p>
            Mostrando <strong>{docentesFiltrados.length}</strong> de{" "}
            <strong>{docentes.length}</strong> docentes
          </p>

        </div>

        <div className="students-table-wrapper">

          <table className="students-table">

            <thead>
              <tr>
                <th>Docente</th>
                <th>Cédula</th>
                <th>Especialidad</th>
                <th>Título</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Materias</th>
                <th>Cursos</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {docentesPaginados.map((docente) => (

                <tr key={docente.id}>

                  <td>
                    <div className="students-person">
                      <span>{docente.nombres.charAt(0)}</span>

                      <strong>
                        {docente.nombres} {docente.apellidos}
                      </strong>
                    </div>
                  </td>

                  <td>{docente.cedula}</td>

                  <td>{docente.especialidad}</td>

                  <td>{docente.titulo}</td>

                  <td>{docente.telefono}</td>

                  <td>{docente.correo}</td>

                  <td><span className="students-role-badge">{rolesActivos.find((rol) => rol.id === docente.rolId)?.nombre ?? "Sin rol"}</span></td>

                  <td>{docente.materiaIds.length}</td>
                  <td>{docente.cursos.length}</td>

                  <td>

                    <div className="students-actions">

                      <button
                        type="button"
                        className="students-action-button students-action-button--edit"
                        onClick={() => editarDocente(docente)}
                        title="Editar"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>

                      <button
                        type="button"
                        className="students-action-button students-action-button--delete"
                        onClick={() => eliminarDocente(docente)}
                        title="Eliminar"
                      >
                        <i className="bi bi-trash3"></i>
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {docentesFiltrados.length === 0 && (

            <div className="students-empty">

              <i className="bi bi-search"></i>

              <p>No existen docentes registrados.</p>

            </div>

          )}

        </div>

        {docentesFiltrados.length > 0 && (

          <div className="students-pagination">

            <button
              type="button"
              disabled={paginaVisible === 1}
              onClick={() =>
                setPaginaActual((pagina) => pagina - 1)
              }
            >
              <i className="bi bi-chevron-left"></i>
              Anterior
            </button>

            <div>

              {Array.from(
                { length: totalPaginas },
                (_, indice) => indice + 1
              ).map((pagina) => (

                <button
                  key={pagina}
                  type="button"
                  className={
                    pagina === paginaVisible
                      ? "students-page-button--active"
                      : ""
                  }
                  onClick={() => setPaginaActual(pagina)}
                >
                  {pagina}
                </button>

              ))}

            </div>

            <button
              type="button"
              disabled={paginaVisible === totalPaginas}
              onClick={() =>
                setPaginaActual((pagina) => pagina + 1)
              }
            >
              Siguiente
              <i className="bi bi-chevron-right"></i>
            </button>

          </div>

        )}

      </Card>
    </div>
  </MainLayout>
);

}

export default Docentes;
