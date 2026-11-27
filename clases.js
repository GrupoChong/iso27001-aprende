/* ISO 27001 Aprende — resúmenes interactivos de las clases grabadas (14-nov, pedido de David).
   Cada clase (C.clases, desde transcripciones/Clase N - resumen.json) se recorre por pestañas: lo esencial,
   las explicaciones del docente, las preguntas de los alumnos con sus respuestas y una lista para repasar.
   Todo se puede escuchar (voz del teléfono por bloque y el audio de la clase), y se enlaza con las preguntas,
   las tarjetas y la lección del módulo de esa clase. */
'use strict';

const CLASES = (C.clases || []).slice().sort((a, b) => a.clase - b.clase);
const CLASE_DE_MODULO = Object.fromEntries(CLASES.filter((c) => c.modulo).map((c) => [c.modulo, c.clase]));
const PEST_CLASE = [['esencial', 'Lo esencial'], ['explicaciones', 'Explicaciones'], ['preguntas', 'Preguntas'], ['repaso', 'Repaso']];

function estadoClase(n) {
  const T = E.clases || (E.clases = {});
  return T[n] || (T[n] = { vista: 'esencial', repaso: {}, vistas: 0 });
}
const minutoChip = (m) => (m ? `<span class="chip minuto">${ico('reloj', 'chico')} min. ${esc(m)}</span>` : '');

function vistaClases(v) {
  v.innerHTML = `${cabecera('Resúmenes de las clases', { atras: '#/biblioteca', ante: `${plural(CLASES.length, 'clase grabada', 'clases grabadas')}` })}
  <div class="tarjeta"><p style="margin:0;line-height:1.6">Cada resumen reúne lo más importante de la clase, las recomendaciones del docente, sus explicaciones y las preguntas que respondió. Puedes escucharlo, practicar sus preguntas y marcar lo que ya repasaste.</p></div>
  ${CLASES.length ? `<div class="tarjeta compacta"><ul class="lista">${CLASES.map((c) => {
    const st = estadoClase(c.clase); const total = (c.para_repasar || []).length; const hechos = Object.values(st.repaso).filter(Boolean).length;
    return `<li><button class="item" data-ir="#/clase/${c.clase}"><span class="num ${total && hechos === total ? 'hecho' : ''}">${c.clase}</span><span class="cuerpo"><strong>${esc(c.titulo)}</strong><span>${esc(c.fecha)} · ${esc(c.duracion)}${total ? ` · repaso ${hechos}/${total}` : ''}</span></span>${ico('sig', 'chico')}</button></li>`;
  }).join('')}</ul></div>` : sinContenido()}`;
}

