import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import BackHomeButton from "../../components/common/BackHomeButton";
import Card from "../../components/common/Card";
import { api, getApiErrorMessage } from "../../api/client";
import "./Padres.css";

interface Alumno {
  id: number;
  nombres: string;
  apellidos: string;
  grado: string;
  paralelo: string;
  estado: string;
}

interface Nota {
  id: number;
  calificacion: number;
  alumno: { id: number };
  actividad: {
    tipo: string;
    periodo: string;
    materia?: {
      id: number;
      nombre: string;
      docente?: { nombres?: string; apellidos?: string };
      docentes?: Array<{ nombres?: string; apellidos?: string }>;
    };
  };
}

interface ResumenMateria {
  id: number;
  asignatura: string;
  docente: string;
  trimestre1: number | null;
  trimestre2: number | null;
  trimestre3: number | null;
  examen: number | null;
  proyecto: number | null;
  promedio: number;
}

const promedio = (valores: number[]) =>
  valores.length
    ? Number((valores.reduce((total, valor) => total + valor, 0) / valores.length).toFixed(2))
    : null;

const clavePeriodo = (periodo: string) => {
  const valor = periodo.toLowerCase();
  if (valor.includes("1") || valor.includes("primer")) return "trimestre1";
  if (valor.includes("2") || valor.includes("segundo")) return "trimestre2";
  return "trimestre3";
};

