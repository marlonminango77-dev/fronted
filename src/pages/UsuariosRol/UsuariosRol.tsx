import { useMemo, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import BackHomeButton from "../../components/common/BackHomeButton";
import "../IngresoPadres/IngresoPadres.css";

interface UsuarioRol {
  id: number;
  nombres: string;
  apellidos: string;
  identificacion: string;
  telefono: string;
  correo: string;
  estado: "Activo" | "Inactivo";
}

type UsuarioForm = Omit<UsuarioRol, "id">;

interface UsuariosRolProps {
  tipo: "Administrador" | "Secretaría";
}

const formularioVacio: UsuarioForm = {
  nombres: "",
  apellidos: "",
  identificacion: "",
  telefono: "",
  correo: "",
  estado: "Activo",
};

const registrosIniciales: Record<UsuariosRolProps["tipo"], UsuarioRol[]> = {
  Administrador: [
    {
      id: 1,
      nombres: "Mateo",
      apellidos: "Administrador",
      identificacion: "0900000001",
      telefono: "099 000 0001",
      correo: "administracion@escuela.edu.ec",
      estado: "Activo",
    },
  ],
  Secretaría: [
    {
      id: 1,
      nombres: "Andrea",
      apellidos: "Vera Mendoza",
      identificacion: "0900000002",
      telefono: "099 000 0002",
      correo: "secretaria@escuela.edu.ec",
      estado: "Activo",
    },
  ],
};

function UsuariosRol({ tipo }: UsuariosRolProps) {
  const autenticado = localStorage.getItem("usuarioAutenticado") === "true";
  const nombrePlural = tipo === "Administrador" ? "administradores" : "personal de secretaría";
  const storageKey = tipo === "Administrador" ? "administradoresRegistrados" : "secretariaRegistrada";

  const [usuarios, setUsuarios] = useState<UsuarioRol[]>(() => {
    try {
      const guardados = localStorage.getItem(storageKey);
      return guardados ? JSON.parse(guardados) : registrosIniciales[tipo];
    } catch {
      return registrosIniciales[tipo];
    }
  });
  const [formulario, setFormulario] = useState<UsuarioForm>(formularioVacio);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return usuarios;
    return usuarios.filter((usuario) =>
      [
        usuario.nombres,
        usuario.apellidos,
        usuario.identificacion,
        usuario.correo,
        usuario.estado,
      ].join(" ").toLowerCase().includes(texto),
    );
  }, [busqueda, usuarios]);

  if (!autenticado) return <Navigate to="/login" replace />;

  function actualizarCampo(campo: keyof UsuarioForm, valor: string) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
    setMensaje("");
  }

  function guardarLista(lista: UsuarioRol[]) {
    setUsuarios(lista);
    localStorage.setItem(storageKey, JSON.stringify(lista));
  }

  function guardarUsuario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const identificacion = formulario.identificacion.trim();
    const repetido = usuarios.some(
      (usuario) =>
        usuario.identificacion === identificacion &&
        usuario.id !== editandoId,
    );

    if (repetido) {
      setMensaje("Ya existe un usuario con esta cédula.");
      return;
    }

    const datos = Object.fromEntries(
      Object.entries(formulario).map(([clave, valor]) => [clave, valor.trim()]),
    ) as unknown as UsuarioForm;

    if (editandoId !== null) {
      guardarLista(
        usuarios.map((usuario) =>
          usuario.id === editandoId ? { ...usuario, ...datos } : usuario,
        ),
      );
      setMensaje("La información se actualizó correctamente.");
    } else {
      guardarLista([...usuarios, { id: Date.now(), ...datos }]);
      setMensaje(`El usuario fue agregado a la lista de ${nombrePlural}.`);
    }

    setFormulario(formularioVacio);
    setEditandoId(null);
  }

  function editarUsuario(usuario: UsuarioRol) {
    const { id, ...datos } = usuario;
    setFormulario(datos);
    setEditandoId(id);
    setMensaje("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicion() {
    setFormulario(formularioVacio);
    setEditandoId(null);
    setMensaje("");
  }

  function eliminarUsuario(usuario: UsuarioRol) {
    if (window.confirm(`¿Deseas eliminar a ${usuario.nombres} ${usuario.apellidos}?`)) {
      guardarLista(usuarios.filter((item) => item.id !== usuario.id));
      setMensaje("Usuario eliminado correctamente.");
    }
  }

  return (
    <MainLayout>
      <div className="parent-entry-page">
        <header className="parent-entry-heading">
          <div>
            <p className="parent-entry-eyebrow">Administración de usuarios</p>
            <h1>Registro de {nombrePlural}</h1>
            <p>Registra y administra los usuarios asignados al rol {tipo}.</p>
          </div>
          <BackHomeButton />
        </header>

        <section className="parent-entry-form-card">
          <div className="parent-entry-card-title">
            <span><i className={tipo === "Administrador" ? "bi bi-shield-lock-fill" : "bi bi-person-lines-fill"}></i></span>
            <div>
              <p>{editandoId ? "Actualización de información" : "Nuevo registro"}</p>
              <h2>{editandoId ? "Editar usuario" : `Datos de ${tipo.toLowerCase()}`}</h2>
            </div>
          </div>

          <form onSubmit={guardarUsuario}>
            <fieldset>
              <legend>Información personal</legend>
              <div className="parent-entry-grid">
                <label><span>Nombres *</span><input required value={formulario.nombres} onChange={(e) => actualizarCampo("nombres", e.target.value)} placeholder="Ingrese los nombres" /></label>
                <label><span>Apellidos *</span><input required value={formulario.apellidos} onChange={(e) => actualizarCampo("apellidos", e.target.value)} placeholder="Ingrese los apellidos" /></label>
                <label><span>Cédula de identidad *</span><input required inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={formulario.identificacion} onChange={(e) => actualizarCampo("identificacion", e.target.value.replace(/\D/g, ""))} placeholder="10 dígitos" /></label>
                <label><span>Estado *</span><select value={formulario.estado} onChange={(e) => actualizarCampo("estado", e.target.value)}><option>Activo</option><option>Inactivo</option></select></label>
              </div>
            </fieldset>

            <fieldset>
              <legend>Datos de contacto</legend>
              <div className="parent-entry-grid">
                <label><span>Teléfono *</span><input required type="tel" value={formulario.telefono} onChange={(e) => actualizarCampo("telefono", e.target.value)} placeholder="Ej. 099 123 4567" /></label>
                <label><span>Correo electrónico *</span><input required type="email" value={formulario.correo} onChange={(e) => actualizarCampo("correo", e.target.value)} placeholder="correo@escuela.edu.ec" /></label>
              </div>
            </fieldset>

            {mensaje && <div className="parent-entry-message"><i className={`bi ${mensaje.startsWith("Ya") ? "bi-exclamation-circle-fill" : "bi-check-circle-fill"}`}></i>{mensaje}</div>}

            <div className="parent-entry-form-actions">
              {editandoId && <button type="button" className="parent-entry-secondary" onClick={cancelarEdicion}>Cancelar</button>}
              <button type="submit" className="parent-entry-primary"><i className={`bi ${editandoId ? "bi-check-lg" : "bi-floppy-fill"}`}></i>{editandoId ? "Guardar cambios" : "Registrar usuario"}</button>
            </div>
          </form>
        </section>

        <section className="parent-entry-list-card">
          <div className="parent-entry-list-header">
            <div><p className="parent-entry-eyebrow">Registros</p><h2>{tipo === "Administrador" ? "Administradores registrados" : "Personal de secretaría registrado"}</h2><span>{usuariosFiltrados.length} resultados</span></div>
            <label className="parent-entry-search"><i className="bi bi-search"></i><span className="parent-entry-sr-only">Buscar usuario</span><input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre, cédula o correo..." /></label>
          </div>

          <div className="parent-entry-table-wrapper">
            <table className="parent-entry-table">
              <thead><tr><th>Usuario</th><th>Contacto</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id}>
                    <td><div className="parent-entry-person"><span>{usuario.nombres.charAt(0)}{usuario.apellidos.charAt(0)}</span><div><strong>{usuario.nombres} {usuario.apellidos}</strong><small>C.I. {usuario.identificacion}</small></div></div></td>
                    <td><div className="parent-entry-contact"><span>{usuario.telefono}</span><small>{usuario.correo}</small></div></td>
                    <td><span className="parent-entry-relation">{tipo}</span></td>
                    <td><strong>{usuario.estado}</strong></td>
                    <td><div className="parent-entry-actions"><button type="button" onClick={() => editarUsuario(usuario)} aria-label={`Editar a ${usuario.nombres}`}><i className="bi bi-pencil-square"></i></button><button type="button" onClick={() => eliminarUsuario(usuario)} aria-label={`Eliminar a ${usuario.nombres}`}><i className="bi bi-trash3"></i></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!usuariosFiltrados.length && <div className="parent-entry-empty"><i className="bi bi-people"></i><h3>No hay usuarios registrados</h3><p>Registra un usuario o prueba otra búsqueda.</p></div>}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

export default UsuariosRol;
