/* ISO 27001 Aprende — herramientas del curso: los formatos y criterios que el docente usó en los talleres
   (sesiones 2 a 4), convertidos en ejercicios que se llenan en el celular y se copian para entregar.
   Fuentes: talleres FODA, PESTEL, Porter y alcance (sesión 2), Guía 001 de la política (sesión 3),
   diagnóstico inicial QG-SIG-RG-012, matriz de evaluación de riesgos y tabla SoA (sesión 4). */
'use strict';

/* ===================== estado y utilidades ===================== */
function hEstado() { return E.herr || (E.herr = {}); }
function hObj(k, base) { const H = hEstado(); if (!H[k]) H[k] = JSON.parse(JSON.stringify(base)); return H[k]; }
function hLeer(ruta) { return ruta.split('.').reduce((o, k) => (o == null ? undefined : o[k]), hEstado()); }
function hFijar(ruta, valor) {
  const ks = ruta.split('.'); let o = hEstado();
  ks.slice(0, -1).forEach((k) => { if (o[k] == null || typeof o[k] !== 'object') o[k] = {}; o = o[k]; });
  o[ks[ks.length - 1]] = valor; guardar();
}
// quita espacios y el punto final, salvo el de una sigla («S.A.C.»)
const limpio = (s) => String(s || '').trim().replace(/\s+/g, ' ').replace(/[;,\s]+$/, '').replace(/(?<![A-ZÁÉÍÓÚÑ])\.+$/, '');
const minus = (s) => (s && /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);
function copiarTexto(t) {
  const ok = () => avisar('Copiado. Ya puedes pegarlo en Word o en la hoja del Drive.', 'ok');
  if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(t).then(ok, () => copiarViejo(t, ok)); } else copiarViejo(t, ok);
}
function copiarViejo(t, ok) {
  const a = document.createElement('textarea'); a.value = t; a.setAttribute('readonly', ''); a.style.position = 'fixed'; a.style.opacity = '0';
  document.body.appendChild(a); a.select();
  let hecho = false; try { hecho = document.execCommand('copy'); } catch (e) { /* sin portapapeles */ }
  a.remove(); if (hecho) ok(); else avisar('No se pudo copiar automáticamente. Mantén presionado el texto para copiarlo.');
}
/* selector de valores (1–5, 1–3, opciones) */
function escala(ruta, opciones, ayuda = '') {
  const v = hLeer(ruta);
  return `<div class="escala" role="radiogroup">${opciones.map(([val, txt]) => `<button type="button" role="radio" aria-checked="${v === val}" data-accion="h-set" data-k="${ruta}" data-v="${esc(JSON.stringify(val))}"><b>${esc(val)}</b><span>${esc(txt)}</span></button>`).join('')}</div>${ayuda ? `<p class="tenue pequeno" style="margin:6px 0 0">${esc(ayuda)}</p>` : ''}`;
}
function campo(ruta, etiqueta, { area = false, ayuda = '', ph = '', filas = 3 } = {}) {
  const v = hLeer(ruta) || '';
  const control = area
    ? `<textarea class="h-campo" rows="${filas}" data-hcampo="${ruta}" placeholder="${esc(ph)}">${esc(v)}</textarea>`
    : `<input class="h-campo" type="text" data-hcampo="${ruta}" value="${esc(v)}" placeholder="${esc(ph)}">`;
  return `<label class="campo"><span class="campo-etq">${esc(etiqueta)}</span>${control}${ayuda ? `<small class="tenue">${esc(ayuda)}</small>` : ''}</label>`;
}
const NIVEL_CLASE = { Bajo: 'bajo', Nulo: 'bajo', Medio: 'medio', Moderado: 'medio', Alto: 'alto', 'Alto / crítico': 'alto', Crítico: 'alto' };
const nivel = (txt) => `<span class="nivel ${NIVEL_CLASE[txt] || ''}"><i aria-hidden="true"></i>${esc(txt)}</span>`;
const pestanasH = (ruta, opciones) => `<div class="filtros" role="tablist">${opciones.map(([k, t]) => `<button role="tab" aria-pressed="${hLeer(ruta) === k}" data-accion="h-set" data-k="${ruta}" data-v="${esc(JSON.stringify(k))}">${esc(t)}</button>`).join('')}</div>`;
let REFRESCO_H = null; // la herramienta activa repinta solo su resultado mientras se escribe

document.addEventListener('input', (e) => {
  const c = e.target.closest('[data-hcampo]'); if (!c) return;
  hFijar(c.dataset.hcampo, c.value);
  if (REFRESCO_H) REFRESCO_H();
});
Object.assign(ACCIONES, {
  'h-set': (b) => { hFijar(b.dataset.k, JSON.parse(b.dataset.v)); render(); },
  'h-copiar': (b) => { const f = H_COPIAR[b.dataset.h]; if (f) copiarTexto(f()); },
});
const H_COPIAR = {};

/* ===================== LISTA DE HERRAMIENTAS ===================== */
const HERRAMIENTAS = [
  ['#/herr/riesgo', 'grafico', 'Calculadora de riesgo', 'Matriz de la sesión 4: CID, vulnerabilidad, amenaza, probabilidad y residual'],
  ['#/herr/diagnostico', 'examen', 'Diagnóstico inicial', 'Brecha por requisito (0 a 4) y por control del Anexo A'],
  ['#/herr/soa', 'tabla', 'Tabla SoA del taller', 'Proceso, riesgo, control, justificación y responsable'],
  ['#/herr/alcance', 'norma', 'Constructor del alcance', 'Regla de cinco componentes y exclusiones justificadas'],
  ['#/herr/contexto', 'lupa', 'Análisis del contexto', 'FODA con estrategias cruzadas, PESTEL y Porter'],
  ['#/herr/politica', 'lista', 'Lista de la política', 'Las partes que exige la Guía 001 del docente'],
];
function vistaHerramientas(v) {
  REFRESCO_H = null;
  v.innerHTML = `${cabecera('Herramientas del curso', { atras: '#/practicar', ante: 'Formatos y criterios del docente' })}
  <div class="tarjeta"><p style="margin:0;line-height:1.6">Cada herramienta reproduce un formato que el docente usó en clase. Lo que escribes se guarda en el celular y puedes copiarlo para pegarlo en tu entrega.</p></div>
  <div class="tarjeta compacta"><ul class="lista">${HERRAMIENTAS.map(([h, i, t, s]) => `<li><button class="item" data-ir="${h}"><span class="num">${ico(i, 'chico')}</span><span class="cuerpo"><strong>${esc(t)}</strong><span>${esc(s)}</span></span>${ico('sig', 'chico')}</button></li>`).join('')}</ul></div>
  <p class="tenue pequeno">Los módulos de «Talleres del docente» (26 a 31, 36 y 39) explican cada formato paso a paso.</p>`;
}

