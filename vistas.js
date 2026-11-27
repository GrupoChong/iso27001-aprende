/* ISO 27001 Aprende — vistas de lectura: inicio, ruta de módulos, lección, audiolibro y biblioteca. */
'use strict';

/* ===================== piezas comunes ===================== */
function cabecera(titulo, { atras = null, ante = '', acciones = '' } = {}) {
  return `<div class="cabecera">${atras ? `<button class="btn-icono" data-ir="${atras}" aria-label="Volver">${ico('atras')}</button>` : ''}
    <div style="flex:1;min-width:0">${ante ? `<p class="antetitulo">${esc(ante)}</p>` : ''}<h1>${esc(titulo)}</h1></div>
    ${acciones ? `<div class="acciones">${acciones}</div>` : ''}</div>`;
}
function anillo(valor, max, centro, sub = '', color = '') {
  const r = 40; const L = 2 * Math.PI * r; const f = Math.max(0, Math.min(1, max ? valor / max : 0));
  return `<div class="anillo" style="--L:${L.toFixed(1)};--off:${(L * (1 - f)).toFixed(1)}${color ? `;color:${color}` : ''}"><svg viewBox="0 0 92 92"><circle class="pista" cx="46" cy="46" r="${r}"/><circle class="valor" cx="46" cy="46" r="${r}"/></svg><div class="centro"><div>${centro}${sub ? `<small>${sub}</small>` : ''}</div></div></div>`;
}
const barra = (v, max, clase = '') => `<div class="barra ${clase}" role="progressbar" aria-valuenow="${pct(v, max)}" aria-valuemin="0" aria-valuemax="100"><span style="--p:${pct(v, max)}%"></span></div>`;
const chipsCID = (cid = []) => cid.map((x) => `<span class="chip ${x.toLowerCase()}">${{ C: 'Confidencialidad', I: 'Integridad', D: 'Disponibilidad' }[x]}</span>`).join('');
const puntosCID = (cid = []) => `<span class="puntos-cid" aria-label="Propiedades: ${cid.join(', ')}">${['C', 'I', 'D'].map((x) => `<i class="${cid.includes(x) ? x.toLowerCase() : ''}"></i>`).join('')}</span>`;
function sinContenido() {
  return `<div class="tarjeta vacio">${ico('info')}<p>Todavía no hay contenido cargado en esta versión de la app.</p></div>`;
}

