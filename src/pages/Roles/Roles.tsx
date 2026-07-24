import { useMemo, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import BackHomeButton from "../../components/common/BackHomeButton";
import Card from "../../components/common/Card";
import "./Roles.css";

type EstadoRol = "Activo" | "Inactivo";

interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  permisos: string;
  usuarios: number;
  estado: EstadoRol;
}

const rolesIniciales: Rol[] = [
  { id: 1, nombre: "Administrador", descripcion: "Acceso completo a la configuración y módulos del sistema.", permisos: "Todos los módulos", usuarios: 2, estado: "Activo" },
  { id: 2, nombre: "Docente", descripcion: "Gestiona notas, asistencia y datos de sus estudiantes.", permisos: "Notas y asistencia", usuarios: 18, estado: "Activo" },
  { id: 3, nombre: "Representante", descripcion: "Consulta el progreso académico de sus representados.", permisos: "Solo consulta", usuarios: 146, estado: "Activo" },
  { id: 4, nombre: "Secretaría", descripcion: "Administra matrículas, expedientes y reportes.", permisos: "Gestión académica", usuarios: 3, estado: "Inactivo" },
];

const formularioInicial = {
  nombre: "",
  descripcion: "",
  permisos: "",
  estado: "Activo" as EstadoRol,
};

