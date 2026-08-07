import { Link, Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../auth/AuthContext";
import Card from "../../components/common/Card";
import "./Home.css";

interface ModuleCard {
  title: string;
  description: string;
  icon: string;
  path: string;
  colorClass: string;
  permission: string | string[];
}
const modules: ModuleCard[] = [
  {
    title: "Gestión de usuarios",
    description: "Crear cuentas y asignar roles a los usuarios.",
    icon: "bi-person-gear",
    path: "/usuarios",
    permission: "Gestion de roles",
    colorClass: "roles-card",
  },
  {
    title: "Gestión de roles",
    description: "Administrar los permisos y roles de los usuarios.",
    icon: "bi-people-fill",
    path: "/roles",
    permission: "Gestion de roles",
    colorClass: "roles-card",
  },
  {
    title: "Ingreso de notas",
    description: "Registrar y actualizar las calificaciones académicas.",
    icon: "bi-journal-check",
    path: "/notas",
    permission: "Notas",
    colorClass: "grades-card",
  },
  {
    title: "Materias",
    description: "Registrar materias, grados y docentes responsables.",
    icon: "bi-bookshelf",
    path: "/materias",
    permission: "Materias",
    colorClass: "grades-card",
  },
  {
    title: "Asistencia",
    description: "Registrar la asistencia diaria de los estudiantes.",
    icon: "bi-calendar-check-fill",
    path: "/asistencia",
    permission: "Asistencia",
    colorClass: "attendance-card",
  },
  {
    title: "Padres de familia",
    description: "Consultar las calificaciones de los estudiantes.",
    icon: "bi-person-hearts",
    path: "/padres",
    permission: "Consulta familiar",
    colorClass: "parents-module-card",
  },
  {
    title: "Ingreso de representantes",
    description: "Registrar y administrar a los representantes de los estudiantes.",
    icon: "bi-person-vcard-fill",
    path: "/ingreso-padres",
    permission: "Representantes",
    colorClass: "parents-module-card",
  },
  {
    title: "Mensajes",
    description: "Enviar o consultar mensajes de los cursos.",
    icon: "bi-chat-left-text-fill",
    path: "/mensajes",
    permission: ["Mensajes", "Consulta familiar"],
    colorClass: "messages-card",
    },
  {
    title: "Reportes",
    description: "Consultar indicadores académicos y exportar resultados.",
    icon: "bi-bar-chart-line-fill",
    path: "/reportes",
    permission: "Reportes",
    colorClass: "reports-card",
  },
  {
    title: "Ingreso de estudiantes",
    description: "Registrar y consultar la información de los estudiantes.",
    icon: "bi-person-plus-fill",
    path: "/estudiantes",
    permission: "Estudiantes",
    colorClass: "students-card",
  },
  {
  title: "Registro de docentes",
  description: "Registrar, editar y administrar la información de los docentes.",
  icon: "bi-person-badge-fill",
  path: "/docentes",
  permission: "Docentes",
  colorClass: "teachers-card",
},
];

function Home() {
  void Navigate;
  const { sesion } = useAuth();
  const nombreUsuario = sesion?.usuario ?? "Usuario";
  const permisos = sesion?.permisos ?? [];
  const modulosVisibles = modules.filter((modulo) => {
    const requeridos = Array.isArray(modulo.permission)
      ? modulo.permission
      : [modulo.permission];
    return requeridos.some((permiso) => permisos.includes(permiso));
  });

  return (
    <MainLayout>
      <div className="home-content">
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
          <Card as="article" className="institution-card">
            <div className="institution-icon">
              <i className="bi bi-bullseye"></i>
            </div>

            <div className="institution-copy">
              <span className="institution-label">Propósito institucional</span>
              <h2>Objetivo Misional</h2>

              <p>
                La Escuela de Educación Básica Fiscal República de Venezuela,
                que educa a niñas y niños desde el nivel inicial hasta la básica
                media, tiene como propósito fundamental impulsar una educación
                integral que garantice el desarrollo pleno, armónico y continuo
                de todos los estudiantes.
              </p>

              <p>
                La institución se compromete a construir y sostener un entorno
                escolar seguro, inclusivo y pedagógicamente enriquecido,
                promoviendo espacios adecuados para el aprendizaje y la
                convivencia.
              </p>

              <p>
                Asimismo, impulsa la incorporación progresiva de herramientas
                tecnológicas en el aula y el fortalecimiento de su
                infraestructura física para brindar una educación de calidad,
                acorde con las necesidades y desafíos de la sociedad actual.
              </p>
            </div>
          </Card>
        </section>

        <br />

        <section className="modules-section">
          <div className="section-title">
            <p>Accesos rápidos</p>
            <h2>Módulos del sistema</h2>
          </div>

          <div className="modules-grid">
            {modulosVisibles.map((module) => (
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
      </div>
    </MainLayout>
  );
}

export default Home;
