import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import BackHomeButton from "../../components/common/BackHomeButton";
import Card from "../../components/common/Card";
import "./Asistencia.css";
import { api, getApiErrorMessage } from "../../api/client";

interface Estudiante {
  id: number;
  nombre: string;
  identificacion: string;
  presente: boolean;
}

function obtenerFechaActual(): string {
  const fecha = new Date();
  const fechaLocal = new Date(
    fecha.getTime() - fecha.getTimezoneOffset() * 60_000
  );

  return fechaLocal.toISOString().split("T")[0];
}

function Asistencia() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [materias, setMaterias] = useState<Array<{ id: number; nombre: string }>>([]);

  const [grado, setGrado] = useState("5° A");
  const [fecha, setFecha] = useState(obtenerFechaActual());
  const [asignatura, setAsignatura] = useState("Matemáticas");
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    Promise.all([api.get<any[]>("/alumnos"), api.get<Array<{ id: number; nombre: string }>>("/materias")])
      .then(([alumnos, listaMaterias]) => {
        setEstudiantes(alumnos.map((alumno) => ({ id: alumno.id, nombre: `${alumno.nombres} ${alumno.apellidos}`, identificacion: alumno.cedula, presente: false })));
        setMaterias(listaMaterias);
        if (listaMaterias.length) setAsignatura(listaMaterias[0].nombre);
      })
      .catch((error) => setMensaje(getApiErrorMessage(error)));
  }, []);

  const estudiantesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return estudiantes;
    }

    return estudiantes.filter(
      (estudiante) =>
        estudiante.nombre.toLowerCase().includes(texto) ||
        estudiante.identificacion.includes(texto)
    );
  }, [busqueda, estudiantes]);

  const totalPresentes = estudiantes.filter(
    (estudiante) => estudiante.presente
  ).length;

  const totalAusentes = estudiantes.length - totalPresentes;

  const cambiarAsistencia = (id: number) => {
    setMensaje("");

    setEstudiantes((listaActual) =>
      listaActual.map((estudiante) =>
        estudiante.id === id
          ? {
              ...estudiante,
              presente: !estudiante.presente,
            }
          : estudiante
      )
    );
  };

  const marcarTodos = (presente: boolean) => {
    setMensaje("");

    setEstudiantes((listaActual) =>
      listaActual.map((estudiante) => ({
        ...estudiante,
        presente,
      }))
    );
  };

  const guardarAsistencia = async () => {
    setGuardando(true);
    setMensaje("");

    const materia = materias.find((item) => item.nombre === asignatura);
    if (!materia) { setGuardando(false); setMensaje("Seleccione una materia valida."); return; }
    try {
      await api.post("/asistencias/lote", {
        fecha,
        materiaId: materia.id,
        estudiantes: estudiantes.map((item) => ({ alumnoId: item.id, presente: item.presente, observacion: "" })),
      });
      setMensaje("La asistencia se guardo correctamente.");
    } catch (error) { setMensaje(getApiErrorMessage(error)); } finally { setGuardando(false); }


  };

  return (
    <MainLayout>
      <div className="pagina-asistencia">
      {/* Contenido */}
      <main className="contenido-asistencia">
        <section className="encabezado-pagina">
          <div>
            <span className="etiqueta-pagina">GESTIÓN ACADÉMICA</span>
            <h1>Ingreso de asistencia</h1>
            <p>Registra y verifica la asistencia diaria de los estudiantes.</p>
          </div>

          <BackHomeButton />
        </section>

        {/* Datos de la clase */}
        <Card as="section" className="tarjeta tarjeta-filtros">
          <div className="titulo-tarjeta">
            <div className="icono-tarjeta">▼</div>

            <div>
              <h2>Datos de la clase</h2>
              <p>Selecciona el curso, la fecha y la asignatura.</p>
            </div>
          </div>

          <div className="filtros-asistencia">
            <div className="campo">
              <label htmlFor="grado">Grado</label>

              <select
                id="grado"
                value={grado}
                onChange={(evento) => setGrado(evento.target.value)}
              >
                <option value="5° A">5° A</option>
                <option value="6° A">6° A</option>
                <option value="7° A">7° A</option>
              </select>
            </div>

            <div className="campo">
              <label htmlFor="fecha">Fecha</label>

              <input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(evento) => setFecha(evento.target.value)}
              />
            </div>

            <div className="campo">
              <label htmlFor="asignatura">Asignatura</label>

              <select
                id="asignatura"
                value={asignatura}
                onChange={(evento) => setAsignatura(evento.target.value)}
              >
                <option value="Matemáticas">Matemáticas</option>
                <option value="Lengua y Literatura">
                  Lengua y Literatura
                </option>
                <option value="Ciencias Naturales">
                  Ciencias Naturales
                </option>
                <option value="Estudios Sociales">
                  Estudios Sociales
                </option>
              </select>
            </div>
          </div>
        </Card>

        {/* Resumen */}
        <section className="resumen-asistencia">
          <Card as="article" className="resumen-card">
            <div className="resumen-icono resumen-icono-total">👥</div>

            <div>
              <span>Total estudiantes</span>
              <strong>{estudiantes.length}</strong>
            </div>
          </Card>

          <Card as="article" className="resumen-card">
            <div className="resumen-icono resumen-icono-presente">✓</div>

            <div>
              <span>Presentes</span>
              <strong>{totalPresentes}</strong>
            </div>
          </Card>

          <Card as="article" className="resumen-card">
            <div className="resumen-icono resumen-icono-ausente">✕</div>

            <div>
              <span>Ausentes</span>
              <strong>{totalAusentes}</strong>
            </div>
          </Card>
        </section>

        {/* Lista de estudiantes */}
        <Card as="section" className="tarjeta tarjeta-estudiantes">
          <div className="titulo-tarjeta">
            <div className="icono-tarjeta">▣</div>

            <div>
              <h2>Lista de estudiantes</h2>
              <p>
                {grado} · {asignatura} · {fecha}
              </p>
            </div>
          </div>

          <div className="barra-herramientas">
            <div className="buscador-estudiantes">
              <span>⌕</span>

              <input
                type="search"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Buscar por nombre o cédula"
              />
            </div>

            <div className="acciones-lista">
              <button
                type="button"
                className="boton-secundario"
                onClick={() => marcarTodos(true)}
              >
                ✓ Todos presentes
              </button>

              <button
                type="button"
                className="boton-secundario"
                onClick={() => marcarTodos(false)}
              >
                ✕ Todos ausentes
              </button>
            </div>
          </div>

          <div className="contenedor-tabla">
            <table className="tabla-asistencia">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Estudiante</th>
                  <th>Estado</th>
                  <th>Asistencia</th>
                </tr>
              </thead>

              <tbody>
                {estudiantesFiltrados.map((estudiante) => (
                  <tr key={estudiante.id}>
                    <td>{estudiante.id}</td>

                    <td>
                      <div className="informacion-estudiante">
                        <div className="avatar-estudiante">
                          {estudiante.nombre.charAt(0)}
                        </div>

                        <div>
                          <strong>{estudiante.nombre}</strong>
                          <span>C.I. {estudiante.identificacion}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={
                          estudiante.presente
                            ? "estado estado-presente"
                            : "estado estado-ausente"
                        }
                      >
                        {estudiante.presente ? "● Presente" : "● Ausente"}
                      </span>
                    </td>

                    <td>
                      <label className="interruptor">
                        <input
                          type="checkbox"
                          checked={estudiante.presente}
                          onChange={() =>
                            cambiarAsistencia(estudiante.id)
                          }
                        />

                        <span className="interruptor-control" />
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {estudiantesFiltrados.length === 0 && (
              <div className="sin-resultados">
                No se encontraron estudiantes.
              </div>
            )}
          </div>

          {mensaje && <div className="mensaje-exito">✓ {mensaje}</div>}

          <div className="pie-lista">
            <p>
              ⓘ Activa el interruptor para marcar al estudiante como presente.
            </p>

            <button
              type="button"
              className="boton-guardar"
              onClick={guardarAsistencia}
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "▣ Guardar asistencia"}
            </button>
          </div>
        </Card>
      </main>

      </div>
    </MainLayout>
  );
}

export default Asistencia;
