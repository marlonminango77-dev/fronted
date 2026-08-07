import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/Login/Login";
import CambiarPassword from "../pages/Login/CambiarPassword";
import RecuperarPassword from "../pages/Login/RecuperarPassword";
import RestablecerPassword from "../pages/Login/RestablecerPassword";
import Home from "../pages/Home/Home";
import Notas from "../pages/Notas/Notas";
import Padres from "../pages/Padres/Padres";
import Asistencia from "../pages/Asistencia/Asistencia";
import Roles from "../pages/Roles/Roles";
import Mensajes from "../pages/Mensajes/Mensajes";
import Estudiantes from "../pages/Estudiantes/Estudiantes";
import IngresoPadres from "../pages/IngresoPadres/IngresoPadres";
import Docentes from "../pages/Docente/Docentes";
import Usuarios from "../pages/Usuarios/Usuarios";
import Materias from "../pages/Materias/Materias";
import Reportes from "../pages/Reportes/Reportes";
import ErrorPage from "../pages/ErrorPage";
import { useAuth } from "../auth/AuthContext";
import "../styles/PageConsistency.css";

function RutaProtegida({
  children,
  permisos = [],
}: {
  children: ReactNode;
  permisos?: string[];
}) {
  const { sesion, verificando } = useAuth();
  if (verificando) {
    return <div role="status" aria-live="polite">Verificando sesión…</div>;
  }
  if (!sesion) return <Navigate to="/login" replace />;
  if (sesion.cambioPasswordPendiente) return <Navigate to="/cambiar-password" replace />;
  if (
    permisos.length &&
    !permisos.some((permiso) => sesion.permisos.includes(permiso))
  ) {
    return <Navigate to="/403" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/recuperar-password" element={<RecuperarPassword />} />
      <Route path="/restablecer-password" element={<RestablecerPassword />} />
      <Route path="/cambiar-password" element={<RutaCambioPassword />} />

      <Route path="/home" element={<RutaProtegida><Home /></RutaProtegida>} />
      <Route path="/roles" element={<RutaProtegida permisos={["Gestion de roles"]}><Roles /></RutaProtegida>} />
      <Route path="/usuarios" element={<RutaProtegida permisos={["Gestion de roles"]}><Usuarios /></RutaProtegida>} />
      <Route path="/notas" element={<RutaProtegida permisos={["Notas"]}><Notas /></RutaProtegida>} />
      <Route path="/asistencia" element={<RutaProtegida permisos={["Asistencia"]}><Asistencia /></RutaProtegida>} />
      <Route path="/padres" element={<RutaProtegida permisos={["Consulta familiar"]}><Padres /></RutaProtegida>} />
      <Route path="/ingreso-padres" element={<RutaProtegida permisos={["Representantes"]}><IngresoPadres /></RutaProtegida>} />
      <Route path="/mensajes" element={<RutaProtegida permisos={["Mensajes", "Consulta familiar"]}><Mensajes /></RutaProtegida>} />
      <Route path="/estudiantes" element={<RutaProtegida permisos={["Estudiantes"]}><Estudiantes /></RutaProtegida>} />
      <Route path="/docentes" element={<RutaProtegida permisos={["Docentes"]}><Docentes /></RutaProtegida>} />
      <Route path="/materias" element={<RutaProtegida permisos={["Materias"]}><Materias /></RutaProtegida>} />
      <Route path="/reportes" element={<RutaProtegida permisos={["Reportes"]}><Reportes /></RutaProtegida>} />
      <Route path="/403" element={<ErrorPage codigo={403} titulo="Acceso denegado" mensaje="Tu cuenta no tiene permiso para ingresar a este módulo." />} />
      <Route path="/servidor-desconectado" element={<ErrorPage codigo={503} titulo="Servidor no disponible" mensaje="No pudimos conectar con el sistema. Verifica Docker e intenta nuevamente." />} />

      <Route path="*" element={<ErrorPage codigo={404} titulo="Página no encontrada" mensaje="La dirección solicitada no existe o fue movida." />} />
    </Routes>
  );
}

function RutaCambioPassword() {
  const { sesion, verificando } = useAuth();
  if (verificando) return <div role="status">Verificando sesión…</div>;
  if (!sesion) return <Navigate to="/login" replace />;
  if (!sesion.cambioPasswordPendiente) return <Navigate to="/home" replace />;
  return <CambiarPassword />;
}

export default AppRoutes;
