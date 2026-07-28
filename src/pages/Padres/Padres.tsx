import { useMemo } from "react";
import { Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import BackHomeButton from "../../components/common/BackHomeButton";
import Card from "../../components/common/Card";
import "./Padres.css";

interface DetalleTrimestre {
  parcial1: number;
  parcial2: number;
}

interface Calificacion {
  id: number;
  asignatura: string;
  docente: string;
  trimestre1: DetalleTrimestre;
  trimestre2: DetalleTrimestre;
  trimestre3: DetalleTrimestre;
  examen: number;
  proyectoInterdisciplinario: number;
}

const calificacionesIniciales: Calificacion[] = [
  {
    id: 1,
    asignatura: "Matemática",
    docente: "María López",
    trimestre1: { parcial1: 9.2, parcial2: 8.8 },
    trimestre2: { parcial1: 8.9, parcial2: 9.3 },
    trimestre3: { parcial1: 9.4, parcial2: 9.1 },
    examen: 9.1,
    proyectoInterdisciplinario: 9.4,
  },
  {
    id: 2,
    asignatura: "Lengua y Literatura",
    docente: "Carlos Andrade",
    trimestre1: { parcial1: 8.7, parcial2: 9.1 },
    trimestre2: { parcial1: 9.0, parcial2: 8.8 },
    trimestre3: { parcial1: 9.2, parcial2: 9.0 },
    examen: 8.9,
    proyectoInterdisciplinario: 9.2,
  },
  {
    id: 3,
    asignatura: "Ciencias Naturales",
    docente: "Ana Martínez",
    trimestre1: { parcial1: 9.5, parcial2: 9.2 },
    trimestre2: { parcial1: 9.1, parcial2: 9.4 },
    trimestre3: { parcial1: 9.6, parcial2: 9.3 },
    examen: 9.4,
    proyectoInterdisciplinario: 9.6,
  },
  {
    id: 4,
    asignatura: "Estudios Sociales",
    docente: "Luis Sánchez",
    trimestre1: { parcial1: 8.4, parcial2: 8.7 },
    trimestre2: { parcial1: 8.8, parcial2: 8.6 },
    trimestre3: { parcial1: 8.7, parcial2: 9.0 },
    examen: 8.5,
    proyectoInterdisciplinario: 9.0,
  },
  {
    id: 5,
    asignatura: "Educación Cultural y Artística",
    docente: "Patricia Gómez",
    trimestre1: { parcial1: 9.6, parcial2: 9.4 },
    trimestre2: { parcial1: 9.7, parcial2: 9.5 },
    trimestre3: { parcial1: 9.8, parcial2: 9.6 },
    examen: 9.5,
    proyectoInterdisciplinario: 9.8,
  },
];

function calcularPromedioTrimestre(detalle: DetalleTrimestre): number {
  return Number(
    ((detalle.parcial1 + detalle.parcial2) / 2).toFixed(2),
  );
}

function calcularPromedioFinal(calificacion: Calificacion): number {
  const trimestre1 = calcularPromedioTrimestre(calificacion.trimestre1);
  const trimestre2 = calcularPromedioTrimestre(calificacion.trimestre2);
  const trimestre3 = calcularPromedioTrimestre(calificacion.trimestre3);

  return Number(
    (
      (trimestre1 +
        trimestre2 +
        trimestre3 +
        calificacion.examen +
        calificacion.proyectoInterdisciplinario) /
      5
    ).toFixed(2),
  );
}

function Padres() {
  const autenticado =
    localStorage.getItem("usuarioAutenticado") === "true";
  const promedioGeneral = useMemo(() => {
    const total = calificacionesIniciales.reduce(
      (acumulador, calificacion) =>
        acumulador + calcularPromedioFinal(calificacion),
      0,
    );

    return Number((total / calificacionesIniciales.length).toFixed(2));
  }, []);

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout>
      <div className="parents-page">
        <main className="parents-content">
          <section className="parents-header">
            <div>
              <p className="parents-label">Consulta académica</p>
              <h1>Vista de padres de familia</h1>
              <p>Consulte las calificaciones registradas del estudiante.</p>
            </div>

            <BackHomeButton />
          </section>

          <Card as="section" className="student-card">
            <div className="student-avatar">
              <i className="bi bi-person-fill"></i>
            </div>

            <div className="student-information">
              <span>Estudiante</span>
              <h2>Juan Andrés Pérez García</h2>

              <div className="student-details">
                <p>
                  <strong>Curso:</strong> Séptimo de Educación General Básica
                </p>
                <p><strong>Paralelo:</strong> A</p>
                <p><strong>Jornada:</strong> Matutina</p>
              </div>
            </div>

            <div className="student-status">
              <span>Estado</span>
              <strong>Matriculado</strong>
            </div>
          </Card>

          <Card as="section" className="grades-section">
            <div className="grades-header">
              <div>
                <p className="section-label">Rendimiento académico</p>
                <h2>Calificaciones del año lectivo</h2>
              </div>

              <div className="grading-hint">
                <i className="bi bi-info-circle"></i>
                Resumen de calificaciones por trimestre
              </div>
            </div>

            <div className="selected-period">
              <i className="bi bi-calendar3"></i>
              <span>
                Periodos registrados:
                <strong>
                  {" "}Trimestre 1, Trimestre 2, Trimestre 3 y examen final
                </strong>
              </span>
            </div>

            <div className="table-responsive">
              <table className="grades-table">
                <thead>
                  <tr>
                    <th>Asignatura</th>
                    <th>Docente</th>
                    <th>Trimestre 1</th>
                    <th>Trimestre 2</th>
                    <th>Trimestre 3</th>
                    <th>Examen</th>
                    <th title="Proyecto interdisciplinario">Proyecto interd.</th>
                    <th>Promedio final</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {calificacionesIniciales.map((calificacion) => {
                    const trimestre1 = calcularPromedioTrimestre(
                      calificacion.trimestre1,
                    );
                    const trimestre2 = calcularPromedioTrimestre(
                      calificacion.trimestre2,
                    );
                    const trimestre3 = calcularPromedioTrimestre(
                      calificacion.trimestre3,
                    );
                    const promedioFinal = calcularPromedioFinal(calificacion);
                    const aprobado = promedioFinal >= 7;

                    return (
                      <tr key={calificacion.id}>
                        <td>
                          <div className="subject-name">
                            <i className="bi bi-book"></i>
                            {calificacion.asignatura}
                          </div>
                        </td>
                        <td>{calificacion.docente}</td>
                        <td>
                          <strong className="trimester-grade">
                            {trimestre1}
                          </strong>
                        </td>
                        <td>
                          <strong className="trimester-grade">
                            {trimestre2}
                          </strong>
                        </td>
                        <td>
                          <strong className="trimester-grade">
                            {trimestre3}
                          </strong>
                        </td>
                        <td>
                          <strong className="exam-grade">
                            {calificacion.examen}
                          </strong>
                        </td>
                        <td>
                          <span className="project-grade">
                            <i className="bi bi-lightbulb-fill"></i>
                            {calificacion.proyectoInterdisciplinario}
                          </span>
                        </td>
                        <td>
                          <strong className="grade-average">
                            {promedioFinal}
                          </strong>
                        </td>
                        <td>
                          <span
                            className={
                              aprobado
                                ? "status-badge approved"
                                : "status-badge failed"
                            }
                          >
                            {aprobado ? "Aprobado" : "Reprobado"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <section className="academic-summary">
            <Card as="article" className="summary-card">
              <div className="summary-icon">
                <i className="bi bi-bar-chart-fill"></i>
              </div>
              <div>
                <span>Promedio general</span>
                <strong>{promedioGeneral} / 10</strong>
              </div>
            </Card>

            <Card as="article" className="summary-card">
              <div className="summary-icon">
                <i className="bi bi-journal-check"></i>
              </div>
              <div>
                <span>Asignaturas registradas</span>
                <strong>{calificacionesIniciales.length}</strong>
              </div>
            </Card>

            <Card as="article" className="summary-card">
              <div className="summary-icon">
                <i className="bi bi-patch-check-fill"></i>
              </div>
              <div>
                <span>Estado académico</span>
                <strong>{promedioGeneral >= 7 ? "Aprobado" : "Reprobado"}</strong>
              </div>
            </Card>
          </section>
        </main>
      </div>

    </MainLayout>
  );
}

export default Padres;