/* ===================== 1. CALCULADORA DE RIESGO ===================== */
const ESC_CID = [[1, 'Nulo'], [2, 'Bajo'], [3, 'Moderado'], [4, 'Alto'], [5, 'Crítico']];
const ESC_3 = [[1, 'Baja'], [2, 'Media'], [3, 'Alta']];
const MATRIZ_3 = [[1, 1, 2], [1, 2, 3], [2, 3, 3]]; // fila = severidad o capacidad; columna = exposición o motivación
function nivelSensibilidad(suma) {
  if (suma <= 4) return [1, 'Nulo']; if (suma <= 6) return [2, 'Bajo']; if (suma <= 9) return [3, 'Moderado']; if (suma <= 12) return [4, 'Alto']; return [5, 'Crítico'];
}
function nivelRiesgo(r) { if (r <= 20) return ['Bajo', 'Riesgo aceptable: requiere monitoreo.']; if (r <= 60) return ['Medio', 'Riesgo relevante: corresponde aplicar controles.']; return ['Alto / crítico', 'Riesgo inaceptable: requiere tratamiento inmediato.']; }
const num = (n) => String(Math.round(n * 10) / 10).replace('.', ',');
function matriz3(titFila, titCol, f, c) {
  return `<div class="tabla-scroll"><table class="tabla matriz3"><thead><tr><th>${esc(titFila)} \\ ${esc(titCol)}</th><th>1</th><th>2</th><th>3</th></tr></thead><tbody>${MATRIZ_3.map((fila, i) => `<tr><th>${i + 1}</th>${fila.map((x, j) => `<td class="${i + 1 === f && j + 1 === c ? 'marcada' : ''}">${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function vistaHerrRiesgo(v) {
  REFRESCO_H = null;
  const R = hObj('riesgo', { activo: '', c: 3, i: 3, d: 3, sev: 2, exp: 2, cap: 2, mot: 2, prob: 2, efi: 2 });
  const suma = R.c + R.i + R.d; const [nS, tS] = nivelSensibilidad(suma);
  const vul = MATRIZ_3[R.sev - 1][R.exp - 1]; const ame = MATRIZ_3[R.cap - 1][R.mot - 1];
  const total = ame * vul * R.prob * nS; const [nT, iT] = nivelRiesgo(total);
  const resid = total / R.efi; const [nR, iR] = nivelRiesgo(resid); const red = total ? Math.round(((total - resid) / total) * 100) : 0;
  const tarjeta = (n, t, cuerpo) => `<div class="tarjeta"><p class="antetitulo">Paso ${n}</p><h3 style="margin:0 0 10px">${esc(t)}</h3>${cuerpo}</div>`;
  v.innerHTML = `${cabecera('Calculadora de riesgo', { atras: '#/herramientas', ante: 'Metodología de la sesión 4' })}
  <div class="tarjeta">${campo('riesgo.activo', 'Activo que estás evaluando', { ph: 'Ejemplo: base de datos de clientes' })}
  <p class="tenue pequeno" style="margin:6px 0 0">Riesgo = amenaza × vulnerabilidad × probabilidad × sensibilidad. La escala final va de 1 a 135.</p></div>
  ${tarjeta(1, 'Sensibilidad del activo (CID)', `<p class="campo-etq">Confidencialidad</p>${escala('riesgo.c', ESC_CID)}<p class="campo-etq">Integridad</p>${escala('riesgo.i', ESC_CID)}<p class="campo-etq">Disponibilidad</p>${escala('riesgo.d', ESC_CID)}
    <p class="resultado-linea">Suma ${suma} (de 3 a 15) → ${nivel(tS)} · nivel ${nS} de 5</p><p class="tenue pequeno">Rangos: 3–4 nulo, 5–6 bajo, 7–9 moderado, 10–12 alto, 13–15 crítico. En la fórmula entra el nivel (1 a 5); por eso el máximo es 3 × 3 × 3 × 5 = 135.</p>`)}
  ${tarjeta(2, 'Vulnerabilidad', `<p class="campo-etq">Severidad: magnitud del daño si se explota</p>${escala('riesgo.sev', ESC_3)}<p class="campo-etq">Exposición: qué tan fácil es explotarla</p>${escala('riesgo.exp', ESC_3)}${matriz3('Severidad', 'Exposición', R.sev, R.exp)}<p class="resultado-linea">Valor de la vulnerabilidad: <b>${vul}</b></p>`)}
  ${tarjeta(3, 'Amenaza', `<p class="campo-etq">Capacidad del agente</p>${escala('riesgo.cap', ESC_3)}<p class="campo-etq">Motivación del agente</p>${escala('riesgo.mot', ESC_3)}${matriz3('Capacidad', 'Motivación', R.cap, R.mot)}<p class="resultado-linea">Valor de la amenaza: <b>${ame}</b></p>`)}
  ${tarjeta(4, 'Probabilidad', `${escala('riesgo.prob', ESC_3, R.prob === 1 ? 'Poco probable: no hay historial de incidentes y la exposición es baja.' : R.prob === 2 ? 'Puede ocurrir ocasionalmente: hay controles parciales o inconsistentes.' : 'Altamente probable: controles deficientes, alta exposición o incidentes frecuentes.')}`)}
  <div class="tarjeta destacada"><p class="antetitulo">Riesgo inherente${R.activo ? ` · ${esc(R.activo)}` : ''}</p>
    <p class="cifra-riesgo">${total}</p><p style="margin:0 0 6px">${ame} × ${vul} × ${R.prob} × ${nS} = ${total} → ${nivel(nT)}</p><p class="tenue" style="margin:0">${esc(iT)}</p></div>
  ${tarjeta(5, 'Riesgo residual', `<p class="campo-etq">Eficacia de los controles existentes</p>${escala('riesgo.efi', [[1, 'Baja'], [2, 'Media'], [3, 'Alta']], 'Método 1 del docente: residual = inherente ÷ eficacia.')}
    <p class="resultado-linea">${total} ÷ ${R.efi} = <b>${num(resid)}</b> → ${nivel(nR)}</p><p class="tenue pequeno" style="margin:0">${esc(iR)} Reducción lograda: ${red} %, calculada como (inherente − residual) ÷ inherente × 100.</p>`)}
  <div class="tarjeta"><p class="antetitulo">Siguiente paso</p><p style="margin:0;line-height:1.6">Registra el resultado en la matriz de riesgo con sus causas, consecuencias, controles existentes del Anexo A, la decisión de tratamiento (mitigar, transferir, aceptar o evitar), los controles adicionales, el responsable y el plazo.</p>
  <div class="botonera"><button class="boton" data-accion="h-copiar" data-h="riesgo">Copiar el cálculo</button></div></div>`;
  H_COPIAR.riesgo = () => [`Activo: ${R.activo || '(sin nombre)'}`, `Sensibilidad: C=${R.c}, I=${R.i}, D=${R.d}; suma ${suma} → ${tS} (nivel ${nS})`, `Vulnerabilidad: severidad ${R.sev} × exposición ${R.exp} → ${vul}`, `Amenaza: capacidad ${R.cap} × motivación ${R.mot} → ${ame}`, `Probabilidad: ${R.prob}`, `Riesgo inherente: ${ame} × ${vul} × ${R.prob} × ${nS} = ${total} → ${nT}`, `Riesgo residual (eficacia ${R.efi}): ${num(resid)} → ${nR}; reducción ${red} %`].join('\n');
}

/* ===================== 2. DIAGNÓSTICO INICIAL ===================== */
const REQUISITOS = [
  ['4', '4.1', 'Comprensión de la organización y de su contexto'], ['4', '4.2', 'Necesidades y expectativas de las partes interesadas'], ['4', '4.3', 'Determinación del alcance del SGSI'], ['4', '4.4', 'Sistema de gestión de seguridad de la información'],
  ['5', '5.1', 'Liderazgo y compromiso'], ['5', '5.2', 'Política'], ['5', '5.3', 'Roles, responsabilidades y autoridades'],
  ['6', '6.1.1', 'Acciones para abordar riesgos y oportunidades'], ['6', '6.1.2', 'Evaluación del riesgo'], ['6', '6.1.3', 'Tratamiento del riesgo y Declaración de Aplicabilidad'], ['6', '6.2', 'Objetivos de seguridad de la información'], ['6', '6.3', 'Planificación de los cambios'],
  ['7', '7.1', 'Recursos'], ['7', '7.2', 'Competencia'], ['7', '7.3', 'Toma de conciencia'], ['7', '7.4', 'Comunicación'], ['7', '7.5', 'Información documentada'],
  ['8', '8.1', 'Planificación y control operacional'], ['8', '8.2', 'Evaluación del riesgo (operación)'], ['8', '8.3', 'Tratamiento del riesgo (operación)'],
  ['9', '9.1', 'Seguimiento, medición, análisis y evaluación'], ['9', '9.2', 'Auditoría interna'], ['9', '9.3', 'Revisión por la dirección'],
  ['10', '10.1', 'Mejora continua'], ['10', '10.2', 'No conformidad y acción correctiva'],
];
const NOMBRE_CLAUSULA = { 4: 'Contexto', 5: 'Liderazgo', 6: 'Planificación', 7: 'Apoyo', 8: 'Operación', 9: 'Evaluación del desempeño', 10: 'Mejora' };
const ESC_DIAG = [[0, '0 %'], [1, '25 %'], [2, '50 %'], [3, '75 %'], [4, '100 %']];
const ESC_CTRL = [['N', 'No cumple'], ['P', 'Parcial'], ['S', 'Cumple'], ['NA', 'No aplica']];
const VALOR_CTRL = { N: 0, P: 50, S: 100 };
const kReq = (id) => id.replace(/\./g, '_'); // 4.1 → 4_1: el punto separaría la ruta dentro del estado
const kCtrl = (id) => id.replace('.', '_');
function vistaHerrDiagnostico(v) {
  REFRESCO_H = null;
  const D = hObj('diag', { vista: 'clausulas', req: {}, ctrl: {}, tema: 'Organizacional' });
  const notas = REQUISITOS.map(([, id]) => D.req[kReq(id)]).filter((x) => x != null);

  const ctrlV = Object.values(D.ctrl).filter((x) => x in VALOR_CTRL); // «No aplica» no entra en el promedio
  const promCtrl = ctrlV.length ? Math.round(ctrlV.reduce((a, x) => a + VALOR_CTRL[x], 0) / ctrlV.length) : 0;
  const porClausula = Object.keys(NOMBRE_CLAUSULA).map((k) => { const xs = REQUISITOS.filter((r) => r[0] === k).map((r) => D.req[kReq(r[1])]).filter((x) => x != null); return [k, xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 25) : null]; });
  // como en el formato: el total es el promedio de las cláusulas evaluadas
  const evaluadas = porClausula.filter(([, p]) => p != null);
  const promReq = evaluadas.length ? Math.round(evaluadas.reduce((a, [, p]) => a + p, 0) / evaluadas.length) : 0;
  const leyenda = (p) => (p <= 25 ? 'Débil' : p <= 50 ? 'Regular' : p <= 75 ? 'Bueno' : 'Excelente');
  const brechas = [...REQUISITOS.filter((r) => D.req[kReq(r[1])] != null && D.req[kReq(r[1])] <= 1).map((r) => `${r[1]} ${r[2]}`), ...CONTROLES.filter((c) => D.ctrl[kCtrl(c.id)] === 'N').map((c) => `${c.id} ${c.titulo}`)];
  let cuerpo = '';
  if (D.vista === 'clausulas') {
    cuerpo = Object.keys(NOMBRE_CLAUSULA).map((k) => `<h2>Cláusula ${k} · ${esc(NOMBRE_CLAUSULA[k])}</h2>${REQUISITOS.filter((r) => r[0] === k).map(([, id, t]) => `<div class="tarjeta"><p class="antetitulo">${esc(id)}</p><h3 style="margin:0 0 10px">${esc(t)}</h3>${escala(`diag.req.${kReq(id)}`, ESC_DIAG)}</div>`).join('')}`).join('');
  } else {
    const temas = TEMAS.map(([t, txt, n]) => [t, `${n}. ${txt}`]);
    const lista = CONTROLES.filter((c) => c.tema === D.tema);
    cuerpo = `${pestanasH('diag.tema', temas)}<div class="tarjeta compacta"><ul class="lista">${lista.map((c) => `<li class="fila-ctrl"><div class="cuerpo"><strong>${esc(c.id)} ${esc(c.titulo)}</strong></div>${escala(`diag.ctrl.${kCtrl(c.id)}`, ESC_CTRL)}</li>`).join('')}</ul></div>`;
  }
  v.innerHTML = `${cabecera('Diagnóstico inicial', { atras: '#/herramientas', ante: 'Formato QG-SIG-RG-012 del curso' })}
  <div class="tarjeta"><p style="margin:0;line-height:1.6">Califica cada requisito de 0 a 4 según cuánto se cumple hoy: 0 no cumple, 1 cumple mínimamente, 2 cumple parcialmente, 3 cumple y 4 cumple satisfactoriamente (cada punto vale 25 %). El porcentaje de cada cláusula es el promedio de sus requisitos y el total es el promedio de las cláusulas, que se lee como débil (hasta 25 %), regular (hasta 50 %), bueno (hasta 75 %) o excelente. En los controles del Anexo A se usa no cumple (0 %), cumple parcialmente (50 %) o cumple satisfactoriamente (100 %); los que no aplican se justifican en la Declaración de Aplicabilidad y no entran en el promedio.</p></div>
  <div class="tarjeta destacada"><p class="antetitulo">Resultado</p>
    <div class="fila-flex" style="gap:18px;flex-wrap:wrap"><div><p class="cifra-riesgo" style="font-size:2rem">${notas.length ? `${promReq} %` : '—'}</p><span class="tenue">Cláusulas (${notas.length} de ${REQUISITOS.length} requisitos)${notas.length ? ` · ${leyenda(promReq)}` : ''}</span></div><div><p class="cifra-riesgo" style="font-size:2rem">${ctrlV.length ? `${promCtrl} %` : '—'}</p><span class="tenue">Anexo A (${ctrlV.length} de ${CONTROLES.length} evaluados)</span></div></div>
    ${porClausula.map(([k, p]) => `<div style="margin:8px 0 0"><div class="fila-flex entre pequeno"><span>${k}. ${esc(NOMBRE_CLAUSULA[k])}</span><span>${p == null ? 'sin evaluar' : `${p} %`}</span></div>${barra(p || 0, 100, 'ok')}</div>`).join('')}
  </div>
  ${brechas.length ? `<div class="tarjeta"><p class="antetitulo">Brechas principales (${brechas.length})</p><p class="tenue pequeno" style="margin:0 0 8px">Requisitos con 0 o 1 punto y controles que no se cumplen. Cada uno debería tener un comentario y una acción en el diagnóstico.</p><ul class="lista-simple">${brechas.slice(0, 40).map((b) => `<li>${esc(b)}</li>`).join('')}</ul></div>` : ''}
  ${pestanasH('diag.vista', [['clausulas', 'Cláusulas 4 a 10'], ['anexo', 'Controles del Anexo A']])}
  ${cuerpo}
  <div class="botonera"><button class="boton" data-accion="h-copiar" data-h="diag">Copiar el resultado</button><button class="boton fantasma" data-accion="h-borrar" data-h="diag">Empezar de nuevo</button></div>`;
  H_COPIAR.diag = () => ['Diagnóstico inicial ISO/IEC 27001:2022', `Cláusulas: ${promReq} % (${notas.length} requisitos evaluados)`, ...porClausula.map(([k, p]) => `  ${k}. ${NOMBRE_CLAUSULA[k]}: ${p == null ? 'sin evaluar' : `${p} %`}`), ...REQUISITOS.filter((r) => D.req[kReq(r[1])] != null).map((r) => `  ${r[1]} ${r[2]}: ${D.req[kReq(r[1])]} (${D.req[kReq(r[1])] * 25} %)`), `Anexo A: ${promCtrl} % (${ctrlV.length} controles evaluados)`, ...CONTROLES.filter((c) => D.ctrl[kCtrl(c.id)]).map((c) => `  ${c.id} ${c.titulo}: ${ESC_CTRL.find((x) => x[0] === D.ctrl[kCtrl(c.id)])[1]}`)].join('\n');
}
/* ===================== 3. TABLA SoA DEL TALLER ===================== */
const SOA_PROCESOS = ['Recursos Humanos', 'Compras', 'Ventas', 'Atención al Cliente', 'Contabilidad', 'Logística', 'Marketing', 'Almacén / Inventarios', 'Servicio Postventa', 'Gestión de Proveedores', 'Operaciones', 'Dirección / Gerencia', 'Legal / Cumplimiento', 'TI / Soporte', 'Gestión Documental / Archivo'];
const SOA_RIESGOS = ['Pérdida de documentos físicos', 'Acceso no autorizado a información', 'Error humano al registrar datos', 'Uso indebido de información confidencial', 'Sustracción de documentos o equipos', 'Información enviada a proveedor no protegido', 'Interrupción del servicio en un proceso crítico', 'Extravío de archivos físicos de clientes', 'Manipulación no autorizada de contratos', 'Datos mal ingresados por falta de capacitación', 'Información expuesta en áreas comunes', 'Falta de respaldo de información importante', 'Procesos detenidos por cambio no autorizado', 'Documentos sin control de versiones', 'Información compartida por correo sin protección', 'Pérdida de inventario por mala custodia', 'Acceso de personal no autorizado a oficinas', 'Uso de cuentas compartidas', 'Información entregada a personal sin rol definido', 'Caída de sistema que afecta operaciones', 'Proveedor no cumple medidas mínimas de seguridad', 'Contratos firmados sin verificación previa', 'Falta de evidencia de procesos críticos', 'Archivos almacenados sin control o clasificación', 'Procesos afectados por incidentes o emergencias'];
const SOA_CONTROLES = [
  ['A.5.1', 'Políticas de seguridad', 'Reglas generales para proteger la información en toda la empresa.', '5.1'], ['A.5.7', 'Clasificación de información', 'Ordenar la información según su importancia y sensibilidad.', '5.12'], ['A.5.12', 'Uso aceptable', 'Define qué está permitido y prohibido al usar información.', '5.10'], ['A.5.19', 'Seguridad en proveedores', 'Exigir medidas básicas a los proveedores que manejan información.', '5.19'], ['A.5.21', 'Control documental', 'Asegurar versiones actualizadas y protegidas de los documentos.', '5.33'], ['A.5.29', 'Continuidad de la información', 'Mantener las operaciones ante cortes o emergencias.', '5.29'],
  ['A.6.1', 'Roles y responsabilidades', 'Definir tareas y funciones relacionadas con la seguridad.', '5.2'], ['A.6.3', 'Capacitación y concientización', 'Enseñar al personal a manejar la información correctamente.', '6.3'], ['A.6.4', 'Confidencialidad del personal', 'Firmar compromisos para proteger información sensible.', '6.6'], ['A.6.5', 'Salida de empleados', 'Asegurar la devolución de accesos y documentos.', '6.5'],
  ['A.7.1', 'Seguridad física', 'Proteger oficinas, documentos y equipos de accesos no autorizados.', '7.1'], ['A.7.4', 'Protección de documentos físicos', 'Guardar los documentos importantes de forma segura.', '7.7'], ['A.7.5', 'Control de acceso físico', 'Permitir el ingreso solo a personas autorizadas en áreas sensibles.', '7.2'], ['A.7.8', 'Áreas restringidas', 'Controlar quién ingresa a las zonas críticas de la empresa.', '7.6'],
  ['A.8.1', 'Inventario de información', 'Lista ordenada de documentos, archivos y datos importantes.', '5.9'], ['A.8.2', 'Manejo de activos', 'Uso y cuidado correcto de equipos y documentos.', '5.10'], ['A.8.9', 'Gestión de accesos', 'Definir quién puede ver o usar la información.', '5.15'], ['A.8.10', 'Uso de contraseñas', 'Reglas simples para contraseñas seguras.', '5.17'], ['A.8.12', 'Prevención de pérdida de datos', 'Evitar que la información se borre o se pierda.', '8.12'], ['A.8.14', 'Registro de actividades (logs)', 'Guardar evidencias de las acciones realizadas en los sistemas.', '8.15'], ['A.8.24', 'Respaldo de información', 'Tener copias de seguridad de la información importante.', '8.13'], ['A.8.26', 'Protección de información transmitida', 'Cuidar la información enviada por correo u otros medios.', '5.14'], ['A.8.32', 'Gestión del cambio', 'Controlar las modificaciones para evitar fallas en los procesos.', '8.32'], ['A.8.33', 'Eliminación segura', 'Borrar la información de manera que no pueda recuperarse.', '8.10'], ['A.8.35', 'Seguridad en correo electrónico', 'Reglas para evitar errores al enviar información.', '5.14'],
];
// La guía del taller numera varios controles distinto de la ISO/IEC 27001:2022; se muestra el número oficial al lado.
const oficialSoa = (c) => { const o = CTRL.get(c[3]); return o ? `${c[3]} ${o.titulo}` : c[3]; };
const opcionesSelect = (lista, valor, vacio) => `<option value="">${esc(vacio)}</option>${lista.map((x) => `<option ${x === valor ? 'selected' : ''}>${esc(x)}</option>`).join('')}`;
function vistaHerrSoa(v) {
  const S = hObj('soa', { filas: [], nueva: { proceso: '', riesgo: '', control: '', just: '', resp: '' } });
  const procesos = new Set(S.filas.map((f) => f.proceso)); const riesgos = new Set(S.filas.map((f) => f.riesgo));
  const ctrlSel = SOA_CONTROLES.find((c) => `${c[0]} ${c[1]}` === S.nueva.control);
  v.innerHTML = `${cabecera('Tabla SoA del taller', { atras: '#/herramientas', ante: 'Actividad grupal de la sesión 4' })}
  <div class="tarjeta"><p style="margin:0;line-height:1.6">Elige solo cinco procesos y cinco riesgos de las listas del taller. La guía de controles del taller usa una numeración propia; al elegir un control, la app te muestra su número oficial en la norma de 2022, que es el que conviene citar en el examen.</p><p style="margin:10px 0 0;line-height:1.6"> Para cada caso, asigna el control del Anexo A que trata ese riesgo y escribe por qué lo trata. La justificación debe explicar la relación entre el riesgo y el control, no repetir el nombre del control.</p>
    <div class="chips" style="margin-top:10px"><span class="chip ${procesos.size > 5 ? 'mal' : 'marca'}">Procesos: ${procesos.size} de 5</span><span class="chip ${riesgos.size > 5 ? 'mal' : 'marca'}">Riesgos: ${riesgos.size} de 5</span></div></div>
  <div class="tarjeta"><p class="antetitulo">Nuevo caso</p>
    <label class="campo"><span class="campo-etq">Proceso</span><select class="h-campo" data-hcampo="soa.nueva.proceso">${opcionesSelect(SOA_PROCESOS, S.nueva.proceso, 'Elige un proceso')}</select></label>
    <label class="campo"><span class="campo-etq">Riesgo</span><select class="h-campo" data-hcampo="soa.nueva.riesgo">${opcionesSelect(SOA_RIESGOS, S.nueva.riesgo, 'Elige un riesgo')}</select></label>
    <label class="campo"><span class="campo-etq">Control del Anexo A</span><select class="h-campo" data-hcampo="soa.nueva.control">${opcionesSelect(SOA_CONTROLES.map((c) => `${c[0]} ${c[1]}`), S.nueva.control, 'Elige un control')}</select>${ctrlSel ? `<small class="tenue">${esc(ctrlSel[2])} En la ISO/IEC 27001:2022 corresponde al control ${esc(oficialSoa(ctrlSel))}.</small>` : ''}</label>
    ${campo('soa.nueva.just', 'Justificación', { area: true, filas: 2, ph: 'Ejemplo: la información del personal solo debe verla quien la necesita para su función.' })}
    ${campo('soa.nueva.resp', 'Responsable o alumno', { ph: 'Nombre' })}
    <div class="botonera"><button class="boton primario" data-accion="soa-agregar">Agregar a la tabla</button></div></div>
  ${S.filas.length ? `<div class="tarjeta"><p class="antetitulo">Tu tabla (${plural(S.filas.length, 'caso', 'casos')})</p><div class="tabla-scroll"><table class="tabla"><thead><tr><th>Caso</th><th>Proceso</th><th>Riesgo</th><th>Control</th><th>Justificación</th><th>Responsable</th><th></th></tr></thead><tbody>${S.filas.map((f, i) => `<tr><td>${i + 1}</td><td>${esc(f.proceso)}</td><td>${esc(f.riesgo)}</td><td>${esc(f.control)}</td><td>${esc(f.just)}</td><td>${esc(f.resp)}</td><td><button class="btn-icono chico" data-accion="soa-quitar" data-i="${i}" aria-label="Quitar el caso ${i + 1}">${ico('x', 'chico')}</button></td></tr>`).join('')}</tbody></table></div>
    <div class="botonera"><button class="boton" data-accion="h-copiar" data-h="soa">Copiar para la hoja del Drive</button></div><p class="tenue pequeno" style="margin:6px 0 0">Se copia separado por columnas (caso, proceso, riesgo, control, justificación y alumno), listo para pegar en la hoja compartida.</p></div>` : ''}`;
  REFRESCO_H = null;
  H_COPIAR.soa = () => S.filas.map((f, i) => [i + 1, f.proceso, f.riesgo, f.control, f.just, f.resp].join('\t')).join('\n');
}
document.addEventListener('change', (e) => { if (e.target.matches('select[data-hcampo^="soa.nueva.control"]')) render(); });
Object.assign(ACCIONES, {
  'soa-agregar': () => {
    const S = hObj('soa', {}); const n = S.nueva; const falta = [];
    if (!n.proceso) falta.push('el proceso'); if (!n.riesgo) falta.push('el riesgo'); if (!n.control) falta.push('el control'); if (limpio(n.just).length < 15) falta.push('una justificación de al menos una frase');
    if (falta.length) { avisar(`Falta ${falta.join(', ')}.`); return; }
    const cs = SOA_CONTROLES.find((c) => `${c[0]} ${c[1]}` === n.control);
    S.filas.push({ proceso: n.proceso, riesgo: n.riesgo, control: cs ? `${n.control} (2022: ${cs[3]})` : n.control, just: limpio(n.just) + '.', resp: limpio(n.resp) });
    S.nueva = { proceso: '', riesgo: '', control: '', just: '', resp: n.resp }; guardar(); sonidoAcierto(); render();
  },
  'soa-quitar': (b) => { const S = hObj('soa', {}); S.filas.splice(Number(b.dataset.i), 1); guardar(); render(); },
  'h-borrar': (b) => { confirmar('¿Empezar de nuevo?', 'Se borrará lo que registraste en esta herramienta.', () => { delete hEstado()[b.dataset.h]; guardar(); render(); }, 'Borrar', true); },
});

/* ===================== 4. CONSTRUCTOR DEL ALCANCE ===================== */
const EJEMPLO_ALCANCE = {
  org: 'Cloud Solutions S.A.C.',
  proc: 'los servicios de hosting, correo corporativo y almacenamiento en la nube que presta a clientes pymes, incluida la administración de los servidores virtuales, el control de accesos y credenciales del panel de administración, los respaldos, el monitoreo y la atención de incidentes',
  ubic: 'la sede principal y los servidores virtuales alojados en el centro de datos externo',
  resp: 'el área de Operaciones',
  excl: 'las actividades de promoción comercial y marketing',
  just: 'no tienen acceso a la información de los clientes ni a la infraestructura que la soporta',
};
const contraer = (t) => t.replace(/\bde el\b/g, 'del').replace(/\ba el\b/g, 'al');
function textoAlcance(A) { return contraer(textoAlcanceCrudo(A)); }
function textoAlcanceCrudo(A) {
  const org = limpio(A.org); const proc = minus(limpio(A.proc)); const ubic = minus(limpio(A.ubic)); const resp = minus(limpio(A.resp)); const excl = minus(limpio(A.excl)); const just = minus(limpio(A.just));
  const o = org || '[organización]'; const p = proc || '[procesos y servicios]'; const u = ubic || '[ubicación e infraestructura]'; const r = resp || '[responsable o área]';
  if (A.modo === 2) return `El SGSI de ${o} cubre ${p}. El alcance comprende ${u}, bajo la responsabilidad de ${r}${excl ? `, excluyendo ${excl}, porque ${just || '[justificación]'}` : ''}.`;
  return `El Sistema de Gestión de Seguridad de la Información (SGSI) de ${o} aplica a ${p}. El alcance comprende ${u}, bajo la responsabilidad de ${r}.${excl ? `\n\nSe excluyen ${excl}, ya que ${just || '[justificación]'}.` : ''}`;
}
function revisionAlcance(A) {
  const ok = (b, t) => `<li class="${b ? 'cumple' : 'falta'}">${ico(b ? 'check' : 'alerta', 'chico')}<span>${esc(t)}</span></li>`;
  const avisos = [];
  if (limpio(A.excl) && !limpio(A.just)) avisos.push('Toda exclusión necesita su justificación: explica por qué no afecta la seguridad de la información.');
  if (/no aplica/i.test(`${A.excl} ${A.just}`)) avisos.push('«No aplica» no es una justificación. El docente pide revisar de forma explícita lo que no se incluye.');
  if (!limpio(A.excl)) avisos.push('No registraste exclusiones. Si no excluyes nada, confírmalo después de revisar los procesos que quedan fuera.');
  if (/centro de datos|proveedor|nube/i.test(A.excl || '')) avisos.push('Un proveedor o centro de datos externo suele ser una interfaz, no una exclusión: su seguridad se controla por contrato.');
  return `<ul class="revision">${ok(limpio(A.org), '1. Organización')}${ok(limpio(A.proc).length > 20, '2. Procesos y servicios incluidos')}${ok(limpio(A.ubic), '3. Ubicación e infraestructura')}${ok(limpio(A.resp), '4. Responsables o área')}${ok(!limpio(A.excl) || limpio(A.just).length > 15, '5. Exclusiones justificadas')}</ul>${avisos.map((t) => `<p class="aviso-h">${ico('info', 'chico')} ${esc(t)}</p>`).join('')}`;
}
function vistaHerrAlcance(v) {
  const A = hObj('alcance', { modo: 1, org: '', proc: '', ubic: '', resp: '', excl: '', just: '' });
  v.innerHTML = `${cabecera('Constructor del alcance', { atras: '#/herramientas', ante: 'Taller de la sesión 2 · requisito 4.3' })}
  <div class="tarjeta"><p style="margin:0;line-height:1.6">El docente pide que el alcance tenga cinco componentes: la organización, los procesos y servicios incluidos, la ubicación e infraestructura, los responsables y las exclusiones con su justificación. Usa verbos claros, como «aplica a», «incluye» o «comprende».</p></div>
  <div class="tarjeta">
    ${campo('alcance.org', '1. Organización (razón social)', { ph: 'Ejemplo: Rutaseg Asistencia Integral S.A.C.' })}
    ${campo('alcance.proc', '2. Procesos y servicios incluidos', { area: true, ph: 'Ejemplo: la atención de siniestros vehiculares para aseguradoras, incluida la plataforma de casos y la central de operaciones' })}
    ${campo('alcance.ubic', '3. Ubicación e infraestructura', { area: true, filas: 2, ph: 'Ejemplo: la sede de Lima y los servidores en la nube' })}
    ${campo('alcance.resp', '4. Responsables o área', { ph: 'Ejemplo: la Gerencia de Operaciones' })}
    ${campo('alcance.excl', '5. Exclusiones', { area: true, filas: 2, ph: 'Ejemplo: las actividades de marketing' })}
    ${campo('alcance.just', 'Justificación de las exclusiones', { area: true, filas: 2, ph: 'Ejemplo: no acceden a la información de los clientes ni a los sistemas que la procesan' })}
    <p class="campo-etq">Forma de redactarlo</p>${pestanasH('alcance.modo', [[1, 'Opción 1: exclusiones aparte'], [2, 'Opción 2: integradas']])}
    <p class="tenue pequeno" style="margin:0">La opción 1 es la habitual en auditorías; la opción 2, en la documentación interna.</p>
  </div>
  <div class="tarjeta destacada"><p class="antetitulo">Redacción del alcance propuesto</p><div id="h-salida" class="salida-h"></div></div>
  <div class="tarjeta"><p class="antetitulo">Revisión</p><div id="h-revision"></div>
    <div class="botonera"><button class="boton primario" data-accion="h-copiar" data-h="alcance">Copiar el alcance</button><button class="boton" data-accion="alcance-ejemplo">Ver el ejemplo de Cloud Solutions</button><button class="boton fantasma" data-accion="h-borrar" data-h="alcance">Limpiar</button></div></div>`;
  REFRESCO_H = () => { const s = $('#h-salida'); if (s) s.innerHTML = fmt(`«${textoAlcance(A)}»`); const r = $('#h-revision'); if (r) r.innerHTML = revisionAlcance(A); };
  REFRESCO_H();
  H_COPIAR.alcance = () => textoAlcance(A);
}
ACCIONES['alcance-ejemplo'] = () => { const A = hObj('alcance', {}); Object.assign(A, EJEMPLO_ALCANCE, { modo: 1 }); guardar(); render(); };

/* ===================== 5. ANÁLISIS DEL CONTEXTO (FODA, PESTEL, PORTER) ===================== */
const CUADRANTES = [['F', 'Fortalezas', 'internas', 'Capacidades propias que ayudan a proteger la información (gobernanza, procesos, información y tecnología, personas).'], ['D', 'Debilidades', 'internas', 'Carencias propias que la organización puede corregir.'], ['O', 'Oportunidades', 'externas', 'Hechos del entorno que la organización puede aprovechar.'], ['A', 'Amenazas', 'externas', 'Hechos del entorno que pueden perjudicarla y que no controla.']];
const ESTRATEGIAS = [['FO', 'Ofensiva (Maxi-Maxi)', 'Usa las fortalezas para aprovechar las oportunidades.'], ['DO', 'Reorientación (Mini-Maxi)', 'Aprovecha las oportunidades para superar las debilidades.'], ['FA', 'Defensiva (Maxi-Mini)', 'Usa las fortalezas para reducir el efecto de las amenazas.'], ['DA', 'Supervivencia (Mini-Mini)', 'Reduce las debilidades para no quedar expuesto a las amenazas.']];
const PESTEL = [['P', 'Político'], ['E', 'Económico'], ['S', 'Social'], ['T', 'Tecnológico'], ['Ec', 'Ecológico'], ['L', 'Legal']];
const PORTER = [['nuevos', 'Nuevos competidores', 'Nuevos vectores de ataque y atacantes emergentes, incluida la IA usada por atacantes.'], ['proveedores', 'Poder de los proveedores', 'Dependencia de la nube, el software como servicio, los centros de datos y otros terceros.'], ['clientes', 'Poder de los clientes y reguladores', 'Exigencias de clientes, socios y autoridades sobre cómo se protege su información.'], ['sustitutos', 'Sustitutos (shadow IT)', 'Herramientas no autorizadas y procesos informales que reemplazan los canales oficiales.'], ['rivalidad', 'Rivalidad entre competidores', 'Fuga de propiedad intelectual y de talento, inteligencia competitiva desleal o ataques de denegación de servicio.']];
function citaValida(clave, texto) { const t = String(texto || ''); return new RegExp(`\\b${clave[0]}[1-4]\\b`).test(t) && new RegExp(`\\b${clave[1]}[1-4]\\b`).test(t); }
function vistaHerrContexto(v) {
  const X = hObj('contexto', { vista: 'foda', foda: {}, est: {}, pestel: {}, porter: {} });
  let cuerpo = '';
  if (X.vista === 'foda') {
    cuerpo = CUADRANTES.map(([k, t, tipo, ayuda]) => { const n = [1, 2, 3, 4].filter((i) => limpio(X.foda[`${k}${i}`])).length; return `<div class="tarjeta"><div class="fila-flex entre"><h3 style="margin:0">${esc(t)} <span class="tenue">· ${tipo}</span></h3><span class="chip ${n === 4 ? 'ok' : 'marca'}">${n} de 4</span></div><p class="tenue pequeno" style="margin:4px 0 8px">${esc(ayuda)}</p>${[1, 2, 3, 4].map((i) => campo(`contexto.foda.${k}${i}`, `${k}${i}`, { ph: k === 'F' ? 'Ejemplo: central de operaciones 24/7 con seguimiento de las unidades' : k === 'D' ? 'Ejemplo: no existe un programa de concientización del personal' : k === 'O' ? 'Ejemplo: las aseguradoras exigen seguridad a sus proveedores' : 'Ejemplo: aumento del phishing dirigido al sector' })).join('')}</div>`; }).join('');
  } else if (X.vista === 'cruzada') {
    const ref = CUADRANTES.map(([k]) => [1, 2, 3, 4].map((i) => (limpio(X.foda[`${k}${i}`]) ? `<li><b>${k}${i}</b> ${esc(limpio(X.foda[`${k}${i}`]))}</li>` : '')).join('')).join('');
    cuerpo = `${ref ? `<details class="tarjeta"><summary><strong>Ver tus factores FODA</strong></summary><ul class="lista-simple">${ref}</ul></details>` : '<div class="tarjeta"><p class="tenue" style="margin:0">Primero completa la pestaña FODA para tener los factores a la mano.</p></div>'}
    ${ESTRATEGIAS.map(([k, t, ayuda]) => `<div class="tarjeta"><p class="antetitulo">Estrategia ${k}</p><h3 style="margin:0">${esc(t)}</h3><p class="tenue pequeno" style="margin:4px 0 8px">${esc(ayuda)} Cita los factores que combinas, por ejemplo «${k[0]}2 + ${k[1]}1».</p>${[1, 2].map((i) => { const val = X.est[`${k}${i}`]; return `${campo(`contexto.est.${k}${i}`, `${k}${i}`, { area: true, filas: 2 })}${limpio(val) && !citaValida(k, val) ? `<p class="aviso-h">${ico('info', 'chico')} Falta citar al menos un factor ${k[0]} y uno ${k[1]}.</p>` : ''}`; }).join('')}</div>`).join('')}`;
  } else if (X.vista === 'pestel') {
    cuerpo = `<div class="tarjeta"><p style="margin:0;line-height:1.6">Identifica al menos un factor externo por dimensión y decide si es una oportunidad o una amenaza para la seguridad de la información. Estos factores alimentan las cuestiones externas de 4.1.</p></div>${PESTEL.map(([k, t]) => `<div class="tarjeta"><h3 style="margin:0 0 8px">${esc(t)}</h3>${campo(`contexto.pestel.${k}.factor`, 'Factor externo', { area: true, filas: 2 })}${escala(`contexto.pestel.${k}.tipo`, [['O', 'Oportunidad'], ['A', 'Amenaza']])}${campo(`contexto.pestel.${k}.just`, 'Por qué', { area: true, filas: 2 })}</div>`).join('')}`;
  } else {
    cuerpo = `<div class="tarjeta"><p style="margin:0;line-height:1.6">Califica la presión de cada fuerza de 1 (baja) a 5 (alta) y propone al menos dos controles del Anexo A con su justificación. La fuerza con mayor puntaje es la que el ejercicio 2 pide atacar primero.</p></div>${PORTER.map(([k, t, ayuda]) => `<div class="tarjeta"><h3 style="margin:0">${esc(t)}</h3><p class="tenue pequeno" style="margin:4px 0 8px">${esc(ayuda)}</p>${escala(`contexto.porter.${k}.nivel`, [[1, 'Muy baja'], [2, 'Baja'], [3, 'Media'], [4, 'Alta'], [5, 'Muy alta']])}${campo(`contexto.porter.${k}.controles`, 'Controles del Anexo A (al menos dos)', { ph: 'Ejemplo: 5.19 Seguridad en las relaciones con proveedores; 5.22 Seguimiento de los servicios de proveedores' })}${campo(`contexto.porter.${k}.just`, 'Justificación', { area: true, filas: 2 })}</div>`).join('')}`;
  }
  const maxPorter = PORTER.map(([k, t]) => [t, (X.porter[k] || {}).nivel || 0]).sort((a, b) => b[1] - a[1])[0];
  v.innerHTML = `${cabecera('Análisis del contexto', { atras: '#/herramientas', ante: 'Talleres de la sesión 2 · requisito 4.1' })}
  ${pestanasH('contexto.vista', [['foda', 'FODA'], ['cruzada', 'Estrategias cruzadas'], ['pestel', 'PESTEL'], ['porter', 'Porter']])}
  ${cuerpo}
  ${X.vista === 'porter' && maxPorter && maxPorter[1] ? `<div class="tarjeta destacada"><p class="antetitulo">Fuerza con mayor presión</p><p style="margin:0">${esc(maxPorter[0])} · ${maxPorter[1]} de 5</p></div>` : ''}
  <div class="botonera"><button class="boton" data-accion="h-copiar" data-h="contexto">Copiar todo el análisis</button><button class="boton fantasma" data-accion="h-borrar" data-h="contexto">Empezar de nuevo</button></div>`;
  REFRESCO_H = null;
  H_COPIAR.contexto = () => {
    const L = ['MATRIZ FODA'];
    CUADRANTES.forEach(([k, t]) => { L.push(`${t}:`); [1, 2, 3, 4].forEach((i) => { const x = limpio(X.foda[`${k}${i}`]); if (x) L.push(`  ${k}${i}. ${x}.`); }); });
    L.push('', 'MATRIZ DE ESTRATEGIAS (CRUZADA)');
    ESTRATEGIAS.forEach(([k, t]) => { L.push(`Estrategia ${k} – ${t}:`); [1, 2].forEach((i) => { const x = limpio(X.est[`${k}${i}`]); if (x) L.push(`  ${k}${i}: ${x}.`); }); });
    L.push('', 'ANÁLISIS PESTEL');
    PESTEL.forEach(([k, t]) => { const p = X.pestel[k] || {}; if (limpio(p.factor)) L.push(`${t}: ${limpio(p.factor)}. ${p.tipo === 'O' ? 'Oportunidad' : p.tipo === 'A' ? 'Amenaza' : ''}${limpio(p.just) ? `: ${limpio(p.just)}.` : ''}`); });
    L.push('', 'CINCO FUERZAS DE PORTER (SGSI)');
    PORTER.forEach(([k, t]) => { const p = X.porter[k] || {}; if (p.nivel || limpio(p.controles)) L.push(`${t} | presión ${p.nivel || '-'} | ${limpio(p.controles)} | ${limpio(p.just)}`); });
    return L.join('\n');
  };
}

/* ===================== 6. LISTA DE LA POLÍTICA (GUÍA 001) ===================== */
const GUIA_001 = [
  ['Encabezado e identificación', ['Título formal de la política', 'Código del documento (por ejemplo, POL.SGSI.001)', 'Elaborado por: rol técnico u operativo', 'Revisado por: Oficial de Seguridad de la Información (CISO)', 'Aprobado por: Gerencia General o alta dirección']],
  ['Control de cambios', ['Versión, fecha, autor, descripción y aprobado por', 'Versión 00 registrada como creación del documento']],
  ['Objetivo', ['Declara el compromiso de la alta dirección', 'Se orienta a la gestión de riesgos y a la mejora continua del SGSI', 'Se alinea con la calidad y la continuidad de los servicios']],
  ['Alcance', ['Procesos, activos, infraestructura, colaboradores y terceros', 'Cláusulas de confidencialidad en los contratos con terceros', 'Ciclo de vida de los datos: generación, almacenamiento, transporte, consulta y destrucción', 'Ciclo de vida de los sistemas: análisis, diseño, desarrollo, implantación y mantenimiento', 'Principios de confidencialidad, integridad y disponibilidad']],
  ['Responsabilidades', ['Alta dirección', 'Oficial de Seguridad de la Información (CISO)', 'Propietarios de la información', 'Usuarios de los sistemas']],
  ['Referencias y abreviaturas', ['ISO/IEC 27001, ISO/IEC 27000 e ISO 31000', 'Ley N.° 29733 de Protección de Datos Personales y su reglamento', 'Documentos internos: manual de organización y funciones y mapa de procesos']],
  ['Definiciones', ['SGSI, activo, riesgo y seguridad de la información', 'Términos propios de la organización (por ejemplo, proveedores de nube)']],
  ['Condiciones generales', ['Compromiso de cumplir las leyes y regulaciones del sector']],
  ['Lineamientos', ['Clasificación y etiquetado de la información', 'Aplicación de la política: planes, proyectos y gestión de riesgos', 'Formación y concientización para todo el personal y los proveedores', 'Auditorías internas y externas periódicas', 'Planes y procedimientos específicos alineados con la política']],
  ['Mejora continua y vigencia', ['Retroalimentación con incidentes, auditorías, métricas y propuestas', 'Entrada en vigor desde su aprobación y publicación', 'Revisión al menos una vez al año']],
];
function vistaHerrPolitica(v) {
  REFRESCO_H = null;
  const P = hObj('politica', { marcas: {} });
  const total = GUIA_001.reduce((a, [, xs]) => a + xs.length, 0); const hechos = Object.values(P.marcas).filter(Boolean).length;
  v.innerHTML = `${cabecera('Lista de la política', { atras: '#/herramientas', ante: 'Guía 001 del docente · requisito 5.2' })}
  <div class="tarjeta destacada"><div class="fila-flex">${anillo(hechos, total, `${pct(hechos, total)}%`)}<div><p class="antetitulo">Tu política cubre</p><p style="margin:0">${hechos} de ${total} elementos que pide la guía.</p></div></div></div>
  <div class="tarjeta"><p style="margin:0;line-height:1.6">Revisa tu borrador sección por sección y marca lo que ya contiene. Recuerda que la política debe estar aprobada por la dirección, comunicada al personal y disponible para las partes interesadas.</p></div>
  ${GUIA_001.map(([t, xs], si) => `<div class="tarjeta"><p class="antetitulo">Sección ${si + 1}</p><h3 style="margin:0 0 8px">${esc(t)}</h3><ul class="checklist">${xs.map((x, i) => { const k = `${si}-${i}`; return `<li><button type="button" role="checkbox" aria-checked="${!!P.marcas[k]}" data-accion="pol-marcar" data-k="${k}"><span class="caja-check">${P.marcas[k] ? ico('check', 'chico') : ''}</span><span>${esc(x)}</span></button></li>`; }).join('')}</ul></div>`).join('')}
  <div class="botonera"><button class="boton fantasma" data-accion="h-borrar" data-h="politica">Desmarcar todo</button></div>`;
}
ACCIONES['pol-marcar'] = (b) => { const P = hObj('politica', { marcas: {} }); P.marcas[b.dataset.k] = !P.marcas[b.dataset.k]; guardar(); render(); };

/* módulo del bloque «Talleres del docente» → herramienta que lo practica (la lección muestra el acceso) */
const HERR_DE_MODULO = {
  m26: ['#/herr/contexto', 'análisis del contexto'], m27: ['#/herr/alcance', 'constructor del alcance'], m28: ['#/herr/politica', 'lista de la política'],
  m29: ['#/herr/riesgo', 'calculadora de riesgo'], m30: ['#/herr/diagnostico', 'diagnóstico inicial'], m31: ['#/herr/riesgo', 'calculadora de riesgo'],
};

/* ===================== rutas ===================== */
RUTAS.push(
  [/^#\/herramientas$/, vistaHerramientas, 'practicar'],
  [/^#\/herr\/riesgo$/, vistaHerrRiesgo, 'practicar'],
  [/^#\/herr\/diagnostico$/, vistaHerrDiagnostico, 'practicar'],
  [/^#\/herr\/soa$/, vistaHerrSoa, 'practicar'],
  [/^#\/herr\/alcance$/, vistaHerrAlcance, 'practicar'],
  [/^#\/herr\/contexto$/, vistaHerrContexto, 'practicar'],
  [/^#\/herr\/politica$/, vistaHerrPolitica, 'practicar'],
);