function vistaClase(v, num) {
  const c = CLASES.find((x) => String(x.clase) === String(num));
  if (!c) { ir('#/clases'); return; }
  const st = estadoClase(c.clase);
  const m = c.modulo ? MOD.get(c.modulo) : null;
  const clave = (k) => `clase${c.clase}-${k}`;
  let cuerpo = '';

  if (st.vista === 'esencial') {
    cuerpo = `${(c.lo_mas_importante || []).length ? `<h2>Lo más importante de esta clase</h2>${c.lo_mas_importante.map((x, i) => `
      <section class="tarjeta esencial">
        <div class="sec-cab"><div class="titulos"><div class="etiqueta">${ico('idea', 'chico')}Idea ${i + 1} de ${c.lo_mas_importante.length}</div><h3>${esc(x.idea)}</h3></div>${botonVoz(clave(`esencial-${i}`), `${x.idea}. ${x.por_que_importa} ${x.como_aplicarlo ? `Cómo aplicarlo: ${x.como_aplicarlo}` : ''}`)}</div>
        <div class="texto">${fmt(x.por_que_importa)}</div>
        ${x.como_aplicarlo ? `<div class="aplicar"><small>Cómo aplicarlo</small><p>${negritas(x.como_aplicarlo)}</p></div>` : ''}
      </section>`).join('')}` : ''}
    ${(c.recomendaciones_clave || []).length ? `<h2>Recomendaciones clave del docente</h2>
      <div class="tarjeta"><div class="sec-cab"><div class="titulos"><div class="etiqueta">${ico('memoria', 'chico')}Para qué sirve cada una</div></div>${botonVoz(clave('recomendaciones'), `Recomendaciones clave del docente. ${c.recomendaciones_clave.map((r) => `${r.recomendacion}. ${r.para_que_sirve}`).join(' ')}`)}</div>
      <ul class="recomendaciones">${c.recomendaciones_clave.map((r) => `<li><strong>${esc(r.recomendacion)}</strong><span>${negritas(r.para_que_sirve)}</span>${minutoChip(r.minuto)}</li>`).join('')}</ul></div>` : ''}
    ${(c.temas || []).length ? `<details class="tarjeta"><summary><strong>Temas de la clase, en orden (${c.temas.length})</strong></summary><ul class="lista-simple">${c.temas.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></details>` : ''}`;
  } else if (st.vista === 'explicaciones') {
    cuerpo = `${(c.puntos_clave || []).length ? `<h2>Puntos clave</h2><div class="tarjeta compacta">${c.puntos_clave.map((p, i) => `
      <details class="glosa"><summary><span class="num-punto">${i + 1}</span><span>${esc(p.titulo)}</span>${ico('sig', 'chico')}</summary>
        <div class="def">${fmt(p.explicacion)}<div class="fila-flex entre">${minutoChip(p.minuto)}${botonVoz(clave(`punto-${i}`), `${p.titulo}. ${p.explicacion}`)}</div></div></details>`).join('')}</div>` : ''}
    ${(c.explicaciones || []).length ? `<h2>Cómo lo explicó el docente</h2>${c.explicaciones.map((e, i) => `
      <section class="tarjeta">
        <div class="sec-cab"><div class="titulos"><div class="etiqueta">${ico('libro', 'chico')}Concepto</div><h3>${esc(e.concepto)}</h3></div>${botonVoz(clave(`expl-${i}`), `${e.concepto}. ${e.como_lo_explico} ${e.ejemplo ? `Ejemplo: ${e.ejemplo}` : ''}`)}</div>
        <div class="texto">${fmt(e.como_lo_explico)}</div>
        ${e.ejemplo ? `<div class="aplicar"><small>Ejemplo que usó</small><p>${negritas(e.ejemplo)}</p></div>` : ''}
        ${minutoChip(e.minuto)}
      </section>`).join('')}` : ''}
    ${(c.consejos_del_docente || []).length ? `<h2>Consejos del docente</h2><div class="tarjeta"><ul class="recomendaciones">${c.consejos_del_docente.map((k) => `<li><strong>${esc(k.consejo)}</strong><span>${negritas(k.por_que)}</span>${minutoChip(k.minuto)}</li>`).join('')}</ul></div>` : ''}`;
  } else if (st.vista === 'preguntas') {
    cuerpo = `${(c.preguntas_de_alumnos || []).length ? `<h2>Lo que preguntaron los alumnos</h2><p class="tenue pequeno">Piensa tu respuesta antes de ver la del docente.</p>${c.preguntas_de_alumnos.map((q, i) => `
      <section class="tarjeta pregunta-clase">
        <div class="sec-cab"><div class="titulos"><div class="etiqueta">${ico('examen', 'chico')}Pregunta ${i + 1}</div><h3>${esc(q.pregunta)}</h3></div>${botonVoz(clave(`preg-${i}`), `Pregunta: ${q.pregunta}. Respuesta del docente: ${q.respuesta}`)}</div>
        <button class="boton ancho" data-accion="clase-respuesta" data-i="${i}" aria-expanded="false">${ico('lupa', 'chico')} Ver la respuesta del docente</button>
        <div class="respuesta" id="resp-${i}" hidden><small>Respuesta del docente</small>${fmt(q.respuesta)}</div>
      </section>`).join('')}` : ''}
    ${(c.evaluacion_y_examen || []).length ? `<h2>Lo que dijo sobre la evaluación</h2><div class="tarjeta"><ul class="lista-simple">${c.evaluacion_y_examen.map((t) => `<li>${negritas(t)}</li>`).join('')}</ul></div>` : ''}
    ${(c.actividades_y_tareas || []).length ? `<h2>Actividades y tareas</h2><div class="tarjeta"><ul class="recomendaciones">${c.actividades_y_tareas.map((a) => `<li><strong>${esc(a.actividad)}</strong><span>${negritas(a.detalle)}</span>${a.plazo ? `<span class="chip marca">Plazo: ${esc(a.plazo)}</span>` : ''}</li>`).join('')}</ul></div>` : ''}`;
  } else {
    const items = c.para_repasar || []; const hechos = items.filter((_, i) => st.repaso[i]).length;
    cuerpo = `<div class="tarjeta destacada"><div class="fila-flex">${anillo(hechos, items.length || 1, `${pct(hechos, items.length || 1)}%`)}<div><p class="antetitulo">Tu repaso de esta clase</p><p style="margin:0">${hechos} de ${items.length} temas dominados. Marca cada uno cuando puedas explicarlo con tus palabras.</p></div></div></div>
      <div class="tarjeta"><ul class="checklist">${items.map((t, i) => `<li><button type="button" role="checkbox" aria-checked="${!!st.repaso[i]}" data-accion="clase-repaso" data-i="${i}"><span class="caja-check">${st.repaso[i] ? ico('check', 'chico') : ''}</span><span>${negritas(t)}</span></button></li>`).join('')}</ul></div>
      ${m ? `<div class="botonera"><button class="boton primario" data-accion="mini-examen" data-mod="${m.id}">${ico('examen')} Mini examen de la clase</button><button class="boton" data-accion="practica-modulo" data-mod="${m.id}">Practicar las ${(m.preguntas || []).length} preguntas</button></div>` : ''}`;
  }

  v.innerHTML = `${cabecera(`Resumen de la clase ${c.clase}`, { atras: '#/clases', ante: `${c.fecha} · ${c.duracion}` })}
  <div class="tarjeta destacada">
    <p class="antetitulo">Clase ${c.clase} · ${esc(c.docente || '')}</p>
    <h3 style="font-size:1.12rem;margin:0 0 6px">${esc(c.titulo)}</h3>
    <p style="margin:0;line-height:1.6">${negritas(c.en_una_frase)}</p>
    <div class="botonera">
      ${m && tieneMp3(m.id) ? `<button class="boton sobre" data-accion="escuchar-cap" data-cap="${m.id}">${ico('escuchar')} Escuchar la clase</button>` : ''}
      ${m ? `<button class="boton contorno-sobre" data-ir="#/modulo/${m.id}">${ico('aprender', 'chico')} Lección</button>` : ''}
      ${m && (m.tarjetas || []).length ? `<button class="boton contorno-sobre" data-accion="tarjetas-modulo" data-mod="${m.id}">${ico('tarjetas', 'chico')} Tarjetas</button>` : ''}
    </div>
  </div>
  <div class="filtros" role="tablist">${PEST_CLASE.map(([k, t]) => `<button role="tab" aria-pressed="${st.vista === k}" data-accion="clase-vista" data-k="${k}" data-n="${c.clase}">${esc(t)}</button>`).join('')}</div>
  ${cuerpo}`;
  window.__claseActual = c.clase;
}

Object.assign(ACCIONES, {
  'clase-vista': (b) => { estadoClase(b.dataset.n).vista = b.dataset.k; guardar(); render(); window.scrollTo(0, 0); },
  'clase-respuesta': (b) => {
    const r = document.getElementById(`resp-${b.dataset.i}`); if (!r) return;
    const abrir = r.hidden; r.hidden = !abrir; b.setAttribute('aria-expanded', String(abrir));
    b.innerHTML = abrir ? `${ico('x', 'chico')} Ocultar la respuesta` : `${ico('lupa', 'chico')} Ver la respuesta del docente`;
    if (abrir) animarEntrada(r, 'sube');
  },
  'clase-repaso': (b) => {
    const st = estadoClase(window.__claseActual); const i = b.dataset.i; st.repaso[i] = !st.repaso[i]; guardar();
    if (st.repaso[i]) { sonidoAcierto(); vibrar([0, 20]); }
    render();
  },
});

RUTAS.push(
  [/^#\/clases$/, vistaClases, 'biblioteca'],
  [/^#\/clase\/(\d+)$/, vistaClase, 'aprender'],
);