function Roles() {
  const autenticado = localStorage.getItem("usuarioAutenticado") === "true";
  const [roles, setRoles] = useState<Rol[]>(rolesIniciales);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const rolesPorPagina = 6;

  const rolesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return roles.filter((rol) =>
      (!termino ||
        `${rol.nombre} ${rol.descripcion} ${rol.permisos}`.toLowerCase().includes(termino)) &&
      (!filtroEstado || rol.estado === filtroEstado),
    );
  }, [busqueda, filtroEstado, roles]);

  const totalPaginas = Math.max(1, Math.ceil(rolesFiltrados.length / rolesPorPagina));
  const paginaVisible = Math.min(paginaActual, totalPaginas);
  const rolesPaginados = rolesFiltrados.slice(
    (paginaVisible - 1) * rolesPorPagina,
    paginaVisible * rolesPorPagina,
  );

  if (!autenticado) return <Navigate to="/login" replace />;

  function actualizarCampo(campo: keyof typeof formulario, valor: string) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
    setMensaje("");
  }

  function guardarRol(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nombre = formulario.nombre.trim();
    const descripcion = formulario.descripcion.trim();
    const permisos = formulario.permisos.trim();
    const repetido = roles.some(
      (rol) => rol.nombre.toLowerCase() === nombre.toLowerCase() && rol.id !== editandoId,
    );

    if (repetido) {
      setMensaje("Ya existe un rol con este nombre.");
      return;
    }

    if (editandoId !== null) {
      setRoles((actuales) =>
        actuales.map((rol) =>
          rol.id === editandoId
            ? { ...rol, nombre, descripcion, permisos, estado: formulario.estado }
            : rol,
        ),
      );
      setMensaje("Rol actualizado correctamente.");
    } else {
      setRoles((actuales) => [
        ...actuales,
        { id: Date.now(), nombre, descripcion, permisos, usuarios: 0, estado: formulario.estado },
      ]);
      setMensaje("Rol registrado correctamente.");
    }

    setFormulario(formularioInicial);
    setEditandoId(null);
  }

  function editarRol(rol: Rol) {
    setFormulario({
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      permisos: rol.permisos,
      estado: rol.estado,
    });
    setEditandoId(rol.id);
    setMensaje("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicion() {
    setFormulario(formularioInicial);
    setEditandoId(null);
    setMensaje("");
  }

  function cambiarEstado(id: number) {
    setRoles((actuales) =>
      actuales.map((rol) =>
        rol.id === id
          ? { ...rol, estado: rol.estado === "Activo" ? "Inactivo" : "Activo" }
          : rol,
      ),
    );
  }

  function eliminarRol(rol: Rol) {
    if (rol.usuarios > 0) {
      setMensaje(`No se puede eliminar "${rol.nombre}" porque tiene usuarios asignados.`);
      return;
    }
    if (window.confirm(`¿Deseas eliminar el rol "${rol.nombre}"?`)) {
      setRoles((actuales) => actuales.filter((item) => item.id !== rol.id));
      setMensaje("Rol eliminado correctamente.");
    }
  }

  return (
    <MainLayout>
      <div className="roles-page">
        <header className="roles-header">
          <div>
            <p className="roles-label">Administración</p>
            <h1>Gestión de roles</h1>
            <p>Registra y organiza los niveles de acceso de los usuarios.</p>
          </div>
          <BackHomeButton />
        </header>

        <Card as="section" className="roles-form-card">
          <div className="roles-card-title">
            <span><i className="bi bi-person-badge-fill"></i></span>
            <div>
              <p>{editandoId === null ? "Nuevo registro" : "Edición"}</p>
              <h2>{editandoId === null ? "Datos del rol" : "Actualizar rol"}</h2>
            </div>
          </div>

          <form onSubmit={guardarRol}>
            <div className="roles-form-grid">
              <label>
                <span>Nombre del rol</span>
                <input required maxLength={40} placeholder="Ej. Inspector" value={formulario.nombre} onChange={(e) => actualizarCampo("nombre", e.target.value)} />
              </label>
              <label>
                <span>Nivel de acceso</span>
                <select required value={formulario.permisos} onChange={(e) => actualizarCampo("permisos", e.target.value)}>
                  <option value="">Seleccione los permisos</option>
                  <option>Todos los módulos</option>
                  <option>Gestión académica</option>
                  <option>Notas y asistencia</option>
                  <option>Solo consulta</option>
                </select>
              </label>
              <label>
                <span>Estado inicial</span>
                <select value={formulario.estado} onChange={(e) => actualizarCampo("estado", e.target.value)}>
                  <option>Activo</option>
                  <option>Inactivo</option>
                </select>
              </label>
              <label className="roles-description-field">
                <span>Descripción</span>
                <textarea required maxLength={180} rows={3} placeholder="Describe las responsabilidades de este rol" value={formulario.descripcion} onChange={(e) => actualizarCampo("descripcion", e.target.value)} />
                <small>{formulario.descripcion.length}/180 caracteres</small>
              </label>
            </div>

            <div className="roles-form-actions">
              {mensaje && <p className={mensaje.startsWith("Ya") || mensaje.startsWith("No") ? "roles-message roles-message--error" : "roles-message"}>{mensaje}</p>}
              <div>
                {editandoId !== null && <button type="button" className="roles-cancel-button" onClick={cancelarEdicion}>Cancelar</button>}
                <button type="submit" className="roles-save-button">
                  <i className="bi bi-check-lg"></i>
                  {editandoId === null ? "Registrar rol" : "Guardar cambios"}
                </button>
              </div>
            </div>
          </form>
        </Card>

        <section className="roles-summary" aria-label="Resumen de roles">
          <Card as="article"><span><i className="bi bi-shield-check"></i></span><div><strong>{roles.length}</strong><small>Roles registrados</small></div></Card>
          <Card as="article"><span><i className="bi bi-check-circle-fill"></i></span><div><strong>{roles.filter((rol) => rol.estado === "Activo").length}</strong><small>Roles activos</small></div></Card>
          <Card as="article"><span><i className="bi bi-people-fill"></i></span><div><strong>{roles.reduce((total, rol) => total + rol.usuarios, 0)}</strong><small>Usuarios asignados</small></div></Card>
        </section>

        <Card as="section" className="roles-list-card">
          <div className="roles-list-header">
            <div><p className="roles-label">Registros</p><h2>Roles del sistema</h2></div>
            <label className="roles-search"><i className="bi bi-search"></i><input type="search" aria-label="Buscar roles" placeholder="Buscar por nombre o permiso" value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }} /></label>
          </div>

          <div className="roles-filters">
            <label><span>Estado</span><select value={filtroEstado} onChange={(e) => { setFiltroEstado(e.target.value); setPaginaActual(1); }}><option value="">Todos los estados</option><option>Activo</option><option>Inactivo</option></select></label>
            <p>Mostrando <strong>{rolesFiltrados.length}</strong> de <strong>{roles.length}</strong> roles</p>
          </div>

          <div className="roles-table-wrapper">
            <table className="roles-table">
              <thead><tr><th>Rol</th><th>Descripción</th><th>Acceso</th><th>Usuarios</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {rolesPaginados.map((rol) => (
                  <tr key={rol.id}>
                    <td><div className="roles-name"><span>{rol.nombre.charAt(0)}</span><strong>{rol.nombre}</strong></div></td>
                    <td className="roles-description">{rol.descripcion}</td>
                    <td><span className="roles-access">{rol.permisos}</span></td>
                    <td>{rol.usuarios}</td>
                    <td><button type="button" className={`roles-status roles-status--${rol.estado.toLowerCase()}`} onClick={() => cambiarEstado(rol.id)}><span></span>{rol.estado}</button></td>
                    <td><div className="roles-actions">
                      <button type="button" className="roles-action-button roles-action-button--edit" onClick={() => editarRol(rol)} aria-label={`Editar ${rol.nombre}`} title="Editar"><i className="bi bi-pencil-square"></i></button>
                      <button type="button" className="roles-action-button roles-action-button--delete" onClick={() => eliminarRol(rol)} aria-label={`Eliminar ${rol.nombre}`} title={rol.usuarios > 0 ? "El rol tiene usuarios asignados" : "Eliminar"}><i className="bi bi-trash3"></i></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rolesFiltrados.length === 0 && <div className="roles-empty"><i className="bi bi-search"></i><p>No se encontraron roles.</p></div>}
          </div>

          {rolesFiltrados.length > 0 && <div className="roles-pagination">
            <button type="button" disabled={paginaVisible === 1} onClick={() => setPaginaActual((pagina) => pagina - 1)}><i className="bi bi-chevron-left"></i>Anterior</button>
            <div>{Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((pagina) => <button type="button" key={pagina} className={pagina === paginaVisible ? "roles-page-button--active" : ""} onClick={() => setPaginaActual(pagina)}>{pagina}</button>)}</div>
            <button type="button" disabled={paginaVisible === totalPaginas} onClick={() => setPaginaActual((pagina) => pagina + 1)}>Siguiente<i className="bi bi-chevron-right"></i></button>
          </div>}
        </Card>
      </div>
    </MainLayout>
  );
}

export default Roles;
