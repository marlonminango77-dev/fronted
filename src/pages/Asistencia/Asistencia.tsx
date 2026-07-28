import { useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import BackHomeButton from "../../components/common/BackHomeButton";
import Card from "../../components/common/Card";
import "./Asistencia.css";

interface Estudiante {
  id: number;
  nombre: string;
  identificacion: string;
  estado: "Presente" | "Atraso" | "Falta";
}

function obtenerFechaActual(): string {
  const fecha = new Date();
  const fechaLocal = new Date(
    fecha.getTime() - fecha.getTimezoneOffset() * 60_000
  );

  return fechaLocal.toISOString().split("T")[0];
}

function Asistencia() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([
    {
      id: 1,
      nombre: "María José Pérez",
      identificacion: "1750012345",
      estado: "Presente",
    },
    {
      id: 2,
      nombre: "Juan Carlos López",
      identificacion: "1750012346",
      estado: "Presente",
    },
    {
      id: 3,
      nombre: "Ana Sofía Martínez",
      identificacion: "1750012347",
      estado: "Atraso",
    },
    {
      id: 4,
      nombre: "Diego Alejandro Ruiz",
      identificacion: "1750012348",
      estado: "Falta",
    },
    {
      id: 5,
      nombre: "Valeria Fernández",
      identificacion: "1750012349",
      estado: "Presente",
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
    (estudiante) => estudiante.estado === "Presente"
  ).length;

  const totalAtrasos = estudiantes.filter(
    (estudiante) => estudiante.estado === "Atraso"
  ).length;

  const totalFaltas = estudiantes.filter(
    (estudiante) => estudiante.estado === "Falta"
  ).length;

  const cambiarAsistencia = (
    id: number,
    estado: Estudiante["estado"],
  ) => {
    setMensaje("");

    setEstudiantes((listaActual) =>
      listaActual.map((estudiante) =>
        estudiante.id === id
          ? { ...estudiante, estado }
          : estudiante
      )
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
              <span>Asistencia</span>
              <strong>{totalPresentes}</strong>
            </div>
          </Card>

          <Card as="article" className="resumen-card">
            <div className="resumen-icono resumen-icono-atraso">◷</div>

            <div>
              <span>Atrasos</span>
              <strong>{totalAtrasos}</strong>
            </div>
          </Card>

          <Card as="article" className="resumen-card">
            <div className="resumen-icono resumen-icono-ausente">✕</div>

            <div>
              <span>Faltas</span>
              <strong>{totalFaltas}</strong>
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

          </div>

          <div className="contenedor-tabla">
            <table className="tabla-asistencia">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Estudiante</th>
                  <th>Asistencia</th>
                  <th>Atraso</th>
                  <th>Falta</th>
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

                    {(["Presente", "Atraso", "Falta"] as const).map((estado) => (
                      <td key={estado}>
                        <label className={`casilla-asistencia casilla-${estado.toLowerCase()}`}>
                          <input
                            type="radio"
                            name={`asistencia-${estudiante.id}`}
                            checked={estudiante.estado === estado}
                            onChange={() => cambiarAsistencia(estudiante.id, estado)}
                            aria-label={`Marcar a ${estudiante.nombre} como ${estado.toLowerCase()}`}
                          />
                          <span aria-hidden="true">✓</span>
                        </label>
                      </td>
                    ))}
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
              ⓘ Selecciona una opción por estudiante: asistencia, atraso o falta.
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
