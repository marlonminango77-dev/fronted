import "./Asistencia.css";

function Asistencia() {
  const estudiantes = [
    { id: 1, nombre: "María José Pérez", presente: true },
    { id: 2, nombre: "Juan Carlos López", presente: true },
    { id: 3, nombre: "Ana Sofía Martínez", presente: true },
    { id: 4, nombre: "Diego Alejandro Ruiz", presente: false },
    { id: 5, nombre: "Valeria Fernández", presente: true },
  ];

  return (
    <div className="contenedor">

      {/* Barra lateral */}
      <aside className="sidebar">
        <h2>Escuela</h2>

        <ul>
          <li>🏠 Inicio</li>
          <li>👨‍🎓 Estudiantes</li>
          <li>📝 Notas</li>
          <li className="activo">📅 Asistencia</li>
          <li>⚙ Configuración</li>
        </ul>
      </aside>

      {/* Contenido */}
      <main className="contenido">

        <h1>Ingreso de Asistencia</h1>

        {/* Filtros */}
        <div className="filtros">

          <div>
            <label>Grado</label>
            <select>
              <option>5° A</option>
              <option>6</option>
            </select>
          </div>

          <div>
            <label>Fecha</label>
            <input type="date" />
          </div>

          <div>
            <label>Asignatura</label>
            <select>
              <option>Matemáticas</option>
              <option>Lengua</option>
              <option>Ciencias</option>
            </select>
          </div>

        </div>

        {/* Tabla */}
        <table>

          <thead>
            <tr>
              <th>#</th>
              <th>Estudiante</th>
              <th>Asistencia</th>
            </tr>
          </thead>

          <tbody>

            {estudiantes.map((estudiante) => (

              <tr key={estudiante.id}>
                <td>{estudiante.id}</td>
                <td>{estudiante.nombre}</td>

                <td>
                  <input
                    type="checkbox"
                    defaultChecked={estudiante.presente}
                  />
                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {/* Leyenda */}
        <div className="estado">
          <label>
            <input type="checkbox" checked readOnly /> Presente
          </label>

          <label>
            <input type="checkbox" readOnly /> Ausente
          </label>
        </div>

        {/* Botón */}
        <button className="btnGuardar">
          Guardar Asistencia
        </button>

      </main>

    </div>
  );
}

export default Asistencia;