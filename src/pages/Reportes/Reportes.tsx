import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import BackHomeButton from "../../components/common/BackHomeButton";
import Card from "../../components/common/Card";
import { api, getApiErrorMessage } from "../../api/client";
import "./Reportes.css";
import { imprimirBoletin, type Boletin } from "./boletin";

interface CursoResumen {
  curso: string;
  estudiantes: number;
  promedioNotas: number;
  asistencia: number;
  calificaciones: number;
  registrosAsistencia: number;
}

interface Resumen {
  estudiantes: number;
  docentes: number;
  representantes: number;
  materias: number;
  cursos: CursoResumen[];
  estudiantesRiesgo: Array<{id:number;estudiante:string;curso:string;promedio:number;asistencia:number;motivo:string}>;
}
interface Periodo {id:number;nombre:string}
interface Materia {id:number;nombre:string}
interface EstudianteOpcion {id:number;estudiante:string;curso:string}

function Reportes() {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [periodos,setPeriodos]=useState<Periodo[]>([]); const[materias,setMaterias]=useState<Materia[]>([]);
  const [periodo,setPeriodo]=useState(""); const[materiaId,setMateriaId]=useState("");const[desde,setDesde]=useState("");const[hasta,setHasta]=useState("");
  const [estudiantes,setEstudiantes]=useState<EstudianteOpcion[]>([]);const[alumnoBoletin,setAlumnoBoletin]=useState("");const[generando,setGenerando]=useState(false);

  useEffect(() => {
    Promise.all([api.get<Periodo[]>("/configuracion-academica/periodos"),api.get<Materia[]>("/materias"),api.get<EstudianteOpcion[]>("/reportes/estudiantes")]).then(([p,m,e])=>{setPeriodos(p);setMaterias(m);setEstudiantes(e)}).catch(()=>{});
  }, []);
  useEffect(()=>{const params=new URLSearchParams();if(periodo)params.set("periodo",periodo);if(materiaId)params.set("materiaId",materiaId);if(desde)params.set("desde",desde);if(hasta)params.set("hasta",hasta);api.get<Resumen>(`/reportes/resumen?${params}`).then(setResumen).catch(p=>setError(getApiErrorMessage(p)))},[periodo,materiaId,desde,hasta]);

  const cursos = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return (resumen?.cursos ?? []).filter((curso) =>
      !texto || curso.curso.toLowerCase().includes(texto),
    );
  }, [busqueda, resumen]);

  function descargarCsv() {
    if (!resumen) return;
    const filas = [
      ["Curso", "Estudiantes", "Promedio de notas", "Asistencia (%)", "Calificaciones", "Registros de asistencia"],
      ...cursos.map((curso) => [
        curso.curso,
        curso.estudiantes,
        curso.promedioNotas,
        curso.asistencia,
        curso.calificaciones,
        curso.registrosAsistencia,
      ]),
    ];
    const contenido = filas
      .map((fila) => fila.map((valor) => `"${String(valor).replaceAll('"', '""')}"`).join(";"))
      .join("\n");
    const archivo = new Blob(["\uFEFF" + contenido], { type: "text/csv;charset=utf-8" });
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(archivo);
    enlace.download = `reporte-academico-${new Date().toISOString().slice(0, 10)}.csv`;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  }

  function descargarExcel(){if(!resumen)return;const filas=cursos.map(c=>`<tr><td>${c.curso}</td><td>${c.estudiantes}</td><td>${c.promedioNotas}</td><td>${c.asistencia}%</td></tr>`).join("");const riesgos=resumen.estudiantesRiesgo.map(e=>`<tr><td>${e.estudiante}</td><td>${e.curso}</td><td>${e.promedio}</td><td>${e.asistencia}%</td><td>${e.motivo}</td></tr>`).join("");const html=`<html><meta charset="UTF-8"><body><h1>Reporte académico</h1><table border="1"><tr><th>Curso</th><th>Estudiantes</th><th>Promedio</th><th>Asistencia</th></tr>${filas}</table><h2>Estudiantes en riesgo</h2><table border="1"><tr><th>Estudiante</th><th>Curso</th><th>Promedio</th><th>Asistencia</th><th>Motivo</th></tr>${riesgos}</table></body></html>`;const url=URL.createObjectURL(new Blob([html],{type:"application/vnd.ms-excel"}));const a=document.createElement("a");a.href=url;a.download=`reporte-${new Date().toISOString().slice(0,10)}.xls`;a.click();URL.revokeObjectURL(url)}

  async function generarBoletin(){
    if(!alumnoBoletin)return setError("Selecciona un estudiante para generar el boletín.");
    const ventana=window.open("","_blank");if(!ventana)return setError("El navegador bloqueó la ventana del boletín.");
    setGenerando(true);setError("");
    try{const params=new URLSearchParams({alumnoId:alumnoBoletin});if(periodo)params.set("periodo",periodo);const boletin=await api.get<Boletin>(`/reportes/boletin?${params}`);imprimirBoletin(ventana,boletin)}
    catch(e){ventana.close();setError(getApiErrorMessage(e))}finally{setGenerando(false)}
  }

  return (
    <MainLayout>
      <div className="reports-page">
        <header className="reports-header">
          <div>
            <p>Información institucional</p>
            <h1>Reportes académicos</h1>
            <span>Consulta indicadores generales y resultados agrupados por curso.</span>
          </div>
          <div className="reports-header-actions">
            <button type="button" onClick={() => window.print()}><i className="bi bi-printer" /> Imprimir</button>
            <button type="button" onClick={descargarCsv}><i className="bi bi-file-earmark-spreadsheet" /> Descargar CSV</button>
            <button type="button" onClick={descargarExcel}><i className="bi bi-file-earmark-excel" /> Excel</button>
            <BackHomeButton />
          </div>
        </header>

        {error && <p className="reports-error">{error}</p>}

        <Card as="section" className="reports-table-card">
          <div className="reports-table-header"><div><p>Documentos</p><h2>Boletín individual en PDF</h2><span>Selecciona un estudiante y luego “Guardar como PDF” en la ventana de impresión.</span></div></div>
          <div className="row g-3 align-items-end"><label className="col-md-8">Estudiante<select className="form-select" value={alumnoBoletin} onChange={e=>setAlumnoBoletin(e.target.value)}><option value="">Selecciona un estudiante</option>{estudiantes.map(e=><option key={e.id} value={e.id}>{e.estudiante} · {e.curso}</option>)}</select></label><div className="col-md-4"><button type="button" className="btn btn-success w-100" disabled={generando||!alumnoBoletin} onClick={generarBoletin}><i className="bi bi-file-earmark-pdf"/> {generando?"Generando...":"Generar boletín PDF"}</button></div></div>
        </Card>

        <Card as="section" className="reports-table-card"><div className="row g-3"><label className="col-md-3">Trimestre<select className="form-select" value={periodo} onChange={e=>setPeriodo(e.target.value)}><option value="">Todos</option>{periodos.map(p=><option key={p.id}>{p.nombre}</option>)}</select></label><label className="col-md-3">Materia<select className="form-select" value={materiaId} onChange={e=>setMateriaId(e.target.value)}><option value="">Todas</option>{materias.map(m=><option key={m.id} value={m.id}>{m.nombre}</option>)}</select></label><label className="col-md-3">Desde<input className="form-control" type="date" value={desde} onChange={e=>setDesde(e.target.value)}/></label><label className="col-md-3">Hasta<input className="form-control" type="date" value={hasta} onChange={e=>setHasta(e.target.value)}/></label></div></Card>

        <section className="reports-summary">
          {[
            ["Estudiantes activos", resumen?.estudiantes ?? 0, "bi-people-fill"],
            ["Docentes", resumen?.docentes ?? 0, "bi-person-badge-fill"],
            ["Representantes", resumen?.representantes ?? 0, "bi-person-hearts"],
            ["Materias", resumen?.materias ?? 0, "bi-bookshelf"],
          ].map(([etiqueta, valor, icono]) => (
            <Card as="article" className="reports-summary-card" key={String(etiqueta)}>
              <i className={`bi ${icono}`} />
              <div><span>{etiqueta}</span><strong>{valor}</strong></div>
            </Card>
          ))}
        </section>

        <Card as="section" className="reports-table-card">
          <div className="reports-table-header">
            <div><p>Resumen por curso</p><h2>Rendimiento y asistencia</h2></div>
            <label><i className="bi bi-search" /><input type="search" placeholder="Buscar curso" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} /></label>
          </div>
          <div className="reports-table-wrapper">
            <table>
              <thead><tr><th>Curso</th><th>Estudiantes</th><th>Promedio</th><th>Asistencia</th><th>Calificaciones</th><th>Registros asistencia</th></tr></thead>
              <tbody>
                {cursos.map((curso) => (
                  <tr key={curso.curso}>
                    <td><strong>{curso.curso}</strong></td>
                    <td>{curso.estudiantes}</td>
                    <td><span className={curso.promedioNotas >= 7 ? "reports-good" : "reports-warning"}>{curso.promedioNotas.toFixed(2)}</span></td>
                    <td>{curso.asistencia.toFixed(2)}%</td>
                    <td>{curso.calificaciones}</td>
                    <td>{curso.registrosAsistencia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!cursos.length && <p className="reports-empty">No existen cursos con estudiantes activos.</p>}
          </div>
        </Card>
        <Card as="section" className="reports-table-card"><div className="reports-table-header"><div><p>Seguimiento</p><h2>Estudiantes en riesgo</h2></div></div><div className="reports-table-wrapper"><table><thead><tr><th>Estudiante</th><th>Curso</th><th>Promedio</th><th>Asistencia</th><th>Motivo</th></tr></thead><tbody>{(resumen?.estudiantesRiesgo??[]).map(e=><tr key={e.id}><td><strong>{e.estudiante}</strong></td><td>{e.curso}</td><td className="reports-warning">{e.promedio.toFixed(2)}</td><td>{e.asistencia.toFixed(2)}%</td><td>{e.motivo}</td></tr>)}</tbody></table>{!resumen?.estudiantesRiesgo.length&&<p className="reports-empty">No se detectaron estudiantes en riesgo con estos filtros.</p>}</div></Card>
      </div>
    </MainLayout>
  );
}

export default Reportes;
