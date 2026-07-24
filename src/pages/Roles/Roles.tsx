import { useMemo, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import BackHomeButton from "../../components/common/BackHomeButton";
import Card from "../../components/common/Card";
import "./Roles.css";

interface Role {
  id: number;
  name: string;
  description: string;
  users: number;
  status: "Activo" | "Inactivo";
}

const initialRoles: Role[] = [
  { id: 1, name: "Administrador", description: "Acceso completo a la configuración y módulos del sistema.", users: 2, status: "Activo" },
  { id: 2, name: "Docente", description: "Gestiona notas, asistencia y datos de sus estudiantes.", users: 18, status: "Activo" },
  { id: 3, name: "Representante", description: "Consulta el progreso académico de sus representados.", users: 146, status: "Activo" },
  { id: 4, name: "Secretaría", description: "Administra matrículas, expedientes y reportes.", users: 3, status: "Inactivo" },
];

const emptyForm = { name: "", description: "" };

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const isAuthenticated = localStorage.getItem("usuarioAutenticado") === "true";

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return roles;
    return roles.filter((role) =>
      `${role.name} ${role.description}`.toLowerCase().includes(query),
    );
  }, [roles, search]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(role: Role) {
    setEditingId(role.id);
    setForm({ name: role.name, description: role.description });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function saveRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();
    const description = form.description.trim();
    if (!name || !description) return;

    if (editingId !== null) {
      setRoles((current) =>
        current.map((role) =>
          role.id === editingId ? { ...role, name, description } : role,
        ),
      );
    } else {
      setRoles((current) => [
        ...current,
        { id: Date.now(), name, description, users: 0, status: "Activo" },
      ]);
    }
    closeModal();
  }

  function toggleStatus(id: number) {
    setRoles((current) =>
      current.map((role) =>
        role.id === id
          ? { ...role, status: role.status === "Activo" ? "Inactivo" : "Activo" }
          : role,
      ),
    );
  }

  function deleteRole(role: Role) {
    if (window.confirm(`¿Deseas eliminar el rol "${role.name}"?`)) {
      setRoles((current) => current.filter((item) => item.id !== role.id));
    }
  }

  return (
    <MainLayout>
      <div className="roles-page">
        <header className="roles-heading">
          <div>
            <p className="roles-eyebrow">Administración</p>
            <h1>Gestión de roles</h1>
            <p className="roles-subtitle">Organiza los niveles de acceso de los usuarios del sistema.</p>
          </div>
          <div className="roles-heading-actions">
            <BackHomeButton />
            <button className="roles-primary-button" onClick={openCreateModal}>
              <i className="bi bi-plus-lg" aria-hidden="true"></i> Nuevo rol
            </button>
          </div>
        </header>

        <section className="roles-summary" aria-label="Resumen de roles">
          <Card as="article">
            <span className="roles-summary-icon roles-summary-icon--green"><i className="bi bi-shield-check"></i></span>
            <div><strong>{roles.length}</strong><span>Roles registrados</span></div>
          </Card>
          <Card as="article">
            <span className="roles-summary-icon roles-summary-icon--blue"><i className="bi bi-person-check"></i></span>
            <div><strong>{roles.filter((role) => role.status === "Activo").length}</strong><span>Roles activos</span></div>
          </Card>
          <Card as="article">
            <span className="roles-summary-icon roles-summary-icon--orange"><i className="bi bi-people"></i></span>
            <div><strong>{roles.reduce((total, role) => total + role.users, 0)}</strong><span>Usuarios asignados</span></div>
          </Card>
        </section>

        <Card as="section" className="roles-panel">
          <div className="roles-toolbar">
            <div><h2>Roles del sistema</h2><p>{filteredRoles.length} resultados encontrados</p></div>
            <label className="roles-search">
              <i className="bi bi-search" aria-hidden="true"></i>
              <span className="roles-sr-only">Buscar roles</span>
              <input type="search" placeholder="Buscar por nombre o descripción..." value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
          </div>

          <div className="roles-table-wrapper">
            <table className="roles-table">
              <thead><tr><th>Rol</th><th>Descripción</th><th>Usuarios</th><th>Estado</th><th className="roles-actions-title">Acciones</th></tr></thead>
              <tbody>
                {filteredRoles.map((role) => (
                  <tr key={role.id}>
                    <td><div className="roles-name"><span><i className="bi bi-person-badge"></i></span><strong>{role.name}</strong></div></td>
                    <td className="roles-description">{role.description}</td>
                    <td><span className="roles-user-count">{role.users}</span></td>
                    <td>
                      <button className={`roles-status roles-status--${role.status.toLowerCase()}`} onClick={() => toggleStatus(role.id)} title="Cambiar estado">
                        <span></span>{role.status}
                      </button>
                    </td>
                    <td>
                      <div className="roles-actions">
                        <button className="roles-icon-button roles-icon-button--edit" onClick={() => openEditModal(role)} aria-label={`Editar ${role.name}`} title="Editar"><i className="bi bi-pencil-square"></i></button>
                        <button className="roles-icon-button roles-icon-button--delete" onClick={() => deleteRole(role)} aria-label={`Eliminar ${role.name}`} title="Eliminar"><i className="bi bi-trash3"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRoles.length === 0 && <div className="roles-empty"><i className="bi bi-search"></i><h3>No encontramos roles</h3><p>Prueba con otro término de búsqueda.</p></div>}
          </div>
        </Card>
      </div>

      {isModalOpen && (
        <div className="roles-modal-backdrop" onMouseDown={closeModal}>
          <div className="roles-modal" role="dialog" aria-modal="true" aria-labelledby="role-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="roles-modal-header">
              <div>
                <span><i className="bi bi-shield-lock"></i></span>
                <div><p>{editingId === null ? "Crear acceso" : "Actualizar acceso"}</p><h2 id="role-modal-title">{editingId === null ? "Nuevo rol" : "Editar rol"}</h2></div>
              </div>
              <button onClick={closeModal} aria-label="Cerrar ventana"><i className="bi bi-x-lg"></i></button>
            </div>
            <form onSubmit={saveRole}>
              <label className="roles-field">
                <span>Nombre del rol</span>
                <input autoFocus required maxLength={40} placeholder="Ej. Inspector" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </label>
              <label className="roles-field">
                <span>Descripción</span>
                <textarea required maxLength={180} rows={4} placeholder="Describe las responsabilidades y el acceso del rol." value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
                <small>{form.description.length}/180 caracteres</small>
              </label>
              <div className="roles-modal-actions">
                <button type="button" className="roles-secondary-button" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="roles-primary-button"><i className="bi bi-check-lg"></i>{editingId === null ? "Crear rol" : "Guardar cambios"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
