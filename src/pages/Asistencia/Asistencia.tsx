import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import BackHomeButton from "../../components/common/BackHomeButton";
import Card from "../../components/common/Card";
import { api, getApiErrorMessage } from "../../api/client";
import "./Asistencia.css";

interface AlumnoApi {
  id: number;
  nombres: string;
  apellidos: string;
  cedula: string;
  grado: string;
  paralelo: string;
  estado: string;
}

type EstadoAsistencia = "Presente" | "Ausente" | "Atraso" | "Justificada" | "Salida anticipada";
interface Estudiante extends AlumnoApi { asistencia: EstadoAsistencia; }

interface Materia {
  id: number;
  nombre: string;
  docente?: { nombres: string; apellidos: string } | null;
  docentes?: Array<{ nombres: string; apellidos: string }>;
}

interface AsistenciaGuardada {
  alumno: { id: number };
  estado?: EstadoAsistencia;
  presente?: boolean;
}

function fechaActual(): string {
  const fecha = new Date();
  const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60_000);
  return local.toISOString().split("T")[0];
}

function claveCurso(grado: string, paralelo: string) {
  return `${grado.trim()}|${paralelo.trim().toUpperCase()}`;
}

function nombreCurso(clave: string) {
  const [grado, paralelo] = clave.split("|");
  return `${grado} ${paralelo}`.trim();
}

