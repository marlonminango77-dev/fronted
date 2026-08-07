import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../../auth/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { sesion, cerrarSesion: cerrarSesionAuth } = useAuth();

  async function cerrarSesion() {
    await cerrarSesionAuth();
    navigate("/login");
  }

  return (
    <nav className="system-navbar">
      <div className="navbar-brand-container">
        <img src="/Logo.png" alt="Logo" className="navbar-logo" />

        <div>
          <strong>Sistema Académico</strong>
          <span>República de Venezuela</span>
        </div>
      </div>

      <div className="navbar-user">
        <div className="user-information">
          <i className="bi bi-person-circle"></i>

          <div>
            <strong>{sesion?.usuario ?? "Usuario"}</strong>
            <span>{sesion?.rol ?? "Usuario del sistema"}</span>
          </div>
        </div>

        <span className="navbar-stripes" aria-hidden="true" />

        <button
          type="button"
          className="logout-button"
          onClick={cerrarSesion}
        >
          <i className="bi bi-box-arrow-right"></i>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
