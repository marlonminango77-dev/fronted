export interface Boletin {
  alumnoId: number; estudiante: string; cedula: string; curso: string;
  representante: string; periodo: string;
  materias: Array<{ materia: string; promedio: number; calificaciones: number }>;
  promedioGeneral: number; presentes: number; atrasos: number; ausentes: number;
  justificadas: number; salidasAnticipadas: number; porcentajeAsistencia: number;
  observacionAcademica: string; observacionComportamiento: string;
  anioLectivo: string; fechaEmision: string; completo: boolean; pendientes: string[];
}

const escapar = (valor: string) => valor.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c] ?? c));

export function imprimirBoletin(ventana: Window, b: Boletin) {
  const filas = b.materias.map(m => `<tr><td>${escapar(m.materia)}</td><td>${m.calificaciones}</td><td>${m.promedio.toFixed(2)}</td><td>${m.promedio >= 7 ? "Aprobado" : "En refuerzo"}</td></tr>`).join("") || '<tr><td colspan="4">No existen calificaciones registradas.</td></tr>';
  ventana.document.write(`<!doctype html><html><head><meta charset="UTF-8"><title>Boletín - ${escapar(b.estudiante)}</title><style>
  @page{size:A4;margin:16mm}body{font-family:Arial,sans-serif;color:#263238;margin:0}header{text-align:center;border-bottom:3px solid #174ea6;padding-bottom:14px}h1{font-size:22px;margin:4px}.sub{color:#667277}.datos{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:22px 0;padding:14px;background:#f4f7fd;border-radius:8px}table{width:100%;border-collapse:collapse;margin:16px 0}th{background:#174ea6;color:white}th,td{padding:9px;border:1px solid #dbe3ef;text-align:left}.resumen{display:flex;gap:14px;margin-top:18px}.resumen div{flex:1;padding:12px;border:1px solid #dbe3ef;border-radius:8px}.firmas{display:flex;justify-content:space-around;margin-top:70px}.firma{width:190px;border-top:1px solid #454b50;padding-top:6px;text-align:center}@media print{button{display:none}}
  </style></head><body><header><strong>ESCUELA DE EDUCACIÓN BÁSICA</strong><h1>República de Venezuela</h1><div class="sub">${escapar(b.periodo)} · Año lectivo ${escapar(b.anioLectivo)} · Emitido ${escapar(b.fechaEmision)}</div></header>${!b.completo?`<div style="margin:16px 0;padding:12px;background:#fff3cd;border:1px solid #e0b400"><b>Boletín pendiente:</b><ul>${b.pendientes.slice(0,8).map(p=>`<li>${escapar(p)}</li>`).join("")}</ul></div>`:""}<section class="datos"><span><b>Estudiante:</b> ${escapar(b.estudiante)}</span><span><b>Cédula:</b> ${escapar(b.cedula)}</span><span><b>Curso:</b> ${escapar(b.curso)}</span><span><b>Representante:</b> ${escapar(b.representante)}</span></section><h2>Rendimiento académico</h2><table><thead><tr><th>Materia</th><th>Calificaciones</th><th>Promedio</th><th>Estado</th></tr></thead><tbody>${filas}</tbody></table><div class="resumen"><div><b>Promedio general</b><br>${b.promedioGeneral.toFixed(2)} / 10</div><div><b>Asistencia</b><br>${b.porcentajeAsistencia.toFixed(2)}%</div></div><h2>Detalle de asistencia</h2><table><tr><th>Presentes</th><th>Atrasos</th><th>Ausentes</th><th>Justificadas</th><th>Salidas anticipadas</th></tr><tr><td>${b.presentes}</td><td>${b.atrasos}</td><td>${b.ausentes}</td><td>${b.justificadas}</td><td>${b.salidasAnticipadas}</td></tr></table>${b.observacionAcademica||b.observacionComportamiento?`<h2>Observaciones</h2><div class="datos"><span><b>Académica:</b> ${escapar(b.observacionAcademica||"Sin observación")}</span><span><b>Comportamiento:</b> ${escapar(b.observacionComportamiento||"Sin observación")}</span></div>`:""}<div class="firmas"><div class="firma">Docente</div><div class="firma">Representante</div></div><script>window.onload=()=>window.print()<\/script></body></html>`);
  ventana.document.close();
}