function Asistencia() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [curso, setCurso] = useState("");
  const [materiaId, setMateriaId] = useState("");
  const [fecha, setFecha] = useState(fechaActual());
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cargandoRegistro, setCargandoRegistro] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<AlumnoApi[]>("/alumnos"),
      api.get<Materia[]>("/materias"),
    ])
      .then(([alumnos, asignaciones]) => {
        const activos = alumnos
          .filter((alumno) => alumno.estado === "Activo")
          .map((alumno) => ({ ...alumno, asistencia: "Ausente" as const }));
        setEstudiantes(activos);
        setMaterias(asignaciones);

        const primerAlumno = activos[0];
        const cursoInicial = primerAlumno
          ? claveCurso(primerAlumno.grado, primerAlumno.paralelo)
          : "";
        setCurso(cursoInicial);
      })
      .catch((error) => setMensaje(getApiErrorMessage(error)));
  }, []);

  const cursos = useMemo(() => {
    const claves = new Set<string>();
    estudiantes.forEach((alumno) =>
      claves.add(claveCurso(alumno.grado, alumno.paralelo)),
    );
    return [...claves].sort((a, b) =>
      nombreCurso(a).localeCompare(nombreCurso(b), "es"),
    );
  }, [estudiantes]);

  const materiasCurso = materias;

  const materiaSeleccionadaId = materiasCurso.some(
    (materia) => String(materia.id) === materiaId,
  )
    ? materiaId
    : materiasCurso[0]
      ? String(materiasCurso[0].id)
      : "";

  const estudiantesCurso = useMemo(
    () => estudiantes.filter(
      (estudiante) => claveCurso(estudiante.grado, estudiante.paralelo) === curso,
    ),
    [curso, estudiantes],
  );

  useEffect(() => {
    if (!curso || !materiaSeleccionadaId || !fecha) return;
    let vigente = true;
    setCargandoRegistro(true);
    api.get<AsistenciaGuardada[]>(`/asistencias/registro?fecha=${encodeURIComponent(fecha)}&materiaId=${materiaSeleccionadaId}`)
      .then((registros) => {
        if (!vigente) return;
        const porAlumno = new Map(registros.map((registro) => [registro.alumno.id, registro]));
        setEstudiantes((actuales) => actuales.map((estudiante) => {
          if (claveCurso(estudiante.grado, estudiante.paralelo) !== curso) return estudiante;
          const registro = porAlumno.get(estudiante.id);
          const asistencia = registro?.estado ?? (registro?.presente ? "Presente" : "Ausente");
          return { ...estudiante, asistencia };
        }));
      })
      .catch((error) => vigente && setMensaje(getApiErrorMessage(error)))
      .finally(() => vigente && setCargandoRegistro(false));
    return () => { vigente = false; };
  }, [curso, fecha, materiaSeleccionadaId]);

  const estudiantesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return estudiantesCurso.filter((estudiante) =>
      !texto ||
      `${estudiante.nombres} ${estudiante.apellidos} ${estudiante.cedula}`
        .toLowerCase()
        .includes(texto),
    );
  }, [busqueda, estudiantesCurso]);

  const presentes = estudiantesCurso.filter((estudiante) => estudiante.asistencia === "Presente").length;
  const atrasos = estudiantesCurso.filter((estudiante) => estudiante.asistencia === "Atraso").length;
  const ausentes = estudiantesCurso.filter((estudiante) => estudiante.asistencia === "Ausente").length;

  function cambiarAsistencia(
    id: number,
    asistencia: EstadoAsistencia,
  ) {
    setEstudiantes((actuales) =>
      actuales.map((estudiante) =>
        estudiante.id === id ? { ...estudiante, asistencia } : estudiante,
      ),
    );
  }

  function marcarTodos(asistencia: EstadoAsistencia) {
    const ids = new Set(estudiantesCurso.map((estudiante) => estudiante.id));
    setEstudiantes((actuales) =>
      actuales.map((estudiante) =>
        ids.has(estudiante.id) ? { ...estudiante, asistencia } : estudiante,
      ),
    );
  }

  async function guardarAsistencia() {
    if (!curso) return setMensaje("Seleccione un curso.");
    if (!materiaSeleccionadaId) return setMensaje("El curso no tiene una materia y docente asignados.");
    if (!estudiantesCurso.length) return setMensaje("El curso no tiene estudiantes registrados.");

    setGuardando(true);
    setMensaje("");
    try {
      await api.post("/asistencias/lote", {
        fecha,
        materiaId: Number(materiaSeleccionadaId),
        estudiantes: estudiantesCurso.map((estudiante) => ({
          alumnoId: estudiante.id,
          estado: estudiante.asistencia,
          observacion: "",
        })),
      });
      setMensaje("La asistencia del curso se guardó correctamente.");
    } catch (error) {
      setMensaje(getApiErrorMessage(error));
    } finally {
      setGuardando(false);
    }
  }

  const materiaSeleccionada = materiasCurso.find(
    (materia) => String(materia.id) === materiaSeleccionadaId,
  );

  return (
    <MainLayout>
      <div className="pagina-asistencia">
        <main className="contenido-asistencia">
          <section className="encabezado-pagina">
            <div>
              <span className="etiqueta-pagina">GESTIÓN ACADÉMICA</span>
              <h1>Ingreso de asistencia</h1>
              <p>Selecciona un curso y registra únicamente a sus estudiantes.</p>
            </div>
            <BackHomeButton />
          </section>

          <Card as="section" className="tarjeta tarjeta-filtros">
            <div className="titulo-tarjeta">
              <div className="icono-tarjeta"><i className="bi bi-funnel-fill" /></div>
              <div>
                <h2>Datos de la clase</h2>
                <p>Los cursos provienen de los estudiantes y las materias del catálogo.</p>
              </div>
            </div>

            <div className="filtros-asistencia">
              <div className="campo">
                <label htmlFor="grado">Curso</label>
                <select id="grado" value={curso} onChange={(evento) => setCurso(evento.target.value)}>
                  {!cursos.length && <option value="">No existen cursos</option>}
                  {cursos.map((item) => <option key={item} value={item}>{nombreCurso(item)}</option>)}
                </select>
              </div>
              <div className="campo">
                <label htmlFor="fecha">Fecha</label>
                <input id="fecha" type="date" value={fecha} onChange={(evento) => setFecha(evento.target.value)} />
              </div>
              <div className="campo">
                <label htmlFor="asignatura">Materia y docente</label>
                <select id="asignatura" value={materiaSeleccionadaId} onChange={(evento) => setMateriaId(evento.target.value)}>
                  {!materiasCurso.length && <option value="">Sin asignación</option>}
                  {materiasCurso.map((materia) => (
                    <option key={materia.id} value={materia.id}>
                      {materia.nombre} — {materia.docentes?.length ? materia.docentes.map((docente) => `${docente.nombres} ${docente.apellidos}`).join(", ") : "Sin docente"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <section className="resumen-asistencia">
            <Card as="article" className="resumen-card"><div className="resumen-icono resumen-icono-total"><i className="bi bi-people-fill" /></div><div><span>Total estudiantes</span><strong>{estudiantesCurso.length}</strong></div></Card>
            <Card as="article" className="resumen-card"><div className="resumen-icono resumen-icono-presente"><i className="bi bi-check-lg" /></div><div><span>Presentes</span><strong>{presentes}</strong></div></Card>
            <Card as="article" className="resumen-card"><div className="resumen-icono resumen-icono-atraso"><i className="bi bi-clock-fill" /></div><div><span>Atrasos</span><strong>{atrasos}</strong></div></Card>
            <Card as="article" className="resumen-card"><div className="resumen-icono resumen-icono-ausente"><i className="bi bi-x-lg" /></div><div><span>Ausentes</span><strong>{ausentes}</strong></div></Card>
          </section>

          <Card as="section" className="tarjeta tarjeta-estudiantes">
            <div className="titulo-tarjeta">
              <div className="icono-tarjeta"><i className="bi bi-card-checklist" /></div>
              <div>
                <h2>Lista de estudiantes</h2>
                <p>{curso ? nombreCurso(curso) : "Sin curso"} · {materiaSeleccionada?.nombre ?? "Sin materia"} · {fecha}</p>
              </div>
            </div>

            <div className="barra-herramientas">
              <div className="buscador-estudiantes"><i className="bi bi-search" /><input type="search" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Buscar por nombre o cédula" /></div>
              <div className="acciones-lista">
                <button type="button" className="boton-secundario" onClick={() => marcarTodos("Presente")}>Todos presentes</button>
                <button type="button" className="boton-secundario" onClick={() => marcarTodos("Ausente")}>Todos ausentes</button>
              </div>
            </div>

            <div className="contenedor-tabla">
              <table className="tabla-asistencia">
                <thead><tr><th>#</th><th>Estudiante</th><th>Estado</th><th>Asistencia</th></tr></thead>
                <tbody>
                  {estudiantesFiltrados.map((estudiante, indice) => (
                    <tr key={estudiante.id}>
                      <td>{indice + 1}</td>
                      <td><div className="informacion-estudiante"><div className="avatar-estudiante">{estudiante.nombres.charAt(0)}</div><div><strong>{estudiante.nombres} {estudiante.apellidos}</strong><span>C.I. {estudiante.cedula}</span></div></div></td>
                      <td><span className={`estado estado-${estudiante.asistencia.toLowerCase()}`}>● {estudiante.asistencia}</span></td>
                      <td>
                        <div className="checks-asistencia">
                          <label><input type="checkbox" checked={estudiante.asistencia === "Presente"} onChange={() => cambiarAsistencia(estudiante.id, "Presente")} /> Presente</label>
                          <label><input type="checkbox" checked={estudiante.asistencia === "Ausente"} onChange={() => cambiarAsistencia(estudiante.id, "Ausente")} /> Ausente</label>
                          <label><input type="checkbox" checked={estudiante.asistencia === "Atraso"} onChange={() => cambiarAsistencia(estudiante.id, "Atraso")} /> Atraso</label>
                          <label><input type="checkbox" checked={estudiante.asistencia === "Justificada"} onChange={() => cambiarAsistencia(estudiante.id, "Justificada")} /> Justificada</label>
                          <label><input type="checkbox" checked={estudiante.asistencia === "Salida anticipada"} onChange={() => cambiarAsistencia(estudiante.id, "Salida anticipada")} /> Salida anticipada</label>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!estudiantesFiltrados.length && <div className="sin-resultados">No existen estudiantes en el curso seleccionado.</div>}
            </div>

            {mensaje && <div className="mensaje-exito">{mensaje}</div>}
            <div className="pie-lista">
              <p>Selecciona el estado correspondiente para cada estudiante.</p>
              <button type="button" className="boton-guardar" onClick={guardarAsistencia} disabled={guardando || cargandoRegistro || !materiaSeleccionadaId || !estudiantesCurso.length}>{guardando ? "Guardando..." : cargandoRegistro ? "Cargando registro..." : "Guardar asistencia"}</button>
            </div>
          </Card>
        </main>
      </div>
    </MainLayout>
  );
}

export default Asistencia;
