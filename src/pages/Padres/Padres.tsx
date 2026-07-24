import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import "./Padres.css";
import MainLayout from "../../layouts/MainLayout";

interface Calificacion {
  id: number;
  asignatura: string;
  docente: string;
  parcial1: number;
  parcial2: number;
  examen: number;
}

const calificacionesIniciales: Calificacion[] = [
  {
    id: 1,
    asignatura: "Matemática",
    docente: "María López",
    parcial1: 9.2,
    parcial2: 8.8,
    examen: 9.1,
  },
  {
    id: 2,
    asignatura: "Lengua y Literatura",
    docente: "Carlos Andrade",
    parcial1: 8.7,
    parcial2: 9.1,
    examen: 8.9,
  },
  {
    id: 3,
    asignatura: "Ciencias Naturales",
    docente: "Ana Martínez",
    parcial1: 9.5,
    parcial2: 9.2,
    examen: 9.4,
  },
  {
    id: 4,
    asignatura: "Estudios Sociales",
    docente: "Luis Sánchez",
    parcial1: 8.4,
    parcial2: 8.7,
    examen: 8.5,
  },
  {
    id: 5,
    asignatura: "Educación Cultural y Artística",
    docente: "Patricia Gómez",
    parcial1: 9.6,
    parcial2: 9.4,
    examen: 9.5,
  },
];

function calcularPromedio(calificacion: Calificacion): number {
  const promedio =
    (calificacion.parcial1 +
      calificacion.parcial2 +
      calificacion.examen) /
    3;

  return Number(promedio.toFixed(2));
}

function Padres() {
  const autenticado =
    localStorage.getItem("usuarioAutenticado") === "true";

  const [periodo, setPeriodo] = useState("Primer quimestre");

  const promedioGeneral = useMemo(() => {
    const total = calificacionesIniciales.reduce(
      (acumulador, calificacion) =>
        acumulador + calcularPromedio(calificacion),
      0,
    );

    return Number(
      (total / calificacionesIniciales.length).toFixed(2),
    );
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
            <p className="parents-label">
              Consulta académica
            </p>

            <h1>Vista de padres de familia</h1>

            <p>
              Consulte las calificaciones registradas del
              estudiante.
            </p>
          </div>

          <Link to="/home" className="back-home-button">
            <i className="bi bi-arrow-left"></i>
            Volver al inicio
          </Link>
        </section>

        <section className="student-card">
          <div className="student-avatar">
            <i className="bi bi-person-fill"></i>
          </div>

          <div className="student-information">
            <span>Estudiante</span>
            <h2>Juan Andrés Pérez García</h2>

            <div className="student-details">
              <p>
                <strong>Curso:</strong> Séptimo de Educación
                General Básica
              </p>

              <p>
                <strong>Paralelo:</strong> A
              </p>

              <p>
                <strong>Jornada:</strong> Matutina
              </p>
            </div>
          </div>

          <div className="student-status">
            <span>Estado</span>
            <strong>Matriculado</strong>
          </div>
        </section>

        <section className="grades-section">
          <div className="grades-header">
            <div>
              <p className="section-label">
                Rendimiento académico
              </p>

              <h2>Calificaciones</h2>
            </div>

            <div className="period-filter">
              <label htmlFor="periodo">
                Periodo académico
              </label>

              <select
                id="periodo"
                value={periodo}
                onChange={(event) =>
                  setPeriodo(event.target.value)
                }
              >
                <option value="Primer quimestre">
                  Primer quimestre
                </option>

                <option value="Segundo quimestre">
                  Segundo quimestre
                </option>

                <option value="Periodo anual">
                  Periodo anual
                </option>
              </select>
            </div>
          </div>

          <div className="selected-period">
            <i className="bi bi-calendar3"></i>

            <span>
              Mostrando calificaciones del:
              <strong> {periodo}</strong>
            </span>
          </div>

          <div className="table-responsive">
            <table className="grades-table">
              <thead>
                <tr>
                  <th>Asignatura</th>
                  <th>Docente</th>
                  <th>Parcial 1</th>
                  <th>Parcial 2</th>
                  <th>Examen</th>
                  <th>Promedio</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {calificacionesIniciales.map(
                  (calificacion) => {
                    const promedio =
                      calcularPromedio(calificacion);

                    const aprobado = promedio >= 7;

                    return (
                      <tr key={calificacion.id}>
                        <td>
                          <div className="subject-name">
                            <i className="bi bi-book"></i>
                            {calificacion.asignatura}
                          </div>
                        </td>

                        <td>{calificacion.docente}</td>

                        <td>{calificacion.parcial1}</td>

                        <td>{calificacion.parcial2}</td>

                        <td>{calificacion.examen}</td>

                        <td>
                          <strong className="grade-average">
                            {promedio}
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
                            {aprobado
                              ? "Aprobado"
                              : "Reprobado"}
                          </span>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="academic-summary">
          <article className="summary-card">
            <div className="summary-icon">
              <i className="bi bi-bar-chart-fill"></i>
            </div>

            <div>
              <span>Promedio general</span>
              <strong>{promedioGeneral} / 10</strong>
            </div>
          </article>

          <article className="summary-card">
            <div className="summary-icon">
              <i className="bi bi-journal-check"></i>
            </div>

            <div>
              <span>Asignaturas registradas</span>
              <strong>
                {calificacionesIniciales.length}
              </strong>
            </div>
          </article>

          <article className="summary-card">
            <div className="summary-icon">
              <i className="bi bi-patch-check-fill"></i>
            </div>

            <div>
              <span>Estado académico</span>

              <strong>
                {promedioGeneral >= 7
                  ? "Aprobado"
                  : "Reprobado"}
              </strong>
            </div>
          </article>
        </section>
      </main>

      
    </div>
    </MainLayout>
  );
}

export default Padres;