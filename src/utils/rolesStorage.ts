export type EstadoRol="Activo"|"Inactivo";
export interface RolSistema{id:number;nombre:string;descripcion:string;permisos:string[];usuarios:number;estado:EstadoRol;protegido?:boolean}
export const permisosDisponibles=["Estudiantes","Docentes","Materias","Notas","Asistencia","Representantes","Consulta familiar","Mensajes","Reportes","Gestion de roles"] as const;
export function etiquetaPermiso(permiso:string){return permiso==="Gestion de roles"?"Gestión de roles":permiso}
