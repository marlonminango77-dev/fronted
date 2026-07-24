import MainLayout from "../../layouts/MainLayout";
import "./Notas.css";

function Notas() {
  return (
    <MainLayout>
      <div className="notas-content">

        <section className="notas-header">
          <h1>Ingreso de Notas</h1>
        </section>

        <section className="filtros-section">

          <div className="filtro">
            <label>Grado</label>
            <select>
              <option>5° A</option>
            </select>
          </div>

          <div className="filtro">
            <label>Asignatura</label>
            <select>
              <option>Matemáticas</option>
            </select>
          </div>

          <div className="filtro">
            <label>Período</label>
            <select>
              <option>Segundo Parcial</option>
            </select>
          </div>

        </section>

        <section className="tabla-section">

          <table className="tabla-notas">

            <thead>

              <tr>
                <th>#</th>
                <th>Estudiante</th>

                <th>
                  Tareas
                  <br />
                  <span>30%</span>
                </th>

                <th>
                  Lecciones
                  <br />
                  <span>30%</span>
                </th>

                <th>
                  Examen
                  <br />
                  <span>40%</span>
                </th>

                <th>Nota Final</th>
              </tr>

            </thead>

            <tbody>

              <tr>
                <td>1</td>
                <td>María José Pérez</td>
                <td><input type="text" defaultValue="8.5" /></td>
                <td><input type="text" defaultValue="9.0" /></td>
                <td><input type="text" defaultValue="9.2" /></td>
                <td className="nota-final">8.92</td>
              </tr>

              <tr>
                <td>2</td>
                <td>Juan Carlos López</td>
                <td><input type="text" defaultValue="7.8" /></td>
                <td><input type="text" defaultValue="8.0" /></td>
                <td><input type="text" defaultValue="8.4" /></td>
                <td className="nota-final">8.08</td>
              </tr>

              <tr>
                <td>3</td>
                <td>Ana Sofía Martínez</td>
                <td><input type="text" defaultValue="9.5" /></td>
                <td><input type="text" defaultValue="9.8" /></td>
                <td><input type="text" defaultValue="9.7" /></td>
                <td className="nota-final">9.67</td>
              </tr>

              <tr>
                <td>4</td>
                <td>Carlos Andrade</td>
                <td><input type="text" defaultValue="6.9" /></td>
                <td><input type="text" defaultValue="7.5" /></td>
                <td><input type="text" defaultValue="7.8" /></td>
                <td className="nota-final">7.44</td>
              </tr>

              <tr>
                <td>5</td>
                <td>Valeria Torres</td>
                <td><input type="text" defaultValue="10" /></td>
                <td><input type="text" defaultValue="9.8" /></td>
                <td><input type="text" defaultValue="9.9" /></td>
                <td className="nota-final">9.90</td>
              </tr>

            </tbody>

          </table>

        </section>

        <section className="botones-section">

          <button className="btn-cancelar">
            Cancelar
          </button>

          <button className="btn-guardar">
            Guardar Notas
          </button>

        </section>

      </div>
    </MainLayout>
  );
}

export default Notas;