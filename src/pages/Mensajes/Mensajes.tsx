import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import BackHomeButton from "../../components/common/BackHomeButton";
import { api, getApiErrorMessage } from "../../api/client";
import "./Mensajes.css";
import { useAuth } from "../../auth/AuthContext";

interface Curso {
  id: number;
  nombre: string;
}

interface MensajeApi {
  id: number;
  fecha: string;
  curso: string;
  contenido: string;
}

function Mensajes() {
  const { tienePermiso } = useAuth();
  const puedeGestionar = tienePermiso("Mensajes");
  const fechaActual = new Date().toLocaleDateString("en-CA");
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [fecha, setFecha] = useState("");
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [contenido, setContenido] = useState("");
  const [mensajes, setMensajes] = useState<MensajeApi[]>([]);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroCurso, setFiltroCurso] = useState("");

  const cursosConMensajes = useMemo(
    () => [...new Set(mensajes.map((mensaje) => mensaje.curso))].sort(),
    [mensajes],
  );

  const mensajesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return mensajes.filter(
      (mensaje) =>
        (!filtroCurso || mensaje.curso === filtroCurso) &&
        (!texto ||
          `${mensaje.curso} ${mensaje.contenido} ${mensaje.fecha}`
            .toLowerCase()
            .includes(texto)),
    );
  }, [busqueda, filtroCurso, mensajes]);

  function mostrarFecha(valor: string) {
    const [anio, mes, dia] = valor.split("-");
    return anio && mes && dia ? `${dia}/${mes}/${anio}` : valor;
  }

  useEffect(() => {
    const cargar = async () => {
      try {
        setError("");
        const lista = await api.get<MensajeApi[]>("/mensajes");
        setMensajes(lista);

        if (puedeGestionar) {
          const nombres = await api.get<string[]>("/mensajes/cursos");
          setCursos(
            nombres.map((nombre, indice) => ({ id: indice + 1, nombre })),
          );
        }
      } catch (error) {
        setError(getApiErrorMessage(error));
      }
    };

    void cargar();
  }, [puedeGestionar]);

  function limpiarFormulario() {
    setFecha("");
    setCursoSeleccionado("");
    setContenido("");
  }

  async function enviarMensaje() {
    if (!fecha || !cursoSeleccionado || !contenido.trim()) {
      setError("Complete todos los campos.");
      return;
    }
    if (fecha < fechaActual) {
      setError("No puede seleccionar una fecha anterior a hoy.");
      return;
    }

    const curso = cursos.find(
      (item) => item.id === Number(cursoSeleccionado),
    );
    if (!curso) {
      setError("El curso seleccionado no existe.");
      return;
    }

    try {
      setError("");
      const guardado = await api.post<MensajeApi>("/mensajes", {
        fecha,
        curso: curso.nombre,
        contenido: contenido.trim(),
        estado: "Enviado",
      });
      setMensajes((actuales) => [guardado, ...actuales]);
      limpiarFormulario();
    } catch (error) {
      setError(getApiErrorMessage(error));
    }
  }

  async function eliminarMensaje(id: number) {
    if (!window.confirm("¿Está seguro de eliminar este mensaje?")) return;
    try {
      setError("");
      await api.delete(`/mensajes/${id}`);
      setMensajes((actuales) => actuales.filter((item) => item.id !== id));
    } catch (error) {
      setError(getApiErrorMessage(error));
    }
  }

  return (
    <MainLayout>
      <div className="mensajes-content">
        <header className="mensajes-header">
          <div>
            <p>Comunicación académica</p>
            <h1>{puedeGestionar ? "Mensajes" : "Mensajes recibidos"}</h1>
            <span>{puedeGestionar ? "Envía comunicados dirigidos a un curso específico." : "Consulta los comunicados enviados a los cursos de tus hijos."}</span>
          </div>
          <BackHomeButton />
        </header>

        {error && <div className="mensajes-alerta"><i className="bi bi-exclamation-circle-fill"/>{error}</div>}

        {puedeGestionar && (
          <section className="mensaje-formulario">
            <div className="mensajes-section-title">
              <span><i className="bi bi-send-fill"/></span>
              <div><p>Nuevo comunicado</p><h2>Redactar mensaje</h2></div>
            </div>
            <div className="mensaje-form-grid">
              <label htmlFor="fecha"><span>Fecha *</span><input id="fecha" type="date" min={fechaActual} value={fecha} onChange={(event) => setFecha(event.target.value)}/></label>
              <label htmlFor="curso"><span>Curso destinatario *</span><select id="curso" value={cursoSeleccionado} onChange={(event) => setCursoSeleccionado(event.target.value)}><option value="">Seleccione un curso</option>{cursos.map((curso) => <option key={curso.id} value={curso.id}>{curso.nombre}</option>)}</select></label>
            </div>
            <label className="mensaje-contenido" htmlFor="mensaje"><span>Mensaje *</span><textarea id="mensaje" rows={4} value={contenido} onChange={(event) => setContenido(event.target.value)} placeholder="Escriba aquí el contenido del comunicado..."/></label>
            <div className="mensaje-acciones">
              <button type="button" className="mensaje-limpiar" onClick={limpiarFormulario}><i className="bi bi-eraser"/>Limpiar</button>
              <button type="button" className="mensaje-enviar" onClick={enviarMensaje}><i className="bi bi-send"/>Enviar mensaje</button>
            </div>
          </section>
        )}

        <section className="lista-mensajes">
          <div className="mensajes-list-header">
            <div><p>Comunicados</p><h2>{puedeGestionar ? "Mensajes enviados" : "Comunicados de sus cursos"}</h2><span>{mensajesFiltrados.length} resultado(s)</span></div>
            <div className="mensajes-filtros">
              <label><i className="bi bi-search"/><input type="search" value={busqueda} onChange={(event)=>setBusqueda(event.target.value)} placeholder="Buscar en los mensajes"/></label>
              <select aria-label="Filtrar por curso" value={filtroCurso} onChange={(event)=>setFiltroCurso(event.target.value)}><option value="">Todos los cursos</option>{cursosConMensajes.map((curso)=><option key={curso}>{curso}</option>)}</select>
            </div>
          </div>
          {mensajesFiltrados.length === 0 ? (
            <div className="mensajes-vacio"><i className="bi bi-chat-left-text"/><h3>No hay mensajes</h3><p>{puedeGestionar ? "No existen mensajes enviados." : "No existen mensajes para los cursos de sus hijos."}</p></div>
          ) : (
            <div className="mensajes-grid">{mensajesFiltrados.map((mensaje) => (
              <article className="mensaje-enviado" key={mensaje.id}>
                <div className="mensaje-icono"><i className="bi bi-megaphone-fill"/></div>
                <div className="mensaje-informacion">
                  <div className="mensaje-meta"><strong>{mensaje.curso}</strong><time dateTime={mensaje.fecha}><i className="bi bi-calendar3"/> {mostrarFecha(mensaje.fecha)}</time></div>
                  <p>{mensaje.contenido}</p>
                </div>
                {puedeGestionar && <button type="button" className="btn-eliminar" onClick={() => eliminarMensaje(mensaje.id)} aria-label="Eliminar mensaje"><i className="bi bi-trash3"/></button>}
              </article>
            ))}</div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}

export default Mensajes;
