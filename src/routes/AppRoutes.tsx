import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/Login/Login";
import Home from "../pages/Home/Home";
import Notas from "../pages/Notas/Notas";
import Padres from "../pages/Padres/Padres";
import Asistencia from "../pages/Asistencia/Asistencia";
import Roles from "../pages/Roles/Roles";
import Mensajes from "../pages/Mensajes/Mensajes";
import Estudiantes from "../pages/Estudiantes/Estudiantes";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />

      <Route path="/home" element={<Home />} />

      <Route
        path="/roles"
        element={<Roles />}
      />

      <Route
        path="/notas"
        element={<Notas/>}
      />

      <Route
        path="/asistencia"
        element={<Asistencia />}
      />

      <Route path="/padres" element={<Padres />} />

      <Route path="/mensajes" element={<Mensajes />} />
      <Route path="/estudiantes" element={<Estudiantes />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
