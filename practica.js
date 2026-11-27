/* ISO 27001 Aprende — práctica: sesiones de preguntas, examen simulado, tarjetas, constructor de riesgos
   y modo estudio. Al final, el arranque de la app. */
'use strict';

/* ===================== PRACTICAR (menú) ===================== */
function vistaPracticar(v) {
  const pend = preguntasPendientes().length; const err = preguntasConError().length;
  const pendT = tarjetasPendientes().length;
  v.innerHTML = `${cabecera('Practicar', { ante: `${PREG.size} preguntas con explicación de cada error` })}
  <div class="tarjeta destacada">
    <p class="antetitulo">Recomendado</p>
    <h3 style="font-size:1.15rem">Práctica inteligente</h3>
    <p class="tenue" style="margin:2px 0 0">15 preguntas que mezclan tus pendientes, tus temas débiles y temas nuevos de lo que ya leíste.</p>
    <button class="boton sobre ancho" style="margin-top:14px" data-accion="practica-inteligente">${ico('rayo')} Empezar</button>
  </div>
  <div class="rejilla">
    ${accionRapida('repetir', `Repaso de errores · ${err}`, err ? 'Lo que fallaste, hasta dominarlo' : 'Aún no tienes errores registrados', 'data-accion="practica-errores"')}
    ${typeof SIMULACRO !== 'undefined' ? accionRapida('trofeo', 'Simulacro del parcial', `${SIMULACRO.length} preguntas · 40 min · sesiones 1 a 6`, 'data-accion="simulacro-parcial"') : ''}
    ${typeof CUESTIONARIOS !== 'undefined' ? CUESTIONARIOS.map((c) => accionRapida('examen', c.titulo, `${c.preguntas.length} preguntas del docente · ${c.sub}`, `data-accion="cuestionario-docente" data-c="${c.id}"`)).join('') : ''}
    ${accionRapida('examen', 'Examen simulado', '40 preguntas · 60 min · aprueba con 14', 'data-accion="examen"')}
    ${accionRapida('traducir', 'Traductor CID', `${(C.traductor || []).length} frases para redactar con lenguaje normativo`, 'data-accion="traductor"')}
    ${accionRapida('pieza', 'Constructor de riesgos', `${(C.riesgos || []).length} casos con la estructura del curso`, 'data-ir="#/riesgos"')}
    ${accionRapida('tarjetas', `Tarjetas${pendT ? ` · ${pendT} hoy` : ''}`, 'Conceptos, glosario y los 93 controles', 'data-ir="#/tarjetas"')}
    ${accionRapida('escudo', '¿Qué control es?', 'Escenarios para elegir el control correcto', 'data-accion="practica-controles"')}
    ${accionRapida('grafico', 'Herramientas del curso', 'Los formatos del docente: riesgo, SoA, alcance y más', 'data-ir="#/herramientas"')}
  </div>
  ${pend ? `<div class="tarjeta"><div class="fila-flex entre"><div><p class="antetitulo">Para hoy</p><strong>${plural(pend, 'pregunta pendiente', 'preguntas pendientes')} de repaso</strong></div><button class="boton primario" data-accion="practica-pendientes">Repasar</button></div></div>` : ''}
  <h2>Por bloque</h2>
  <div class="tarjeta compacta"><ul class="lista">${BLOQUES.map((b) => { const n = [...PREG.values()].filter((p) => p.bloque === b && p.tipo !== 'traductor').length; return n ? `<li><button class="item" data-accion="practica-bloque" data-b="${esc(b)}"><span class="num">${ico('practicar', 'chico')}</span><span class="cuerpo"><strong>${esc(b)}</strong><span>${n} preguntas · se eligen 15 al azar</span></span>${ico('sig', 'chico')}</button></li>` : ''; }).join('')}</ul></div>
  <h2>Por módulo</h2>
  <div class="tarjeta compacta"><ul class="lista">${MODULOS.map((m) => { const e = estadisticaModulo(m.id); return `<li><button class="item" data-accion="practica-modulo" data-mod="${m.id}"><span class="num ${estadoModulo(m.id).completado ? 'hecho' : ''}">${m.orden}</span><span class="cuerpo"><strong>${esc(m.titulo)}</strong><span>${e.total} preguntas${e.respondidas ? ` · ${e.precision} % de acierto` : ''}</span></span>${ico('sig', 'chico')}</button></li>`; }).join('')}</ul></div>`;
}

