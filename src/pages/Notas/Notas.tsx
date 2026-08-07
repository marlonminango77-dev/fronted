import { useEffect, useRef, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import BackHomeButton from "../../components/common/BackHomeButton";
import Card from "../../components/common/Card";
import FeedbackDialog from "../../components/common/FeedbackDialog";
import "./Notas.css";
import { api, getApiErrorMessage } from "../../api/client";

type Estudiante = {
  id: number;
  nombre: string;
  tareas: string[];
  lecciones: string[];
  examenes: string[];
  observacion: string;
};

interface AlumnoApi { id:number;nombres:string;apellidos:string;grado:string;paralelo:string;estado:string }
interface MateriaApi { id:number;nombre:string }
interface ActividadApi { id:number;nombre:string;tipo:string;periodo:string;grado:string;paralelo:string;materia?:{id:number} }
interface NotaApi { calificacion:number;alumno?:{id:number};actividad?:{id:number} }
interface PeriodoApi { id:number;nombre:string;cerrado:boolean }
interface ObservacionApi {id?:number;alumno?:{id:number};academica?:string;comportamiento?:string;autor?:string;fechaActualizacion?:string}

export default function Notas() {
  const respaldoEstudiantes = useRef<Estudiante[] | null>(null);
  const respaldoActividades = useRef<{
    tareas: string[];
    lecciones: string[];
    examenes: string[];
  } | null>(null);

  const [tareas, setTareas] = useState<string[]>([]);

  const [lecciones, setLecciones] = useState<string[]>([]);

  const [examenes, setExamenes] = useState<string[]>([]);



  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [materiasApi, setMateriasApi] = useState<Array<{ id: number; nombre: string }>>([]);
  const [cursos, setCursos] = useState<string[]>([]);
  const [idsTareas, setIdsTareas] = useState<Array<number | null>>([]);
  const [idsLecciones, setIdsLecciones] = useState<Array<number | null>>([]);
  const [idsExamenes, setIdsExamenes] = useState<Array<number | null>>([]);
  const [grado, setGrado] = useState("");
  const [asignatura, setAsignatura] = useState("");
  const [periodo, setPeriodo] = useState("Trimestre 1");
  const [periodosApi, setPeriodosApi] = useState<PeriodoApi[]>([]);
  const [publicando, setPublicando] = useState(false);
  const [observaciones,setObservaciones]=useState<Record<number,{academica:string;comportamiento:string}>>({});
  const [guardandoObservacion,setGuardandoObservacion]=useState<number|null>(null);

  const [mostrarTareas, setMostrarTareas] = useState(false);
  const [mostrarLecciones, setMostrarLecciones] = useState(false);
  const [mostrarExamenes, setMostrarExamenes] = useState(false);

  const [dialogTarea, setDialogTarea] = useState(false);
  const [dialogLeccion, setDialogLeccion] = useState(false);
  const [dialogExamen, setDialogExamen] = useState(false);
  const [dialogNotas, setDialogNotas] = useState(false);

  const [mensajeError, setMensajeError] = useState("");
  const [actividadAEliminar, setActividadAEliminar] = useState({
    tareas: "",
    lecciones: "",
    examenes: "",
  });

  useEffect(() => {
    Promise.all([api.get<AlumnoApi[]>("/alumnos"), api.get<MateriaApi[]>("/materias"), api.get<ActividadApi[]>("/actividades"), api.get<NotaApi[]>("/notas"), api.get<PeriodoApi[]>("/configuracion-academica/periodos")])
      .then(([alumnos, materias, actividades, notas, periodosConfigurados]) => {
        setPeriodosApi(periodosConfigurados);
        if (!periodosConfigurados.some(p=>p.nombre===periodo) && periodosConfigurados[0]) setPeriodo(periodosConfigurados[0].nombre);
        setMateriasApi(materias);
        const cursosDisponibles = [...new Set(
          alumnos
            .filter((alumno) => alumno.estado === "Activo")
            .map((alumno) => `${alumno.grado}|${alumno.paralelo.toUpperCase()}`),
        )].sort();
        setCursos(cursosDisponibles);

        const cursoActivo = cursosDisponibles.includes(grado)
          ? grado
          : (cursosDisponibles[0] ?? "");
        const asignaturaActiva = materias.some((materia) => materia.nombre === asignatura)
          ? asignatura
          : (materias[0]?.nombre ?? "");
        if (cursoActivo !== grado) setGrado(cursoActivo);
        if (asignaturaActiva !== asignatura) setAsignatura(asignaturaActiva);

        const [gradoActivo = "", paraleloActivo = ""] = cursoActivo.split("|");
        const materiaId = materias.find((materia) => materia.nombre === asignaturaActiva)?.id;
        const delPeriodo = actividades.filter((actividad) =>
          (!materiaId || actividad.materia?.id === materiaId)
          && actividad.periodo === periodo
          && actividad.grado === gradoActivo
          && actividad.paralelo.toUpperCase() === paraleloActivo,
        );
        const porTipo = (tipo: string) => delPeriodo.filter((a) => a.tipo === tipo);
        const ts = porTipo("Tarea"), ls = porTipo("Leccion"), es = porTipo("Examen");
        setTareas(ts.map((a) => a.nombre)); setIdsTareas(ts.map((a) => a.id));
        setLecciones(ls.map((a) => a.nombre)); setIdsLecciones(ls.map((a) => a.id));
        setExamenes(es.map((a) => a.nombre)); setIdsExamenes(es.map((a) => a.id));
        setActividadAEliminar({ tareas: "", lecciones: "", examenes: "" });
        const valor = (alumnoId: number, actividadId: number) => String(notas.find((n) => n.alumno?.id === alumnoId && n.actividad?.id === actividadId)?.calificacion ?? "");
        setEstudiantes(
          alumnos
            .filter((alumno) =>
              alumno.estado === "Activo"
              && alumno.grado === gradoActivo
              && alumno.paralelo.toUpperCase() === paraleloActivo,
            )
            .map((alumno) => ({
              id: alumno.id,
              nombre: `${alumno.nombres} ${alumno.apellidos}`,
              tareas: ts.map((actividad) => valor(alumno.id, actividad.id)),
              lecciones: ls.map((actividad) => valor(alumno.id, actividad.id)),
              examenes: es.map((actividad) => valor(alumno.id, actividad.id)),
              observacion: "",
            })),
        );
      })
      .catch((error) => setMensajeError(getApiErrorMessage(error)));
  }, [periodo, grado, asignatura]);

  useEffect(()=>{const [g="",p=""]=grado.split("|");if(!g||!p||!periodo)return;const params=new URLSearchParams({grado:g,paralelo:p,periodo});api.get<ObservacionApi[]>(`/observaciones-estudiantes?${params}`).then(lista=>setObservaciones(Object.fromEntries(lista.filter(o=>o.alumno?.id).map(o=>[o.alumno!.id,{academica:o.academica??"",comportamiento:o.comportamiento??""}])))).catch(e=>setMensajeError(getApiErrorMessage(e)))},[grado,periodo]);

  function cambiarSeguimiento(id:number,campo:"academica"|"comportamiento",valor:string){setObservaciones(a=>({...a,[id]:{academica:a[id]?.academica??"",comportamiento:a[id]?.comportamiento??"",[campo]:valor}}))}
  async function guardarObservacion(id:number){setGuardandoObservacion(id);setMensajeError("");try{const valor=observaciones[id]??{academica:"",comportamiento:""};await api.put(`/observaciones-estudiantes/${id}?periodo=${encodeURIComponent(periodo)}`,valor)}catch(e){setMensajeError(getApiErrorMessage(e))}finally{setGuardandoObservacion(null)}}

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

    setIdsTareas(prev => [...prev, null]);
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

    setIdsLecciones(prev => [...prev, null]);
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

    setIdsExamenes(prev => [...prev, null]);
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


  const eliminarActividad = async (
    categoria: "tareas" | "lecciones" | "examenes",
  ) => {
    const actividades = { tareas, lecciones, examenes }[categoria];
    const ids = { tareas: idsTareas, lecciones: idsLecciones, examenes: idsExamenes }[categoria];
    const seleccion = actividadAEliminar[categoria];
    if (seleccion === "") {
      setMensajeError("Seleccione la actividad que desea eliminar.");
      return;
    }

    const indice = Number(seleccion);
    const nombre = actividades[indice];
    const actividadId = ids[indice];
    if (!window.confirm(`Se eliminará “${nombre}” y todas sus notas. ¿Desea continuar?`)) return;

    try {
      if (actividadId) {
        await api.delete(`/actividades/${actividadId}`);
        respaldoEstudiantes.current = null;
        respaldoActividades.current = null;
      }

      if (categoria === "tareas") {
        setTareas((actuales) => actuales.filter((_, posicion) => posicion !== indice));
        setIdsTareas((actuales) => actuales.filter((_, posicion) => posicion !== indice));
        setEstudiantes((actuales) => actuales.map((e) => ({ ...e, tareas: e.tareas.filter((_, posicion) => posicion !== indice) })));
      } else if (categoria === "lecciones") {
        setLecciones((actuales) => actuales.filter((_, posicion) => posicion !== indice));
        setIdsLecciones((actuales) => actuales.filter((_, posicion) => posicion !== indice));
        setEstudiantes((actuales) => actuales.map((e) => ({ ...e, lecciones: e.lecciones.filter((_, posicion) => posicion !== indice) })));
      } else {
        setExamenes((actuales) => actuales.filter((_, posicion) => posicion !== indice));
        setIdsExamenes((actuales) => actuales.filter((_, posicion) => posicion !== indice));
        setEstudiantes((actuales) => actuales.map((e) => ({ ...e, examenes: e.examenes.filter((_, posicion) => posicion !== indice) })));
      }
      setActividadAEliminar((actual) => ({ ...actual, [categoria]: "" }));
      setMensajeError(actividadId ? `“${nombre}” y sus notas fueron eliminadas.` : `“${nombre}” fue retirada.`);
    } catch (error) {
      setMensajeError(getApiErrorMessage(error));
    }
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

  const guardarTareas = async () => {

    if (!validarCategoria("tareas", "tareas")) return;
    const materia = materiasApi.find((item) => item.nombre === asignatura);
    if (!materia) { setMensajeError("Debe existir una materia registrada."); return; }
    try {
      const nuevosIds = [...idsTareas];
      for (let i = 0; i < tareas.length; i++) {
        const [gradoSeleccionado, paraleloSeleccionado] = grado.split("|");
        const payload = { nombre: tareas[i], tipo: "Tarea", periodo, grado: gradoSeleccionado, paralelo: paraleloSeleccionado, materia: { id: materia.id } };
        const actividad = nuevosIds[i] ? await api.put<ActividadApi>(`/actividades/${nuevosIds[i]}`, payload) : await api.post<ActividadApi>("/actividades", payload);
        nuevosIds[i] = actividad.id;
        await api.post("/notas/lote", { actividadId: actividad.id, notas: estudiantes.map((estudiante) => ({ alumnoId: estudiante.id, calificacion: estudiante.tareas[i].trim() === "" ? null : Number(estudiante.tareas[i]), observacion: estudiante.observacion })) });
      }
      setIdsTareas(nuevosIds);
      respaldoEstudiantes.current = null; respaldoActividades.current = null;
      setMostrarTareas(false); setDialogTarea(true);
    } catch (error) { setMensajeError(getApiErrorMessage(error)); }

  };

  const guardarLecciones = async () => {

    if (!validarCategoria("lecciones", "lecciones")) return;
    const materia = materiasApi.find((item) => item.nombre === asignatura);
    if (!materia) { setMensajeError("Debe existir una materia registrada."); return; }
    try {
      const nuevosIds = [...idsLecciones];
      for (let i = 0; i < lecciones.length; i++) {
        const [gradoSeleccionado, paraleloSeleccionado] = grado.split("|");
        const payload = { nombre: lecciones[i], tipo: "Leccion", periodo, grado: gradoSeleccionado, paralelo: paraleloSeleccionado, materia: { id: materia.id } };
        const actividad = nuevosIds[i] ? await api.put<ActividadApi>(`/actividades/${nuevosIds[i]}`, payload) : await api.post<ActividadApi>("/actividades", payload);
        nuevosIds[i] = actividad.id;
        await api.post("/notas/lote", { actividadId: actividad.id, notas: estudiantes.map((estudiante) => ({ alumnoId: estudiante.id, calificacion: estudiante.lecciones[i].trim() === "" ? null : Number(estudiante.lecciones[i]), observacion: estudiante.observacion })) });
      }
      setIdsLecciones(nuevosIds);
      respaldoEstudiantes.current = null; respaldoActividades.current = null;
      setMostrarLecciones(false); setDialogLeccion(true);
    } catch (error) { setMensajeError(getApiErrorMessage(error)); }

  };

  const guardarExamenes = async () => {

    if (!validarCategoria("examenes", "evaluaciones")) return;
    const materia = materiasApi.find((item) => item.nombre === asignatura);
    if (!materia) { setMensajeError("Debe existir una materia registrada."); return; }
    try {
      const nuevosIds = [...idsExamenes];
      for (let i = 0; i < examenes.length; i++) {
        const [gradoSeleccionado, paraleloSeleccionado] = grado.split("|");
        const payload = { nombre: examenes[i], tipo: "Examen", periodo, grado: gradoSeleccionado, paralelo: paraleloSeleccionado, materia: { id: materia.id } };
        const actividad = nuevosIds[i] ? await api.put<ActividadApi>(`/actividades/${nuevosIds[i]}`, payload) : await api.post<ActividadApi>("/actividades", payload);
        nuevosIds[i] = actividad.id;
        await api.post("/notas/lote", { actividadId: actividad.id, notas: estudiantes.map((estudiante) => ({ alumnoId: estudiante.id, calificacion: estudiante.examenes[i].trim() === "" ? null : Number(estudiante.examenes[i]), observacion: estudiante.observacion })) });
      }
      setIdsExamenes(nuevosIds);
      respaldoEstudiantes.current = null; respaldoActividades.current = null;
      setMostrarExamenes(false); setDialogExamen(true);
    } catch (error) { setMensajeError(getApiErrorMessage(error)); }

  };

  const guardarNotas = () => setDialogNotas(true);

  const cancelarNotas = () => {
    setEstudiantes((actuales) => actuales.map((estudiante) => ({ ...estudiante, tareas: estudiante.tareas.map(() => ""), lecciones: estudiante.lecciones.map(() => ""), examenes: estudiante.examenes.map(() => ""), observacion: "" })));
    setMensajeError("");
  };

  const nombreCurso = grado ? grado.replace("|", " ") : "Sin curso";
  const promedio = (notas: string[]) =>
    notas.length
      ? notas.reduce((suma, nota) => suma + (Number(nota) || 0), 0) / notas.length
      : 0;

  async function publicarPeriodo() {
    const materia = materiasApi.find(m => m.nombre === asignatura);
    const [gradoSeleccionado, paraleloSeleccionado] = grado.split("|");
    if (!materia || !gradoSeleccionado) return setMensajeError("Selecciona curso y materia.");
    if (!window.confirm(`¿Publicar todas las notas de ${asignatura}, ${nombreCurso}, ${periodo}?`)) return;
    setPublicando(true); setMensajeError("");
    try {
      const resultado = await api.post<{publicadas:number}>(`/notas/publicar-periodo?periodo=${encodeURIComponent(periodo)}&grado=${encodeURIComponent(gradoSeleccionado)}&paralelo=${encodeURIComponent(paraleloSeleccionado)}&materiaId=${materia.id}`);
      setMensajeError(`${resultado.publicadas} calificaciones publicadas para los representantes.`);
    } catch (error) { setMensajeError(getApiErrorMessage(error)); }
    finally { setPublicando(false); }
  }

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
              {!cursos.length && <option value="">No existen cursos</option>}
              {cursos.map((curso) => (
                <option key={curso} value={curso}>{curso.replace("|", " ")}</option>
              ))}
            </select>
          </div>

          <div className="grupo">
            <label htmlFor="filtro-asignatura">Asignatura</label>

            <select
              id="filtro-asignatura"
              value={asignatura}
              onChange={(event) => setAsignatura(event.target.value)}
            >
              {!materiasApi.length && <option value="">No existen materias</option>}
              {materiasApi.map((materia) => (
                <option key={materia.id} value={materia.nombre}>{materia.nombre}</option>
              ))}
            </select>
          </div>

          <div className="grupo">
            <label htmlFor="filtro-periodo">Trimestre</label>

            <select
              id="filtro-periodo"
              value={periodo}
              onChange={(event) => setPeriodo(event.target.value)}
            >
              {periodosApi.map(p=><option key={p.id} value={p.nombre}>{p.nombre}{p.cerrado?" (Cerrado)":""}</option>)}
            </select>
          </div>

        </div>
      </Card>

      <Card as="section" className="tabla-section">
        <div className="tabla-section-header"><div><p>Seguimiento del trimestre</p><h2>Observaciones de estudiantes</h2></div><span>Se incluirán en el boletín individual</span></div>
        <div className="tabla-container"><table className="tabla-notas"><thead><tr><th>Estudiante</th><th>Observación académica</th><th>Comportamiento</th><th>Acción</th></tr></thead><tbody>{estudiantes.map(e=><tr key={`observacion-${e.id}`}><td><strong>{e.nombre}</strong></td><td><textarea className="form-control" rows={2} maxLength={1000} value={observaciones[e.id]?.academica??""} onChange={x=>cambiarSeguimiento(e.id,"academica",x.target.value)} placeholder="Rendimiento, fortalezas y recomendaciones"/></td><td><textarea className="form-control" rows={2} maxLength={1000} value={observaciones[e.id]?.comportamiento??""} onChange={x=>cambiarSeguimiento(e.id,"comportamiento",x.target.value)} placeholder="Convivencia, responsabilidad y participación"/></td><td><button type="button" className="btn btn-success" disabled={guardandoObservacion===e.id} onClick={()=>guardarObservacion(e.id)}>{guardandoObservacion===e.id?"Guardando...":"Guardar"}</button></td></tr>)}</tbody></table>{!estudiantes.length&&<p>No existen estudiantes en este curso.</p>}</div>
      </Card>

      <Card as="section" className="tabla-section">
        <div className="tabla-section-header">
          <div>
            <p>Calificaciones del curso</p>
            <h2>{nombreCurso}</h2>
          </div>
          <div><span>{asignatura || "Sin materia"} · {periodo}</span><button type="button" className="btn btn-success ms-3" onClick={publicarPeriodo} disabled={publicando}>{publicando ? "Publicando..." : "Publicar notas"}</button></div>
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

                const promedioTareas = promedio(estudiante.tareas);
                const promedioLecciones = promedio(estudiante.lecciones);
                const promedioExamenes = promedio(estudiante.examenes);

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

              {!estudiantes.length && (
                <tr>
                  <td colSpan={6} className="notas-empty">
                    No existen estudiantes para el curso seleccionado.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

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
        </Card>
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

                  <select
                    className="select-eliminar-actividad"
                    aria-label="Actividad de tarea a eliminar"
                    value={actividadAEliminar.tareas}
                    onChange={(event) => setActividadAEliminar((actual) => ({ ...actual, tareas: event.target.value }))}
                  >
                    <option value="">Elegir actividad…</option>
                    {tareas.map((actividad, indice) => <option key={idsTareas[indice] ?? `nueva-${indice}`} value={indice}>{actividad}</option>)}
                  </select>

                  <button
                    className="btn-eliminar-actividad"
                    disabled={actividadAEliminar.tareas === ""}
                    onClick={() => eliminarActividad("tareas")}
                  >
                    Eliminar seleccionada
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
                    value={nombreCurso}
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

                  <select
                    className="select-eliminar-actividad"
                    aria-label="Actividad de lección a eliminar"
                    value={actividadAEliminar.lecciones}
                    onChange={(event) => setActividadAEliminar((actual) => ({ ...actual, lecciones: event.target.value }))}
                  >
                    <option value="">Elegir actividad…</option>
                    {lecciones.map((actividad, indice) => <option key={idsLecciones[indice] ?? `nueva-${indice}`} value={indice}>{actividad}</option>)}
                  </select>

                  <button
                    className="btn-eliminar-actividad"
                    disabled={actividadAEliminar.lecciones === ""}
                    onClick={() => eliminarActividad("lecciones")}
                  >
                    Eliminar seleccionada
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
                    value={nombreCurso}
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

          <select
            className="select-eliminar-actividad"
            aria-label="Actividad de examen a eliminar"
            value={actividadAEliminar.examenes}
            onChange={(event) => setActividadAEliminar((actual) => ({ ...actual, examenes: event.target.value }))}
          >
            <option value="">Elegir actividad…</option>
            {examenes.map((actividad, indice) => <option key={idsExamenes[indice] ?? `nueva-${indice}`} value={indice}>{actividad}</option>)}
          </select>

          <button
            className="btn-eliminar-actividad"
            disabled={actividadAEliminar.examenes === ""}
            onClick={() => eliminarActividad("examenes")}
          >
            Eliminar seleccionada
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
            value={nombreCurso}
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
