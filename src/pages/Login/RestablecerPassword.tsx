import { type FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, getApiErrorMessage } from "../../api/client";
import "./Login.css";

export default function RestablecerPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [mensaje, setMensaje] = useState(token ? "" : "El enlace no contiene un token válido.");
  const [listo, setListo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (password !== confirmacion) return setMensaje("Las contraseñas no coinciden.");
    setGuardando(true); setMensaje("");
    try {
      const respuesta = await api.post<{ mensaje: string }>("/auth/restablecer-password", { token, passwordNueva: password });
      setMensaje(respuesta.mensaje); setListo(true);
    } catch (error) { setMensaje(getApiErrorMessage(error)); }
    finally { setGuardando(false); }
  }
  return <main className="login-page"><section className="login-container login-container--single">
    <div className="login-card" style={{ width: "100%" }}><div className="login-card-header">
      <i className="bi bi-shield-check"/><h3>Nueva contraseña</h3><p>Elige una clave de al menos 8 caracteres.</p>
    </div>{!listo ? <form onSubmit={guardar}>
      <label className="form-label">Nueva contraseña<input className="form-control mb-3" type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></label>
      <label className="form-label">Confirmar contraseña<input className="form-control mb-3" type="password" minLength={8} required value={confirmacion} onChange={e=>setConfirmacion(e.target.value)}/></label>
      {mensaje && <div className="alert alert-danger">{mensaje}</div>}
      <button className="btn login-button w-100" disabled={guardando || !token}>{guardando ? "Actualizando..." : "Guardar contraseña"}</button>
    </form> : <div className="alert alert-success">{mensaje}<Link className="d-block mt-3" to="/login">Iniciar sesión</Link></div>}</div>
  </section></main>;
}
