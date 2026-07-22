import { useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const nombreUsuario =
    localStorage.getItem("nombreUsuario") || "Usuario";

  function cerrarSesion() {
    localStorage.removeItem("usuarioAutenticado");
    localStorage.removeItem("nombreUsuario");

    navigate("/login");
  }

  return (
    <nav className="system-navbar">
      <div className="navbar-brand-container">
        <img src="/logo.png" alt="Logo" className="navbar-logo" />

        <div>
          <strong>Sistema Académico</strong>
          <span>República de Venezuela</span>
        </div>
      </div>

      <div className="navbar-user">
        <div className="user-information">
          <i className="bi bi-person-circle"></i>

          <div>
            <strong>{nombreUsuario}</strong>
            <span>Usuario del sistema</span>
          </div>
        </div>

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