/* ===================== secciones de lección ===================== */
const SECCION = {
  idea: ['idea', 'La idea clave'], explicacion: ['libro', 'Explicación'], ejemplo: ['casa', 'Ejemplo cotidiano'],
  empresa: ['edificio', 'En una organización'], formal: ['traducir', 'Lenguaje normativo'], tabla: ['tabla', 'Cuadro comparativo'],
  pasos: ['lista', 'Paso a paso'], norma: ['norma', 'Qué establece la norma'], error: ['alerta', 'Error frecuente'],
  memoria: ['memoria', 'Para recordar'], auditor: ['auditor', 'Lo que verifica el auditor'],
};
function textoDeSeccion(s) {
  if (s.tipo === 'formal') return `${s.titulo}. ${(s.pares || []).map((p) => `En lugar de decir: ${p.coloquial}. Se dice: ${p.formal}`).join('. ')}`;
  if (s.tipo === 'tabla') return `${s.titulo}. ${(s.filas || []).map((f) => f.map((c, i) => `${s.columnas[i]}: ${c}`).join('. ')).join('. ')}`;
  if (s.tipo === 'pasos') return `${s.titulo}. ${(s.items || []).map((t, i) => `Paso ${i + 1}: ${t}`).join('. ')}`;
  return `${s.titulo}. ${s.texto || ''}`;
}
function seccionHTML(s, clave) {
  const [icono, etiquetaTipo] = SECCION[s.tipo] || ['libro', ''];
  const etiqueta = s.etiqueta ?? etiquetaTipo;
  let cuerpo = '';
  if (s.tipo === 'formal') {
    cuerpo = `<div class="pares">${(s.pares || []).map((p) => `<div class="par"><div class="col coloquial"><small>Así NO</small><span>${negritas(p.coloquial)}</span></div><div class="col formal"><small>Lenguaje normativo</small>${negritas(p.formal)}</div></div>`).join('')}</div>`;
  } else if (s.tipo === 'tabla') {
    cuerpo = `<div class="tabla-scroll"><table class="tabla"><thead><tr>${(s.columnas || []).map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${(s.filas || []).map((f) => `<tr>${f.map((c) => `<td>${negritas(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  } else if (s.tipo === 'pasos') {
    cuerpo = `<ol class="pasos">${(s.items || []).map((t) => `<li><span>${negritas(t)}</span></li>`).join('')}</ol>`;
  } else {
    cuerpo = `<div class="texto">${fmt(s.texto)}</div>${s.ref ? `<span class="ref">${esc(s.ref)}</span>` : ''}`;
  }
  return `<section class="tarjeta seccion ${s.tipo}">
    <div class="sec-cab"><div class="titulos"><div class="etiqueta">${ico(icono, 'chico')}${esc(etiqueta.toLowerCase() === String(s.titulo).trim().toLowerCase() ? '' : etiqueta)}</div><h3>${esc(s.titulo)}</h3></div>${botonVoz(clave, textoDeSeccion(s))}</div>
    ${cuerpo}</section>`;
}

/* ===================== INICIO ===================== */
function vistaInicio(v) {
  const d = registroDia(); const min = Math.floor(d.seg / 60); const meta = E.ajustes.meta;
  const pend = preguntasPendientes().length; const pendT = tarjetasPendientes().length;
  const sig = siguienteModulo(); const hechos = MODULOS.filter((m) => estadoModulo(m.id).completado).length;
  const r = racha();
  const diaPlan = diaDelPlan(); const tareaPlan = (C.metodo?.plan || []).find((p) => p.dia === diaPlan);
  const semana = [...Array(7)].map((_, i) => sumarDias(hoy(), i - 6));
  const nombreDia = (f) => new Intl.DateTimeFormat('es-PE', { weekday: 'short' }).format(new Date(`${f}T12:00:00`)).replace('.', '');
  v.innerHTML = `
  ${cabecera(FECHA_LARGA.format(new Date()).replace(',', '').replace(/^./, (l) => l.toUpperCase()), { acciones: `<button class="btn-icono" data-ir="#/ajustes" aria-label="Ajustes">${ico('ajustes')}</button>` })}
  <section class="tarjeta hero">
    <div class="hero-fila">
      ${anillo(min, meta, `<span data-contar="${min}">${min}</span>`, `de ${meta} min`)}
      <div class="hero-txt">
        <p class="antetitulo">Meta de hoy</p>
        <h2 class="hero-titulo">${min >= meta ? 'Meta cumplida' : `Te faltan ${meta - min} minutos`}</h2>
        <p class="hero-sub">${min >= meta ? 'Excelente constancia. Lo que sumes hoy es ganancia.' : 'Un bloque de estudio te acerca a la meta.'}</p>
      </div>
    </div>
    <dl class="cifras">
      <div><dt>Racha</dt><dd><span data-contar="${r}">${r}</span><small>${r === 1 ? 'día' : 'días'}</small></dd></div>
      <div><dt>Preguntas</dt><dd><span data-contar="${d.preguntas}">${d.preguntas}</span><small>hoy</small></dd></div>
      <div><dt>Acierto</dt><dd>${d.preguntas ? `<span data-contar="${pct(d.aciertos, d.preguntas)}">${pct(d.aciertos, d.preguntas)}</span><small>%</small>` : '—'}</dd></div>
    </dl>
    <button class="boton primario ancho hero-boton" data-ir="#/foco">${ico('foco')} Modo estudio</button>
  </section>

  <div class="tarjeta">
    <div class="fila-flex entre"><div><p class="antetitulo">Repaso pendiente</p><h3>${pend + pendT ? `${plural(pend, 'pregunta', 'preguntas')} y ${plural(pendT, 'tarjeta', 'tarjetas')}` : 'Estás al día'}</h3></div>${ico('repetir', 'grande')}</div>
    <p class="tenue" style="margin:6px 0 0">${pend + pendT ? 'Empieza siempre por aquí: son tus errores y lo que toca reforzar hoy para no olvidarlo.' : 'No tienes nada pendiente. Avanza con un módulo nuevo o haz una práctica inteligente.'}</p>
    ${pend + pendT ? `<div class="botonera">${pend ? '<button class="boton primario" data-accion="practica-pendientes">Repasar preguntas</button>' : ''}${pendT ? '<button class="boton" data-accion="tarjetas-pendientes">Repasar tarjetas</button>' : ''}</div>` : ''}
  </div>

  ${sig ? `<div class="tarjeta">
    <p class="antetitulo">${hechos ? 'Continúa tu ruta' : 'Empieza aquí'} · ${esc(BLOQUE_CORTO[sig.bloque] || '')}</p>
    <h3 style="font-size:1.12rem">Módulo ${sig.orden}. ${esc(sig.titulo)}</h3>
    <p class="tenue" style="margin:2px 0 10px">${esc(sig.subtitulo)}</p>
    ${barra(Math.round((estadoModulo(sig.id).lectura || 0) * 100), 100)}
    <div class="botonera"><button class="boton primario" data-ir="#/modulo/${sig.id}">${ico('aprender')} Leer</button><button class="boton" data-accion="escuchar-cap" data-cap="${sig.id}">${ico('escuchar')} Escuchar</button></div>
  </div>` : sinContenido()}

  <div class="rejilla">
    ${accionRapida('examen', 'Examen simulado', '40 preguntas · 60 min · nota sobre 20', 'data-accion="examen"')}
    ${accionRapida('traducir', 'Traductor CID', 'De lo coloquial al lenguaje de la norma', 'data-accion="traductor"')}
    ${accionRapida('pieza', 'Constructor de riesgos', 'Redacta riesgos como en el curso', 'data-ir="#/riesgos"')}
    ${accionRapida('rayo', 'Práctica inteligente', 'Mezcla tus temas débiles y nuevos', 'data-accion="practica-inteligente"')}
  </div>

  ${tareaPlan ? `<div class="tarjeta pulsable" data-ir="#/plan" role="button">
    <div class="fila-flex"><span class="ico-caja">${ico('calendario')}</span>
    <div style="flex:1"><p class="antetitulo">Plan de 4 semanas · día ${diaPlan} de 28</p><strong>${esc(tareaPlan.tarea)}</strong></div>${ico('sig')}</div></div>` : ''}

  <div class="tarjeta">
    <p class="antetitulo">Tu avance</p>
    ${BLOQUES.map((b) => { const ms = MODULOS.filter((m) => m.bloque === b); const h = ms.filter((m) => estadoModulo(m.id).completado).length; return ms.length ? `<div style="margin:10px 0"><div class="fila-flex entre pequeno"><span>${esc(b)}</span><span class="tenue">${h}/${ms.length}</span></div>${barra(h, ms.length, 'ok')}</div>` : ''; }).join('')}
    <div class="dias-semana">${semana.map((f) => { const x = E.dias[f]; const c = diaCumplido(f) ? 'lleno' : x && (x.seg > 0 || x.preguntas > 0) ? 'medio' : ''; return `<div><i class="${c}"></i>${nombreDia(f)}</div>`; }).join('')}</div>
  </div>`;
}
function accionRapida(icono, titulo, sub, attrs) {
  return `<button class="tarjeta pulsable accion-rapida" ${attrs}><span class="ico-caja">${ico(icono)}</span><strong>${esc(titulo)}</strong><span>${esc(sub)}</span></button>`;
}
function diaDelPlan() {
  if (!E.planInicio) { E.planInicio = E.creado || hoy(); guardar(); }
  return Math.max(1, Math.min(28, difDias(E.planInicio, hoy()) + 1));
}

/* ===================== APRENDER (ruta) ===================== */
function vistaAprender(v) {
  if (!MODULOS.length) { v.innerHTML = cabecera('Aprender') + sinContenido(); return; }
  v.innerHTML = `${cabecera('Ruta de aprendizaje', { ante: `${MODULOS.length} módulos · ${BLOQUES.filter((b) => MODULOS.some((m) => m.bloque === b)).length} bloques` })}
  <button class="tarjeta pulsable compacta" data-ir="#/metodo"><div class="fila-flex"><span class="ico-caja">${ico('idea')}</span><div style="flex:1"><strong>Antes de empezar: cómo estudiar con esta app</strong><span class="tenue" style="display:block">Método para estudiar y recordar · 8 min</span></div>${ico('sig')}</div></button>
  ${BLOQUES.map((b, bi) => {
    const ms = MODULOS.filter((m) => m.bloque === b); if (!ms.length) return '';
    return `<h2>Bloque ${bi + 1}. ${esc(b)}</h2><div class="tarjeta compacta"><ul class="lista">${ms.map((m) => {
      const st = estadoModulo(m.id); const es = estadisticaModulo(m.id);
      const clase = st.completado ? 'hecho' : st.leido ? 'leido' : '';
      const estado = st.completado ? `Dominado · ${st.nota || 0} %` : st.leido ? 'Leído · falta el mini examen' : (st.lectura ? `Leído al ${Math.round(st.lectura * 100)} %` : `${m.minutos} min · ${es.total} preguntas`);
      return `<li><button class="item" data-ir="#/modulo/${m.id}"><span class="num ${clase}">${st.completado ? ico('check', 'chico') : m.orden}</span><span class="cuerpo"><strong>${esc(m.titulo)}</strong><span>${esc(estado)}</span></span>${ico('sig', 'chico')}</button></li>`;
    }).join('')}</ul></div>`;
  }).join('')}`;
}

/* ===================== LECCIÓN ===================== */
let observadorLectura = null;
function vistaModulo(v, id) {
  const m = MOD.get(id); if (!m) { ir('#/aprender'); return; }
  const st = estadoModulo(id); st.visto = hoy(); guardar();
  const i = MODULOS.indexOf(m); const ant = MODULOS[i - 1]; const sig = MODULOS[i + 1];
  const es = estadisticaModulo(id);
  const nTarj = (m.tarjetas || []).length;
  v.innerHTML = `<div class="lectura-progreso"><span id="barra-lectura"></span></div>
  ${cabecera('', { atras: '#/aprender', acciones: `<button class="btn-icono" data-accion="escuchar-cap" data-cap="${m.id}" aria-label="Escuchar el audio del módulo">${ico('escuchar')}</button>` })}
  <header class="leccion-cabecera">
    <p class="antetitulo">${esc(m.bloque)} · Módulo ${m.orden} · ${m.minutos} min</p>
    <h1>${esc(m.titulo)}</h1>
    <p class="subtitulo">${esc(m.subtitulo)}</p>
  </header>
  <div class="tarjeta"><p class="antetitulo">Al terminar podrás</p><ul class="objetivos">${(m.objetivos || []).map((o) => `<li>${ico('check', 'chico')}<span>${esc(o.replace(/^Al terminar podrás\s*/i, ''))}</span></li>`).join('')}</ul></div>
  ${(m.secciones || []).map((s, k) => seccionHTML(s, `${m.id}-s${k}`)).join('')}
  <section class="tarjeta" id="fin-modulo">
    <div class="sec-cab"><div class="titulos"><div class="etiqueta">${ico('lista', 'chico')}Resumen</div><h3>Lo esencial de este módulo</h3></div>${botonVoz(`${m.id}-res`, `Resumen. ${(m.resumen || []).join('. ')}`)}</div>
    <ul class="resumen-lista">${(m.resumen || []).map((r) => `<li>${negritas(r)}</li>`).join('')}</ul>
  </section>
  <div class="tarjeta destacada">
    <p class="antetitulo">Comprueba lo aprendido</p>
    <h3 style="font-size:1.12rem">${st.completado ? `Módulo dominado (${st.nota} %)` : 'Mini examen de 6 preguntas'}</h3>
    <p class="tenue" style="margin:4px 0 0">${st.completado ? 'Puedes repetirlo o practicar todas las preguntas del módulo.' : 'Con 5 de 6 respuestas correctas el módulo queda como dominado.'}</p>
    <div class="botonera">
      <button class="boton sobre" data-accion="mini-examen" data-mod="${m.id}">${ico('examen')} Hacer el mini examen</button>
      <button class="boton contorno-sobre" data-accion="practica-modulo" data-mod="${m.id}">Practicar las ${es.total}</button>
    </div>
  </div>
  ${typeof CLASE_DE_MODULO !== 'undefined' && CLASE_DE_MODULO[m.id] ? `<button class="tarjeta pulsable destacada compacta" data-ir="#/clase/${CLASE_DE_MODULO[m.id]}"><div class="fila-flex">${ico('lista')}<div style="flex:1"><strong>Resumen interactivo de la clase</strong><span class="tenue" style="display:block">Lo esencial, explicaciones, preguntas de los alumnos y lista para repasar</span></div>${ico('sig')}</div></button>` : ''}
  ${typeof HERR_DE_MODULO !== 'undefined' && HERR_DE_MODULO[m.id] ? `<button class="tarjeta pulsable compacta" data-ir="${HERR_DE_MODULO[m.id][0]}"><div class="fila-flex">${ico('pieza')}<div style="flex:1"><strong>Practica con la herramienta: ${esc(HERR_DE_MODULO[m.id][1])}</strong><span class="tenue" style="display:block">El mismo formato que pide el docente, para llenarlo en el celular</span></div>${ico('sig')}</div></button>` : ''}
  ${nTarj ? `<button class="tarjeta pulsable compacta" data-accion="tarjetas-modulo" data-mod="${m.id}"><div class="fila-flex">${ico('tarjetas')}<div style="flex:1"><strong>Tarjetas de este módulo</strong><span class="tenue" style="display:block">${nTarj} conceptos para memorizar</span></div>${ico('sig')}</div></button>` : ''}
  <div class="botonera">
    ${ant ? `<button class="boton" data-ir="#/modulo/${ant.id}">${ico('atras', 'chico')} Módulo ${ant.orden}</button>` : ''}
    ${sig ? `<button class="boton primario" data-ir="#/modulo/${sig.id}">Módulo ${sig.orden} ${ico('sig', 'chico')}</button>` : ''}
  </div>`;
  // progreso de lectura y «continuar donde lo dejaste»
  const barraL = $('#barra-lectura');
  const medir = () => {
    const alto = document.documentElement.scrollHeight - innerHeight; const r = alto > 0 ? Math.min(1, scrollY / alto) : 1;
    if (barraL) barraL.style.width = `${r * 100}%`;
    if (r > (st.lectura || 0)) { st.lectura = Math.round(r * 100) / 100; guardar(); }
  };
  window.onscroll = location.hash === `#/modulo/${id}` ? medir : null;
  if (observadorLectura) observadorLectura.disconnect();
  observadorLectura = new IntersectionObserver((ents) => { if (ents.some((e) => e.isIntersecting) && !st.leido) { st.leido = hoy(); st.lectura = 1; guardar(); } }, { threshold: 0.4 });
  observadorLectura.observe($('#fin-modulo'));
  if (st.lectura > 0.12 && st.lectura < 0.92 && !st.leido) {
    setTimeout(() => {
      avisar('Te llevo a donde te quedaste.');
      window.scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * st.lectura - 80, behavior: 'smooth' });
    }, 350);
  }
}
window.addEventListener('hashchange', () => { if (!location.hash.startsWith('#/modulo/')) window.onscroll = null; });

/* ===================== MÉTODO ===================== */
function vistaMetodo(v) {
  const M = C.metodo; if (!M) { v.innerHTML = cabecera('Método', { atras: '#/biblioteca' }) + sinContenido(); return; }
  v.innerHTML = `${cabecera('', { atras: '#/biblioteca', acciones: `<button class="btn-icono" data-accion="escuchar-cap" data-cap="intro" aria-label="Escuchar">${ico('escuchar')}</button>` })}
  <header class="leccion-cabecera"><p class="antetitulo">Antes de empezar · ${M.minutos} min</p><h1>${esc(M.titulo)}</h1><p class="subtitulo">${esc(M.subtitulo)}</p></header>
  ${M.secciones.map((s, k) => seccionHTML(s, `met-${k}`)).join('')}
  <section class="tarjeta"><div class="sec-cab"><div class="titulos"><div class="etiqueta">${ico('lista', 'chico')}Resumen</div><h3>Lo esencial</h3></div></div><ul class="resumen-lista">${M.resumen.map((r) => `<li>${negritas(r)}</li>`).join('')}</ul></section>
  <div class="botonera"><button class="boton" data-ir="#/plan">${ico('calendario')} Ver el plan de 4 semanas</button><button class="boton primario" data-ir="#/foco">${ico('foco')} Empezar a estudiar</button></div>`;
}

/* ===================== ESCUCHAR ===================== */
let verTexto = false;
function vistaEscuchar(v) {
  const actual = capActual || CAP.get(E.audio.ultimo) || CAPITULOS[0];
  if (!actual) { v.innerHTML = cabecera('Audiolibro') + sinContenido(); return; }
  const dur = capActual ? (AUD.duration || duracionCap(actual.id)) : duracionCap(actual.id);
  const totalMin = Math.round(CAPITULOS.reduce((s, c) => s + duracionCap(c.id), 0) / 60);
  const grupos = [['Introducción', CAPITULOS.filter((c) => c.id === 'intro')], ...BLOQUES.map((b) => [b, CAPITULOS.filter((c) => c.bloque === b)]), ['Repaso', CAPITULOS.filter((c) => c.id === 'repaso')]];
  v.innerHTML = `${cabecera('Audiolibro', { ante: totalMin ? `${CAPITULOS.length} capítulos · ${Math.floor(totalMin / 60)} h ${totalMin % 60} min` : `${CAPITULOS.length} capítulos` })}
  <div class="tarjeta reproductor-grande">
    <div class="portada">${ico('escuchar', 'grande')}</div>
    <p class="antetitulo">${actual.numero ? `Capítulo ${actual.numero}` : 'Capítulo de bienvenida'}</p>
    <h2>${esc(actual.titulo)}</h2>
    <input type="range" id="rango-audio" min="0" max="${Math.round(dur || 1)}" value="${Math.round(capActual ? AUD.currentTime : (E.audio.pos[actual.id] || 0))}" aria-label="Posición del audio">
    <div class="tiempos"><span id="t-actual">${mmss(capActual ? AUD.currentTime : E.audio.pos[actual.id] || 0)}</span><span id="t-total">${mmss(dur)}</span></div>
    <div class="controles-audio">
      <button class="btn-icono" data-accion="audio-menos" aria-label="Retroceder 15 segundos">${ico('menos15')}</button>
      <button class="btn-play" id="btn-play-grande" data-accion="audio-grande" data-cap="${actual.id}" aria-label="Reproducir">${ico(capActual && !AUD.paused ? 'pausa' : 'play')}</button>
      <button class="btn-icono" data-accion="audio-mas" aria-label="Adelantar 15 segundos">${ico('mas15')}</button>
    </div>
    <div class="velocidades">${[0.8, 1, 1.15, 1.25, 1.5].map((x) => `<button data-accion="vel-audio" data-v="${x}" aria-pressed="${E.ajustes.velAudio === x}">${String(x).replace('.', ',')}×</button>`).join('')}</div>
    <div class="ajuste" style="margin-top:6px;text-align:left"><div class="txt"><strong>Reproducción continua</strong><span>Al terminar un capítulo empieza el siguiente</span></div><button class="interruptor" role="switch" aria-checked="${E.ajustes.continuo}" data-accion="alternar-ajuste" data-k="continuo" aria-label="Reproducción continua"></button></div>
    <button class="boton fantasma ancho" data-accion="ver-texto">${ico('libro')} ${verTexto ? 'Ocultar el texto' : 'Leer el texto mientras escuchas'}</button>
    ${verTexto ? `<div class="transcripcion">${esc(actual.texto)}</div>` : ''}
  </div>
  ${grupos.map(([g, caps]) => caps.length ? `<h2>${esc(g)}</h2><div class="tarjeta compacta"><ul class="lista">${caps.map((c) => `<li><button class="item" data-accion="escuchar-cap" data-cap="${c.id}"><span class="num ${E.audio.hechos[c.id] ? 'hecho' : ''}">${E.audio.hechos[c.id] ? ico('check', 'chico') : c.numero || ico('play', 'chico')}</span><span class="cuerpo"><strong>${esc(c.titulo)}</strong><span>${duracionCap(c.id) ? mmss(duracionCap(c.id)) : 'Voz del teléfono'}${E.audio.pos[c.id] > 5 ? ` · vas en ${mmss(E.audio.pos[c.id])}` : ''}</span></span>${ico(capActual && capActual.id === c.id && !AUD.paused ? 'pausa' : 'play', 'chico')}</button></li>`).join('')}</ul></div>` : '').join('')}
  <p class="tenue" style="text-align:center;margin-top:18px">Consejo: escucha antes de leer para tener el mapa general, y después para consolidar.</p>`;
  const r = $('#rango-audio');
  r.addEventListener('input', () => { r.dataset.arrastrando = '1'; $('#t-actual').textContent = mmss(r.value); });
  r.addEventListener('change', () => { delete r.dataset.arrastrando; if (!capActual || capActual.id !== actual.id) { E.audio.pos[actual.id] = Number(r.value); cargarCapitulo(actual.id); } else AUD.currentTime = Number(r.value); });
}
Object.assign(ACCIONES, {
  'escuchar-cap': (b) => { const id = b.dataset.cap; if (capActual && capActual.id === id) { alternarAudio(); } else cargarCapitulo(id); if (location.hash === '#/escuchar') render(); else pintarMini(); },
  'audio-grande': (b) => { if (!capActual || capActual.id !== b.dataset.cap) cargarCapitulo(b.dataset.cap); else alternarAudio(); },
  'vel-audio': (b) => { velocidadAudio(Number(b.dataset.v)); $$('.velocidades button').forEach((x) => x.setAttribute('aria-pressed', x.dataset.v === b.dataset.v)); },
  'ver-texto': () => { verTexto = !verTexto; render(); },
  'alternar-ajuste': (b) => { const k = b.dataset.k; E.ajustes[k] = !E.ajustes[k]; guardar(); b.setAttribute('aria-checked', E.ajustes[k]); if (k === 'ruido') ruidoMarron(E.ajustes.ruido && !!FOCO); },
});

/* ===================== BIBLIOTECA ===================== */
function vistaBiblioteca(v) {
  const dominados = Object.values(E.controles).filter((x) => x.dominado).length;
  const item = (ir_, icono, titulo, sub) => `<li><button class="item" data-ir="${ir_}"><span class="num">${ico(icono, 'chico')}</span><span class="cuerpo"><strong>${titulo}</strong><span>${sub}</span></span>${ico('sig', 'chico')}</button></li>`;
  v.innerHTML = `${cabecera('Biblioteca', { ante: 'Consulta y referencia' })}
  <div class="tarjeta compacta"><ul class="lista">
    ${item('#/clases', 'escuchar', 'Resúmenes de las clases', 'Lo esencial de cada clase grabada, con audio y preguntas')}
    ${item('#/herramientas', 'pieza', 'Herramientas del curso', 'Riesgo, diagnóstico, SoA, alcance, contexto y política')}
    ${item('#/controles', 'escudo', 'Los 93 controles del Anexo A', `Explicados uno por uno · ${dominados} marcados como dominados`)}
    ${item('#/glosario', 'libro', 'Glosario', `${(C.glosario || []).length} términos con ejemplos`)}
    ${item('#/metodo', 'idea', 'Método de estudio', 'Cómo estudiar y recordar')}
    ${item('#/plan', 'calendario', 'Plan de 4 semanas', 'Qué estudiar cada día')}
    ${item('#/estadisticas', 'grafico', 'Mis estadísticas', 'Tiempo, aciertos, exámenes y bloques de estudio')}
    ${item('#/ajustes', 'ajustes', 'Ajustes', 'Tema, letra, sonido, vibración y voz')}
    ${item('#/creditos', 'info', 'Fuentes y créditos', 'De dónde sale el contenido')}
  </ul></div>`;
}

/* ===================== CONTROLES ===================== */
const filtroCtrl = { tema: 'todos', q: '' };
function vistaControles(v) {
  if (!CONTROLES.length) { v.innerHTML = cabecera('Controles', { atras: '#/biblioteca' }) + sinContenido(); return; }
  const filtros = [['todos', `Todos · ${CONTROLES.length}`], ...TEMAS.map(([t, txt]) => [t, `${txt} · ${CONTROLES.filter((c) => c.tema === t).length}`]), ['nuevos', `Nuevos 2022 · ${CONTROLES.filter((c) => c.nuevo2022).length}`], ['dominados', 'Dominados']];
  v.innerHTML = `${cabecera('Controles del Anexo A', { atras: '#/biblioteca', ante: 'ISO/IEC 27001:2022 · guía ISO/IEC 27002:2022' })}
  <div class="campo-busqueda">${ico('lupa')}<input id="buscar-ctrl" type="search" placeholder="Busca por número o tema: 8.13, respaldo, proveedores…" value="${esc(filtroCtrl.q)}" aria-label="Buscar control"></div>
  <div class="filtros" role="group" aria-label="Filtrar por tema">${filtros.map(([k, t]) => `<button data-accion="filtro-ctrl" data-k="${k}" aria-pressed="${filtroCtrl.tema === k}">${esc(t)}</button>`).join('')}</div>
  <div id="lista-ctrl"></div>`;
  pintarListaControles();
  $('#buscar-ctrl').addEventListener('input', (e) => { filtroCtrl.q = e.target.value; pintarListaControles(); });
}
function pintarListaControles() {
  const q = filtroCtrl.q.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const lista = CONTROLES.filter((c) => {
    if (filtroCtrl.tema === 'nuevos' && !c.nuevo2022) return false;
    if (filtroCtrl.tema === 'dominados' && !E.controles[c.id]?.dominado) return false;
    if (!['todos', 'nuevos', 'dominados'].includes(filtroCtrl.tema) && c.tema !== filtroCtrl.tema) return false;
    if (q && !(c.id.startsWith(q) || norm(c.titulo).includes(q) || norm(c.que_es).includes(q))) return false;
    return true;
  });
  const cont = $('#lista-ctrl'); if (!cont) return;
  if (!lista.length) { cont.innerHTML = `<div class="tarjeta vacio">${ico('lupa')}<p>No hay controles con ese filtro.</p></div>`; return; }
  const grupos = TEMAS.map(([t, txt, n]) => [t, txt, n, lista.filter((c) => c.tema === t)]).filter((g) => g[3].length);
  cont.innerHTML = grupos.map(([, txt, n, cs]) => `<h2>${n}. Controles ${esc(txt.toLowerCase())}</h2><div class="tarjeta compacta"><ul class="lista">${cs.map((c) => `<li><button class="item" data-ir="#/control/${c.id}"><span class="num ${E.controles[c.id]?.dominado ? 'hecho' : ''}">${c.id}</span><span class="cuerpo"><strong>${esc(c.titulo)}</strong><span>${c.nuevo2022 ? '<b class="tono-alerta">Nuevo 2022</b> · ' : ''}${esc((c.attr?.tipo || []).join(', '))}</span></span>${puntosCID(c.attr?.cid)}</button></li>`).join('')}</ul></div>`).join('');
}
ACCIONES['filtro-ctrl'] = (b) => { filtroCtrl.tema = b.dataset.k; $$('.filtros button').forEach((x) => x.setAttribute('aria-pressed', x === b)); pintarListaControles(); };

function vistaControl(v, id) {
  const c = CTRL.get(id); if (!c) { ir('#/controles'); return; }
  const i = CONTROLES.indexOf(c); const ant = CONTROLES[i - 1]; const sig = CONTROLES[i + 1];
  const a = c.attr || {}; const dom = !!E.controles[id]?.dominado; const preg = PREG_CTRL.get(id) || [];
  const textoVoz = `Control ${c.id}. ${c.titulo}. Qué es: ${c.que_es} Por qué importa: ${c.por_que} Ejemplo: ${c.ejemplo} Evidencias que pediría un auditor: ${(c.evidencia || []).join('. ')}. Pregunta del auditor: ${c.pregunta_auditor} Error común: ${c.error_comun}`;
  v.innerHTML = `${cabecera('', { atras: '#/controles', acciones: botonVoz(`ctrl-${id}`, textoVoz) })}
  <header class="leccion-cabecera"><p class="antetitulo">Control ${esc(c.tema.toLowerCase())} · Anexo A ${esc(c.id)}${c.nuevo2022 ? ' · nuevo en 2022' : ''}</p><h1>${esc(c.id)} ${esc(c.titulo)}</h1></header>
  <div class="tarjeta">
    <p class="antetitulo">Atributos según la ISO/IEC 27002:2022</p>
    <div class="chips" style="margin-bottom:8px">${(a.tipo || []).map((t) => `<span class="chip marca">${esc(t)}</span>`).join('')}${chipsCID(a.cid)}</div>
    <div class="chips">${(a.ciber || []).map((t) => `<span class="chip">${esc(t)}</span>`).join('')}${(a.dominio || []).map((t) => `<span class="chip alerta">${esc(t)}</span>`).join('')}</div>
  </div>
  ${seccionHTML({ tipo: 'idea', etiqueta: `Control ${c.id}`, titulo: 'Qué es', texto: c.que_es }, `c${id}-1`)}
  ${seccionHTML({ tipo: 'explicacion', etiqueta: 'Riesgo que trata', titulo: 'Por qué importa', texto: c.por_que }, `c${id}-2`)}
  ${seccionHTML({ tipo: 'empresa', titulo: 'Ejemplo', texto: c.ejemplo }, `c${id}-3`)}
  ${seccionHTML({ tipo: 'pasos', etiqueta: 'Evidencias', titulo: 'Lo que mostrarías al auditor', items: c.evidencia || [] }, `c${id}-4`)}
  ${seccionHTML({ tipo: 'auditor', titulo: 'Pregunta típica del auditor', texto: c.pregunta_auditor }, `c${id}-5`)}
  ${seccionHTML({ tipo: 'error', etiqueta: 'Cuidado', titulo: 'Error común', texto: c.error_comun }, `c${id}-6`)}
  ${(c.relacion || []).length ? `<div class="tarjeta"><p class="antetitulo">Relacionados</p><div class="chips">${c.relacion.map((r) => (CTRL.has(r) ? `<button class="chip marca" data-ir="#/control/${r}">${esc(r)} ${esc(CTRL.get(r).titulo)}</button>` : `<span class="chip">${esc(r)}</span>`)).join('')}</div></div>` : ''}
  <div class="botonera">
    ${preg.length ? `<button class="boton primario" data-accion="practica-control" data-c="${id}">${ico('practicar')} Practicar (${preg.length})</button>` : ''}
    <button class="boton" data-accion="dominar-ctrl" data-c="${id}">${dom ? `${ico('check')} Dominado` : 'Marcar como dominado'}</button>
  </div>
  <div class="botonera">${ant ? `<button class="boton fantasma" data-ir="#/control/${ant.id}">${ico('atras', 'chico')} ${ant.id}</button>` : ''}${sig ? `<button class="boton fantasma" data-ir="#/control/${sig.id}">${sig.id} ${ico('sig', 'chico')}</button>` : ''}</div>`;
}
ACCIONES['dominar-ctrl'] = (b) => { const id = b.dataset.c; const x = E.controles[id] || (E.controles[id] = {}); x.dominado = !x.dominado; guardar(); render(); };

/* ===================== GLOSARIO ===================== */
let filtroGlosa = '';
function vistaGlosario(v) {
  const G = [...(C.glosario || [])].sort((a, b) => a.termino.localeCompare(b.termino, 'es'));
  v.innerHTML = `${cabecera('Glosario', { atras: '#/biblioteca', ante: `${G.length} términos` })}
  <div class="campo-busqueda">${ico('lupa')}<input id="buscar-glosa" type="search" placeholder="Busca un término…" value="${esc(filtroGlosa)}" aria-label="Buscar en el glosario"></div>
  <div class="tarjeta compacta" id="lista-glosa"></div>`;
  const pintar = () => {
    const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const q = norm(filtroGlosa.trim());
    const lista = G.filter((g) => !q || norm(g.termino).includes(q) || norm(g.definicion).includes(q));
    let letra = '';
    $('#lista-glosa').innerHTML = lista.length ? lista.map((g, k) => {
      const l = norm(g.termino)[0]?.toUpperCase() || ''; const cab = l !== letra ? `<div class="letra-indice">${esc(l)}</div>` : ''; letra = l;
      return `${cab}<details class="glosa"><summary>${esc(g.termino)}${ico('sig', 'chico')}</summary><div class="def">${fmt(g.definicion)}${g.ejemplo ? `<p><strong>Ejemplo:</strong> ${negritas(g.ejemplo)}</p>` : ''}${g.ref ? `<span class="ref">${esc(g.ref)}</span>` : ''}<div style="margin-top:8px">${botonVoz(`g-${k}`, `${g.termino}. ${g.definicion}. ${g.ejemplo ? `Ejemplo: ${g.ejemplo}` : ''}`)}</div></div></details>`;
    }).join('') : `<div class="vacio">${ico('lupa')}<p>Sin resultados.</p></div>`;
    refrescarBotonesVoz();
  };
  pintar();
  $('#buscar-glosa').addEventListener('input', (e) => { filtroGlosa = e.target.value; pintar(); });
}

/* ===================== PLAN ===================== */
function vistaPlan(v) {
  const P = C.metodo?.plan || []; const d = diaDelPlan();
  const hechos = P.filter((p) => E.plan[p.dia]).length;
  v.innerHTML = `${cabecera('Plan de 4 semanas', { atras: '#/biblioteca', ante: `${hechos} de ${P.length} días completados` })}
  <div class="tarjeta"><p style="margin:0" class="tenue">Unos 35 a 45 minutos al día. Si un día no puedes, no te saltes: continúa con el siguiente pendiente. Marca cada día al terminarlo.</p>${barra(hechos, P.length, 'ok')}</div>
  ${[1, 2, 3, 4].map((s) => `<h2>Semana ${s}: ${['Fundamentos', 'Requisitos de la ISO/IEC 27001', 'Controles de la ISO/IEC 27002', 'Auditoría, caso y simulacros'][s - 1]}</h2><div class="tarjeta compacta"><ul class="lista">${P.filter((p) => p.semana === s).map((p) => `<li><div class="item"><button class="num ${E.plan[p.dia] ? 'hecho' : p.dia === d ? 'leido' : ''}" data-accion="plan-marcar" data-d="${p.dia}" aria-label="Marcar el día ${p.dia}" style="border:0">${E.plan[p.dia] ? ico('check', 'chico') : p.dia}</button><span class="cuerpo"><strong>${esc(p.tarea)}</strong><span>${p.dia === d ? 'Hoy te toca este día' : `Día ${p.dia}`}</span></span><button class="btn-icono" data-accion="plan-ir" data-d="${p.dia}" aria-label="Ir a la tarea">${ico('sig')}</button></div></li>`).join('')}</ul></div>`).join('')}`;
}
ACCIONES['plan-marcar'] = (b) => { const k = b.dataset.d; E.plan[k] = !E.plan[k]; guardar(); render(); };
ACCIONES['plan-ir'] = (b) => {
  const p = (C.metodo?.plan || []).find((x) => String(x.dia) === b.dataset.d); if (!p) return;
  if (p.accion === 'metodo') ir('#/metodo');
  else if (p.accion === 'modulo') ir(`#/modulo/${p.modulo}`);
  else if (p.accion === 'bloque') iniciarPracticaBloque(p.bloque);
  else if (p.accion === 'examen') iniciarExamen();
  else if (p.accion === 'inteligente') iniciarPracticaInteligente();
  else if (p.accion === 'traductor') iniciarTraductor();
  else if (p.accion === 'repaso') { cargarCapitulo(CAP.has('repaso') ? 'repaso' : 'intro'); ir('#/escuchar'); }
};

/* ===================== ESTADÍSTICAS ===================== */
function vistaEstadisticas(v) {
  const dias = Object.values(E.dias); const seg = dias.reduce((s, d) => s + d.seg, 0); const preg = dias.reduce((s, d) => s + d.preguntas, 0); const ac = dias.reduce((s, d) => s + d.aciertos, 0);
  const porBloque = BLOQUES.map((b) => { let vis = 0; let a = 0; for (const p of PREG.values()) if (p.bloque === b) { const r = E.preguntas[p.id]; if (r) { vis += r.vistas; a += r.aciertos; } } return [b, vis, a]; });
  const mods = MODULOS.map((m) => [m, estadisticaModulo(m.id)]).filter(([, e]) => e.respondidas > 0).sort((x, y) => x[1].precision - y[1].precision);
  v.innerHTML = `${cabecera('Mis estadísticas', { atras: '#/biblioteca' })}
  <div class="rejilla">
    <div class="tarjeta"><p class="antetitulo">Tiempo total</p><div class="cifra-mediana">${Math.floor(seg / 3600)} h ${Math.floor((seg % 3600) / 60)} min</div></div>
    <div class="tarjeta"><p class="antetitulo">Racha</p><div class="cifra-mediana">${plural(racha(), 'día', 'días')}</div></div>
    <div class="tarjeta"><p class="antetitulo">Preguntas respondidas</p><div class="cifra-mediana">${preg}</div></div>
    <div class="tarjeta"><p class="antetitulo">Acierto global</p><div class="cifra-mediana">${pct(ac, preg)} %</div></div>
  </div>
  <div class="tarjeta"><p class="antetitulo">Acierto por bloque</p>${porBloque.map(([b, vis, a]) => `<div style="margin:10px 0"><div class="fila-flex entre pequeno"><span>${esc(b)}</span><span class="tenue">${vis ? `${pct(a, vis)} %` : 'sin datos'}</span></div>${barra(a, vis || 1, 'ok')}</div>`).join('')}</div>
  ${mods.length ? `<div class="tarjeta"><p class="antetitulo">Tus temas más débiles primero</p><ul class="lista">${mods.slice(0, 8).map(([m, e]) => `<li><button class="item" data-accion="practica-modulo" data-mod="${m.id}"><span class="num">${m.orden}</span><span class="cuerpo"><strong>${esc(m.titulo)}</strong><span>${e.precision} % de acierto · ${e.respondidas}/${e.total} preguntas vistas</span></span>${ico('practicar', 'chico')}</button></li>`).join('')}</ul></div>` : ''}
  <div class="tarjeta"><p class="antetitulo">Exámenes simulados</p>${E.examenes.length ? `<ul class="lista">${E.examenes.slice(-8).reverse().map((x) => `<li><div class="item"><span class="num ${x.nota >= 14 ? 'hecho' : ''}">${String(x.nota).replace('.', ',')}</span><span class="cuerpo"><strong>${x.nota >= 14 ? 'Aprobado' : 'Desaprobado'} · ${x.aciertos}/${x.total}</strong><span>${esc(x.fecha)} · ${mmss(x.seg)} min</span></span></div></li>`).join('')}</ul>` : '<p class="tenue">Aún no has rendido un examen simulado.</p>'}</div>
  <div class="tarjeta"><p class="antetitulo">Modo estudio</p><p style="margin:4px 0">${plural(E.foco.sesiones, 'sesión', 'sesiones')} · ${E.foco.minutos} minutos enfocados · ${plural(E.foco.distracciones, 'salida', 'salidas')} de la app durante los bloques.</p><p class="tenue">${E.foco.sesiones ? `Promedio: ${(E.foco.distracciones / E.foco.sesiones).toFixed(1).replace('.', ',')} salidas por bloque. La meta es acercarte a cero.` : 'Prueba un bloque de 25 minutos desde Inicio.'}</p></div>`;
}

/* ===================== AJUSTES ===================== */
function vistaAjustes(v) {
  const A = E.ajustes;
  const seg = (k, ops) => `<div class="segmentado" role="group">${ops.map(([val, t]) => `<button data-accion="ajuste" data-k="${k}" data-v="${val}" aria-pressed="${String(A[k]) === String(val)}">${t}</button>`).join('')}</div>`;
  const sw = (k, txt) => `<button class="interruptor" role="switch" aria-checked="${!!A[k]}" data-accion="alternar-ajuste" data-k="${k}" aria-label="${esc(txt)}"></button>`;
  v.innerHTML = `${cabecera('Ajustes', { atras: '#/biblioteca' })}
  <div class="tarjeta">
    <div class="ajuste"><div class="txt"><strong>Tema</strong><span>Oscuro cansa menos de noche</span></div>${seg('tema', [['auto', 'Auto'], ['claro', 'Claro'], ['oscuro', 'Oscuro']])}</div>
    <div class="ajuste"><div class="txt"><strong>Movimiento</strong><span>Animaciones cortas o reducidas al mínimo</span></div>${seg('movimiento', [['sistema', 'Normal'], ['reducido', 'Reducido']])}</div>
    <div class="ajuste"><div class="txt"><strong>Tamaño de letra</strong><span>${Math.round(A.escala * 100)} %</span></div>${seg('escala', [['0.9', 'A−'], ['1', 'A'], ['1.12', 'A+'], ['1.25', 'A++']])}</div>
    <div class="ajuste"><div class="txt"><strong>Meta diaria</strong><span>Minutos de estudio por día</span></div>${seg('meta', [['15', '15'], ['30', '30'], ['45', '45'], ['60', '60']])}</div>
  </div>
  <div class="tarjeta">
    <div class="ajuste"><div class="txt"><strong>Sonidos</strong><span>Tono de acierto y alerta de error</span></div>${sw('sonido', 'Sonidos')}</div>
    <div class="ajuste"><div class="txt"><strong>Vibración</strong><span>El teléfono vibra cuando fallas</span></div>${sw('vibracion', 'Vibración')}</div>
    <div class="ajuste"><div class="txt"><strong>Ruido de fondo en el modo estudio</strong><span>Ruido marrón suave que cubre los sonidos del entorno</span></div>${sw('ruido', 'Ruido de fondo')}</div>
    <div class="ajuste"><div class="txt"><strong>Velocidad de la voz</strong><span>Lectura en voz alta de las tarjetas</span></div>${seg('velVoz', [['0.85', 'Lenta'], ['1', 'Normal'], ['1.2', 'Rápida']])}</div>
    <button class="boton ancho" data-accion="probar-voz">${ico('voz')} Probar la voz</button>
  </div>
  <div class="tarjeta">
    <p class="antetitulo">Tu progreso</p>
    <p class="tenue" style="margin-top:0">Se guarda solo en este dispositivo. Copia el respaldo si vas a cambiar de teléfono.</p>
    <div class="botonera"><button class="boton" data-accion="exportar">Copiar respaldo</button><button class="boton" data-accion="importar">Restaurar respaldo</button></div>
    <button class="boton peligro ancho" style="margin-top:10px" data-accion="reiniciar">Borrar todo el progreso</button>
  </div>
  ${NAT && NAT.buscarActualizacion ? `<div class="tarjeta">
    <p class="antetitulo">Actualizaciones</p>
    <p class="tenue" style="margin-top:0">La app revisa sola al abrirse si hay una versión nueva y te pregunta antes de instalarla. Tu progreso se conserva.</p>
    <button class="boton ancho" data-accion="buscar-actualizacion">${ico('repetir')} Buscar actualizaciones</button>
  </div>` : ''}
  <p class="tenue pie-version"><img src="marca/sello.svg" alt="">Versión ${esc((NAT && NAT.version && NAT.version()) || 'web')} · contenido del ${esc(C.generado || '')}</p>`;
}
ACCIONES['buscar-actualizacion'] = () => { avisar('Buscando una versión nueva…'); NAT.buscarActualizacion(); };
Object.assign(ACCIONES, {
  ajuste: (b) => { const k = b.dataset.k; const val = b.dataset.v; E.ajustes[k] = ['escala', 'meta', 'velVoz'].includes(k) ? Number(val) : val; guardar(); aplicarTema(); render(); },
  'probar-voz': () => Voz.hablar('Pérdida de confidencialidad: la información se divulga a personas no autorizadas. Así suena la lectura en voz alta.', 'prueba'),
  exportar: () => {
    const t = JSON.stringify(E);
    abrirCapa(`<h2>Respaldo de tu progreso</h2><p class="subtitulo">Copia este texto y guárdalo (por ejemplo, envíatelo por correo).</p><textarea class="caja" readonly id="txt-respaldo">${esc(t)}</textarea><div class="botonera"><button class="boton primario" id="btn-copiar">Copiar</button><button class="boton" data-accion="cerrar-capa">Cerrar</button></div>`);
    $('#btn-copiar').onclick = async () => { try { await navigator.clipboard.writeText(t); avisar('Respaldo copiado.', 'ok'); } catch (e) { $('#txt-respaldo').select(); document.execCommand('copy'); avisar('Respaldo copiado.', 'ok'); } };
  },
  importar: () => {
    abrirCapa(`<h2>Restaurar respaldo</h2><p class="subtitulo">Pega el texto del respaldo. Reemplazará el progreso actual.</p><textarea class="caja" id="txt-importar"></textarea><div class="botonera"><button class="boton" data-accion="cerrar-capa">Cancelar</button><button class="boton primario" id="btn-importar">Restaurar</button></div>`);
    $('#btn-importar').onclick = () => { try { const g = JSON.parse($('#txt-importar').value); if (!g || g.v !== 1) throw new Error('formato'); localStorage.setItem(CLAVE_ESTADO, JSON.stringify(g)); location.reload(); } catch (e) { avisar('El texto no es un respaldo válido.', 'mal'); } };
  },
  reiniciar: () => confirmar('¿Borrar todo el progreso?', 'Se perderán tus avances, errores registrados, exámenes y estadísticas. No se puede deshacer.', () => { localStorage.removeItem(CLAVE_ESTADO); location.hash = '#/inicio'; location.reload(); }, 'Borrar', true),
});

/* ===================== CRÉDITOS ===================== */
function vistaCreditos(v) {
  v.innerHTML = `${cabecera('Fuentes y créditos', { atras: '#/biblioteca' })}
  <div class="tarjeta marca-app"><img src="marca/sello.svg" alt=""><div><strong>ISO 27001 Aprende</strong><span>Curso de ISO/IEC 27001:2022 e ISO/IEC 27002:2022 · versión ${esc((NAT && NAT.version && NAT.version()) || 'web')}</span></div></div>
  <div class="tarjeta"><p class="antetitulo">Documentos revisados</p><ul class="resumen-lista">
    <li>NTP-ISO/IEC 27001:2022 (INACAL, 3.ª edición) y su Modificación Técnica 1:2024 sobre cambio climático.</li>
    <li>NTP-ISO/IEC 27002:2022 (INACAL): los 93 controles, su finalidad, orientación y atributos.</li>
    <li>ISO/IEC 27000:2026: visión general, conceptos, principios y familia de normas.</li>
    <li>SGS Academy, curso «Interpretación, implementación y formación de auditor interno ISO/IEC 27001:2022 – 27002:2022», sesiones 1 a 7 (docente: Ing. Mario César García Freitas).</li>
    <li>Caso 1 de la sesión 1: implementación de ISO 27001 desde cero en una empresa manufacturera.</li>
    <li>Talleres y formatos del docente: FODA, PESTEL, cinco fuerzas de Porter y alcance (sesión 2); Guía 001 de la política (sesión 3); diagnóstico inicial, matriz de evaluación de riesgos, tabla y taller de la Declaración de Aplicabilidad y guía de controles (sesión 4); herramienta de análisis de brechas (sesión 7). Los módulos 26 a 31, 36 y 39 y las herramientas del curso se basan en ellos.</li>
    <li>Modelos de documentos de SGS: política, manual, Declaración de Aplicabilidad, matrices RACI y listado de entregables de una implementación.</li>
  </ul></div>
  <div class="tarjeta"><p class="antetitulo">Derechos de autor</p><p style="margin:0">Las normas ISO/IEC y NTP son documentos con derechos reservados. Esta app no reproduce su texto: lo explica con palabras propias, con ejemplos, y cita la cláusula o el control al que se refiere. Para el texto oficial consulta tu ejemplar de la norma.</p></div>
  <div class="tarjeta"><p class="antetitulo">Audio</p><p style="margin:0">Audiolibro narrado con voz sintética neuronal en español del Perú. La lectura en voz alta de las tarjetas usa la voz instalada en tu teléfono.</p></div>
  <div class="tarjeta"><p class="antetitulo">Iconos y letra</p><p style="margin:0">Phosphor Icons (phosphoricons.com), de Helena Zhang y Tobias Fried, con licencia MIT. Letra IBM Plex Sans (IBM), con licencia SIL Open Font License 1.1.</p></div>`;
}

RUTAS.push(
  [/^#\/?$|^#\/inicio$/, vistaInicio, 'inicio'],
  [/^#\/aprender$/, vistaAprender, 'aprender'],
  [/^#\/modulo\/(m\d\d)$/, vistaModulo, 'aprender'],
  [/^#\/metodo$/, vistaMetodo, 'aprender'],
  [/^#\/escuchar$/, vistaEscuchar, 'escuchar'],
  [/^#\/biblioteca$/, vistaBiblioteca, 'biblioteca'],
  [/^#\/controles$/, vistaControles, 'biblioteca'],
  [/^#\/control\/([5-8]\.\d{1,2})$/, vistaControl, 'biblioteca'],
  [/^#\/glosario$/, vistaGlosario, 'biblioteca'],
  [/^#\/plan$/, vistaPlan, 'biblioteca'],
  [/^#\/estadisticas$/, vistaEstadisticas, 'biblioteca'],
  [/^#\/ajustes$/, vistaAjustes, 'biblioteca'],
  [/^#\/creditos$/, vistaCreditos, 'biblioteca'],
);
