import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/Login/Login";
import Home from "../pages/Home/Home";
import Notas from "../pages/Notas/Notas";

function PaginaTemporal({ titulo }: { titulo: string }) {
  return (
    <div className="container py-5">
      <h1>{titulo}</h1>
      <p>Esta pantalla se desarrollará posteriormente.</p>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />

      <Route path="/home" element={<Home />} />

      <Route
        path="/roles"
        element={<PaginaTemporal titulo="Gestión de roles" />}
      />

      <Route
        path="/notas"
        element={<Notas/>}
      />

      <Route
        path="/asistencia"
        element={<PaginaTemporal titulo="Ingreso de asistencia" />}
      />

      <Route
        path="/padres"
        element={<PaginaTemporal titulo="Vista de padres de familia" />}
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;