import { useMemo, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import BackHomeButton from "../../components/common/BackHomeButton";
import Card from "../../components/common/Card";
import "./Estudiantes.css";

interface Estudiante {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  grado: string;
  paralelo: string;
  representante: string;
  telefono: string;
}

const estudiantesIniciales: Estudiante[] = [
  {
    id: 1,
    cedula: "1750012345",
    nombres: "María José",
    apellidos: "Pérez García",
    fechaNacimiento: "2014-05-18",
    grado: "Séptimo EGB",
    paralelo: "A",
    representante: "Carmen García",
    telefono: "0991234567",
  },
  {
    id: 2,
    cedula: "1750012346",
    nombres: "Juan Carlos",
    apellidos: "López Torres",
    fechaNacimiento: "2014-08-03",
    grado: "Séptimo EGB",
    paralelo: "A",
    representante: "Pedro López",
    telefono: "0987654321",
  },
];

const formularioInicial = {
  cedula: "",
  nombres: "",
  apellidos: "",
  fechaNacimiento: "",
  grado: "",
  paralelo: "",
  representante: "",
  telefono: "",
};

function Estudiantes() {
  const autenticado =
    localStorage.getItem("usuarioAutenticado") === "true";

  const [estudiantes, setEstudiantes] =
    useState<Estudiante[]>(estudiantesIniciales);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [filtroGrado, setFiltroGrado] = useState("");
  const [filtroParalelo, setFiltroParalelo] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const estudiantesPorPagina = 10;

  const estudiantesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return estudiantes.filter(
      (estudiante) =>
        (!termino ||
          `${estudiante.cedula} ${estudiante.nombres} ${estudiante.apellidos}`
            .toLowerCase()
            .includes(termino)) &&
        (!filtroGrado || estudiante.grado === filtroGrado) &&
        (!filtroParalelo || estudiante.paralelo === filtroParalelo),
    );
  }, [busqueda, estudiantes, filtroGrado, filtroParalelo]);

  const cursos = useMemo(() => {
    const resumen = new Map<string, { grado: string; paralelo: string; total: number }>();

    estudiantes.forEach((estudiante) => {
      const clave = `${estudiante.grado}-${estudiante.paralelo}`;
      const curso = resumen.get(clave);

      resumen.set(clave, {
        grado: estudiante.grado,
        paralelo: estudiante.paralelo,
        total: (curso?.total ?? 0) + 1,
      });
    });

    return Array.from(resumen.values());
  }, [estudiantes]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(estudiantesFiltrados.length / estudiantesPorPagina),
  );
  const paginaVisible = Math.min(paginaActual, totalPaginas);
  const inicioPagina = (paginaVisible - 1) * estudiantesPorPagina;
  const estudiantesPaginados = estudiantesFiltrados.slice(
    inicioPagina,
    inicioPagina + estudiantesPorPagina,
  );

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  function actualizarCampo(
    campo: keyof typeof formulario,
    valor: string,
  ) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
    setMensaje("");
  }

  function registrarEstudiante(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cedulaRepetida = estudiantes.some(
      (estudiante) =>
        estudiante.cedula === formulario.cedula.trim() &&
        estudiante.id !== editandoId,
    );

    if (cedulaRepetida) {
      setMensaje("Ya existe un estudiante con esta cédula.");
      return;
    }

    const datosEstudiante = {
      ...formulario,
      cedula: formulario.cedula.trim(),
      nombres: formulario.nombres.trim(),
      apellidos: formulario.apellidos.trim(),
      representante: formulario.representante.trim(),
      telefono: formulario.telefono.trim(),
    };

    if (editandoId !== null) {
      setEstudiantes((actuales) =>
        actuales.map((estudiante) =>
          estudiante.id === editandoId
            ? { ...estudiante, ...datosEstudiante }
            : estudiante,
        ),
      );
    } else {
      setEstudiantes((actuales) => [
        ...actuales,
        { id: Date.now(), ...datosEstudiante },
      ]);
    }

    setFormulario(formularioInicial);
    setEditandoId(null);
    setMensaje(
      editandoId === null
        ? "Estudiante registrado correctamente."
        : "Información actualizada correctamente.",
    );
  }

  function editarEstudiante(estudiante: Estudiante) {
    setFormulario({
      cedula: estudiante.cedula,
      nombres: estudiante.nombres,
      apellidos: estudiante.apellidos,
      fechaNacimiento: estudiante.fechaNacimiento,
      grado: estudiante.grado,
      paralelo: estudiante.paralelo,
      representante: estudiante.representante,
      telefono: estudiante.telefono,
    });
    setEditandoId(estudiante.id);
    setMensaje("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function eliminarEstudiante(estudiante: Estudiante) {
    if (
      window.confirm(
        `¿Deseas eliminar a ${estudiante.nombres} ${estudiante.apellidos}?`,
      )
    ) {
      setEstudiantes((actuales) =>
        actuales.filter((item) => item.id !== estudiante.id),
      );
    }
  }

  function filtrarCurso(grado: string, paralelo: string) {
    setFiltroGrado(grado);
    setFiltroParalelo(paralelo);
    setPaginaActual(1);
  }

  return (
    <MainLayout>
      <div className="students-page">
        <header className="students-header">
          <div>
            <p className="students-label">Gestión académica</p>
            <h1>Ingreso de estudiantes</h1>
            <p>Registra la información académica y del representante.</p>
          </div>

          <BackHomeButton />
        </header>

        <Card as="section" className="students-form-card">
          <div className="students-card-title">
            <span><i className="bi bi-person-plus-fill"></i></span>
            <div>
              <p>{editandoId === null ? "Nuevo registro" : "Edición"}</p>
              <h2>
                {editandoId === null
                  ? "Datos del estudiante"
                  : "Actualizar estudiante"}
              </h2>
            </div>
          </div>

          <form onSubmit={registrarEstudiante}>
            <div className="students-form-grid">
              <label>
                <span>Cédula</span>
                <input
                  required
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  placeholder="10 dígitos"
                  value={formulario.cedula}
                  onChange={(event) =>
                    actualizarCampo("cedula", event.target.value)
                  }
                />
              </label>

              <label>
                <span>Nombres</span>
                <input
                  required
                  maxLength={60}
                  placeholder="Nombres del estudiante"
                  value={formulario.nombres}
                  onChange={(event) =>
                    actualizarCampo("nombres", event.target.value)
                  }
                />
              </label>

              <label>
                <span>Apellidos</span>
                <input
                  required
                  maxLength={60}
                  placeholder="Apellidos del estudiante"
                  value={formulario.apellidos}
                  onChange={(event) =>
                    actualizarCampo("apellidos", event.target.value)
                  }
                />
              </label>

              <label>
                <span>Fecha de nacimiento</span>
                <input
                  required
                  type="date"
                  value={formulario.fechaNacimiento}
                  onChange={(event) =>
                    actualizarCampo("fechaNacimiento", event.target.value)
                  }
                />
              </label>

              <label>
                <span>Grado</span>
                <select
                  required
                  value={formulario.grado}
                  onChange={(event) =>
                    actualizarCampo("grado", event.target.value)
                  }
                >
                  <option value="">Seleccione un grado</option>
                  <option>Primero EGB</option>
                  <option>Segundo EGB</option>
                  <option>Tercero EGB</option>
                  <option>Cuarto EGB</option>
                  <option>Quinto EGB</option>
                  <option>Sexto EGB</option>
                  <option>Séptimo EGB</option>
                </select>
              </label>

              <label>
                <span>Paralelo</span>
                <select
                  required
                  value={formulario.paralelo}
                  onChange={(event) =>
                    actualizarCampo("paralelo", event.target.value)
                  }
                >
                  <option value="">Seleccione</option>
                  <option>A</option>
                  <option>B</option>
                  <option>C</option>
                </select>
              </label>

              <label>
                <span>Representante</span>
                <input
                  required
                  maxLength={100}
                  placeholder="Nombre del representante"
                  value={formulario.representante}
                  onChange={(event) =>
                    actualizarCampo("representante", event.target.value)
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
                  placeholder="Número de contacto"
                  value={formulario.telefono}
                  onChange={(event) =>
                    actualizarCampo("telefono", event.target.value)
                  }
                />
              </label>
            </div>

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

              <button type="submit" className="students-save-button">
                <i className="bi bi-check-lg"></i>
                {editandoId === null
                  ? "Registrar estudiante"
                  : "Guardar cambios"}
              </button>
            </div>
          </form>
        </Card>

        <section className="students-course-summary">
          <button
            type="button"
            className={
              !filtroGrado && !filtroParalelo
                ? "students-course-card students-course-card--active"
                : "students-course-card"
            }
            onClick={() => {
              setFiltroGrado("");
              setFiltroParalelo("");
              setPaginaActual(1);
            }}
          >
            <span><i className="bi bi-people-fill"></i></span>
            <div>
              <strong>Todos los cursos</strong>
              <small>{estudiantes.length} estudiantes</small>
            </div>
          </button>

          {cursos.map((curso) => (
            <button
              type="button"
              key={`${curso.grado}-${curso.paralelo}`}
              className={
                filtroGrado === curso.grado &&
                filtroParalelo === curso.paralelo
                  ? "students-course-card students-course-card--active"
                  : "students-course-card"
              }
              onClick={() => filtrarCurso(curso.grado, curso.paralelo)}
            >
              <span><i className="bi bi-mortarboard-fill"></i></span>
              <div>
                <strong>{curso.grado} “{curso.paralelo}”</strong>
                <small>{curso.total} estudiantes</small>
              </div>
            </button>
          ))}
        </section>

        <Card as="section" className="students-list-card">
          <div className="students-list-header">
            <div>
              <p className="students-label">Registros</p>
              <h2>Estudiantes ingresados</h2>
            </div>

            <label className="students-search">
              <i className="bi bi-search"></i>
              <input
                type="search"
                aria-label="Buscar estudiantes"
                placeholder="Buscar por nombre o cédula"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
              />
            </label>
          </div>

          <div className="students-filters">
            <label>
              <span>Grado</span>
              <select
                value={filtroGrado}
                onChange={(event) => {
                  setFiltroGrado(event.target.value);
                  setPaginaActual(1);
                }}
              >
                <option value="">Todos los grados</option>
                {[...new Set(estudiantes.map((estudiante) => estudiante.grado))]
                  .sort()
                  .map((grado) => (
                    <option key={grado}>{grado}</option>
                  ))}
              </select>
            </label>

            <label>
              <span>Paralelo</span>
              <select
                value={filtroParalelo}
                onChange={(event) => {
                  setFiltroParalelo(event.target.value);
                  setPaginaActual(1);
                }}
              >
                <option value="">Todos los paralelos</option>
                {[...new Set(estudiantes.map((estudiante) => estudiante.paralelo))]
                  .sort()
                  .map((paralelo) => (
                    <option key={paralelo}>{paralelo}</option>
                  ))}
              </select>
            </label>

            <p>
              Mostrando <strong>{estudiantesFiltrados.length}</strong> de{" "}
              <strong>{estudiantes.length}</strong> estudiantes
            </p>
          </div>

          <div className="students-table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Cédula</th>
                  <th>Curso</th>
                  <th>Representante</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estudiantesPaginados.map((estudiante) => (
                  <tr key={estudiante.id}>
                    <td>
                      <div className="students-person">
                        <span>{estudiante.nombres.charAt(0)}</span>
                        <strong>
                          {estudiante.nombres} {estudiante.apellidos}
                        </strong>
                      </div>
                    </td>
                    <td>{estudiante.cedula}</td>
                    <td>{estudiante.grado} “{estudiante.paralelo}”</td>
                    <td>{estudiante.representante}</td>
                    <td>{estudiante.telefono}</td>
                    <td>
                      <div className="students-actions">
                        <button
                          type="button"
                          className="students-action-button students-action-button--edit"
                          onClick={() => editarEstudiante(estudiante)}
                          aria-label={`Editar a ${estudiante.nombres}`}
                          title="Editar"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          type="button"
                          className="students-action-button students-action-button--delete"
                          onClick={() => eliminarEstudiante(estudiante)}
                          aria-label={`Eliminar a ${estudiante.nombres}`}
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

            {estudiantesFiltrados.length === 0 && (
              <div className="students-empty">
                <i className="bi bi-search"></i>
                <p>No se encontraron estudiantes.</p>
              </div>
            )}
          </div>

          {estudiantesFiltrados.length > 0 && (
            <div className="students-pagination">
              <button
                type="button"
                disabled={paginaVisible === 1}
                onClick={() => setPaginaActual((pagina) => pagina - 1)}
              >
                <i className="bi bi-chevron-left"></i>
                Anterior
              </button>

              <div>
                {Array.from({ length: totalPaginas }, (_, indice) => indice + 1)
                  .map((pagina) => (
                    <button
                      type="button"
                      key={pagina}
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
                onClick={() => setPaginaActual((pagina) => pagina + 1)}
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

export default Estudiantes;