function Padres() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [alumnoId, setAlumnoId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get<Alumno[]>("/representantes/mis-estudiantes"), api.get<Nota[]>("/representantes/mis-notas")])
      .then(([listaAlumnos, listaNotas]) => {
        setAlumnos(listaAlumnos);
        setNotas(listaNotas);
        setAlumnoId(listaAlumnos[0]?.id ?? null);
      })
      .catch((problema) => setError(getApiErrorMessage(problema)))
      .finally(() => setCargando(false));
  }, []);

  const alumno = alumnos.find((item) => item.id === alumnoId);
  const resumen = useMemo<ResumenMateria[]>(() => {
    if (alumnoId === null) return [];
    const porMateria = new Map<number, Nota[]>();
    notas
      .filter((nota) => nota.alumno.id === alumnoId && nota.actividad.materia)
      .forEach((nota) => {
        const materiaId = nota.actividad.materia!.id;
        porMateria.set(materiaId, [...(porMateria.get(materiaId) ?? []), nota]);
      });

    return [...porMateria.entries()].map(([id, registros]) => {
      const materia = registros[0].actividad.materia!;
      const periodos: Record<string, number[]> = {
        trimestre1: [],
        trimestre2: [],
        trimestre3: [],
      };
      const examenes: number[] = [];
      const proyectos: number[] = [];

      registros.forEach((nota) => {
        const tipo = nota.actividad.tipo.toLowerCase();
        if (tipo.includes("examen")) examenes.push(nota.calificacion);
        else if (tipo.includes("proyecto")) proyectos.push(nota.calificacion);
        else periodos[clavePeriodo(nota.actividad.periodo)].push(nota.calificacion);
      });

      const trimestre1 = promedio(periodos.trimestre1);
      const trimestre2 = promedio(periodos.trimestre2);
      const trimestre3 = promedio(periodos.trimestre3);
      const examen = promedio(examenes);
      const proyecto = promedio(proyectos);
      const valores = [trimestre1, trimestre2, trimestre3, examen, proyecto].filter(
        (valor): valor is number => valor !== null,
      );

      return {
        id,
        asignatura: materia.nombre,
        docente: materia.docentes?.length
          ? materia.docentes.map((docente) => `${docente.nombres ?? ""} ${docente.apellidos ?? ""}`.trim()).join(", ")
          : "Sin docente asignado",
        trimestre1,
        trimestre2,
        trimestre3,
        examen,
        proyecto,
        promedio: promedio(valores) ?? 0,
      };
    });
  }, [alumnoId, notas]);

  const promedioGeneral = useMemo(
    () => promedio(resumen.map((materia) => materia.promedio)) ?? 0,
    [resumen],
  );
  const mostrarNota = (valor: number | null) => (valor === null ? "—" : valor.toFixed(2));

  return (
    <MainLayout>
      <div className="parents-page">
        <main className="parents-content">
          <section className="parents-header">
            <div>
              <p className="parents-label">Consulta académica</p>
              <h1>Vista de padres de familia</h1>
              <p>Consulta las calificaciones registradas en el sistema.</p>
            </div>
            <BackHomeButton />
          </section>

          {error && <p className="roles-notification" role="alert">{error}</p>}
          {cargando && <p role="status">Cargando información académica…</p>}

          {!cargando && (
            <>
              <Card as="section" className="student-card">
                <div className="student-avatar"><i className="bi bi-person-fill" /></div>
                <div className="student-information">
                  <label htmlFor="alumno-consulta">Estudiante</label>
                  <select
                    id="alumno-consulta"
                    value={alumnoId ?? ""}
                    onChange={(evento) => setAlumnoId(Number(evento.target.value))}
                  >
                    {alumnos.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombres} {item.apellidos}
                      </option>
                    ))}
                  </select>
                  {alumno && (
                    <div className="student-details">
                      <p><strong>Curso:</strong> {alumno.grado}</p>
                      <p><strong>Paralelo:</strong> {alumno.paralelo}</p>
                    </div>
                  )}
                </div>
                <div className="student-status">
                  <span>Estado</span>
                  <strong>{alumno?.estado ?? "Sin registro"}</strong>
                </div>
              </Card>

              <Card as="section" className="grades-section">
                <div className="grades-header">
                  <div>
                    <p className="section-label">Rendimiento académico</p>
                    <h2>Calificaciones registradas</h2>
                  </div>
                  <div className="grading-hint">
                    <i className="bi bi-database-check" /> Datos obtenidos de PostgreSQL
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="grades-table">
                    <thead>
                      <tr>
                        <th>Asignatura</th><th>Docente</th><th>Trimestre 1</th>
                        <th>Trimestre 2</th><th>Trimestre 3</th><th>Examen</th>
                        <th>Proyecto</th><th>Promedio</th><th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumen.map((materia) => (
                        <tr key={materia.id}>
                          <td><div className="subject-name"><i className="bi bi-book" />{materia.asignatura}</div></td>
                          <td>{materia.docente}</td>
                          <td>{mostrarNota(materia.trimestre1)}</td>
                          <td>{mostrarNota(materia.trimestre2)}</td>
                          <td>{mostrarNota(materia.trimestre3)}</td>
                          <td>{mostrarNota(materia.examen)}</td>
                          <td>{mostrarNota(materia.proyecto)}</td>
                          <td><strong className="grade-average">{materia.promedio.toFixed(2)}</strong></td>
                          <td><span className={`status-badge ${materia.promedio >= 7 ? "approved" : "failed"}`}>{materia.promedio >= 7 ? "Aprobado" : "Reprobado"}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!resumen.length && <p>No existen calificaciones para el estudiante seleccionado.</p>}
                </div>
              </Card>

              <section className="academic-summary">
                <Card as="article" className="summary-card"><div className="summary-icon"><i className="bi bi-bar-chart-fill" /></div><div><span>Promedio general</span><strong>{promedioGeneral.toFixed(2)} / 10</strong></div></Card>
                <Card as="article" className="summary-card"><div className="summary-icon"><i className="bi bi-journal-check" /></div><div><span>Asignaturas registradas</span><strong>{resumen.length}</strong></div></Card>
                <Card as="article" className="summary-card"><div className="summary-icon"><i className="bi bi-patch-check-fill" /></div><div><span>Estado académico</span><strong>{resumen.length ? (promedioGeneral >= 7 ? "Aprobado" : "Reprobado") : "Sin notas"}</strong></div></Card>
              </section>
            </>
          )}
        </main>
      </div>
    </MainLayout>
  );
}

export default Padres;
