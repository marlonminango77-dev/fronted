import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState("");

  function iniciarSesion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!usuario.trim() || !contrasena.trim()) {
      setError("Ingrese el usuario y la contraseña.");
      return;
    }

    /*
     * Login temporal:
     * mientras no exista backend, aceptamos cualquier usuario
     * y contraseña que no estén vacíos.
     */
    localStorage.setItem("usuarioAutenticado", "true");
    localStorage.setItem("nombreUsuario", usuario);

    navigate("/home");
  }

  return (
    <main className="login-page">
      <section className="login-container">
        <div className="login-information">
          <div className="institution-logo">
            <img src="/Logo.png" alt="Escudo de la Escuela República de Venezuela" />
          </div>

          <p className="login-subtitle">Sistema Académico</p>

          <h1>Escuela de Educación Básica</h1>

          <h2>República de Venezuela</h2>

          <p className="login-description">
            Plataforma para la gestión de notas, asistencia y consulta
            académica.
          </p>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <i className="bi bi-person-circle"></i>

            <h3>Iniciar sesión</h3>

            <p>Ingrese sus credenciales para continuar</p>
          </div>

          <form onSubmit={iniciarSesion}>
            <div className="mb-3">
              <label htmlFor="usuario" className="form-label">
                Usuario
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-person"></i>
                </span>

                <input
                  id="usuario"
                  type="text"
                  className="form-control"
                  placeholder="Ingrese su usuario"
                  value={usuario}
                  onChange={(event) => setUsuario(event.target.value)}
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="contrasena" className="form-label">
                Contraseña
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock"></i>
                </span>

                <input
                  id="contrasena"
                  type={mostrarContrasena ? "text" : "password"}
                  className="form-control"
                  placeholder="Ingrese su contraseña"
                  value={contrasena}
                  onChange={(event) => setContrasena(event.target.value)}
                />
                <button
                  type="button"
                  className="btn password-toggle"
                  onClick={() => setMostrarContrasena((visible) => !visible)}
                  aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={mostrarContrasena}
                >
                  <i className={`bi ${mostrarContrasena ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <button type="submit" className="btn login-button w-100">
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Ingresar
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Login;
