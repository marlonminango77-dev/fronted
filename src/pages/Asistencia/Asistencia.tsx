import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Asistencia.css";

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
  const navigate = useNavigate();

  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([
    {
      id: 1,
      nombre: "María José Pérez",
      identificacion: "1750012345",
      presente: true,
    },
    {
      id: 2,
      nombre: "Juan Carlos López",
      identificacion: "1750012346",
      presente: true,
    },
    {
      id: 3,
      nombre: "Ana Sofía Martínez",
      identificacion: "1750012347",
      presente: true,
    },
    {
      id: 4,
      nombre: "Diego Alejandro Ruiz",
      identificacion: "1750012348",
      presente: false,
    },
    {
      id: 5,
      nombre: "Valeria Fernández",
      identificacion: "1750012349",
      presente: true,
    },
  ]);

  const [grado, setGrado] = useState("5° A");
  const [fecha, setFecha] = useState(obtenerFechaActual());
  const [asignatura, setAsignatura] = useState("Matemáticas");
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

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

  const guardarAsistencia = () => {
    setGuardando(true);
    setMensaje("");

    const registro = {
      grado,
      fecha,
      asignatura,
      estudiantes,
      fechaRegistro: new Date().toISOString(),
    };

    localStorage.setItem(
      `asistencia-${grado}-${asignatura}-${fecha}`,
      JSON.stringify(registro)
    );

    setTimeout(() => {
      setGuardando(false);
      setMensaje("La asistencia se guardó correctamente.");
    }, 500);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("usuarioAutenticado");
    navigate("/login");
  };

  return (
    <div className="pagina-asistencia">
      {/* Barra superior */}
      <header className="barra-superior">
        <div className="marca-sistema">
          <div className="marca-logo">🏫</div>

          <div>
            <strong>Sistema Académico</strong>
            <span>República de Venezuela</span>
          </div>
        </div>

        <div className="usuario-sistema">
          <div className="usuario-informacion">
            <div className="usuario-icono">👤</div>

            <div>
              <strong>Usuario del sistema</strong>
              <span>Sesión activa</span>
            </div>
          </div>

          <button
            type="button"
            className="boton-cerrar"
            onClick={cerrarSesion}
          >
            ↪ Cerrar sesión
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main className="contenido-asistencia">
        <section className="encabezado-pagina">
          <div>
            <span className="etiqueta-pagina">GESTIÓN ACADÉMICA</span>
            <h1>Ingreso de asistencia</h1>
            <p>Registra y verifica la asistencia diaria de los estudiantes.</p>
          </div>

          <button
            type="button"
            className="boton-volver"
            onClick={() => navigate("/home")}
          >
            ← Volver al inicio
          </button>
        </section>

        {/* Datos de la clase */}
        <section className="tarjeta tarjeta-filtros">
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
        </section>

        {/* Resumen */}
        <section className="resumen-asistencia">
          <article className="resumen-card">
            <div className="resumen-icono resumen-icono-total">👥</div>

            <div>
              <span>Total estudiantes</span>
              <strong>{estudiantes.length}</strong>
            </div>
          </article>

          <article className="resumen-card">
            <div className="resumen-icono resumen-icono-presente">✓</div>

            <div>
              <span>Presentes</span>
              <strong>{totalPresentes}</strong>
            </div>
          </article>

          <article className="resumen-card">
            <div className="resumen-icono resumen-icono-ausente">✕</div>

            <div>
              <span>Ausentes</span>
              <strong>{totalAusentes}</strong>
            </div>
          </article>
        </section>

        {/* Lista de estudiantes */}
        <section className="tarjeta tarjeta-estudiantes">
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
        </section>
      </main>

      <footer className="pie-pagina">
        © 2026 Escuela de Educación Básica República de Venezuela
      </footer>
    </div>
  );
}

export default Asistencia;