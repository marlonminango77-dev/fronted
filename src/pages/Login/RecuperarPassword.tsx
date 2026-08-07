import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { api, getApiErrorMessage } from "../../api/client";
import "./Login.css";

export default function RecuperarPassword() {
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  async function enviar(e: FormEvent) {
    e.preventDefault(); setEnviando(true); setMensaje("");
    try {
      const respuesta = await api.post<{ mensaje: string }>("/auth/recuperar-password", { correo });
      setMensaje(respuesta.mensaje);
    } catch (error) { setMensaje(getApiErrorMessage(error)); }
    finally { setEnviando(false); }
  }
  return <main className="login-page"><section className="login-container login-container--single">
    <div className="login-card"><div className="login-card-header">
      <i className="bi bi-envelope-key"/><h3>Recuperar contraseña</h3>
      <p>Te enviaremos un enlace seguro con vigencia de 30 minutos.</p>
    </div><form onSubmit={enviar}>
      <label className="form-label" htmlFor="correo">Correo de la cuenta</label>
      <input id="correo" className="form-control mb-3" type="email" required value={correo} onChange={e=>setCorreo(e.target.value)} />
      {mensaje && <div className="alert alert-info" role="status">{mensaje}</div>}
      <button className="btn login-button w-100" disabled={enviando}>{enviando ? "Enviando..." : "Enviar enlace"}</button>
      <Link className="d-block text-center mt-3" to="/login">Volver a iniciar sesión</Link>
    </form></div></section></main>;
}
