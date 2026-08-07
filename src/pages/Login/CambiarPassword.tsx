import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getApiErrorMessage } from "../../api/client";
import { useAuth, type Sesion } from "../../auth/AuthContext";
import "./Login.css";

export default function CambiarPassword() {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);
  const { establecerSesion } = useAuth();
  const navigate = useNavigate();

  async function guardar(evento: FormEvent) {
    evento.preventDefault();
    if (nueva !== confirmacion) return setMensaje("Las contraseñas nuevas no coinciden.");
    setGuardando(true);
    setMensaje("");
    try {
      const sesion = await api.post<Sesion>("/auth/cambiar-password", {
        passwordActual: actual,
        passwordNueva: nueva,
      });
      establecerSesion(sesion);
      navigate("/home", { replace: true });
    } catch (error) {
      setMensaje(getApiErrorMessage(error));
    } finally {
      setGuardando(false);
    }
  }

  return <main className="login-page">
    <section className="login-card" style={{ maxWidth: 520, margin: "auto" }}>
      <div className="login-form-panel">
        <i className="bi bi-shield-lock" style={{ fontSize: 48, color: "#174ea6" }} />
        <h1>Cambiar contraseña</h1>
        <p>Por seguridad, reemplaza la contraseña temporal antes de continuar.</p>
        <form onSubmit={guardar} className="login-form">
          <label>Contraseña actual<input type="password" required value={actual} onChange={e => setActual(e.target.value)} /></label>
          <label>Nueva contraseña<input type="password" required minLength={8} value={nueva} onChange={e => setNueva(e.target.value)} /></label>
          <label>Confirmar nueva contraseña<input type="password" required minLength={8} value={confirmacion} onChange={e => setConfirmacion(e.target.value)} /></label>
          {mensaje && <div className="login-error" role="alert">{mensaje}</div>}
          <button type="submit" disabled={guardando}>{guardando ? "Guardando..." : "Actualizar contraseña"}</button>
        </form>
      </div>
    </section>
  </main>;
}
