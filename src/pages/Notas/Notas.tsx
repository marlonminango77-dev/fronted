import "./Notas.css";


export default function Notas() {
  return (
    <div className="container">

      {/* Header */}
      <header className="header">

        <div className="logo-container">
          <img
            src="/logo.png"
            alt="Logo"
            className="logo"
          />

          <div>
            <h2>Escuela de Educación Básica</h2>
            <h1>República de Venezuela</h1>
            <p>Sistema de Gestión Académica</p>
          </div>
        </div>

        <div className="usuario">
          <img
            src="/usuario.png"
            alt="Usuario"
            className="avatar"
          />

          <div>
            <h3>Julio Rosero</h3>
            <span>Docente</span>
          </div>
        </div>

      </header>

      <div className="contenido">

        <aside className="sidebar">

          <h3 className="menu-titulo">Menu</h3>
          <button className="menu-item">Inicio</button>
          <button className="menu-item active">Notas</button>
          <button className="menu-item">Asistencia</button>
          <button className="menu-item">Estudiantes</button>
          <button className="menu-item">Reportes</button>
          <button className="menu-item salir">Cerrar Sesion</button>

        </aside>
        <main className="main"></main>

      </div>

      <main className="main">

        <h2 className="titulo">Ingreso de notas</h2>
        <div className="filtros">
        <div className="campo">
          <label>Grado</label>
          <select>
            <option>Seleccione un grado</option>
            <option>1° EGB</option>
            <option>2° EGB</option>
            <option>3° EGB</option>
            <option>4° EGB</option>
            <option>5° EGB</option>
            <option>6° EGB</option>
          </select>
        </div>

        <div className="campo">
          <label>Materia</label>
          <select>
            <option>Seleccione una materia</option>
            <option>Matematicas</option>
            <option>Lengua y Literatura</option>
            <option>Ciencias Naturales</option>
            <option>Estudios Sociales</option>
          </select>
        </div>


        <div className="campo">
          <label>Periodo</label>
          <select>
            <option>Seleccione un periodo</option>
            <option>Primer Parcial</option>
            <option>Segundo Parcial</option>
            <option>Examen Final</option>
          </select>
        </div>
        



        </div>
        




      </main>



    </div>


  



  );
}