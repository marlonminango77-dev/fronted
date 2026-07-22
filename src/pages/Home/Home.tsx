import { Link, Navigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import "./Home.css";

interface ModuleCard {
  title: string;
  description: string;
  icon: string;
  path: string;
  colorClass: string;
}

const modules: ModuleCard[] = [
  {
    title: "Gestión de roles",
    description: "Administrar los permisos y roles de los usuarios.",
    icon: "bi-people-fill",
    path: "/roles",
    colorClass: "roles-card",
  },
  {
    title: "Ingreso de notas",
    description: "Registrar y actualizar las calificaciones académicas.",
    icon: "bi-journal-check",
    path: "/notas",
    colorClass: "grades-card",
  },
  {
    title: "Asistencia",
    description: "Registrar la asistencia diaria de los estudiantes.",
    icon: "bi-calendar-check-fill",
    path: "/asistencia",
    colorClass: "attendance-card",
  },
  {
    title: "Padres de familia",
    description: "Consultar las calificaciones de los estudiantes.",
    icon: "bi-person-hearts",
    path: "/padres",
    colorClass: "parents-card",
  },
];

function Home() {
  const autenticado =
    localStorage.getItem("usuarioAutenticado") === "true";

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  const nombreUsuario =
    localStorage.getItem("nombreUsuario") || "Usuario";

  return (
    <div className="home-page">
      <Navbar />

      <main className="home-content">
        <section className="welcome-section">
          <div>
            <p className="welcome-label">Panel principal</p>

            <h1>Bienvenido, {nombreUsuario}</h1>

            <p>
              Administra la información académica de la Escuela de Educación
              Básica República de Venezuela.
            </p>
          </div>

          <div className="welcome-icon">
            <i className="bi bi-mortarboard-fill"></i>
          </div>
        </section>
        <section className="institution-section">
          <article className="institution-card">
            <div className="institution-icon">
              <i className="bi bi-bullseye"></i>
            </div>

            <div>
              <h2>Misión</h2>

              <p>
                Formar estudiantes con valores, pensamiento crítico,
                responsabilidad y compromiso social mediante una educación
                integral y de calidad.
              </p>
            </div>
          </article>

          <article className="institution-card">
            <div className="institution-icon">
              <i className="bi bi-eye-fill"></i>
            </div>

            <div>
              <h2>Visión</h2>

              <p>
                Ser una institución reconocida por su excelencia académica,
                innovación educativa y formación de ciudadanos íntegros que
                contribuyan al desarrollo de la sociedad.
              </p>
            </div>
          </article>
        </section>
        <br/>
        <section className="modules-section">
          <div className="section-title">
            <div>
              <p>Accesos rápidos</p>
              <h2>Módulos del sistema</h2>
            </div>
          </div>

          <div className="modules-grid">
            {modules.map((module) => (
              <Link
                to={module.path}
                className={`module-card ${module.colorClass}`}
                key={module.title}
              >
                <div className="module-icon">
                  <i className={`bi ${module.icon}`}></i>
                </div>

                <div className="module-information">
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>

                  <span>
                    Ingresar
                    <i className="bi bi-arrow-right"></i>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        
      </main>

      <footer className="home-footer">
        <p>
          © 2026 Escuela de Educación Básica República de Venezuela
        </p>
      </footer>
    </div>
  );
}

export default Home;