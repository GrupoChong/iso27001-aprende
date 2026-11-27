/* ISO 27001 Aprende — base: utilidades, estado, voz, sonidos, audio, navegación.
   Todos los scripts son clásicos y comparten el ámbito global (contenido.js → base.js → vistas.js → practica.js). */
'use strict';

const C = window.CONTENIDO || { modulos: [], controles: [], glosario: [], traductor: [], riesgos: [], metodo: null, audios: {} };
const NAT = window.Nativo || null;
const CLAVE_ESTADO = 'iso27001-aprende-v1';

/* ===================== utilidades ===================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const negritas = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const fmt = (t) => String(t || '').split(/\n{2,}/).map((p) => `<p>${negritas(p).replace(/\n/g, '<br>')}</p>`).join('');
const plano = (t) => String(t || '').replace(/\*\*/g, '');
const z2 = (n) => String(n).padStart(2, '0');
const fechaLocal = (d) => `${d.getFullYear()}-${z2(d.getMonth() + 1)}-${z2(d.getDate())}`;
const hoy = () => fechaLocal(new Date());
function sumarDias(f, n) { const d = new Date(`${f}T12:00:00`); d.setDate(d.getDate() + n); return fechaLocal(d); }
function difDias(a, b) { return Math.round((new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`)) / 86400000); }
function barajar(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const mmss = (s) => { s = Math.max(0, Math.round(s || 0)); return `${Math.floor(s / 60)}:${z2(s % 60)}`; };
const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
const FECHA_LARGA = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });

/* ===================== iconos: viven en iconos.js (tools/iconos.py) ===================== */

/* ===================== estado persistente ===================== */
function estadoInicial() {
  return {
    v: 1,
    creado: hoy(),
    ajustes: { tema: 'auto', movimiento: 'sistema', escala: 1, sonido: true, vibracion: true, velVoz: 1, velAudio: 1, meta: 30, continuo: true, ruido: false },
    modulos: {},
    preguntas: {},
    tarjetas: {},
    controles: {},
    audio: { pos: {}, hechos: {}, ultimo: null },
    dias: {},
    examenes: [],
    plan: {},
    foco: { sesiones: 0, minutos: 0, distracciones: 0 },
  };
}
function cargarEstado() {
  const base = estadoInicial();
  try {
    const t = localStorage.getItem(CLAVE_ESTADO);
    if (t) {
      const g = JSON.parse(t);
      const r = Object.assign(base, g);
      r.ajustes = Object.assign(estadoInicial().ajustes, g.ajustes || {});
      r.audio = Object.assign(estadoInicial().audio, g.audio || {});
      r.foco = Object.assign(estadoInicial().foco, g.foco || {});
      return r;
    }
  } catch (e) { /* almacenamiento no disponible: se usa el estado en memoria */ }
  return base;
}
const E = cargarEstado();
let _guardar = null;
function guardar() {
  clearTimeout(_guardar);
  _guardar = setTimeout(() => { try { localStorage.setItem(CLAVE_ESTADO, JSON.stringify(E)); } catch (e) { /* sin espacio o bloqueado */ } }, 200);
}
function registroDia(f = hoy()) { return E.dias[f] || (E.dias[f] = { seg: 0, preguntas: 0, aciertos: 0 }); }
function diaCumplido(f) { const d = E.dias[f]; return !!d && (d.seg >= 300 || d.preguntas >= 8); }
function racha() {
  let n = 0; let f = hoy();
  if (!diaCumplido(f)) f = sumarDias(f, -1);
  while (diaCumplido(f)) { n++; f = sumarDias(f, -1); }
  return n;
}

/* ===================== índices del contenido ===================== */
const MODULOS = [...C.modulos].sort((a, b) => a.orden - b.orden);
const MOD = new Map(MODULOS.map((m) => [m.id, m]));
const BLOQUES = ['Fundamentos', 'Requisitos ISO/IEC 27001', 'Controles ISO/IEC 27002', 'Auditoría y caso práctico', 'Talleres del docente', 'Clases del curso'];
const BLOQUE_CORTO = { Fundamentos: 'Fundamentos', 'Requisitos ISO/IEC 27001': 'Requisitos 27001', 'Controles ISO/IEC 27002': 'Controles 27002', 'Auditoría y caso práctico': 'Auditoría y caso', 'Talleres del docente': 'Talleres', 'Clases del curso': 'Clases' };
const PREG = new Map();
MODULOS.forEach((m) => (m.preguntas || []).forEach((p) => PREG.set(p.id, Object.assign({}, p, { modulo: m.id, bloque: m.bloque }))));
(C.traductor || []).forEach((t, i) => {
  const id = `tr-${i + 1}`;
  PREG.set(id, {
    id, nivel: 2, tipo: 'traductor', modulo: 'm02', bloque: 'Fundamentos',
    caso: `Redacción coloquial: «${t.coloquial}»`,
    enunciado: '¿Cuál es la redacción correcta en lenguaje normativo?',
    opciones: t.opciones, clave: t.clave, ref: 'Propiedades de la información: confidencialidad, integridad y disponibilidad', pilar: t.pilar,
  });
});
const CONTROLES = [...(C.controles || [])].sort((a, b) => { const [x1, y1] = a.id.split('.').map(Number); const [x2, y2] = b.id.split('.').map(Number); return x1 - x2 || y1 - y2; });
const CTRL = new Map(CONTROLES.map((c) => [c.id, c]));
const TEMAS = [['Organizacional', 'Organizacionales', '5'], ['Personas', 'De personas', '6'], ['Físico', 'Físicos', '7'], ['Tecnológico', 'Tecnológicos', '8']];
// preguntas asociadas a cada control (por la referencia o el enunciado de los módulos de controles)
const PREG_CTRL = new Map();
for (const p of PREG.values()) {
  const m = MOD.get(p.modulo);
  if (!m || m.bloque !== 'Controles ISO/IEC 27002') continue;
  const ids = new Set(`${p.ref || ''} ${p.enunciado || ''}`.match(/\b[5-8]\.\d{1,2}\b/g) || []);
  ids.forEach((id) => { if (CTRL.has(id)) { if (!PREG_CTRL.has(id)) PREG_CTRL.set(id, []); PREG_CTRL.get(id).push(p.id); } });
}

/* ===================== repetición espaciada ===================== */
const INTERVALOS = [0, 1, 3, 7, 16, 35];
function registrarRespuesta(id, ok) {
  const r = E.preguntas[id] || (E.preguntas[id] = { caja: 0, vistas: 0, fallos: 0, aciertos: 0 });
  const nueva = r.vistas === 0;
  r.vistas++;
  if (ok) { r.aciertos++; r.caja = nueva ? 3 : Math.min(5, (r.caja || 0) + 1); } else { r.fallos++; r.caja = 1; r.ultFallo = hoy(); }
  r.prox = sumarDias(hoy(), ok ? INTERVALOS[r.caja] : 1);
  r.ult = hoy();
  r.ultOk = ok;
  const d = registroDia(); d.preguntas++; if (ok) d.aciertos++;
  guardar();
}
function preguntasPendientes() { const h = hoy(); return [...PREG.keys()].filter((id) => { const r = E.preguntas[id]; return r && r.prox && r.prox <= h; }); }
function preguntasConError() { return [...PREG.keys()].filter((id) => { const r = E.preguntas[id]; return r && r.fallos > 0 && (r.caja || 0) < 4; }); }
function calificarTarjeta(id, nivel) { // 0 = no la sabía, 1 = dudé, 2 = la sabía
  const r = E.tarjetas[id] || (E.tarjetas[id] = { caja: 0, vistas: 0 });
  r.vistas++;
  if (nivel === 0) r.caja = 1; else if (nivel === 2) r.caja = Math.min(5, (r.caja || 0) + (r.vistas === 1 ? 3 : 1)); else r.caja = Math.max(1, r.caja || 1);
  r.prox = sumarDias(hoy(), nivel === 0 ? 0 : nivel === 1 ? 1 : INTERVALOS[r.caja]);
  guardar();
}
function estadisticaModulo(mid) {
  const m = MOD.get(mid); let vistas = 0; let aciertos = 0; let respondidas = 0;
  (m?.preguntas || []).forEach((p) => { const r = E.preguntas[p.id]; if (r && r.vistas) { respondidas++; vistas += r.vistas; aciertos += r.aciertos; } });
  return { total: (m?.preguntas || []).length, respondidas, precision: pct(aciertos, vistas) };
}
function estadoModulo(mid) { return E.modulos[mid] || (E.modulos[mid] = {}); }
function siguienteModulo() { return MODULOS.find((m) => !estadoModulo(m.id).completado) || MODULOS[0]; }

/* ===================== sonido y vibración ===================== */
let ctxAudio = null;
function ctx() { if (!ctxAudio) { const A = window.AudioContext || window.webkitAudioContext; if (A) ctxAudio = new A(); } if (ctxAudio && ctxAudio.state === 'suspended') ctxAudio.resume(); return ctxAudio; }
function tonos(notas, dur, tipo, vol) {
  if (!E.ajustes.sonido) return;
  try {
    const a = ctx(); if (!a) return; const t0 = a.currentTime + 0.01;
    notas.forEach((f, i) => {
      const o = a.createOscillator(); const g = a.createGain(); const ini = t0 + i * dur; const fin = ini + dur;
      o.type = tipo; o.frequency.setValueAtTime(f[0], ini); if (f[1]) o.frequency.linearRampToValueAtTime(f[1], fin);
      g.gain.setValueAtTime(0.0001, ini); g.gain.exponentialRampToValueAtTime(vol, ini + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, fin);
      o.connect(g).connect(a.destination); o.start(ini); o.stop(fin + 0.05);
    });
  } catch (e) { /* sin audio */ }
}
const sonidoAcierto = () => tonos([[660], [880]], 0.1, 'sine', 0.12);
const sonidoError = () => tonos([[311, 233], [233, 156]], 0.2, 'sawtooth', 0.07);
const sonidoFin = () => tonos([[523], [659], [784], [1046]], 0.13, 'sine', 0.1);
const sonidoAviso = () => tonos([[880], [660], [880]], 0.12, 'triangle', 0.14);
function vibrar(patron) {
  if (!E.ajustes.vibracion) return;
  try { if (NAT && NAT.vibrar) NAT.vibrar(patron.join(',')); else if (navigator.vibrate) navigator.vibrate(patron.slice(1)); } catch (e) { /* sin vibración */ }
}
let ruido = null;
function ruidoMarron(encender) {
  if (encender && !ruido) {
    const a = ctx(); if (!a) return;
    const largo = a.sampleRate * 4; const buf = a.createBuffer(1, largo, a.sampleRate); const d = buf.getChannelData(0); let ult = 0;
    for (let i = 0; i < largo; i++) { const w = Math.random() * 2 - 1; ult = (ult + 0.02 * w) / 1.02; d[i] = ult * 3.2; }
    const src = a.createBufferSource(); src.buffer = buf; src.loop = true; const g = a.createGain(); g.gain.value = 0.22;
    src.connect(g).connect(a.destination); src.start(); ruido = src;
  } else if (!encender && ruido) { try { ruido.stop(); } catch (e) { /* ya detenido */ } ruido = null; }
}

/* ===================== voz (lectura en voz alta) ===================== */
const Voz = {
  activa: null, cola: [], alFin: null,
  nativa() { try { return !!(NAT && NAT.vozDisponible && NAT.vozDisponible()); } catch (e) { return false; } },
  disponible() { return this.nativa() || 'speechSynthesis' in window; },
  hablar(texto, clave, alFin) {
    this.callar(); pausarAudio();
    texto = plano(texto).replace(/\s+/g, ' ').trim(); if (!texto) return;
    this.activa = clave || 'x'; this.alFin = alFin || null;
    if (this.nativa()) { NAT.hablar(texto, E.ajustes.velVoz); refrescarBotonesVoz(); return; }
    if (!('speechSynthesis' in window)) { avisar('Este dispositivo no tiene lectura en voz alta.'); this.activa = null; return; }
    this.cola = texto.match(/[^.!?;:]+[.!?;:]*\s*/g) || [texto];
    this._siguiente(); refrescarBotonesVoz();
  },
  _siguiente() {
    if (!this.activa) return;
    const t = this.cola.shift();
    if (!t) { this._fin(); return; }
    const u = new SpeechSynthesisUtterance(t);
    u.lang = 'es-PE'; u.rate = E.ajustes.velVoz;
    const voces = speechSynthesis.getVoices(); const v = voces.find((x) => /^es[-_]PE/i.test(x.lang)) || voces.find((x) => /^es[-_]/i.test(x.lang));
    if (v) u.voice = v;
    u.onend = () => this._siguiente(); u.onerror = () => this._fin();
    speechSynthesis.speak(u);
  },
  _fin() { const f = this.alFin; this.activa = null; this.alFin = null; refrescarBotonesVoz(); if (f) f(); },
  callar() {
    const habia = this.activa; this.activa = null; this.cola = []; this.alFin = null;
    try { if (NAT && NAT.callar) NAT.callar(); } catch (e) { /* nada */ }
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    if (habia) refrescarBotonesVoz();
  },
  alternar(texto, clave) { if (this.activa === clave) this.callar(); else this.hablar(texto, clave); },
};
window.alTerminarVoz = () => Voz._fin();
function refrescarBotonesVoz() {
  $$('[data-voz]').forEach((b) => {
    const on = Voz.activa === b.dataset.voz;
    b.classList.toggle('sonando', on);
    b.innerHTML = ico(on ? 'callar' : 'voz', 'chico');
    b.setAttribute('aria-label', on ? 'Detener lectura' : 'Leer en voz alta');
  });
}
const TEXTOS_VOZ = new Map();
function botonVoz(clave, texto) { TEXTOS_VOZ.set(clave, texto); return `<button class="btn-voz" data-voz="${esc(clave)}" aria-label="Leer en voz alta">${ico('voz', 'chico')}</button>`; }

/* ===================== audiolibro ===================== */
const AUD = $('#reproductor');
const CAPITULOS = [];
if (C.metodo) CAPITULOS.push({ id: 'intro', numero: 0, titulo: 'Bienvenida y método de estudio', archivo: 'audio/00-intro.mp3', texto: C.metodo.audio });
MODULOS.forEach((m) => CAPITULOS.push({ id: m.id, numero: m.orden, titulo: m.titulo, bloque: m.bloque, archivo: `audio/${m.id}.mp3`, texto: m.audio }));
if (C.repaso) CAPITULOS.push({ id: 'repaso', numero: 26, titulo: 'Repaso general de todo el curso', archivo: 'audio/99-repaso.mp3', texto: C.repaso });
const CAP = new Map(CAPITULOS.map((c) => [c.id, c]));
const duracionCap = (id) => (C.audios && C.audios[id]) || 0;
const tieneMp3 = (id) => !!(C.audios && C.audios[id]);
let capActual = null;
let _ultimoGuardadoAudio = 0;
function audioSonando() { return !AUD.paused && !AUD.ended && !!capActual; }
function cargarCapitulo(id, reproducir = true) {
  const c = CAP.get(id); if (!c) return;
  Voz.callar();
  if (!tieneMp3(id)) { // respaldo: si el MP3 no existe, se lee el guion con la voz del teléfono
    capActual = null; pintarMini();
    Voz.hablar(c.texto, `cap-${id}`, () => { E.audio.hechos[id] = true; guardar(); });
    avisar('Leyendo con la voz del teléfono (audio no incluido en esta versión).');
    return;
  }
  if (!capActual || capActual.id !== id) {
    capActual = c; AUD.src = c.archivo; AUD.playbackRate = E.ajustes.velAudio;
    const pos = E.audio.pos[id] || 0;
    AUD.addEventListener('loadedmetadata', function fijar() { AUD.removeEventListener('loadedmetadata', fijar); if (pos > 3 && pos < (AUD.duration || 1e9) - 5) AUD.currentTime = pos; AUD.playbackRate = E.ajustes.velAudio; });
  }
  E.audio.ultimo = id; guardar();
  if (reproducir) AUD.play().catch(() => {});
  pintarMini(); actualizarMediaSession();
}
function pausarAudio() { if (!AUD.paused) AUD.pause(); }
function alternarAudio() { if (!capActual) { cargarCapitulo(E.audio.ultimo || 'intro'); return; } if (AUD.paused) { Voz.callar(); AUD.play().catch(() => {}); } else AUD.pause(); }
function saltarAudio(s) { if (capActual) AUD.currentTime = Math.max(0, Math.min((AUD.duration || 0) - 1, AUD.currentTime + s)); }
function velocidadAudio(v) { E.ajustes.velAudio = v; AUD.playbackRate = v; guardar(); }
AUD.addEventListener('timeupdate', () => {
  if (!capActual) return;
  const ahora = Date.now();
  if (ahora - _ultimoGuardadoAudio > 4000) { E.audio.pos[capActual.id] = AUD.currentTime; guardar(); _ultimoGuardadoAudio = ahora; }
  actualizarProgresoAudio();
});
AUD.addEventListener('play', () => { pintarMini(); actualizarControlesAudio(); });
AUD.addEventListener('pause', () => { if (capActual) { E.audio.pos[capActual.id] = AUD.currentTime; guardar(); } pintarMini(); actualizarControlesAudio(); });
AUD.addEventListener('ended', () => {
  if (!capActual) return;
  E.audio.pos[capActual.id] = 0; E.audio.hechos[capActual.id] = true; guardar();
  const i = CAPITULOS.findIndex((c) => c.id === capActual.id);
  const sig = CAPITULOS.slice(i + 1).find((c) => tieneMp3(c.id));
  if (E.ajustes.continuo && sig) cargarCapitulo(sig.id); else { pintarMini(); actualizarControlesAudio(); }
});
function pintarMini() {
  const mini = $('#mini');
  const ver = !!capActual && !location.hash.startsWith('#/escuchar');
  mini.hidden = !ver; document.body.classList.toggle('con-mini', ver);
  if (!ver) return;
  mini.innerHTML = `<div class="info" data-ir="#/escuchar"><strong>${esc(capActual.numero ? `${capActual.numero}. ` : '')}${esc(capActual.titulo)}</strong><span>${AUD.paused ? 'En pausa' : 'Reproduciendo'} · ${mmss(AUD.currentTime)} / ${mmss(AUD.duration || duracionCap(capActual.id))}</span></div>
    <button class="btn-icono" data-accion="audio-menos" aria-label="Retroceder 15 segundos">${ico('menos15')}</button>
    <button class="btn-icono activo" data-accion="audio-alternar" aria-label="${AUD.paused ? 'Reproducir' : 'Pausar'}">${ico(AUD.paused ? 'play' : 'pausa')}</button>
    <span class="linea" style="width:${pct(AUD.currentTime, AUD.duration || 1)}%"></span>`;
}
function actualizarProgresoAudio() {
  const m = $('#mini'); if (m && !m.hidden) { const l = $('.linea', m); if (l) l.style.width = `${pct(AUD.currentTime, AUD.duration || 1)}%`; const s = $('.info span', m); if (s) s.textContent = `${AUD.paused ? 'En pausa' : 'Reproduciendo'} · ${mmss(AUD.currentTime)} / ${mmss(AUD.duration || duracionCap(capActual.id))}`; }
  const r = $('#rango-audio'); if (r && !r.dataset.arrastrando) { r.max = Math.round(AUD.duration || duracionCap(capActual.id) || 1); r.value = Math.round(AUD.currentTime); }
  const t1 = $('#t-actual'); if (t1) t1.textContent = mmss(AUD.currentTime);
  const t2 = $('#t-total'); if (t2) t2.textContent = mmss(AUD.duration || duracionCap(capActual?.id));
}
function actualizarControlesAudio() {
  const b = $('#btn-play-grande'); if (b) { b.innerHTML = ico(AUD.paused ? 'play' : 'pausa'); b.setAttribute('aria-label', AUD.paused ? 'Reproducir' : 'Pausar'); }
  $$('[data-cap]').forEach((el) => el.classList.toggle('sonando', !!capActual && el.dataset.cap === capActual.id && !AUD.paused));
}
function actualizarMediaSession() {
  if (!('mediaSession' in navigator) || !capActual) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({ title: capActual.titulo, artist: 'ISO 27001 Aprende', album: 'Audiolibro ISO/IEC 27001 y 27002' });
    navigator.mediaSession.setActionHandler('play', () => AUD.play());
    navigator.mediaSession.setActionHandler('pause', () => AUD.pause());
    navigator.mediaSession.setActionHandler('seekbackward', () => saltarAudio(-15));
    navigator.mediaSession.setActionHandler('seekforward', () => saltarAudio(15));
  } catch (e) { /* no soportado */ }
}

/* ===================== avisos y capas ===================== */
function avisar(texto, tipo = '') {
  const a = document.createElement('div'); a.className = `aviso ${tipo}`; a.innerHTML = esc(texto);
  $('#avisos').appendChild(a); setTimeout(() => a.remove(), 3200);
}
let alCerrarCapa = null;
function abrirCapa(html, alCerrar) {
  const c = $('#capa'); c.innerHTML = `<div class="hoja" role="dialog" aria-modal="true">${html}</div>`; c.hidden = false; alCerrarCapa = alCerrar || null;
  const f = $('button, [href], input', c); if (f) setTimeout(() => f.focus(), 50);
}
function cerrarCapa() { const c = $('#capa'); if (c.hidden) return false; c.hidden = true; c.innerHTML = ''; const f = alCerrarCapa; alCerrarCapa = null; if (f) f(); return true; }
$('#capa').addEventListener('click', (e) => { if (e.target.id === 'capa' && !$('#capa').dataset.fija) cerrarCapa(); });
function confirmar(titulo, texto, si, etiquetaSi = 'Sí', peligro = false) {
  abrirCapa(`<h2>${esc(titulo)}</h2><p class="subtitulo">${esc(texto)}</p><div class="botonera"><button class="boton" data-accion="cerrar-capa">Cancelar</button><button class="boton ${peligro ? 'peligro' : 'primario'}" id="btn-si">${esc(etiquetaSi)}</button></div>`);
  $('#btn-si').onclick = () => { cerrarCapa(); si(); };
}

/* ===================== tema y tamaño de letra ===================== */
function aplicarTema() {
  const r = document.documentElement; const t = E.ajustes.tema;
  if (t === 'auto') r.removeAttribute('data-tema'); else r.setAttribute('data-tema', t);
  r.style.setProperty('--escala', E.ajustes.escala);
  const oscuro = t === 'oscuro' || (t === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  r.dataset.modo = oscuro ? 'oscuro' : 'claro';
  r.dataset.movimiento = E.ajustes.movimiento === 'reducido' ? 'reducido' : 'sistema';
  const fondo = getComputedStyle(r).getPropertyValue('--fondo').trim();
  try { if (NAT && NAT.tema) NAT.tema(fondo || (oscuro ? '#0D1219' : '#EDF0F3'), oscuro); } catch (e) { /* nada */ }
  _barras = ''; pintarBarras();
}
/* Barras del sistema (Android): arriba toma el color de la franja marina cuando la pantalla la tiene;
   abajo, el de la barra de pestañas cuando se ve. Así no queda un corte de color en los bordes. */
let _barras = '';
function pintarBarras() {
  if (!NAT || !NAT.barras || !document.body) return;
  const cs = getComputedStyle(document.documentElement); const b = document.body; const v = (k) => cs.getPropertyValue(k).trim();
  const oscuro = document.documentElement.dataset.modo === 'oscuro';
  const enFoco = b.classList.contains('en-foco');
  const franja = !enFoco && !b.classList.contains('en-sesion') && !!$('#vista > .cabecera, #vista > .leccion-cabecera');
  const arriba = franja ? v('--banda') : enFoco ? v('--superficie') : v('--fondo');
  const nav = $('#pestanas'); const conNav = !!nav && getComputedStyle(nav).display !== 'none';
  const abajo = conNav ? v('--nav-fondo') : v('--fondo');
  const clave = `${arriba}|${abajo}|${oscuro}|${franja}`;
  if (!arriba || !abajo || clave === _barras) return;
  _barras = clave;
  try { NAT.barras(arriba, franja || oscuro, abajo, oscuro); } catch (e) { /* versión sin el puente */ }
}
/* ===================== movimiento ===================== */
const movimientoReducido = () => document.documentElement.dataset.movimiento === 'reducido' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function animarCifras(raiz) {
  if (movimientoReducido()) return;
  $$('[data-contar]', raiz).forEach((el) => {
    const fin = Number(el.dataset.contar); if (!fin) return;
    const t0 = performance.now(); const dur = 420;
    const paso = (t) => { const k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(fin * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(paso); };
    el.textContent = '0'; requestAnimationFrame(paso);
  });
}
function animarEntrada(v, tipo) {
  v.classList.remove('entra-sube', 'entra-lado', 'entra-atras'); void v.offsetWidth; v.classList.add(`entra-${tipo}`);
  animarCifras(v);
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', aplicarTema);

/* ===================== tiempo de estudio ===================== */
let ultimaInteraccion = Date.now();
let appEnFondo = false;
['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach((ev) => addEventListener(ev, () => { ultimaInteraccion = Date.now(); }, { passive: true }));
addEventListener('scroll', () => { ultimaInteraccion = Date.now(); }, { passive: true });
setInterval(() => {
  const leyendo = !appEnFondo && document.visibilityState === 'visible' && Date.now() - ultimaInteraccion < 90000;
  if (leyendo || audioSonando() || Voz.activa) { registroDia().seg += 15; guardar(); }
}, 15000);

/* ===================== navegación ===================== */
const PESTANAS = [['inicio', 'Inicio', '#/inicio'], ['aprender', 'Aprender', '#/aprender'], ['practicar', 'Practicar', '#/practicar'], ['escuchar', 'Escuchar', '#/escuchar'], ['biblioteca', 'Biblioteca', '#/biblioteca']];
const RUTAS = []; // se llenan en vistas.js y practica.js: [regex, función, pestaña]
const pila = [];
function ir(hash) { if (location.hash === hash) render(); else location.hash = hash; }
function pintarPestanas(activa) {
  const nav = $('#pestanas');
  if (!nav.firstElementChild) nav.innerHTML = `<div class="fila" style="--n:${PESTANAS.length}"><span class="indicador" aria-hidden="true"></span>${PESTANAS.map(([id, txt, h]) => `<button data-ir="${h}" data-pestana="${id}"><span class="burbuja">${ico(id, 'normal')}${ico(`${id}-on`, 'activo')}</span><span class="rotulo">${txt}</span></button>`).join('')}</div>`;
  $('.fila', nav).style.setProperty('--i', Math.max(0, PESTANAS.findIndex((p) => p[0] === activa)));
  $$('button', nav).forEach((b) => { if (b.dataset.pestana === activa) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
}
let vistaActual = '';
function render() {
  const h = location.hash || '#/inicio';
  let haciaAtras = false;
  if (pila[pila.length - 1] !== h) { if (pila.length > 1 && pila[pila.length - 2] === h) { pila.pop(); haciaAtras = true; } else pila.push(h); }
  if (pila.length > 40) pila.shift();
  Voz.callar();
  for (const [re, fn, pest] of RUTAS) {
    const m = h.match(re);
    if (m) {
      pintarPestanas(pest);
      document.body.classList.toggle('en-sesion', h.startsWith('#/sesion') || (h === '#/tarjetas' && typeof MAZO !== 'undefined' && !!MAZO));
      const v = $('#vista');
      const nueva = vistaActual !== h;
      if (nueva) window.scrollTo(0, 0);
      vistaActual = h;
      document.body.dataset.vista = pest;
      document.body.classList.toggle('raiz', RAICES.has(h));
      fn(v, ...m.slice(1));
      if (nueva) animarEntrada(v, RAICES.has(h) ? 'sube' : haciaAtras ? 'atras' : 'lado');
      pintarMini();
      pintarBarras();
      refrescarBotonesVoz();
      return;
    }
  }
  location.hash = '#/inicio';
}
window.addEventListener('hashchange', render);
const RAICES = new Set(PESTANAS.map((p) => p[2]));
let antesDeSalir = null; // función que la vista activa puede poner para confirmar la salida
window.appAtras = function appAtras() {
  if (cerrarCapa()) return true;
  if (antesDeSalir && antesDeSalir()) return true;
  const h = location.hash || '#/inicio';
  if (!RAICES.has(h)) {
    if (pila.length > 1) { pila.pop(); location.hash = pila[pila.length - 1]; pila.pop(); } else location.hash = raizDe(h);
    return true;
  }
  if (h !== '#/inicio') { location.hash = '#/inicio'; return true; }
  return false;
};
function raizDe(h) { for (const [re, , pest] of RUTAS) if (h.match(re)) return PESTANAS.find((p) => p[0] === pest)[2]; return '#/inicio'; }
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') window.appAtras(); });

/* acciones delegadas */
const ACCIONES = {
  'cerrar-capa': () => cerrarCapa(),
  'audio-alternar': () => alternarAudio(),
  'audio-menos': () => saltarAudio(-15),
  'audio-mas': () => saltarAudio(15),
};
document.addEventListener('click', (e) => {
  const voz = e.target.closest('[data-voz]');
  if (voz) { e.preventDefault(); Voz.alternar(TEXTOS_VOZ.get(voz.dataset.voz) || '', voz.dataset.voz); return; }
  const irA = e.target.closest('[data-ir]');
  if (irA) { e.preventDefault(); ir(irA.dataset.ir); return; }
  const a = e.target.closest('[data-accion]');
  if (a && ACCIONES[a.dataset.accion]) { e.preventDefault(); ACCIONES[a.dataset.accion](a, e); }
});