/* ===================== motor de sesiones ===================== */
let SES = null;
function nuevaSesion(ids, opciones) {
  ids = ids.filter((id) => PREG.has(id));
  if (!ids.length) { avisar('No hay preguntas disponibles para esta práctica.'); return; }
  SES = Object.assign({
    titulo: 'Práctica', modo: 'practica', cola: ids, i: 0, resultados: {}, reinsertadas: {}, errSeguidos: 0,
    inicio: Date.now(), elegida: null, respondida: false, orden: {}, alTerminar: null, limiteSeg: 0,
  }, opciones);
  ir('#/sesion');
}
const elegirAzar = (ids, n) => barajar(ids).slice(0, n);
function idsDeModulos(filtro) { return [...PREG.values()].filter((p) => p.tipo !== 'traductor' && p.tipo !== 'simulacro' && filtro(p)).map((p) => p.id); }
function iniciarPracticaModulo(mid) { const m = MOD.get(mid); nuevaSesion(barajar(idsDeModulos((p) => p.modulo === mid)), { titulo: `Módulo ${m.orden}: ${m.titulo}` }); }
function iniciarPracticaBloque(b) { nuevaSesion(elegirAzar(idsDeModulos((p) => p.bloque === b), 15), { titulo: b }); }
function iniciarPracticaInteligente() {
  const pend = barajar(preguntasPendientes());
  const err = barajar(preguntasConError().filter((id) => !pend.includes(id)));
  const leidos = new Set(MODULOS.filter((m) => estadoModulo(m.id).leido || estadoModulo(m.id).lectura > 0.3).map((m) => m.id));
  if (!leidos.size) leidos.add(siguienteModulo().id);
  const nuevas = barajar(idsDeModulos((p) => leidos.has(p.modulo) && !E.preguntas[p.id]));
  const debiles = MODULOS.map((m) => [m.id, estadisticaModulo(m.id)]).filter(([, e]) => e.respondidas >= 3 && e.precision < 75).map(([id]) => id);
  const deDebiles = barajar(idsDeModulos((p) => debiles.includes(p.modulo)));
  const set = []; const meter = (arr, n) => { for (const id of arr) { if (set.length >= 15 || n <= 0) break; if (!set.includes(id)) { set.push(id); n--; } } };
  meter(pend, 6); meter(err, 3); meter(deDebiles, 3); meter(nuevas, 15); meter(barajar(idsDeModulos(() => true)), 15);
  nuevaSesion(barajar(set), { titulo: 'Práctica inteligente' });
}
function iniciarRepasoErrores() { const ids = preguntasConError(); if (!ids.length) { avisar('No tienes errores pendientes', 'ok'); return; } nuevaSesion(barajar(ids).slice(0, 20), { titulo: 'Repaso de errores', modo: 'errores' }); }
function iniciarPendientes() { const ids = preguntasPendientes(); if (!ids.length) { avisar('Nada pendiente para hoy.', 'ok'); return; } nuevaSesion(barajar(ids).slice(0, 25), { titulo: 'Repaso pendiente de hoy' }); }
function iniciarTraductor() { const ids = [...PREG.keys()].filter((id) => id.startsWith('tr-')); nuevaSesion(elegirAzar(ids, 10), { titulo: 'Traductor CID' }); }
function iniciarMiniExamen(mid) {
  const m = MOD.get(mid); const ps = barajar((m.preguntas || []).map((p) => p.id));
  const conCaso = ps.filter((id) => PREG.get(id).caso); const sinCaso = ps.filter((id) => !PREG.get(id).caso);
  const sel = barajar([...conCaso.slice(0, 2), ...sinCaso.slice(0, 4)]).slice(0, 6);
  while (sel.length < Math.min(6, ps.length)) { const x = ps.find((id) => !sel.includes(id)); if (!x) break; sel.push(x); }
  nuevaSesion(sel, {
    titulo: `Mini examen · Módulo ${m.orden}`, modo: 'mini', modulo: mid,
    alTerminar: (s) => { const ok = Object.values(s.resultados).filter((r) => r.primeraOk).length; const n = Object.keys(s.resultados).length; const nota = pct(ok, n); const st = estadoModulo(mid); st.nota = Math.max(st.nota || 0, nota); if (nota >= 80) { st.completado = st.completado || hoy(); st.leido = st.leido || hoy(); } guardar(); return nota >= 80 ? 'Módulo dominado. Ya cuenta en tu avance.' : 'Te falta poco: repasa las claves de tus errores y vuelve a intentarlo.'; },
  });
}
function iniciarSimulacroParcial() {
  const ids = barajar(SIMULACRO.map((p) => p.id));
  const empezar = () => nuevaSesion(ids, { titulo: 'Simulacro del parcial', modo: 'examen', limiteSeg: 2400, respuestas: {} });
  confirmar('Simulacro del parcial', `${ids.length} preguntas del repaso de las sesiones 1 a 6, en 40 minutos, como la evaluación del martes 24. Verás las respuestas y su explicación al final. Nota sobre 20.`, empezar, 'Empezar');
}
function iniciarCuestionarioDocente(cid) {
  const c = CUESTIONARIOS.find((x) => x.id === cid);
  if (!c) return;
  const ids = c.preguntas.map((p) => p.id);
  const empezar = () => nuevaSesion(ids, { titulo: c.titulo, modo: 'examen', limiteSeg: Math.max(600, ids.length * 60), respuestas: {} });
  confirmar(c.titulo, `Las ${ids.length} preguntas del docente (${c.sub}), en el mismo orden del formulario. Verás la respuesta y el porqué de cada una al final. Nota sobre 20.`, empezar, 'Empezar');
}
function iniciarExamen() {
  const cuota = { Fundamentos: 10, 'Requisitos ISO/IEC 27001': 14, 'Controles ISO/IEC 27002': 12, 'Auditoría y caso práctico': 4 };
  let ids = [];
  BLOQUES.forEach((b) => { ids = ids.concat(elegirAzar(idsDeModulos((p) => p.bloque === b), cuota[b])); });
  if (ids.length < 40) ids = ids.concat(elegirAzar(idsDeModulos((p) => !ids.includes(p.id)), 40 - ids.length));
  const empezar = () => nuevaSesion(barajar(ids), { titulo: 'Examen simulado', modo: 'examen', limiteSeg: 3600, respuestas: {} });
  confirmar('Examen simulado', `${ids.length} preguntas, 60 minutos. No verás las respuestas hasta el final, como en el examen real. Nota sobre 20; se aprueba con 14.`, empezar, 'Empezar');
}
Object.assign(ACCIONES, {
  'practica-inteligente': () => iniciarPracticaInteligente(),
  'practica-errores': () => iniciarRepasoErrores(),
  'practica-pendientes': () => iniciarPendientes(),
  'practica-modulo': (b) => iniciarPracticaModulo(b.dataset.mod),
  'practica-bloque': (b) => iniciarPracticaBloque(b.dataset.b),
  'practica-controles': () => nuevaSesion(elegirAzar(idsDeModulos((p) => p.bloque === 'Controles ISO/IEC 27002' && (p.nivel >= 2 || p.caso)), 15), { titulo: '¿Qué control es?' }),
  'practica-control': (b) => nuevaSesion(barajar(PREG_CTRL.get(b.dataset.c) || []), { titulo: `Control ${b.dataset.c}` }),
  'mini-examen': (b) => iniciarMiniExamen(b.dataset.mod),
  traductor: () => iniciarTraductor(),
  examen: () => iniciarExamen(),
  'simulacro-parcial': () => iniciarSimulacroParcial(),
  'cuestionario-docente': (b) => iniciarCuestionarioDocente(b.dataset.c),
});

