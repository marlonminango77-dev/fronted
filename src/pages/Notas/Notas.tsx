import { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
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

  //==========================
  // COLUMNAS
  //==========================

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

  //==========================
  // DATOS
  //==========================

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

  //==========================
  // ESTADOS
  //==========================

  const [estudiantes, setEstudiantes] = useState(estudiantesIniciales);

  const [mostrarTareas, setMostrarTareas] = useState(false);
  const [mostrarLecciones, setMostrarLecciones] = useState(false);
  const [mostrarExamenes, setMostrarExamenes] = useState(false);

  const [dialogTarea, setDialogTarea] = useState(false);
  const [dialogLeccion, setDialogLeccion] = useState(false);
  const [dialogExamen, setDialogExamen] = useState(false);
  const [dialogNotas, setDialogNotas] = useState(false);

  const [mensajeError, setMensajeError] = useState("");

  //==========================
  // MODALES
  //==========================

  const abrirTareas = () => {
    setMensajeError("");
    setMostrarTareas(true);
  };

  const abrirLecciones = () => {
    setMensajeError("");
    setMostrarLecciones(true);
  };

  const abrirExamenes = () => {
    setMensajeError("");
    setMostrarExamenes(true);
  };

  const cerrarTareas = () => setMostrarTareas(false);
  const cerrarLecciones = () => setMostrarLecciones(false);
  const cerrarExamenes = () => setMostrarExamenes(false);
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

  //==========================
  // CAMBIAR TAREAS
  //==========================

  const cambiarTarea = (
    estudiante: number,
    actividad: number,
    valor: string
  ) => {

    const copia = [...estudiantes];

    copia[estudiante].tareas[actividad] = valor;

    setEstudiantes(copia);

  };

  //==========================
  // CAMBIAR LECCIONES
  //==========================

  const cambiarLeccion = (
    estudiante: number,
    actividad: number,
    valor: string
  ) => {

    const copia = [...estudiantes];

    copia[estudiante].lecciones[actividad] = valor;

    setEstudiantes(copia);

  };

  //==========================
  // CAMBIAR EXÁMENES
  //==========================

  const cambiarExamen = (
    estudiante: number,
    actividad: number,
    valor: string
  ) => {

    const copia = [...estudiantes];

    copia[estudiante].examenes[actividad] = valor;

    setEstudiantes(copia);

  };

  //==========================
  // OBSERVACIÓN
  //==========================

  const cambiarObservacion = (
    estudiante: number,
    texto: string
  ) => {

    const copia = [...estudiantes];

    copia[estudiante].observacion = texto;

    setEstudiantes(copia);

  };

  //==========================
  // VALIDACIÓN
  //==========================

  const validarNotas = () => {

    for (const estudiante of estudiantes) {

      if (estudiante.tareas.some(n => n === "")) {
        setMensajeError("Debe completar todas las tareas.");
        return false;
      }

      if (estudiante.lecciones.some(n => n === "")) {
        setMensajeError("Debe completar todas las lecciones.");
        return false;
      }

      if (estudiante.examenes.some(n => n === "")) {
        setMensajeError("Debe completar todos los exámenes.");
        return false;
      }

    }

    setMensajeError("");

    return true;

  };

  //==========================
  // GUARDAR
  //==========================

  const guardarTareas = () => {

    if (!validarNotas()) return;

    setMostrarTareas(false);
    setDialogTarea(true);

  };

  const guardarLecciones = () => {

    if (!validarNotas()) return;

    setMostrarLecciones(false);
    setDialogLeccion(true);

  };

  const guardarExamenes = () => {

    if (!validarNotas()) return;

    setMostrarExamenes(false);
    setDialogExamen(true);

  };

  const guardarNotas = () => {

    setDialogNotas(true);

  };

  return (

    <MainLayout>
      <div className="contenedor-notas">

        <div className="encabezado">

          <h1>Gestión de Notas</h1>

          <Link to="/docente">
            <button className="btn-regresar">
              ← Regresar
            </button>
          </Link>

        </div>

        <div className="filtros">

          <div className="grupo">

            <label>Grado</label>

            <select>

              <option>Octavo EGB</option>
              <option>Noveno EGB</option>
              <option>Décimo EGB</option>

            </select>

          </div>

          <div className="grupo">

            <label>Asignatura</label>

            <select>

              <option>Matemáticas</option>
              <option>Lengua</option>
              <option>Ciencias</option>

            </select>

          </div>

          <div className="grupo">

            <label>Periodo</label>

            <select>

              <option>Primer Parcial</option>
              <option>Segundo Parcial</option>

            </select>

          </div>

        </div>

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

        <div className="acciones">

          <button
            className="btn-cancelar"
            type="button"
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

        {/* MODAL TAREAS */}
        {mostrarTareas && (

          <div className="modal-overlay">

            <div className="modal-grande">

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

                    ✖

                  </button>

                </div>
              </div>

              <div className="modal-filtros">

                <div>

                  <label>Grado</label>

                  <input
                    type="text"
                    value="Octavo EGB"
                    readOnly
                  />

                </div>

                <div>

                  <label>Asignatura</label>

                  <input
                    type="text"
                    value="Matemáticas"
                    readOnly
                  />

                </div>

                <div>

                  <label>Periodo</label>

                  <input
                    type="text"
                    value="Primer Parcial"
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
                        {actividad}
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
        {/* MODAL LECCIONES */}

        {mostrarLecciones && (

          <div className="modal-overlay">

            <div className="modal-grande">

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

                    ✖

                  </button>

                </div>
              </div>

              <div className="modal-filtros">

                <div>

                  <label>Grado</label>

                  <input
                    type="text"
                    value="Octavo EGB"
                    readOnly
                  />

                </div>

                <div>

                  <label>Asignatura</label>

                  <input
                    type="text"
                    value="Matemáticas"
                    readOnly
                  />

                </div>

                <div>

                  <label>Periodo</label>

                  <input
                    type="text"
                    value="Primer Parcial"
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
                        {leccion}
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
  <div className="modal-overlay">
    <div className="modal-grande">

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
            ✖
          </button>
        </div>
      </div>

      <div className="modal-filtros">
        <div>
          <label>Grado</label>
          <input
            type="text"
            value="Octavo EGB"
            readOnly
          />
        </div>

        <div>
          <label>Asignatura</label>
          <input
            type="text"
            value="Matemáticas"
            readOnly
          />
        </div>

        <div>
          <label>Periodo</label>
          <input
            type="text"
            value="Primer Parcial"
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
                {examen}
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

        {/* DIÁLOGOS DE CONFIRMACIÓN */}
        {dialogTarea && (

          <div className="dialog-overlay">

            <div className="dialog-box">

              <div className="dialog-icon">✅</div>

              <h3>Tareas guardadas correctamente</h3>

              <button
                className="btn-guardar"
                onClick={() => setDialogTarea(false)}
              >
                Aceptar
              </button>

            </div>

          </div>


        )}

        {dialogLeccion && (

          <div className="dialog-overlay">

            <div className="dialog-box">

              <div className="dialog-icon">✅</div>

              <h3>Lecciones guardadas correctamente</h3>

              <button
                className="btn-guardar"
                onClick={() => setDialogLeccion(false)}
              >
                Aceptar
              </button>

            </div>

          </div>

        )}

        {dialogExamen && (

          <div className="dialog-overlay">

            <div className="dialog-box">

              <div className="dialog-icon">✅</div>

              <h3>Exámenes guardados correctamente</h3>

              <button
                className="btn-guardar"
                onClick={() => setDialogExamen(false)}
              >
                Aceptar
              </button>

            </div>

          </div>

        )}

        {dialogNotas && (

          <div className="dialog-overlay">

            <div className="dialog-box">

              <div className="dialog-icon">🎉</div>

              <h2>Notas registradas correctamente</h2>

              <p>
                Toda la información fue almacenada exitosamente.
              </p>

              <button
                className="btn-guardar"
                onClick={() => setDialogNotas(false)}
              >
                Finalizar
              </button>

            </div>

          </div>

        )}

      </div>

    </MainLayout>


  )
    ;

}

