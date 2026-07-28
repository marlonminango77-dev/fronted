import { useRef, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import BackHomeButton from "../../components/common/BackHomeButton";
import Card from "../../components/common/Card";
import FeedbackDialog from "../../components/common/FeedbackDialog";
import "./Notas.css";

type Estudiante = {
  id: number;
  nombre: string;
  tareas: string[];
  lecciones: string[];
  examenes: string[];
  observacion: string;
};

export default function Notas() {
  const respaldoEstudiantes = useRef<Estudiante[] | null>(null);
  const respaldoActividades = useRef<{
    tareas: string[];
    lecciones: string[];
    examenes: string[];
  } | null>(null);

  const [tareas, setTareas] = useState([
    "Actividad 1",
    "Actividad 2",
    "Actividad 3",
    "Actividad 4",
    "Actividad 5"
  ]);

  const [lecciones, setLecciones] = useState([
    "Lección 1",
    "Lección 2",
    "Lección 3",
    "Lección 4",
    "Lección 5"
  ]);

  const [examenes, setExamenes] = useState([
    "Parcial",
    "Final",
    "Recuperación",
    "Supletorio"
  ]);

  

  const estudiantesIniciales: Estudiante[] = [

    {
      id: 1,
      nombre: "María José Pérez",
      tareas: Array(tareas.length).fill(""),
      lecciones: Array(lecciones.length).fill(""),
      examenes: Array(examenes.length).fill(""),
      observacion: ""
    },

    {
      id: 2,
      nombre: "Juan Carlos López",
      tareas: Array(tareas.length).fill(""),
      lecciones: Array(lecciones.length).fill(""),
      examenes: Array(examenes.length).fill(""),
      observacion: ""
    },

    {
      id: 3,
      nombre: "Ana Sofía Martínez",
      tareas: Array(tareas.length).fill(""),
      lecciones: Array(lecciones.length).fill(""),
      examenes: Array(examenes.length).fill(""),
      observacion: ""
    },

    {
      id: 4,
      nombre: "Carlos Andrade",
      tareas: Array(tareas.length).fill(""),
      lecciones: Array(lecciones.length).fill(""),
      examenes: Array(examenes.length).fill(""),
      observacion: ""
    },

    {
      id: 5,
      nombre: "Valeria Torres",
      tareas: Array(tareas.length).fill(""),
      lecciones: Array(lecciones.length).fill(""),
      examenes: Array(examenes.length).fill(""),
      observacion: ""
    }

  ];

 

  const [estudiantes, setEstudiantes] = useState(estudiantesIniciales);
  const [grado, setGrado] = useState("Octavo EGB");
  const [asignatura, setAsignatura] = useState("Matemáticas");
  const [periodo, setPeriodo] = useState("Trimestre 1");

  const [mostrarTareas, setMostrarTareas] = useState(false);
  const [mostrarLecciones, setMostrarLecciones] = useState(false);
  const [mostrarExamenes, setMostrarExamenes] = useState(false);

  const [dialogTarea, setDialogTarea] = useState(false);
  const [dialogLeccion, setDialogLeccion] = useState(false);
  const [dialogExamen, setDialogExamen] = useState(false);
  const [dialogNotas, setDialogNotas] = useState(false);

  const [mensajeError, setMensajeError] = useState("");

  const abrirTareas = () => {
    setMensajeError("");
    respaldoEstudiantes.current = structuredClone(estudiantes);
    respaldoActividades.current = {
      tareas: [...tareas],
      lecciones: [...lecciones],
      examenes: [...examenes],
    };
    setMostrarTareas(true);
  };

  const abrirLecciones = () => {
    setMensajeError("");
    respaldoEstudiantes.current = structuredClone(estudiantes);
    respaldoActividades.current = {
      tareas: [...tareas],
      lecciones: [...lecciones],
      examenes: [...examenes],
    };
    setMostrarLecciones(true);
  };

  const abrirExamenes = () => {
    setMensajeError("");
    respaldoEstudiantes.current = structuredClone(estudiantes);
    respaldoActividades.current = {
      tareas: [...tareas],
      lecciones: [...lecciones],
      examenes: [...examenes],
    };
    setMostrarExamenes(true);
  };

  const restaurarRespaldo = () => {
    if (respaldoEstudiantes.current) {
      setEstudiantes(respaldoEstudiantes.current);
      respaldoEstudiantes.current = null;
    }
    if (respaldoActividades.current) {
      setTareas(respaldoActividades.current.tareas);
      setLecciones(respaldoActividades.current.lecciones);
      setExamenes(respaldoActividades.current.examenes);
      respaldoActividades.current = null;
    }
    setMensajeError("");
  };

  const cambiarNombreActividad = (
    categoria: "tareas" | "lecciones" | "examenes",
    indice: number,
    nombre: string,
  ) => {
    const actualizar = (actividades: string[]) =>
      actividades.map((actividad, posicion) =>
        posicion === indice ? nombre : actividad,
      );

    if (categoria === "tareas") setTareas(actualizar);
    if (categoria === "lecciones") setLecciones(actualizar);
    if (categoria === "examenes") setExamenes(actualizar);
  };

  const cerrarTareas = () => {
    restaurarRespaldo();
    setMostrarTareas(false);
  };

  const cerrarLecciones = () => {
    restaurarRespaldo();
    setMostrarLecciones(false);
  };

  const cerrarExamenes = () => {
    restaurarRespaldo();
    setMostrarExamenes(false);
  };
  const agregarActividadTarea = () => {

    setTareas(prev => [
      ...prev,
      `Actividad ${prev.length + 1}`
    ]);

    setEstudiantes(prev =>

      prev.map(estudiante => ({

        ...estudiante,

        tareas: [
          ...estudiante.tareas,
          ""
        ]

      }))

    );

  };
  const agregarActividadLeccion = () => {

    setLecciones(prev => [
      ...prev,
      `Lección ${prev.length + 1}`
    ]);

    setEstudiantes(prev =>
      prev.map(estudiante => ({
        ...estudiante,
        lecciones: [
          ...estudiante.lecciones,
          ""
        ]
      }))
    );

  };
  const agregarActividadExamen = () => {

    setExamenes(prev => [
      ...prev,
      `Examen ${prev.length + 1}`
    ]);

    setEstudiantes(prev =>

      prev.map(estudiante => ({

        ...estudiante,

        examenes: [
          ...estudiante.examenes,
          ""
        ]

      }))

    );

  };


  const cambiarTarea = (
    estudiante: number,
    actividad: number,
    valor: string
  ) => {

    setEstudiantes((actuales) =>
      actuales.map((item, fila) =>
        fila === estudiante
          ? {
              ...item,
              tareas: item.tareas.map((nota, columna) =>
                columna === actividad ? valor : nota,
              ),
            }
          : item,
      ),
    );

  };


  const cambiarLeccion = (
    estudiante: number,
    actividad: number,
    valor: string
  ) => {

    setEstudiantes((actuales) =>
      actuales.map((item, fila) =>
        fila === estudiante
          ? {
              ...item,
              lecciones: item.lecciones.map((nota, columna) =>
                columna === actividad ? valor : nota,
              ),
            }
          : item,
      ),
    );

  };


  const cambiarExamen = (
    estudiante: number,
    actividad: number,
    valor: string
  ) => {

    setEstudiantes((actuales) =>
      actuales.map((item, fila) =>
        fila === estudiante
          ? {
              ...item,
              examenes: item.examenes.map((nota, columna) =>
                columna === actividad ? valor : nota,
              ),
            }
          : item,
      ),
    );

  };


  const cambiarObservacion = (
    estudiante: number,
    texto: string
  ) => {

    setEstudiantes((actuales) =>
      actuales.map((item, fila) =>
        fila === estudiante ? { ...item, observacion: texto } : item,
      ),
    );

  };


  const validarCategoria = (
    categoria: "tareas" | "lecciones" | "examenes",
    etiqueta: string,
  ) => {
    const actividades = { tareas, lecciones, examenes }[categoria];

    if (actividades.some((actividad) => actividad.trim() === "")) {
      setMensajeError("Cada actividad debe tener un nombre.");
      return false;
    }

    for (const estudiante of estudiantes) {
      for (const nota of estudiante[categoria]) {
        if (nota.trim() === "") {
          continue;
        }

        const valor = Number(nota);
        if (!Number.isFinite(valor) || valor < 0 || valor > 10) {
          setMensajeError(
            `Las notas de ${etiqueta} deben estar entre 0 y 10.`,
          );
          return false;
        }
      }
    }

    setMensajeError("");
    return true;
  };

  const guardarTareas = () => {

    if (!validarCategoria("tareas", "tareas")) return;

    respaldoEstudiantes.current = null;
    respaldoActividades.current = null;
    setMostrarTareas(false);
    setDialogTarea(true);

  };

  const guardarLecciones = () => {

    if (!validarCategoria("lecciones", "lecciones")) return;

    respaldoEstudiantes.current = null;
    respaldoActividades.current = null;
    setMostrarLecciones(false);
    setDialogLeccion(true);

  };

  const guardarExamenes = () => {

    if (!validarCategoria("examenes", "evaluaciones")) return;

    respaldoEstudiantes.current = null;
    respaldoActividades.current = null;
    setMostrarExamenes(false);
    setDialogExamen(true);

  };

  const guardarNotas = () => {
    const registro = {
      grado,
      asignatura,
      periodo,
      estudiantes,
      fechaRegistro: new Date().toISOString(),
    };

    localStorage.setItem("registro-notas", JSON.stringify(registro));
    setDialogNotas(true);
  };

  const cancelarNotas = () => {
    setEstudiantes(estudiantesIniciales);
    setMensajeError("");
  };

 return (
  <MainLayout>
    <div className="contenedor-notas">

      <section className="notas-header">
        <div>
          <p>Gestión académica</p>
          <h1>Ingreso de Notas</h1>
        </div>

        <BackHomeButton />
      </section>

      <Card as="section" className="filtros-section">
        <div className="filtros">

          <div className="grupo">

            <label htmlFor="filtro-grado">Grado</label>

            <select
              id="filtro-grado"
              value={grado}
              onChange={(event) => setGrado(event.target.value)}
            >
              <option>Octavo EGB</option>
              <option>Noveno EGB</option>
              <option>Décimo EGB</option>
            </select>
          </div>

          <div className="grupo">
            <label htmlFor="filtro-asignatura">Asignatura</label>

            <select
              id="filtro-asignatura"
              value={asignatura}
              onChange={(event) => setAsignatura(event.target.value)}
            >
              <option>Matemáticas</option>
              <option>Lengua</option>
              <option>Ciencias</option>
            </select>
          </div>

          <div className="grupo">
            <label htmlFor="filtro-periodo">Trimestre</label>

            <select
              id="filtro-periodo"
              value={periodo}
              onChange={(event) => setPeriodo(event.target.value)}
            >
              <option>Trimestre 1</option>
              <option>Trimestre 2</option>
              <option>Trimestre 3</option>
            </select>
          </div>

        </div>
      </Card>

      <Card as="section" className="tabla-section">
        <div className="tabla-container">

          <table className="tabla-notas">

            <thead>
              <tr>
                <th>#</th>

                <th>Estudiante</th>

                <th>
                  <button
                    className="btn-columna"
                    onClick={abrirTareas}
                  >
                    Tareas
                  </button>
                </th>

                <th>
                  <button
                    className="btn-columna"
                    onClick={abrirLecciones}
                  >
                    Lecciones
                  </button>
                </th>

                <th>
                  <button
                    className="btn-columna"
                    onClick={abrirExamenes}
                  >
                    Exámenes
                  </button>
                </th>

                <th>Nota Final</th>
              </tr>
            </thead>

            <tbody>

              {estudiantes.map((estudiante) => {

                const promedioTareas =
                  estudiante.tareas.reduce(
                    (suma, nota) => suma + (Number(nota) || 0),
                    0
                  ) / tareas.length;

                const promedioLecciones =
                  estudiante.lecciones.reduce(
                    (suma, nota) => suma + (Number(nota) || 0),
                    0
                  ) / lecciones.length;

                const promedioExamenes =
                  estudiante.examenes.reduce(
                    (suma, nota) => suma + (Number(nota) || 0),
                    0
                  ) / examenes.length;

                const notaFinal =

                  promedioTareas * 0.30 +

                  promedioLecciones * 0.30 +

                  promedioExamenes * 0.40;

                return (

                  <tr key={estudiante.id}>

                    <td>{estudiante.id}</td>

                    <td>{estudiante.nombre}</td>

                    <td>{promedioTareas.toFixed(2)}</td>

                    <td>{promedioLecciones.toFixed(2)}</td>

                    <td>{promedioExamenes.toFixed(2)}</td>

                    <td className="nota-final">

                      {notaFinal.toFixed(2)}

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>
        </Card>

        <div className="acciones">

          <button
            className="btn-cancelar"
            type="button"
            onClick={cancelarNotas}
          >
            Cancelar
          </button>

          <button
            className="btn-guardar"
            type="button"
            onClick={guardarNotas}
          >
            Guardar Notas
          </button>

        </div>
        {mostrarTareas && (

          <div className="modal-overlay" onMouseDown={cerrarTareas}>

            <div
              className="modal-grande"
              role="dialog"
              aria-modal="true"
              aria-label="Registro de tareas"
              onMouseDown={(event) => event.stopPropagation()}
            >

              <div className="modal-header">

                <h2>Registro de Tareas</h2>

                <div className="acciones-header">

                  <button

                    className="btn-agregar-columna"

                    onClick={agregarActividadTarea}

                  >

                    ➕ Añadir actividad

                  </button>

                  <button

                    className="btn-cerrar"

                    onClick={cerrarTareas}

                  >

                    ✕

                  </button>

                </div>
              </div>

              <div className="modal-filtros">

                <div>

                  <label>Grado</label>

                  <input
                    type="text"
                    value={grado}
                    readOnly
                  />

                </div>

                <div>

                  <label>Asignatura</label>

                  <input
                    type="text"
                    value={asignatura}
                    readOnly
                  />

                </div>

                <div>

                  <label>Periodo</label>

                  <input
                    type="text"
                    value={periodo}
                    readOnly
                  />

                </div>

              </div>

              <table className="tabla-modal">

                <thead>

                  <tr>

                    <th>#</th>

                    <th>Estudiante</th>

                    {tareas.map((actividad, index) => (

                      <th key={index}>
                        <input
                          className="input-nombre-actividad"
                          type="text"
                          value={actividad}
                          aria-label={`Nombre de la tarea ${index + 1}`}
                          onChange={(event) =>
                            cambiarNombreActividad("tareas", index, event.target.value)
                          }
                        />
                      </th>

                    ))}

                    <th>Observación</th>

                  </tr>

                </thead>

                <tbody>

                  {estudiantes.map((estudiante, fila) => (

                    <tr key={estudiante.id}>

                      <td>{estudiante.id}</td>

                      <td>{estudiante.nombre}</td>
                      {tareas.map((_, columna) => (

                        <td key={columna}>

                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.01"
                            className="input-nota"
                            value={estudiante.tareas[columna]}
                            onChange={(e) =>
                              cambiarTarea(
                                fila,
                                columna,
                                e.target.value
                              )
                            }
                          />

                        </td>

                      ))}

                      <td>

                        <textarea
                          className="input-observacion"
                          placeholder="Observaciones..."
                          value={estudiante.observacion}
                          onChange={(e) =>
                            cambiarObservacion(
                              fila,
                              e.target.value
                            )
                          }
                        />

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

              {mensajeError && (

                <div className="mensaje-error">

                  {mensajeError}

                </div>


              )}

              <div className="modal-footer">

                <button
                  className="btn-cancelar"
                  onClick={cerrarTareas}
                >
                  Cancelar
                </button>

                <button
                  className="btn-guardar"
                  onClick={guardarTareas}
                >
                  Guardar Tareas
                </button>

              </div>

            </div>

          </div>

        )}
        {mostrarLecciones && (

          <div className="modal-overlay" onMouseDown={cerrarLecciones}>

            <div
              className="modal-grande"
              role="dialog"
              aria-modal="true"
              aria-label="Registro de lecciones"
              onMouseDown={(event) => event.stopPropagation()}
            >

              <div className="modal-header">

                <h2>Registro de Lecciones</h2>

                <div className="acciones-header">

                  <button

                    className="btn-agregar-columna"

                    onClick={agregarActividadLeccion}

                  >

                    ➕ Añadir actividad

                  </button>

                  <button

                    className="btn-cerrar"

                    onClick={cerrarLecciones}

                  >

                    ✕

                  </button>

                </div>
              </div>

              <div className="modal-filtros">

                <div>

                  <label>Grado</label>

                  <input
                    type="text"
                    value={grado}
                    readOnly
                  />

                </div>

                <div>

                  <label>Asignatura</label>

                  <input
                    type="text"
                    value={asignatura}
                    readOnly
                  />

                </div>

                <div>

                  <label>Periodo</label>

                  <input
                    type="text"
                    value={periodo}
                    readOnly
                  />

                </div>

              </div>

              <table className="tabla-modal">

                <thead>

                  <tr>

                    <th>#</th>

                    <th>Estudiante</th>

                    {lecciones.map((leccion, index) => (

                      <th key={index}>
                        <input
                          className="input-nombre-actividad"
                          type="text"
                          value={leccion}
                          aria-label={`Nombre de la lección ${index + 1}`}
                          onChange={(event) =>
                            cambiarNombreActividad("lecciones", index, event.target.value)
                          }
                        />
                      </th>

                    ))}

                    <th>Observación</th>

                  </tr>

                </thead>

                <tbody>

                  {estudiantes.map((estudiante, fila) => (

                    <tr key={estudiante.id}>

                      <td>{estudiante.id}</td>

                      <td>{estudiante.nombre}</td>

                      {lecciones.map((_, columna) => (

                        <td key={columna}>

                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.01"
                            className="input-nota"
                            value={estudiante.lecciones[columna]}
                            onChange={(e) =>
                              cambiarLeccion(
                                fila,
                                columna,
                                e.target.value
                              )
                            }
                          />

                        </td>

                      ))}
                      <td>

                        <textarea
                          className="input-observacion"
                          placeholder="Observaciones..."
                          value={estudiante.observacion}
                          onChange={(e) =>
                            cambiarObservacion(
                              fila,
                              e.target.value
                            )
                          }
                        />

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

              {mensajeError && (

                <div className="mensaje-error">

                  {mensajeError}

                </div>

              )}

              <div className="modal-footer">

                <button
                  className="btn-cancelar"
                  onClick={cerrarLecciones}
                >
                  Cancelar
                </button>

                <button
                  className="btn-guardar"
                  onClick={guardarLecciones}
                >
                  Guardar Lecciones
                </button>

              </div>

            </div>

          </div>

        )}


        {/* MODAL EXÁMENES */}

{mostrarExamenes && (
  <div className="modal-overlay" onMouseDown={cerrarExamenes}>
    <div
      className="modal-grande"
      role="dialog"
      aria-modal="true"
      aria-label="Registro de evaluaciones"
      onMouseDown={(event) => event.stopPropagation()}
    >

      <div className="modal-header">
        <h2>Registro de Exámenes</h2>

        <div className="acciones-header">
          <button
            className="btn-agregar-columna"
            onClick={agregarActividadExamen}
          >
            ➕ Añadir actividad
          </button>

          <button
            className="btn-cerrar"
            onClick={cerrarExamenes}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="modal-filtros">
        <div>
          <label>Grado</label>
          <input
            type="text"
            value={grado}
            readOnly
          />
        </div>

        <div>
          <label>Asignatura</label>
          <input
            type="text"
            value={asignatura}
            readOnly
          />
        </div>

        <div>
          <label>Periodo</label>
          <input
            type="text"
            value={periodo}
            readOnly
          />
        </div>
      </div>

      <table className="tabla-modal">
        <thead>
          <tr>
            <th>#</th>
            <th>Estudiante</th>

            {examenes.map((examen, index) => (
              <th key={index}>
                <input
                          className="input-nombre-actividad"
                          type="text"
                          value={examen}
                          aria-label={`Nombre del examen ${index + 1}`}
                          onChange={(event) =>
                            cambiarNombreActividad("examenes", index, event.target.value)
                          }
                        />
              </th>
            ))}

            <th>Observación</th>
          </tr>
        </thead>

        <tbody>
          {estudiantes.map((estudiante, fila) => (
            <tr key={estudiante.id}>
              <td>{estudiante.id}</td>
              <td>{estudiante.nombre}</td>

              {examenes.map((_, columna) => (
                <td key={columna}>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    className="input-nota"
                    value={estudiante.examenes[columna]}
                    onChange={(e) =>
                      cambiarExamen(
                        fila,
                        columna,
                        e.target.value
                      )
                    }
                  />
                </td>
              ))}

              <td>
                <textarea
                  className="input-observacion"
                  placeholder="Observaciones..."
                  value={estudiante.observacion}
                  onChange={(e) =>
                    cambiarObservacion(
                      fila,
                      e.target.value
                    )
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

                {mensajeError && (

                  <div className="mensaje-error">

                    {mensajeError}

                  </div>

                )}

                <div className="modal-footer">

                  <button
                    className="btn-cancelar"
                    onClick={cerrarExamenes}
                  >
                    Cancelar
                  </button>

                  <button
                    className="btn-guardar"
                    onClick={guardarExamenes}
                  >
                    Guardar Exámenes
                  </button>

                </div>

              </div>

            </div>

        )}

        <FeedbackDialog
          open={dialogTarea}
          title="Tareas guardadas"
          message="Las calificaciones de tareas se actualizaron correctamente."
          onClose={() => setDialogTarea(false)}
        />

        <FeedbackDialog
          open={dialogLeccion}
          title="Lecciones guardadas"
          message="Las calificaciones de lecciones se actualizaron correctamente."
          onClose={() => setDialogLeccion(false)}
        />

        <FeedbackDialog
          open={dialogExamen}
          title="Evaluaciones guardadas"
          message="Las calificaciones de evaluaciones se actualizaron correctamente."
          onClose={() => setDialogExamen(false)}
        />

        <FeedbackDialog
          open={dialogNotas}
          title="Notas registradas"
          message="Toda la información académica fue almacenada correctamente."
          buttonLabel="Finalizar"
          onClose={() => setDialogNotas(false)}
        />

      </div>

    </MainLayout>


  )
    ;

}