/* ===================== pantalla de pregunta ===================== */
let relojExamen = null;
function vistaSesion(v) {
  if (!SES) { ir('#/practicar'); return; }
  antesDeSalir = () => {
    if (!SES || SES.terminada) return false;
    confirmar('¿Salir de la práctica?', SES.modo === 'examen' ? 'El examen se anulará.' : 'Lo que ya respondiste queda guardado.', () => { SES = null; antesDeSalir = null; clearInterval(relojExamen); ir('#/practicar'); }, 'Salir');
    return true;
  };
  if (SES.terminada) { pintarResultado(v); return; }
  const id = SES.cola[SES.i]; const p = PREG.get(id);
  if (!SES.orden[`${id}#${SES.i}`]) SES.orden[`${id}#${SES.i}`] = barajar(p.opciones.map((_, k) => k));
  const orden = SES.orden[`${id}#${SES.i}`];
  const total = SES.cola.length; const m = MOD.get(p.modulo);
  const ex = SES.modo === 'examen'; const elegidaEx = ex ? SES.respuestas[SES.i] : null;
  const vozTxt = `${p.caso ? `${p.caso}. ` : ''}${p.enunciado}. ${orden.map((k, n) => `Opción ${'ABCD'[n]}: ${p.opciones[k].texto}`).join('. ')}`;
  v.innerHTML = `<div class="sesion-cab">
      <button class="btn-icono" data-accion="salir-sesion" aria-label="Salir">${ico('x')}</button>
      ${barra(SES.i, total)}
      <span class="contador">${SES.i + 1}/${total}</span>
      ${ex ? `<span class="chip alerta" id="reloj-examen">${ico('reloj', 'chico')} ${mmss(SES.limiteSeg - (Date.now() - SES.inicio) / 1000)}</span>` : ''}
    </div>
    <article class="tarjeta pregunta" id="tarjeta-pregunta">
      <div class="meta"><span class="chip marca">${esc(SES.titulo)}</span>${m && p.tipo !== 'simulacro' ? `<span class="chip">Módulo ${m.orden}</span>` : ''}<span class="chip">${['', 'Recordar', 'Aplicar', 'Analizar caso'][p.nivel] || ''}</span>${(SES.reinsertadas[id] && !ex) ? '<span class="chip mal">Segunda oportunidad</span>' : ''}<span style="margin-left:auto">${botonVoz(`p-${id}`, vozTxt)}</span></div>
      ${p.caso ? `<div class="caso">${negritas(p.caso)}</div>` : ''}
      <h2 class="enunciado">${negritas(p.enunciado)}</h2>
      <div class="opciones" role="group" aria-label="Opciones">
        ${orden.map((k, n) => `<button class="opcion ${elegidaEx === k ? 'elegida' : ''}" data-accion="responder" data-k="${k}"><span class="letra">${'ABCD'[n]}</span><span>${negritas(p.opciones[k].texto)}</span></button>`).join('')}
      </div>
      <div id="retro"></div>
    </article>
    ${ex ? `<div class="botonera"><button class="boton" data-accion="ex-anterior" ${SES.i === 0 ? 'disabled' : ''}>${ico('atras', 'chico')} Anterior</button><button class="boton primario" data-accion="ex-siguiente">${SES.i === total - 1 ? 'Terminar examen' : 'Siguiente'} ${ico('sig', 'chico')}</button></div>
      <p class="tenue" style="text-align:center">${Object.keys(SES.respuestas).length} de ${total} respondidas</p>` : ''}`;
  if (ex) {
    clearInterval(relojExamen);
    relojExamen = setInterval(() => {
      if (!SES || SES.modo !== 'examen' || SES.terminada) { clearInterval(relojExamen); return; }
      const rest = SES.limiteSeg - (Date.now() - SES.inicio) / 1000; const r = $('#reloj-examen');
      if (r) r.innerHTML = `${ico('reloj', 'chico')} ${mmss(rest)}`;
      if (rest <= 0) { clearInterval(relojExamen); avisar('Se acabó el tiempo.', 'mal'); terminarSesion(); }
    }, 1000);
  }
}
function responder(k) {
  const id = SES.cola[SES.i]; const p = PREG.get(id);
  if (SES.modo === 'examen') { SES.respuestas[SES.i] = k; $$('.opcion').forEach((b) => b.classList.toggle('elegida', Number(b.dataset.k) === k)); return; }
  if (SES.respondida) return;
  SES.respondida = true;
  const ok = !!p.opciones[k].correcta; const kOk = p.opciones.findIndex((o) => o.correcta);
  registrarRespuesta(id, ok);
  const r = SES.resultados[id] || (SES.resultados[id] = { intentos: 0, primeraOk: null, ultimaOk: null });
  r.intentos++; if (r.primeraOk === null) { r.primeraOk = ok; r.elegida = k; } r.ultimaOk = ok;
  $$('.opcion').forEach((b) => {
    const kk = Number(b.dataset.k); b.disabled = true;
    if (kk === kOk) b.classList.add('correcta'); else if (kk === k) b.classList.add('incorrecta'); else b.classList.add('atenuada');
    if (kk === kOk) b.querySelector('.letra').innerHTML = ico('check', 'chico');
    if (kk === k && !ok) b.querySelector('.letra').innerHTML = ico('x', 'chico');
  });
  const retro = $('#retro'); const tarjeta = $('#tarjeta-pregunta');
  const m = MOD.get(p.modulo);
  if (ok) {
    SES.errSeguidos = 0;
    sonidoAcierto(); vibrar([0, 25]);
    retro.innerHTML = `<div class="retro bien"><h3>${ico('check')} Correcto</h3><div class="bloque-retro"><p>${negritas(p.opciones[k].explicacion)}</p></div>${p.ref ? `<span class="ref">${esc(p.ref)}</span>` : ''}</div>
      <div class="botonera"><button class="boton primario" data-accion="siguiente" id="btn-siguiente">Siguiente ${ico('sig', 'chico')}</button></div>`;
  } else {
    SES.errSeguidos++;
    sonidoError(); vibrar([0, 90, 70, 160]);
    tarjeta.classList.remove('sacudir', 'destello-mal'); void tarjeta.offsetWidth; tarjeta.classList.add('sacudir', 'destello-mal');
    const vuelve = SES.modo !== 'mini' && (SES.reinsertadas[id] || 0) < 2;
    if (vuelve) { SES.reinsertadas[id] = (SES.reinsertadas[id] || 0) + 1; const pos = Math.min(SES.cola.length, SES.i + 4); SES.cola.splice(pos, 0, id); }
    const espera = 3;
    retro.innerHTML = `<div class="retro mal" role="alert"><h3>${ico('alerta')} Atención: respuesta incorrecta</h3>
      <div class="bloque-retro"><small>Elegiste</small><p><strong>${negritas(p.opciones[k].texto)}</strong></p><p style="margin-top:4px">${negritas(p.opciones[k].explicacion)}</p></div>
      <div class="bloque-retro"><small>La respuesta correcta</small><p><strong>${negritas(p.opciones[kOk].texto)}</strong></p><p style="margin-top:4px">${negritas(p.opciones[kOk].explicacion)}</p></div>
      <div class="clave">${ico('memoria', 'chico')} ${negritas(p.clave)}</div>
      ${p.ref ? `<span class="ref">${esc(p.ref)}</span>` : ''}
      ${vuelve ? `<div class="vuelve">${ico('repetir', 'chico')} Esta pregunta volverá a aparecer en unos minutos.</div>` : ''}
      </div>
      <div class="botonera">${m ? `<button class="boton" data-ir="#/modulo/${m.id}">${ico('aprender', 'chico')} Repasar el módulo</button>` : ''}<button class="boton primario con-espera" style="--espera:${espera}s" data-accion="siguiente" id="btn-siguiente" disabled>Entendido</button></div>`;
    setTimeout(() => { const b = $('#btn-siguiente'); if (b) b.disabled = false; }, espera * 1000);
    setTimeout(() => retro.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120);
  }
  if (ok) setTimeout(() => retro.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
}
function siguientePregunta() {
  if (SES.errSeguidos >= 3) { SES.errSeguidos = 0; pausaPorErrores(); return; }
  SES.i++; SES.respondida = false;
  if (SES.i >= SES.cola.length) { terminarSesion(); return; }
  render(); animarEntrada($('#vista'), 'lado');
}
function pausaPorErrores() {
  $('#capa').dataset.fija = '1';
  abrirCapa(`<div style="text-align:center"><div class="respiracion">Respira</div><h2>Tres errores seguidos</h2><p class="subtitulo">No pasa nada: es la señal para bajar el ritmo. Respira con el círculo y, en la siguiente, lee el caso dos veces y busca la palabra clave antes de mirar las opciones.</p><button class="boton primario ancho con-espera" style="--espera:10s;margin-top:14px" id="btn-pausa" disabled>Continuar</button></div>`, () => { delete $('#capa').dataset.fija; });
  sonidoAviso(); vibrar([0, 60, 80, 60]);
  setTimeout(() => { const b = $('#btn-pausa'); if (b) { b.disabled = false; b.onclick = () => { cerrarCapa(); SES.i++; SES.respondida = false; if (SES.i >= SES.cola.length) terminarSesion(); else render(); }; } }, 10000);
}
function terminarSesion() {
  clearInterval(relojExamen);
  if (SES.modo === 'examen') {
    const unicos = SES.cola;
    unicos.forEach((id, idx) => {
      const k = SES.respuestas[idx]; const p = PREG.get(id); const ok = k !== undefined && !!p.opciones[k].correcta;
      registrarRespuesta(id, ok);
      SES.resultados[id] = { primeraOk: ok, elegida: k, intentos: 1 };
    });
    const ac = Object.values(SES.resultados).filter((r) => r.primeraOk).length;
    SES.nota = Math.round((ac / unicos.length) * 200) / 10;
    E.examenes.push({ fecha: hoy(), nota: SES.nota, aciertos: ac, total: unicos.length, seg: Math.round((Date.now() - SES.inicio) / 1000) });
    guardar();
  }
  SES.terminada = true; SES.fin = Date.now();
  if (SES.alTerminar) SES.mensaje = SES.alTerminar(SES);
  sonidoFin(); vibrar([0, 40, 60, 40]);
  render();
}
function pintarResultado(v) {
  const res = SES.resultados; const ids = Object.keys(res); const ok = ids.filter((id) => res[id].primeraOk).length;
  const fallos = ids.filter((id) => !res[id].primeraOk);
  const ex = SES.modo === 'examen';
  const porBloque = ex ? BLOQUES.map((b) => { const xs = ids.filter((id) => PREG.get(id).bloque === b); return [b, xs.filter((id) => res[id].primeraOk).length, xs.length]; }).filter((x) => x[2]) : [];
  const aprobado = ex ? SES.nota >= 14 : pct(ok, ids.length) >= 80;
  v.innerHTML = `${cabecera(SES.titulo, { ante: 'Resultado' })}
  <div class="tarjeta" style="text-align:center">
    ${ex ? `<p class="antetitulo">Nota vigesimal</p><div class="resultado-grande" style="color:${aprobado ? 'var(--ok)' : 'var(--mal)'}">${String(SES.nota).replace('.', ',')}</div><p><span class="chip ${aprobado ? 'ok' : 'mal'}">${aprobado ? 'Aprobado (mínimo 14)' : 'Desaprobado (mínimo 14)'}</span></p>`
      : `<div style="display:flex;justify-content:center">${anillo(ok, ids.length, `${pct(ok, ids.length)} %`, 'a la primera', aprobado ? 'var(--ok)' : 'var(--alerta)')}</div><p style="margin:10px 0 0"><span class="chip ${aprobado ? 'ok' : 'alerta'}">${aprobado ? 'Bien: 80 % o más' : 'Por reforzar: menos de 80 %'}</span></p>`}
    <p style="margin:10px 0 0"><strong>${ok} de ${ids.length}</strong> correctas a la primera · ${mmss((SES.fin - SES.inicio) / 1000)} min</p>
    ${SES.mensaje ? `<p class="subtitulo">${esc(SES.mensaje)}</p>` : ''}
  </div>
  ${porBloque.length ? `<div class="tarjeta"><p class="antetitulo">Por bloque</p>${porBloque.map(([b, a, n]) => `<div style="margin:10px 0"><div class="fila-flex entre pequeno"><span>${esc(b)}</span><span class="tenue">${a}/${n}</span></div>${barra(a, n, 'ok')}</div>`).join('')}</div>` : ''}
  <div class="botonera">${fallos.length ? `<button class="boton primario" data-accion="repasar-fallos">${ico('repetir')} ${fallos.length === 1 ? 'Repasar mi error' : `Repasar mis ${fallos.length} errores`}</button>` : ''}<button class="boton" data-accion="fin-sesion">Terminar</button></div>
  ${fallos.length ? `<h2>Lo que debes reforzar</h2>${fallos.map((id) => { const p = PREG.get(id); const r = res[id]; const kOk = p.opciones.findIndex((o) => o.correcta); return `<details class="tarjeta compacta"><summary style="cursor:pointer;font-weight:600;list-style:none;display:flex;gap:10px"><span style="color:var(--mal)">${ico('x', 'chico')}</span><span>${negritas(p.enunciado)}</span></summary><div style="margin-top:10px">${r.elegida !== undefined ? `<p class="pequeno"><strong>Elegiste:</strong> ${negritas(p.opciones[r.elegida].texto)}<br><span class="tenue">${negritas(p.opciones[r.elegida].explicacion)}</span></p>` : '<p class="pequeno tenue">Sin responder.</p>'}<p class="pequeno"><strong>Correcta:</strong> ${negritas(p.opciones[kOk].texto)}<br><span class="tenue">${negritas(p.opciones[kOk].explicacion)}</span></p><div class="retro mal" style="padding:10px 12px;margin-top:8px;border-width:1px"><strong>Clave:</strong> ${negritas(p.clave)}</div></div></details>`; }).join('')}` : ''}`;
  ACCIONES['repasar-fallos'] = () => { const xs = fallos; SES = null; nuevaSesion(barajar(xs), { titulo: 'Repaso de los errores', modo: 'errores' }); };
}
Object.assign(ACCIONES, {
  responder: (b) => responder(Number(b.dataset.k)),
  siguiente: () => siguientePregunta(),
  'salir-sesion': () => window.appAtras(),
  'fin-sesion': () => { const vuelta = SES && SES.modo === 'mini' ? `#/modulo/${SES.modulo}` : '#/practicar'; SES = null; antesDeSalir = null; ir(vuelta); },
  'ex-anterior': () => { if (SES.i > 0) { SES.i--; render(); } },
  'ex-siguiente': () => {
    if (SES.i < SES.cola.length - 1) { SES.i++; render(); return; }
    const faltan = SES.cola.length - Object.keys(SES.respuestas).length;
    confirmar('¿Terminar el examen?', faltan ? `Te faltan ${faltan} preguntas sin responder; contarán como incorrectas.` : 'Revisaremos tus respuestas.', () => terminarSesion(), 'Terminar');
  },
});
document.addEventListener('keydown', (e) => {
  if (!location.hash.startsWith('#/sesion') || !SES || SES.terminada || !$('#capa').hidden) return;
  const n = 'abcd'.indexOf(e.key.toLowerCase()); const num = '1234'.indexOf(e.key);
  const idx = n >= 0 ? n : num;
  const botones = $$('.opcion');
  if (idx >= 0 && botones[idx] && !botones[idx].disabled) { botones[idx].click(); return; }
  if (e.key === 'Enter') { const b = $('#btn-siguiente'); if (b && !b.disabled) b.click(); }
});

/* ===================== TARJETAS ===================== */
function todasLasTarjetas() {
  const t = [];
  MODULOS.forEach((m) => (m.tarjetas || []).forEach((x, k) => t.push({ id: `t-${m.id}-${k}`, mazo: m.id, frente: x.frente, reverso: x.reverso })));
  (C.glosario || []).forEach((g) => t.push({ id: `g-${g.termino}`, mazo: 'glosario', frente: g.termino, reverso: g.definicion }));
  CONTROLES.forEach((c) => {
    t.push({ id: `c-${c.id}`, mazo: 'controles', frente: `¿Qué control es el ${c.id}?`, reverso: `**${c.id} ${c.titulo}**\n\n${c.que_es}` });
    t.push({ id: `cn-${c.id}`, mazo: 'controles-num', frente: `¿Qué número tiene el control «${c.titulo}»?`, reverso: `**${c.id}** · control ${c.tema.toLowerCase()}\n\n${c.que_es}` });
  });
  return t;
}
function tarjetasPendientes() { const h = hoy(); return todasLasTarjetas().filter((x) => { const r = E.tarjetas[x.id]; return r && r.prox && r.prox <= h; }); }
let MAZO = null;
function vistaTarjetas(v) {
  if (MAZO && MAZO.cartas.length) { pintarCarta(v); return; }
  const T = todasLasTarjetas(); const pend = tarjetasPendientes();
  const nuevas = (f) => T.filter((x) => f(x) && !E.tarjetas[x.id]).length;
  const opcion = (k, titulo, sub) => `<li><button class="item" data-accion="mazo" data-k="${k}"><span class="num">${ico('tarjetas', 'chico')}</span><span class="cuerpo"><strong>${esc(titulo)}</strong><span>${esc(sub)}</span></span>${ico('sig', 'chico')}</button></li>`;
  v.innerHTML = `${cabecera('Tarjetas', { atras: '#/practicar', ante: 'Memoriza con repetición espaciada' })}
  <div class="tarjeta"><p class="tenue" style="margin:0">Lee el frente, intenta responder <strong>en voz alta</strong> y recién entonces toca la tarjeta para voltearla. Sé honesto al calificarte: lo que no sabías volverá pronto.</p></div>
  <div class="tarjeta compacta"><ul class="lista">
    ${pend.length ? opcion('pendientes', `Pendientes de hoy · ${pend.length}`, 'Primero esto') : ''}
    ${opcion('controles', 'Controles: número → nombre', `93 controles · ${nuevas((x) => x.mazo === 'controles')} sin ver`)}
    ${opcion('controles-num', 'Controles: nombre → número', `93 controles · ${nuevas((x) => x.mazo === 'controles-num')} sin ver`)}
    ${opcion('glosario', 'Glosario', `${(C.glosario || []).length} términos · ${nuevas((x) => x.mazo === 'glosario')} sin ver`)}
    ${MODULOS.filter((m) => (m.tarjetas || []).length).map((m) => opcion(m.id, `Módulo ${m.orden}: ${m.titulo}`, `${m.tarjetas.length} tarjetas`)).join('')}
  </ul></div>`;
}
function abrirMazo(k) {
  const T = todasLasTarjetas(); let cartas;
  if (k === 'pendientes') cartas = tarjetasPendientes();
  else { const del = T.filter((x) => x.mazo === k); const h = hoy(); cartas = [...del.filter((x) => E.tarjetas[x.id]?.prox <= h), ...barajar(del.filter((x) => !E.tarjetas[x.id])), ...del.filter((x) => E.tarjetas[x.id] && E.tarjetas[x.id].prox > h)]; }
  cartas = cartas.slice(0, 20);
  if (!cartas.length) { avisar('Este mazo no tiene tarjetas.'); return; }
  MAZO = { cartas, i: 0, volteada: false, ok: 0 }; ir('#/tarjetas'); render();
}
function pintarCarta(v) {
  const c = MAZO.cartas[MAZO.i];
  antesDeSalir = () => { MAZO = null; antesDeSalir = null; render(); return true; };
  v.innerHTML = `<div class="sesion-cab"><button class="btn-icono" data-accion="cerrar-mazo" aria-label="Salir">${ico('x')}</button>${barra(MAZO.i, MAZO.cartas.length)}<span class="contador">${MAZO.i + 1}/${MAZO.cartas.length}</span></div>
  <div class="mazo"><div class="carta ${MAZO.volteada ? 'volteada' : ''}" data-accion="voltear" role="button" aria-label="Voltear tarjeta">
    <div class="tarjeta cara"><p class="antetitulo">Pregunta</p><div class="grande">${negritas(c.frente)}</div><div class="pista">Responde en voz alta y toca para ver la respuesta</div></div>
    <div class="tarjeta cara reverso"><p class="antetitulo">Respuesta</p><div class="texto" style="line-height:1.6">${fmt(c.reverso)}</div></div>
  </div></div>
  ${MAZO.volteada ? `<div class="botonera"><button class="boton" style="color:var(--mal)" data-accion="calificar" data-n="0">No la sabía</button><button class="boton" data-accion="calificar" data-n="1">Dudé</button><button class="boton primario" data-accion="calificar" data-n="2">La sabía</button></div>`
    : `<div class="botonera"><button class="boton primario ancho" data-accion="voltear">Ver respuesta</button></div>`}
  <div style="text-align:center;margin-top:6px">${botonVoz(`carta-${c.id}`, MAZO.volteada ? `${c.frente}. Respuesta: ${c.reverso}` : c.frente)}</div>`;
  const carta = $('.carta'); const alto = Math.max(...$$('.cara', carta).map((x) => x.scrollHeight)); carta.style.minHeight = `${Math.max(280, Math.min(alto, 520))}px`;
}
Object.assign(ACCIONES, {
  mazo: (b) => abrirMazo(b.dataset.k),
  'tarjetas-pendientes': () => abrirMazo('pendientes'),
  'tarjetas-modulo': (b) => abrirMazo(b.dataset.mod),
  voltear: () => { MAZO.volteada = !MAZO.volteada; render(); },
  'cerrar-mazo': () => { MAZO = null; antesDeSalir = null; render(); },
  calificar: (b) => {
    const n = Number(b.dataset.n); const c = MAZO.cartas[MAZO.i]; calificarTarjeta(c.id, n);
    if (n === 0) { vibrar([0, 50]); MAZO.cartas.splice(Math.min(MAZO.cartas.length, MAZO.i + 4), 0, c); } else MAZO.ok++;
    MAZO.i++; MAZO.volteada = false;
    if (MAZO.i >= MAZO.cartas.length) { sonidoFin(); avisar(`Mazo terminado: ${MAZO.ok} tarjetas dominadas.`, 'ok'); MAZO = null; antesDeSalir = null; }
    render(); animarEntrada($('#vista'), 'lado');
  },
});

/* ===================== CONSTRUCTOR DE RIESGOS ===================== */
const PIEZAS = [['amenaza', 'Amenaza', 'Debido a'], ['vulnerabilidad', 'Vulnerabilidad', 'y a'], ['activo', 'Activo', ', el/la'], ['evento', 'Evento', 'podría sufrir'], ['pilar', 'Propiedad afectada', ', afectando la'], ['impacto', 'Impacto', 'y causando']];
const AYUDA_PIEZA = {
  amenaza: 'La amenaza es la causa potencial externa o interna (una persona, un fenómeno, una falla) que puede aprovechar una debilidad.',
  vulnerabilidad: 'La vulnerabilidad es la debilidad propia del activo o del proceso: lo que falta o está mal configurado.',
  activo: 'El activo es lo que tiene valor y se vería comprometido: información, sistema, servicio, instalación o persona.',
  evento: 'El evento describe qué le ocurriría al activo (acceso no autorizado, modificación no autorizada, interrupción…).',
  pilar: 'Elige la propiedad que se pierde: confidencialidad (divulgación), integridad (modificación/inexactitud) o disponibilidad (interrupción).',
  impacto: 'El impacto es la consecuencia para la organización si el riesgo se materializa.',
};
let RIE = null;
function vistaRiesgos(v) {
  const R = C.riesgos || [];
  if (!R.length) { v.innerHTML = cabecera('Constructor de riesgos', { atras: '#/practicar' }) + sinContenido(); return; }
  if (!RIE) RIE = { orden: barajar(R.map((_, i) => i)), n: 0, paso: 0, elegidas: {}, fallos: 0, total: 0, mezcla: {} };
  const r = R[RIE.orden[RIE.n % R.length]];
  const frase = PIEZAS.map(([k, , con], i) => { const val = RIE.elegidas[k]; return `${esc(con)} <span class="hueco ${val ? 'lleno' : i === RIE.paso ? 'actual' : ''}">${val ? esc(val) : PIEZAS[i][1].toLowerCase()}</span>`; }).join(' ') + '.';
  const actual = PIEZAS[RIE.paso];
  let piezas = '';
  if (actual) {
    const [k, nombre] = actual; const d = r[k];
    if (!RIE.mezcla[k]) RIE.mezcla[k] = barajar([d.correcta, ...d.distractores]);
    piezas = `<p class="antetitulo" style="margin-top:16px">Elige: ${esc(nombre)}</p><div class="piezas">${RIE.mezcla[k].map((t) => `<button class="opcion" data-accion="pieza" data-t="${esc(t)}"><span class="letra">${ico('pieza', 'chico')}</span><span>${esc(t)}</span></button>`).join('')}</div><p class="tenue pequeno" style="margin-top:10px">${ico('info', 'chico')} ${esc(AYUDA_PIEZA[k])}</p>`;
  }
  v.innerHTML = `${cabecera('Constructor de riesgos', { atras: '#/practicar', ante: `Caso ${RIE.n % R.length + 1} de ${R.length}` })}
  <div class="tarjeta" id="tarjeta-riesgo"><p class="antetitulo">Escenario</p><p style="margin:0;line-height:1.6">${negritas(r.escenario)}</p></div>
  <div class="tarjeta"><p class="antetitulo">Tu redacción (estructura del curso SGS)</p><p class="frase-riesgo">${frase}</p>${piezas}
  ${!actual ? `<div class="retro bien"><h3>${ico('check')} Riesgo bien redactado</h3><div class="bloque-retro"><small>Por qué</small><p>${negritas(r.explicacion)}</p></div><div class="bloque-retro"><small>Control que lo trataría</small><p>${negritas(r.control)}</p></div></div><div class="botonera"><button class="boton primario" data-accion="riesgo-sig">Siguiente caso ${ico('sig', 'chico')}</button></div>` : ''}
  </div>`;
}
ACCIONES.pieza = (b) => {
  const R = C.riesgos; const r = R[RIE.orden[RIE.n % R.length]]; const [k] = PIEZAS[RIE.paso]; const t = b.dataset.t;
  if (t === r[k].correcta) {
    RIE.elegidas[k] = t; RIE.paso++; sonidoAcierto(); vibrar([0, 20]); render();
  } else {
    RIE.fallos++; sonidoError(); vibrar([0, 90, 70, 160]);
    b.classList.add('incorrecta'); b.disabled = true; const tj = $('#tarjeta-riesgo'); tj.classList.remove('sacudir'); void tj.offsetWidth; tj.classList.add('sacudir');
    const otra = PIEZAS.find(([kk]) => kk !== k && (r[kk].correcta === t || r[kk].distractores.includes(t)));
    let msg = `«${t}» no es la ${PIEZAS[RIE.paso][1].toLowerCase()} de este caso.`;
    if (k === 'amenaza' && (r.vulnerabilidad.correcta === t || /falta|sin |no se |no est|ausencia|débil|desactualiz|excesiv|compartid|carec|inexist|vencid|abiert|expuest|mal configur/i.test(t))) msg = 'Eso describe una debilidad propia (vulnerabilidad), no la causa que la aprovecha (amenaza).';
    if (k === 'vulnerabilidad' && r.amenaza.correcta === t) msg = 'Eso es la amenaza (la causa), no la debilidad del activo o del proceso.';
    if (otra && otra[0] !== k && msg.startsWith('«')) msg += ` Parece más bien: ${otra[1].toLowerCase()}.`;
    abrirCapa(`<div class="retro mal" role="alert" style="margin:0"><h3>${ico('alerta')} Atención</h3><p>${esc(msg)}</p><div class="clave">${esc(AYUDA_PIEZA[k])}</div></div><div class="botonera"><button class="boton primario" data-accion="cerrar-capa">Entendido, vuelvo a intentar</button></div>`);
  }
};
ACCIONES['riesgo-sig'] = () => { RIE.n++; RIE.paso = 0; RIE.elegidas = {}; RIE.mezcla = {}; render(); };

/* ===================== MODO ESTUDIO ===================== */
let FOCO = null; let wakeLock = null;
const pref = { min: 25, act: 'ruta' };
function vistaFoco(v) {
  if (FOCO) { ir(FOCO.destino); return; }
  v.innerHTML = `${cabecera('Modo estudio', { atras: '#/inicio', ante: 'Un bloque, una tarea' })}
  <div class="tarjeta"><p style="margin:0;line-height:1.6">Durante el bloque la pantalla no se apaga, desaparece el menú y, si sales de la app, al volver verás cuánto tiempo estuviste fuera. Antes de empezar, activa <strong>No molestar</strong> en tu teléfono.</p></div>
  <h2>¿Cuánto tiempo?</h2>
  <div class="opciones-foco" role="group">${[[15, 'Arranque'], [25, 'Clásico'], [45, 'Profundo']].map(([m, t]) => `<button data-accion="foco-min" data-m="${m}" aria-pressed="${pref.min === m}">${m}<small>${t}</small></button>`).join('')}</div>
  <h2>¿Qué vas a hacer?</h2>
  <div class="tarjeta compacta"><ul class="lista">
    ${[['ruta', 'aprender', 'Seguir mi ruta', `Módulo ${siguienteModulo()?.orden || 1}: ${siguienteModulo()?.titulo || ''}`], ['practica', 'rayo', 'Práctica inteligente', 'Pendientes, temas débiles y nuevos'], ['escuchar', 'escuchar', 'Escuchar el audiolibro', 'Con la pantalla siempre encendida']].map(([k, i, t, s]) => `<li><button class="item" data-accion="foco-act" data-k="${k}"><span class="num ${pref.act === k ? 'leido' : ''}">${ico(i, 'chico')}</span><span class="cuerpo"><strong>${esc(t)}</strong><span>${esc(s)}</span></span>${pref.act === k ? ico('check', 'chico') : ''}</button></li>`).join('')}
  </ul></div>
  <div class="tarjeta compacta"><div class="ajuste"><div class="txt"><strong>Ruido de fondo</strong><span>Ruido marrón suave para aislarte</span></div><button class="interruptor" role="switch" aria-checked="${E.ajustes.ruido}" data-accion="alternar-ajuste" data-k="ruido" aria-label="Ruido de fondo"></button></div></div>
  <button class="boton primario ancho" data-accion="foco-empezar" style="min-height:56px;font-size:1.05rem">${ico('foco')} Empezar ${pref.min} minutos</button>`;
}
async function pedirWakeLock() { try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen'); } catch (e) { /* no disponible */ } }
function empezarFoco() {
  const destino = pref.act === 'ruta' ? `#/modulo/${siguienteModulo().id}` : pref.act === 'escuchar' ? '#/escuchar' : '#/sesion';
  FOCO = { inicio: Date.now(), fin: Date.now() + pref.min * 60000, min: pref.min, distracciones: 0, salida: null, destino, ultimoEmpujon: Date.now() };
  document.body.classList.add('en-foco'); $('#foco-barra').hidden = false;
  try { if (NAT) { NAT.pantallaEncendida(true); NAT.inmersivo(true); } } catch (e) { /* nada */ }
  pedirWakeLock();
  if (E.ajustes.ruido) ruidoMarron(true);
  FOCO.reloj = setInterval(tickFoco, 1000); tickFoco();
  sonidoAviso();
  if (pref.act === 'practica') iniciarPracticaInteligente();
  else if (pref.act === 'escuchar') { cargarCapitulo(E.audio.ultimo && CAP.has(E.audio.ultimo) ? E.audio.ultimo : (siguienteModulo()?.id || 'intro')); ir('#/escuchar'); } else ir(destino);
}
function tickFoco() {
  if (!FOCO) return;
  const rest = (FOCO.fin - Date.now()) / 1000; const total = FOCO.min * 60;
  $('#foco-barra').innerHTML = `${ico('foco')}<span class="reloj">${mmss(rest)}</span><span class="etq">Modo estudio · ${plural(FOCO.distracciones, 'salida', 'salidas')}</span><button class="btn-icono" data-accion="foco-terminar" aria-label="Terminar el bloque">${ico('salir')}</button><span class="linea" style="width:${100 - pct(rest, total)}%"></span>`;
  // empujón si no hay actividad en 2 minutos (salvo que esté escuchando)
  const quieto = Date.now() - ultimaInteraccion > 120000;
  if (quieto && !audioSonando() && !Voz.activa && Date.now() - FOCO.ultimoEmpujon > 120000 && $('#capa').hidden) {
    FOCO.ultimoEmpujon = Date.now(); sonidoAviso(); vibrar([0, 120, 80, 120]);
    abrirCapa(`<div style="text-align:center"><h2>¿Sigues aquí?</h2><p class="subtitulo">Llevas 2 minutos sin interactuar. Si tu mente se fue, no pasa nada: vuelve a leer la última línea y sigue.</p><button class="boton primario ancho" data-accion="cerrar-capa">Sigo aquí</button></div>`);
  }
  if (rest <= 0) terminarFoco(true);
}
function terminarFoco(completo) {
  if (!FOCO) return;
  clearInterval(FOCO.reloj);
  const minutos = Math.round((Date.now() - FOCO.inicio) / 60000);
  E.foco.sesiones++; E.foco.minutos += minutos; E.foco.distracciones += FOCO.distracciones; guardar();
  const d = FOCO.distracciones;
  FOCO = null; document.body.classList.remove('en-foco'); $('#foco-barra').hidden = true;
  try { if (NAT) { NAT.pantallaEncendida(false); NAT.inmersivo(false); } } catch (e) { /* nada */ }
  try { if (wakeLock) { wakeLock.release(); wakeLock = null; } } catch (e) { /* nada */ }
  ruidoMarron(false);
  sonidoFin(); vibrar([0, 200, 100, 200]);
  abrirCapa(`<div style="text-align:center">
    <p class="antetitulo">${completo ? 'Bloque completado' : 'Bloque terminado'}</p>
    <h2>${minutos} minutos de estudio</h2>
    <p class="subtitulo">${d === 0 ? 'Cero salidas de la app. Así se construye la atención.' : `Saliste ${plural(d, 'vez', 'veces')} de la app. En el siguiente bloque intenta bajar ese número.`}</p>
    <div class="respiracion">Pausa</div>
    <p class="tenue">Toma 5 minutos lejos de la pantalla: camina, toma agua, mira a lo lejos. Respira con el círculo: inhala cuando crece, exhala cuando se encoge.</p>
    <div class="botonera"><button class="boton" data-accion="cerrar-capa">Terminar por hoy</button><button class="boton primario" data-accion="foco-otro">Otro bloque</button></div></div>`);
  render();
}
window.alSalirApp = () => { appEnFondo = true; if (FOCO) FOCO.salida = Date.now(); };
window.alVolverApp = () => {
  appEnFondo = false; ultimaInteraccion = Date.now();
  if (FOCO && FOCO.salida) {
    const s = Math.round((Date.now() - FOCO.salida) / 1000); FOCO.salida = null;
    if (s >= 5) {
      FOCO.distracciones++; sonidoAviso(); vibrar([0, 80, 60, 80]);
      abrirCapa(`<div style="text-align:center"><p class="antetitulo">Volviste</p><h2>Estuviste fuera ${s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`}</h2><p class="subtitulo">Tu atención es la herramienta principal. Respira una vez, lee de nuevo la última línea y continúa. Quedan ${mmss((FOCO.fin - Date.now()) / 1000)} del bloque.</p><button class="boton primario ancho" data-accion="cerrar-capa">Retomar</button></div>`);
    }
  }
};
document.addEventListener('visibilitychange', () => { if (NAT) return; if (document.hidden) window.alSalirApp(); else window.alVolverApp(); });
Object.assign(ACCIONES, {
  'foco-min': (b) => { pref.min = Number(b.dataset.m); render(); },
  'foco-act': (b) => { pref.act = b.dataset.k; render(); },
  'foco-empezar': () => empezarFoco(),
  'foco-terminar': () => confirmar('¿Terminar el bloque ahora?', 'Quedan minutos del bloque. Terminar antes también cuenta, pero intenta llegar al final.', () => terminarFoco(false), 'Terminar'),
  'foco-otro': () => { cerrarCapa(); ir('#/foco'); },
});

/* ===================== rutas y arranque ===================== */
RUTAS.push(
  [/^#\/practicar$/, vistaPracticar, 'practicar'],
  [/^#\/sesion$/, vistaSesion, 'practicar'],
  [/^#\/tarjetas$/, vistaTarjetas, 'practicar'],
  [/^#\/riesgos$/, vistaRiesgos, 'practicar'],
  [/^#\/foco$/, vistaFoco, 'inicio'],
);
window.addEventListener('hashchange', () => {
  if (!location.hash.startsWith('#/sesion') && SES && !SES.terminada && SES.modo !== 'examen') { /* la sesión queda en memoria por si vuelve */ }
  if (!location.hash.startsWith('#/sesion') && !location.hash.startsWith('#/tarjetas')) antesDeSalir = null;
});
aplicarTema();
render();
if (!E.bienvenida && MODULOS.length) {
  E.bienvenida = hoy(); guardar();
  abrirCapa(`<div style="text-align:center"><img class="portada-sello" src="marca/sello.svg" alt="Sello ISO/IEC 27001 Aprende">
    <h2>Bienvenido a ISO 27001 Aprende</h2>
    <p class="subtitulo">${MODULOS.length} módulos, ${PREG.size} preguntas con explicación de cada error, los 93 controles explicados y un audiolibro completo.</p>
    <p class="tenue">Empieza por el método de estudio (8 minutos): te enseña a sacarle el máximo provecho a cada sesión.</p>
    <div class="botonera"><button class="boton" data-accion="cerrar-capa">Explorar</button><button class="boton primario" id="btn-metodo">Ver el método</button></div></div>`);
  $('#btn-metodo').onclick = () => { cerrarCapa(); ir('#/metodo'); };
}
