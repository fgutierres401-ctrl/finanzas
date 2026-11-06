/* =========================================================
   Finanzas — control personal de gastos
   Datos guardados localmente en el navegador (localStorage).
   ========================================================= */

const KEY = 'finanzas.v1';

// Paleta sobria para las tarjetas (se oscurece automáticamente en la tarjeta)
const COLORS = ['#1e3a8a', '#2563eb', '#0e7490', '#166534', '#7c4a24', '#b45309', '#831843', '#be123c', '#4c1d95', '#3f3f46'];

const ACC_TYPES = {
  debito:    { n: 'Débito',            ic: 'bank' },
  credito:   { n: 'Crédito',           ic: 'card' },
  ahorro:    { n: 'Ahorro',            ic: 'bank' },
  efectivo:  { n: 'Efectivo',          ic: 'wallet' },
  digital:   { n: 'Billetera digital', ic: 'phone' },
  inversion: { n: 'Inversión',         ic: 'chart' },
};

const SVG = {
  bank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3.5 20.5h17"/></svg>',
  card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V5.5A1.5 1.5 0 0 0 17.5 4H6a2 2 0 0 0 0 4h13a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6"/><circle cx="16" cy="13.5" r="1.2"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6.5" y="3" width="11" height="18" rx="2.5"/><path d="M11 17.5h2"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16M6 15l4-4 3 3 5-6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  msg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/></svg>',
  sync: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 0 0-14.3-4.5L4 8.5M4 13a8 8 0 0 0 14.3 4.5l1.7-2"/><path d="M4 4v4.5h4.5M20 20v-4.5h-4.5"/></svg>',
};

// Bancos y billeteras (los logos se cargan desde el sitio oficial de cada uno, siempre actualizados)
const BANKS = {
  bancolombia: { n: 'Bancolombia',          d: 'bancolombia.com',          c: '#FDDA24', re: /bancolombia/i },
  nequi:       { n: 'Nequi',                d: 'nequi.com.co',             c: '#DA0081', re: /nequi/i },
  daviplata:   { n: 'DaviPlata',            d: 'daviplata.com',            c: '#E30613', re: /daviplata/i },
  nu:          { n: 'Nu',                   d: 'nu.com.co',                c: '#820AD1', h: 1, re: /\bnu\b|nubank/i },
  uala:        { n: 'Ualá',                 d: 'uala.com.co',              c: '#3D5AFE', re: /ual[aá]/i },
  davivienda:  { n: 'Davivienda',           d: 'davivienda.com',           c: '#E30613', re: /davivienda/i },
  bbva:        { n: 'BBVA',                 d: 'bbva.com.co',              c: '#004481', h: 1, re: /bbva/i },
  bogota:      { n: 'Banco de Bogotá',      d: 'bancodebogota.com',        c: '#003DA5', re: /banco de bogot/i },
  lulo:        { n: 'Lulo Bank',            d: 'lulobank.com',             c: '#2B2B2B', h: 1, re: /lulo/i },
  rappipay:    { n: 'RappiPay',             d: 'rappipay.co',              c: '#FF441F', h: 1, re: /rappi ?pay|rappicard/i },
  falabella:   { n: 'Banco Falabella',      d: 'bancofalabella.com.co',    c: '#2E7D32', re: /falabella/i },
  colpatria:   { n: 'Scotiabank Colpatria', d: 'scotiabankcolpatria.com',  c: '#EC111A', h: 1, re: /colpatria|scotiabank/i },
  occidente:   { n: 'Banco de Occidente',   d: 'bancodeoccidente.com.co',  c: '#0057A4', re: /occidente/i },
  popular:     { n: 'Banco Popular',        d: 'bancopopular.com.co',      c: '#00843D', h: 1, re: /banco popular/i },
  avvillas:    { n: 'AV Villas',            d: 'avvillas.com.co',          c: '#E20613', re: /av ?villas/i },
  cajasocial:  { n: 'Caja Social',          d: 'bancocajasocial.com',      c: '#004B8D', re: /caja social/i },
  itau:        { n: 'Itaú',                 d: 'itau.co',                  c: '#EC7000', re: /ita[uú]/i },
  agrario:     { n: 'Banco Agrario',        d: 'bancoagrario.gov.co',      c: '#0B7A3E', re: /agrario/i },
  movii:       { n: 'Movii',                d: 'movii.com.co',             c: '#5B2C83', h: 1, re: /movii/i },
  dale:        { n: 'dale!',                d: 'dale.com.co',              c: '#00A99D', re: /dale!/i },
  mercadopago: { n: 'Mercado Pago',         d: 'mercadopago.com',       c: '#00B1EA', re: /mercado ?pago/i },
  paypal:      { n: 'PayPal',               d: 'paypal.com',               c: '#003087', h: 1, re: /paypal/i },
};

const CATS = {
  egreso: [
    ['comida', 'Comida', '🍽️'], ['super', 'Mercado', '🛒'], ['transporte', 'Transporte', '🚗'],
    ['hogar', 'Hogar', '🏠'], ['servicios', 'Servicios', '💡'], ['salud', 'Salud', '🩺'],
    ['ocio', 'Ocio', '🎬'], ['compras', 'Compras', '🛍️'], ['educacion', 'Educación', '📚'],
    ['suscripciones', 'Suscripciones', '🔁'], ['deudas', 'Deudas', '🧾'], ['otros', 'Otros', '🔹'],
  ],
  ingreso: [
    ['sueldo', 'Sueldo', '💼'], ['freelance', 'Freelance', '🧑‍💻'], ['ventas', 'Ventas', '🏷️'],
    ['inversiones', 'Inversiones', '📈'], ['prestamo', 'Me pagaron', '🤝'], ['regalo', 'Regalo', '🎁'], ['otros_in', 'Otros', '🔹'],
  ],
};

// Palabras clave para categorizar automáticamente (SMS y CSV)
const KEYWORDS = [
  [/rappi|ifood|domicilios|restaur|caf[eé]|starbucks|juan valdez|mcdonald|burger|el corral|frisby|kfc|crepes|pizza|sushi|comida|panader/i, 'comida'],
  [/[eé]xito|carulla|\bd1\b|\bara\b|ol[ií]mpica|jumbo|makro|metro\b|super|mercado|alkosto|surtimax|colsubsidio/i, 'super'],
  [/uber|cabify|didi|indriver|picap|taxi|transmilenio|metro de|sitp|terpel|primax|texaco|biomax|gasolin|combustible|peaje|parqueadero|parking/i, 'transporte'],
  [/netflix|spotify|disney|hbo|\bmax\b|prime video|youtube|apple\.com|icloud|google|chatgpt|openai|claude|crunchyroll/i, 'suscripciones'],
  [/claro|movistar|tigo|\bwom\b|\betb\b|epm|codensa|enel|vanti|gas natural|acueducto|energ[ií]a|internet|celular/i, 'servicios'],
  [/farmacia|drogas|droguer|cruz verde|cafam|colsanitas|sura|cl[ií]nica|m[eé]dic|dental|hospital|eps/i, 'salud'],
  [/cine|cinemark|cinecolombia|procinal|steam|playstation|xbox|nintendo|bar |concierto|tuboleta|ticket/i, 'ocio'],
  [/arriendo|administraci[oó]n|homecenter|ikea|easy|conjunto/i, 'hogar'],
  [/amazon|mercado ?libre|falabella|ripley|zara|h&m|aliexpress|shein|temu|tienda|koaj|arturo calle/i, 'compras'],
  [/universidad|colegio|curso|udemy|platzi|libro|matr[ií]cula/i, 'educacion'],
];
const KEYWORDS_IN = [
  [/sueldo|salario|n[oó]mina|pago de n[oó]mina|payroll/i, 'sueldo'],
  [/honorario|freelance|upwork|fiverr/i, 'freelance'],
  [/dividend|inter[eé]s|rendimiento|cdt/i, 'inversiones'],
];

const LOCALES = { COP: 'es-CO', USD: 'es-US', EUR: 'es-ES', MXN: 'es-MX', CLP: 'es-CL', ARS: 'es-AR', PEN: 'es-PE', UYU: 'es-UY', BOB: 'es-BO', PYG: 'es-PY', GTQ: 'es-GT', CRC: 'es-CR', DOP: 'es-DO', VES: 'es-VE' };

const NOTE_LISTS = {
  pendiente: { n: 'Pendientes', ph: 'Ej. Llamar al banco, renovar SOAT…', money: false },
  medeben:   { n: 'Me deben',   ph: 'Ej. Juan — almuerzo',                money: true },
  debo:      { n: 'Debo',       ph: 'Ej. Mamá — préstamo',                money: true },
};

/* ---------- Estado ---------- */
let S = load();
let tab = 'inicio', prevTab = 'inicio';
let movMonth = todayISO().slice(0, 7);
let billMonth = todayISO().slice(0, 7);
let movFilter = 'todos', movSearch = '';
let noteList = 'pendiente';
let selAcc = null;

function load() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) { /* datos dañados */ }
  if (!d || !Array.isArray(d.accounts)) d = { accounts: [], txs: [] };
  d.settings = { currency: 'COP', ...(d.settings || {}) };
  d.txs ||= []; d.notes ||= []; d.bills ||= []; d.smsSeen ||= [];
  // Migración: detectar el banco por el nombre de cuentas antiguas
  for (const a of d.accounts) if (a.bank === undefined) a.bank = detectBank(a.name) || '';
  return d;
}
function save() { localStorage.setItem(KEY, JSON.stringify(S)); }

/* ---------- Utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

function fmt(n) {
  const cur = S.settings.currency || 'COP';
  const dec = ['COP', 'CLP', 'PYG'].includes(cur) && Math.round(n) === n ? 0 : 2;
  try {
    return new Intl.NumberFormat(LOCALES[cur] || 'es', { style: 'currency', currency: cur, minimumFractionDigits: dec, maximumFractionDigits: 2 }).format(n || 0);
  } catch { return (n || 0).toFixed(2); }
}

function toISO(d) { return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); }
function todayISO() { return toISO(new Date()); }
function isoAdd(iso, days) { const d = new Date(iso + 'T12:00'); d.setDate(d.getDate() + days); return toISO(d); }
function ymAdd(ym, n) { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
function ymLabel(ym, opts = { month: 'long', year: 'numeric' }) { const [y, m] = ym.split('-').map(Number); return cap(new Date(y, m - 1, 1).toLocaleDateString('es', opts)); }
function daysInMonth(ym) { const [y, m] = ym.split('-').map(Number); return new Date(y, m, 0).getDate(); }
function relDay(iso) {
  const t = todayISO();
  if (iso === t) return 'Hoy';
  if (iso === isoAdd(t, -1)) return 'Ayer';
  return cap(new Date(iso + 'T12:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' }));
}

// Acepta "1.500", "1,500.50", "1.500,50", "$ -2.300", "(45,00)"
function parseAmount(v) {
  if (typeof v === 'number') return v;
  let s = String(v ?? '').trim();
  const neg = /^\(.*\)$/.test(s) || /-/.test(s);
  s = s.replace(/[^\d.,]/g, '').replace(/[.,]+$/, '');
  if (!s) return NaN;
  const lc = s.lastIndexOf(','), ld = s.lastIndexOf('.');
  if (lc > -1 && ld > -1) s = lc > ld ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  else if (lc > -1) s = /^\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, '') : s.replace(',', '.');
  else if (ld > -1 && /^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  const n = parseFloat(s);
  return neg ? -n : n;
}

function parseDate(v) {
  const s = String(v ?? '').trim();
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = s.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
  if (m) { const y = m[3].length === 2 ? '20' + m[3] : m[3]; return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`; }
  return todayISO();
}

function guessCat(text, type) {
  const list = type === 'ingreso' ? KEYWORDS_IN : KEYWORDS;
  for (const [re, c] of list) if (re.test(text || '')) return c;
  return type === 'ingreso' ? 'otros_in' : 'otros';
}
function catInfo(id) {
  for (const t in CATS) { const c = CATS[t].find(c => c[0] === id); if (c) return { id: c[0], n: c[1], i: c[2] }; }
  return { id, n: 'Otros', i: '🔹' };
}
const accById = id => S.accounts.find(a => a.id === id);

function detectBank(text) {
  let best = null, pos = Infinity;
  for (const [k, b] of Object.entries(BANKS)) {
    const m = String(text || '').match(b.re);
    if (m && m.index < pos) { pos = m.index; best = k; }
  }
  return best;
}

/* ---------- Logos ---------- */
function logoImg(bankKey) {
  const b = BANKS[bankKey];
  if (!b) return '';
  const order = b.h ? 'hgd' : 'ghd';
  return `<img src="${LOGO_SRC[order[0]](b.d)}" alt="${esc(b.n)}" referrerpolicy="no-referrer" data-d="${b.d}" data-n="${esc(b.n)}" data-o="${order}" data-step="0" onerror="logoErr(this)" onload="logoOk(this)">`;
}
// Fuentes de logos; si una falla o tarda, pasa a la siguiente y al final muestra la inicial del banco
const LOGO_SRC = {
  g: d => `https://www.google.com/s2/favicons?domain=${d}&sz=128`,
  h: d => `https://icon.horse/icon/${d}`,
  d: d => `https://icons.duckduckgo.com/ip3/${d}.ico`,
};
window.logoOk = img => { if (img.naturalWidth < 24) logoErr(img); };
window.logoErr = img => {
  if (!img.isConnected) return;
  const step = +img.dataset.step + 1;
  if (step < img.dataset.o.length) { img.dataset.step = step; img.src = LOGO_SRC[img.dataset.o[step]](img.dataset.d); return; }
  const span = document.createElement('span');
  span.className = 'mono'; span.textContent = (img.dataset.n || '?').charAt(0);
  img.replaceWith(span);
};
// Si un logo tarda más de 3 s, prueba la siguiente fuente
function watchLogos() {
  clearTimeout(watchLogos.t);
  watchLogos.t = setTimeout(() => {
    const slow = $$('img[data-d]').filter(i => !i.complete || !i.naturalWidth);
    slow.forEach(logoErr);
    if (slow.length) watchLogos();
  }, 3000);
}
function accLogo(a, cls = 'logo') {
  if (a.bank && BANKS[a.bank]) return `<div class="${cls} has-img">${logoImg(a.bank)}</div>`;
  return `<div class="${cls}">${SVG[(ACC_TYPES[a.type] || ACC_TYPES.debito).ic]}</div>`;
}

/* ---------- Cálculos ---------- */
function txDelta(id) {
  let b = 0;
  for (const t of S.txs) {
    if (t.type === 'ingreso' && t.account === id) b += t.amount;
    else if (t.type === 'egreso' && t.account === id) b -= t.amount;
    else if (t.type === 'transferencia') { if (t.account === id) b -= t.amount; if (t.to === id) b += t.amount; }
  }
  return b;
}
const accBalance = id => (+accById(id)?.initial || 0) + txDelta(id);
function totals() {
  let assets = 0, debts = 0;
  for (const a of S.accounts) { const b = accBalance(a.id); if (b >= 0) assets += b; else debts += -b; }
  return { assets, debts, net: assets - debts };
}
function monthStats(ym) {
  let inc = 0, exp = 0;
  const byCat = {};
  for (const t of S.txs) {
    if (!t.date.startsWith(ym)) continue;
    if (t.type === 'ingreso') inc += t.amount;
    if (t.type === 'egreso') { exp += t.amount; byCat[t.category] = (byCat[t.category] || 0) + t.amount; }
  }
  return { inc, exp, net: inc - exp, byCat };
}
const sortedTxs = list => [...list].sort((a, b) => b.date.localeCompare(a.date) || (b.created || 0) - (a.created || 0));

const billTx = (billId, ym) => S.txs.find(t => t.billId === billId && t.billMonth === ym);
function billStats(ym) {
  let total = 0, paid = 0, pending = 0, done = 0;
  for (const b of S.bills) {
    const t = billTx(b.id, ym);
    if (t) { done++; paid += t.amount; total += t.amount; } else { pending += b.amount; total += b.amount; }
  }
  return { total, paid, pending, done, n: S.bills.length };
}

/* ---------- Componentes ---------- */
function txRow(t) {
  const acc = accById(t.account);
  let icon, title, sub, cls = '', sign = '';
  if (t.type === 'transferencia') {
    const to = accById(t.to);
    icon = '⇄'; title = t.note || 'Transferencia';
    sub = `${acc?.name || '—'} → ${to?.name || '—'}`;
  } else {
    const c = catInfo(t.category);
    icon = c.i; title = t.note || c.n;
    sub = `${c.n} · ${acc?.name || '—'}`;
    if (t.type === 'ingreso') { cls = 'pos'; sign = '+'; } else sign = '−';
  }
  const badge = t.source === 'sms' ? '<span class="badge">SMS</span>' : t.billId ? '<span class="badge">Mensual</span>' : '';
  return `<div class="row" data-tx="${t.id}">
    <div class="icon">${icon}</div>
    <div class="meta"><div class="title">${esc(title)}${badge}</div><div class="sub">${esc(sub)}</div></div>
    <div class="amt ${cls}">${sign}${fmt(t.amount)}</div>
  </div>`;
}

function walletCard(a, { sel = false, preview = false } = {}) {
  const t = ACC_TYPES[a.type] || ACC_TYPES.debito;
  const bal = preview ? a._bal : accBalance(a.id);
  return `<div class="wcard ${sel ? 'sel' : ''}" style="--c:${a.color}" ${preview ? '' : `data-acc="${a.id}"`}>
    <div class="whead">
      ${accLogo(a)}
      <div class="wmeta"><div class="wname">${esc(a.name || 'Nombre de la cuenta')}</div>
        <div class="wsub">${t.n.toUpperCase()} · ${fmt(bal)}</div></div>
    </div>
    <div class="wfoot">
      <div><div class="wlabel">${a.type === 'credito' ? 'DEUDA' : 'BALANCE'}</div><div class="wbal">${fmt(a.type === 'credito' ? Math.abs(bal) : bal)}</div></div>
      <div class="wdigits">${a.last4 ? '•••• ' + esc(a.last4) : '••••'}</div>
    </div>
  </div>`;
}

function emptyState(em, text, btn) {
  return `<div class="empty"><span class="em">${em}</span>${text}${btn ? `<div style="margin-top:16px"><button class="btn sm" data-action="${btn[1]}">${btn[0]}</button></div>` : ''}</div>`;
}

function animateNumber(el, to) {
  if (!el) return;
  const start = performance.now(), dur = 800;
  const step = now => {
    const p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(p < 1 ? Math.round(to * e) : to);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function growBars() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    $$('[data-w]').forEach(el => el.style.width = el.dataset.w);
    $$('[data-h]').forEach(el => el.style.height = el.dataset.h);
  }));
}

/* ---------- Vistas ---------- */
const TITLES = { inicio: 'Inicio', movimientos: 'Historial', pagos: 'Gastos mensuales', notas: 'Notas', ajustes: 'Ajustes' };

function render() {
  $('#title').textContent = TITLES[tab];
  $$('.tabbar [data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  $('#topActions').innerHTML = tab === 'ajustes'
    ? `<button class="top-btn" data-top="close" aria-label="Cerrar ajustes">${SVG.close}</button>`
    : `<button class="top-btn" data-top="settings" aria-label="Ajustes">${SVG.gear}</button>` +
      (tab === 'inicio' ? `<button class="top-btn dark" data-top="add-account" aria-label="Agregar cuenta">${SVG.plus}</button>` : '');
  const html = { inicio: viewInicio, movimientos: viewMovimientos, pagos: viewPagos, notas: viewNotas, ajustes: viewAjustes }[tab]();
  $('#view').innerHTML = `<div class="view">${html}</div>`;
  if (tab === 'inicio') animateNumber($('#heroNum'), totals().net);
  if (tab === 'movimientos') renderMovList();
  growBars();
  watchLogos();
}

function viewInicio() {
  if (!S.accounts.length) {
    return `<div class="card">${emptyState('👋', 'Bienvenido. Empieza agregando tus tarjetas, cuentas o efectivo.<br>Todo se sumará en un saldo total.', ['Agregar mi primera cuenta', 'add-account'])}</div>`;
  }
  const T = totals();
  const ym = todayISO().slice(0, 7);
  const M = monthStats(ym);
  const B = billStats(ym);
  const saveRate = M.inc > 0 ? Math.round((M.net / M.inc) * 100) : null;
  if (!accById(selAcc)) selAcc = S.accounts[S.accounts.length - 1].id;

  const cats = Object.entries(M.byCat).sort((a, b) => b[1] - a[1]);
  const maxCat = cats[0]?.[1] || 1;
  const catHtml = cats.length
    ? cats.slice(0, 6).map(([id, v]) => {
        const c = catInfo(id);
        return `<div class="cat-row"><div class="top"><span>${c.i}&nbsp; ${c.n}</span><span>${fmt(v)}</span></div>
          <div class="track"><div data-w="${(v / maxCat) * 100}%"></div></div></div>`;
      }).join('')
    : `<div class="empty" style="padding:16px">Sin gastos este mes 🎉</div>`;

  const months = [];
  for (let i = 5; i >= 0; i--) { const k = ymAdd(ym, -i); months.push([k, monthStats(k)]); }
  const maxM = Math.max(1, ...months.map(([, s]) => Math.max(s.inc, s.exp)));
  const bars = months.map(([k, s]) => `<div class="bar-group">
      <div class="bar-pair"><div class="bar in" data-h="${(s.inc / maxM) * 100}%" title="Ingresos ${fmt(s.inc)}"></div><div class="bar out" data-h="${(s.exp / maxM) * 100}%" title="Egresos ${fmt(s.exp)}"></div></div>
      <div class="bar-label">${ymLabel(k, { month: 'short' }).replace('.', '')}</div></div>`).join('');

  const recent = sortedTxs(S.txs).slice(0, 5);
  const billsCard = B.n ? `
    <div class="card bills-mini" data-goto="pagos">
      <div class="chart-head"><span class="label-sm">GASTOS MENSUALES</span><span class="sub" style="margin:0">${B.done} de ${B.n} pagados</span></div>
      <div class="track" style="margin:12px 0 10px"><div data-w="${B.total ? (B.paid / B.total) * 100 : 0}%"></div></div>
      <div class="split"><span>Pagado <b>${fmt(B.paid)}</b></span><span>Pendiente <b>${fmt(B.pending)}</b></span></div>
    </div>` : '';

  return `
    <div class="card hero">
      <div class="label-sm">SALDO TOTAL</div>
      <div class="big" id="heroNum">${fmt(T.net)}</div>
      <div class="split"><span>Activos <b>${fmt(T.assets)}</b></span><span>Deudas <b>${fmt(T.debts)}</b></span></div>
      ${B.pending > 0 ? `<div class="after-bills">Después de pagos pendientes del mes: <b>${fmt(T.net - B.pending)}</b></div>` : ''}
    </div>

    <div class="quick">
      <button class="qbtn" data-action="sms-paste">${SVG.msg}<span>Pegar SMS</span></button>
      <button class="qbtn" data-action="sms-sync">${SVG.sync}<span>Sincronizar</span></button>
    </div>

    <div class="section-title">Mis cuentas <button class="link" data-action="add-account">Agregar</button></div>
    <div class="stack" id="stack">${S.accounts.map(a => walletCard(a, { sel: a.id === selAcc })).join('')}</div>
    <p class="hint center">Toca una tarjeta para verla · tócala de nuevo para editarla</p>

    <div class="grid grid-2">
      <div class="card stat"><div class="label"><span class="dot" style="background:var(--green)"></span>Ingresos del mes</div><div class="value">${fmt(M.inc)}</div></div>
      <div class="card stat"><div class="label"><span class="dot" style="background:var(--red)"></span>Egresos del mes</div><div class="value">${fmt(M.exp)}</div></div>
      <div class="card stat"><div class="label"><span class="dot" style="background:var(--accent)"></span>Balance del mes</div><div class="value ${M.net < 0 ? 'negc' : ''}">${fmt(M.net)}</div></div>
      <div class="card stat"><div class="label"><span class="dot" style="background:var(--accent-2)"></span>Tasa de ahorro</div><div class="value">${saveRate === null ? '—' : saveRate + '%'}</div></div>
    </div>
    ${billsCard ? `<div style="margin-top:14px">${billsCard}</div>` : ''}

    <div class="section-title">Gastos por categoría</div>
    <div class="card">${catHtml}</div>

    <div class="section-title">Últimos 6 meses</div>
    <div class="card">
      <div class="chart-head"><span class="sub" style="margin:0">Ingresos vs. egresos</span>
        <div class="legend"><span><i style="background:var(--green)"></i>Ingresos</span><span><i style="background:var(--red)"></i>Egresos</span></div></div>
      <div class="bars">${bars}</div>
    </div>

    <div class="section-title">Recientes <button class="link" data-goto="movimientos">Ver todo</button></div>
    <div class="card flush">${recent.length ? recent.map(txRow).join('') : emptyState('🧾', 'Aún no hay movimientos.<br>Toca <b>+</b> para registrar uno.')}</div>
  `;
}

function viewMovimientos() {
  return `
    <div class="card">
      <div class="month-nav">
        <button class="round-btn" data-action="month-prev" aria-label="Mes anterior">‹</button>
        <h3>${ymLabel(movMonth)}</h3>
        <button class="round-btn" data-action="month-next" aria-label="Mes siguiente">›</button>
      </div>
      <div class="segmented" id="movSeg">
        ${[['todos', 'Todos'], ['ingreso', 'Ingresos'], ['egreso', 'Egresos'], ['transferencia', 'Transf.']].map(([k, n]) => `<button data-f="${k}" class="${movFilter === k ? 'on' : ''}">${n}</button>`).join('')}
      </div>
      <div id="movSum"></div>
    </div>
    <input class="input search" id="movSearch" type="search" placeholder="Buscar por nota, categoría o cuenta" value="${esc(movSearch)}">
    <div id="movList"></div>
  `;
}

function renderMovList() {
  const q = movSearch.trim().toLowerCase();
  const list = sortedTxs(S.txs.filter(t => {
    if (!t.date.startsWith(movMonth)) return false;
    if (movFilter !== 'todos' && t.type !== movFilter) return false;
    if (!q) return true;
    const hay = [t.note, catInfo(t.category).n, accById(t.account)?.name, accById(t.to)?.name].join(' ').toLowerCase();
    return hay.includes(q);
  }));
  const M = monthStats(movMonth);
  $('#movSum').innerHTML = `<div class="mini-sum">
    <div>Ingresos<b class="pos">${fmt(M.inc)}</b></div><div>Egresos<b>${fmt(M.exp)}</b></div><div>Balance<b class="${M.net < 0 ? 'negc' : ''}">${fmt(M.net)}</b></div></div>`;
  if (!list.length) { $('#movList').innerHTML = `<div class="card" style="margin-top:14px">${emptyState('🔍', 'No hay movimientos para mostrar.')}</div>`; return; }
  const groups = {};
  for (const t of list) (groups[t.date] ||= []).push(t);
  $('#movList').innerHTML = Object.entries(groups).map(([d, items]) =>
    `<div class="day-head">${relDay(d)}</div><div class="card flush">${items.map(txRow).join('')}</div>`).join('');
}

/* ----- Gastos mensuales ----- */
function viewPagos() {
  const ym = billMonth;
  const B = billStats(ym);
  const isCur = ym === todayISO().slice(0, 7);
  const today = +todayISO().slice(8, 10);
  const pct = B.total ? Math.round((B.paid / B.total) * 100) : 0;

  const rows = [...S.bills]
    .map(b => ({ b, t: billTx(b.id, ym) }))
    .sort((x, y) => (!!x.t - !!y.t) || x.b.day - y.b.day)
    .map(({ b, t }) => {
      const day = Math.min(b.day, daysInMonth(ym));
      const acc = accById(t?.account || b.account);
      let status;
      if (t) status = `<span class="ok">Pagado ${relDay(t.date).toLowerCase()}</span>`;
      else if (isCur && day < today) status = `<span class="late">Vencido · día ${day}</span>`;
      else if (isCur && day === today) status = `<span class="late">Vence hoy</span>`;
      else status = `Vence el ${day}`;
      return `<div class="row bill ${t ? 'done' : ''}" data-bill="${b.id}">
        <button class="check ${t ? 'on' : ''}" data-pay="${b.id}" aria-label="${t ? 'Desmarcar pago' : 'Marcar como pagado'}">${SVG.check}</button>
        <div class="meta"><div class="title">${catInfo(b.category).i}&nbsp; ${esc(b.name)}</div><div class="sub">${status}${acc ? ' · ' + esc(acc.name) : ''}</div></div>
        <div class="amt">${fmt(t ? t.amount : b.amount)}</div>
      </div>`;
    }).join('');

  return `
    <div class="card">
      <div class="month-nav">
        <button class="round-btn" data-action="bills-prev" aria-label="Mes anterior">‹</button>
        <h3>${ymLabel(ym)}</h3>
        <button class="round-btn" data-action="bills-next" aria-label="Mes siguiente">›</button>
      </div>
      <div class="ring-wrap">
        <div class="ring" style="--p:${pct}"><div><b>${pct}%</b><span>pagado</span></div></div>
        <div class="ring-info">
          <div><span>Total del mes</span><b>${fmt(B.total)}</b></div>
          <div><span>Pagado</span><b class="pos">${fmt(B.paid)}</b></div>
          <div><span>Pendiente</span><b>${fmt(B.pending)}</b></div>
        </div>
      </div>
    </div>
    <div class="section-title">Pagos <button class="link" data-action="add-bill">Agregar</button></div>
    <div class="card flush">${S.bills.length ? rows : emptyState('📅', 'Agrega tus gastos fijos: arriendo, servicios, celular, suscripciones…<br>Cada mes los marcas como pagados y se descuentan de tu saldo.', ['Agregar gasto mensual', 'add-bill'])}</div>
    ${S.bills.length ? '<p class="hint center">Toca el círculo para marcar el pago · toca el nombre para editarlo</p>' : ''}
  `;
}

/* ----- Notas ----- */
function viewNotas() {
  const L = NOTE_LISTS[noteList];
  const items = S.notes.filter(n => n.list === noteList);
  const open = items.filter(n => !n.done).sort((a, b) => b.created - a.created);
  const done = items.filter(n => n.done).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
  const sum = open.reduce((s, n) => s + (n.amount || 0), 0);
  const count = k => S.notes.filter(n => n.list === k && !n.done).length;

  const row = n => `<div class="row note ${n.done ? 'done' : ''}" data-note="${n.id}">
      <button class="check ${n.done ? 'on' : ''}" data-note-check="${n.id}" aria-label="Marcar">${SVG.check}</button>
      <div class="meta"><div class="title">${esc(n.text)}</div>${n.detail ? `<div class="sub">${esc(n.detail)}</div>` : ''}</div>
      ${n.amount ? `<div class="amt">${fmt(n.amount)}</div>` : ''}
    </div>`;

  return `
    <div class="segmented" id="noteSeg">
      ${Object.entries(NOTE_LISTS).map(([k, v]) => `<button data-nl="${k}" class="${k === noteList ? 'on' : ''}">${v.n}${count(k) ? ` <span class="cnt">${count(k)}</span>` : ''}</button>`).join('')}
    </div>
    ${L.money ? `<div class="card owe"><span>${noteList === 'medeben' ? 'Te deben en total' : 'Debes en total'}</span><b class="${noteList === 'medeben' ? 'pos' : ''}">${fmt(sum)}</b></div>` : ''}
    <div class="card add-note">
      <input class="input" id="nText" placeholder="${L.ph}" autocomplete="off">
      ${L.money ? '<input class="input amt-in" id="nAmt" inputmode="decimal" placeholder="Monto">' : ''}
      <button class="add-btn" data-action="add-note" aria-label="Agregar">${SVG.plus}</button>
    </div>
    <div class="card flush" style="margin-top:14px">${open.length ? open.map(row).join('') : emptyState('✨', noteList === 'pendiente' ? 'Nada pendiente por ahora.' : 'Sin registros pendientes.')}</div>
    ${done.length ? `<div class="section-title">Completados <button class="link" data-action="clear-done">Limpiar</button></div>
      <div class="card flush">${done.map(row).join('')}</div>` : ''}
  `;
}

/* ----- Ajustes ----- */
function viewAjustes() {
  const cur = S.settings.currency;
  const opts = Object.keys(LOCALES).map(c => `<option ${c === cur ? 'selected' : ''}>${c}</option>`).join('');
  return `
    <div class="card flush">
      <div class="set-row"><div class="sicon">$</div><div class="meta">Moneda</div>
        <select class="input" id="curSel">${opts}</select></div>
      <button class="set-row" data-action="add-account"><div class="sicon">${SVG.card}</div><div class="meta">Agregar cuenta o tarjeta</div><span class="chev">›</span></button>
    </div>

    <div class="section-title">Registro desde mensajes (SMS)</div>
    <div class="card flush">
      <button class="set-row" data-action="sms-setup"><div class="sicon">${SVG.msg}</div><div class="meta">Configurar registro automático<div class="sub">Guarda los SMS del banco y la app los convierte en movimientos</div></div><span class="chev">›</span></button>
      <button class="set-row" data-action="sms-sync"><div class="sicon">${SVG.sync}</div><div class="meta">Sincronizar SMS<div class="sub">${S.settings.lastSync ? 'Última vez: ' + relDay(S.settings.lastSync).toLowerCase() : 'Aún no sincronizas'}</div></div><span class="chev">›</span></button>
      <button class="set-row" data-action="sms-paste"><div class="sicon">⌘</div><div class="meta">Pegar un SMS<div class="sub">Copia el mensaje del banco y pégalo aquí</div></div><span class="chev">›</span></button>
    </div>

    <div class="section-title">Importar</div>
    <div class="card flush">
      <button class="set-row" data-action="import-csv"><div class="sicon">⇪</div><div class="meta">Extracto del banco (CSV)<div class="sub">Carga los movimientos exportados desde tu banco</div></div><span class="chev">›</span></button>
    </div>

    <div class="section-title">Respaldo</div>
    <div class="card flush">
      <button class="set-row" data-action="export"><div class="sicon">↓</div><div class="meta">Exportar respaldo (JSON)</div><span class="chev">›</span></button>
      <button class="set-row" data-action="import-json"><div class="sicon">↑</div><div class="meta">Restaurar respaldo</div><span class="chev">›</span></button>
      <button class="set-row" data-action="reset"><div class="sicon danger">✕</div><div class="meta" style="color:var(--red)">Borrar todos los datos</div></button>
    </div>
    <p class="hint center" style="margin-top:20px">${S.accounts.length} cuentas · ${S.txs.length} movimientos · ${S.bills.length} gastos mensuales · ${S.notes.length} notas<br>Tus datos se guardan solo en este dispositivo.</p>
  `;
}

/* ---------- Hoja modal y toast ---------- */
function openSheet(html) {
  $('#sheetBody').innerHTML = html;
  $('#sheet').scrollTop = 0;
  $('#sheet').classList.add('open');
  $('#backdrop').classList.add('open');
  watchLogos();
}
function closeSheet() {
  $('#sheet').classList.remove('open');
  $('#backdrop').classList.remove('open');
}
let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}
const accOptions = sel => S.accounts.map(a => `<option value="${a.id}" ${a.id === sel ? 'selected' : ''}>${esc(a.name)}</option>`).join('');
const catChips = (type, sel) => CATS[type].map(([id, n, i]) => `<button class="chip ${id === sel ? 'on' : ''}" data-v="${id}">${i} ${n}</button>`).join('');

/* ---------- Formulario de movimiento ---------- */
function txSheet(tx, prefill) {
  if (!S.accounts.length) { toast('Primero agrega una cuenta'); return accountSheet(); }
  const isEdit = !!tx;
  const d = tx ? { ...tx } : {
    type: 'egreso', amount: '', account: S.accounts[0].id,
    to: S.accounts[1]?.id || '', category: 'comida', note: '', date: todayISO(), ...(prefill || {}),
  };

  openSheet(`
    <h2 class="sheet-title">${isEdit ? 'Editar movimiento' : 'Nuevo movimiento'}</h2>
    <div class="segmented" id="tType">
      <button data-v="egreso">Egreso</button><button data-v="ingreso">Ingreso</button><button data-v="transferencia">Transferencia</button>
    </div>
    <input class="amount-input" id="tAmt" inputmode="decimal" placeholder="0" autocomplete="off" value="${d.amount}">
    <p class="amount-cur">${esc(S.settings.currency)}</p>
    ${isEdit ? '' : `<button class="paste-link" id="tPaste">${SVG.msg} Llenar desde un SMS copiado</button>`}
    <div class="field"><label id="tAccLabel">Cuenta</label><select class="input" id="tAcc">${accOptions(d.account)}</select></div>
    <div class="field" id="tToWrap"><label>Hacia</label><select class="input" id="tTo">${accOptions(d.to)}</select></div>
    <div class="field" id="tCatWrap"><label>Categoría</label><div class="chips" id="tCat"></div></div>
    <div class="row2">
      <div class="field"><label>Nota</label><input class="input" id="tNote" placeholder="Ej. Café, Uber…" value="${esc(d.note)}"></div>
      <div class="field"><label>Fecha</label><input class="input" type="date" id="tDate" value="${d.date}"></div>
    </div>
    <button class="btn" id="tSave">${isEdit ? 'Guardar cambios' : 'Agregar'}</button>
    ${isEdit ? '<button class="btn danger" id="tDel">Eliminar movimiento</button>' : '<button class="btn ghost" id="tCancel">Cancelar</button>'}
  `);

  const sync = () => {
    $$('#tType button').forEach(b => b.classList.toggle('on', b.dataset.v === d.type));
    const isT = d.type === 'transferencia';
    $('#tToWrap').style.display = isT ? '' : 'none';
    $('#tCatWrap').style.display = isT ? 'none' : '';
    $('#tAccLabel').textContent = isT ? 'Desde' : 'Cuenta';
    $('#tAmt').style.color = d.type === 'ingreso' ? 'var(--green)' : d.type === 'egreso' ? 'var(--text)' : 'var(--accent)';
    if (!isT) {
      if (!CATS[d.type].some(c => c[0] === d.category)) d.category = CATS[d.type][0][0];
      $('#tCat').innerHTML = catChips(d.type, d.category);
    }
  };
  sync();
  if (!isEdit && !prefill) setTimeout(() => $('#tAmt').focus(), 350);

  $('#tType').onclick = e => { const b = e.target.closest('button'); if (b) { d.type = b.dataset.v; sync(); } };
  $('#tCat').onclick = e => { const b = e.target.closest('button'); if (b) { d.category = b.dataset.v; sync(); } };
  $('#tAmt').onkeydown = e => { if (e.key === 'Enter') $('#tSave').click(); };
  if (!isEdit) $('#tPaste').onclick = async () => {
    let text = '';
    try { text = await navigator.clipboard.readText(); } catch { /* sin permiso */ }
    const p = parseSMS(text);
    if (!p) return toast(text ? 'El texto copiado no parece un SMS del banco' : 'Copia primero el SMS del banco');
    Object.assign(d, { type: p.type, category: p.category });
    $('#tAmt').value = p.amount; $('#tNote').value = p.note; $('#tDate').value = p.date; $('#tAcc').value = p.account;
    d.source = 'sms'; d.smsHash = p.hash;
    sync(); toast('Datos tomados del SMS');
  };

  $('#tSave').onclick = () => {
    const amount = Math.abs(parseAmount($('#tAmt').value));
    if (!(amount > 0)) { toast('Ingresa un monto válido'); $('#tAmt').focus(); return; }
    const rec = {
      ...d, id: d.id || uid(), created: d.created || Date.now(),
      amount, account: $('#tAcc').value,
      note: $('#tNote').value.trim(), date: $('#tDate').value || todayISO(),
    };
    if (d.type === 'transferencia') {
      rec.to = $('#tTo').value; delete rec.category;
      if (rec.to === rec.account) { toast('Elige cuentas distintas'); return; }
    } else delete rec.to;
    if (rec.smsHash && !S.smsSeen.includes(rec.smsHash)) S.smsSeen.push(rec.smsHash);
    if (isEdit) S.txs[S.txs.findIndex(t => t.id === d.id)] = rec; else S.txs.push(rec);
    save(); closeSheet(); render();
    toast(isEdit ? 'Movimiento actualizado' : 'Movimiento agregado');
  };
  if (isEdit) $('#tDel').onclick = () => {
    if (!confirm('¿Eliminar este movimiento?')) return;
    S.txs = S.txs.filter(t => t.id !== d.id);
    save(); closeSheet(); render(); toast('Movimiento eliminado');
  };
  else $('#tCancel').onclick = closeSheet;
}

/* ---------- Formulario de cuenta ---------- */
function accountSheet(acc) {
  const isEdit = !!acc;
  const d = acc ? { ...acc } : { name: '', type: 'debito', color: COLORS[S.accounts.length % COLORS.length], initial: 0, bank: '', last4: '' };
  const current = isEdit ? accBalance(acc.id) : 0;
  let nameTouched = isEdit;

  openSheet(`
    <h2 class="sheet-title">${isEdit ? 'Editar cuenta' : 'Nueva cuenta'}</h2>
    <div class="preview-wrap" id="aPrev"></div>
    <div class="field"><label>Banco o billetera</label>
      <div class="bank-grid" id="aBank">
        <button class="bank" data-v=""><div class="blogo">${SVG.wallet}</div><span>Ninguno</span></button>
        ${Object.entries(BANKS).map(([k, b]) => `<button class="bank" data-v="${k}"><div class="blogo has-img">${logoImg(k)}</div><span>${esc(b.n)}</span></button>`).join('')}
      </div>
    </div>
    <div class="field"><label>Nombre</label><input class="input" id="aName" placeholder="Ej. Cuenta de ahorros, Tarjeta Visa" value="${esc(d.name)}"></div>
    <div class="field"><label>Tipo</label><div class="chips" id="aType">${Object.entries(ACC_TYPES).map(([k, v]) => `<button class="chip" data-v="${k}">${v.n}</button>`).join('')}</div></div>
    <div class="row2">
      <div class="field"><label id="aBalLabel"></label><input class="input" id="aBal" inputmode="decimal" placeholder="0" value="${isEdit ? Math.abs(current) || '' : ''}"></div>
      <div class="field"><label>Últimos 4 dígitos</label><input class="input" id="aLast4" inputmode="numeric" maxlength="4" placeholder="Opcional" value="${esc(d.last4 || '')}"></div>
    </div>
    <p class="hint" id="aHint"></p>
    <div class="field"><label>Color de la tarjeta</label><div class="swatches" id="aColor">${COLORS.map(c => `<button class="swatch" data-v="${c}" style="background:${c};color:${c}" aria-label="Color"></button>`).join('')}</div></div>
    <button class="btn" id="aSave">${isEdit ? 'Guardar cambios' : 'Crear cuenta'}</button>
    ${isEdit ? '<button class="btn danger" id="aDel">Eliminar cuenta</button>' : '<button class="btn ghost" id="aCancel">Cancelar</button>'}
  `);

  const sync = () => {
    d.name = $('#aName').value;
    d.last4 = $('#aLast4').value.replace(/\D/g, '');
    const v = Math.abs(parseAmount($('#aBal').value) || 0);
    $('#aPrev').innerHTML = `<div class="stack single">${walletCard({ ...d, _bal: d.type === 'credito' ? -v : v }, { preview: true, sel: true })}</div>`;
    $$('#aBank .bank').forEach(b => b.classList.toggle('on', b.dataset.v === (d.bank || '')));
    $$('#aType .chip').forEach(b => b.classList.toggle('on', b.dataset.v === d.type));
    $$('#aColor .swatch').forEach(b => b.classList.toggle('on', b.dataset.v === d.color));
    const cred = d.type === 'credito';
    $('#aBalLabel').textContent = cred ? 'Deuda actual' : (isEdit ? 'Saldo actual' : 'Saldo inicial');
    $('#aHint').textContent = cred
      ? 'Lo que debes hoy en la tarjeta. Se resta de tu saldo total.'
      : isEdit ? 'Si cambias el saldo se ajusta para coincidir con tu banco, sin modificar tus movimientos.' : 'El dinero que tienes hoy en esta cuenta. Los 4 dígitos ayudan a reconocer los SMS.';
  };
  sync();

  $('#aName').oninput = () => { nameTouched = true; sync(); };
  $('#aBal').oninput = sync;
  $('#aLast4').oninput = sync;
  $('#aBank').onclick = e => {
    const b = e.target.closest('.bank'); if (!b) return;
    d.bank = b.dataset.v;
    if (d.bank) {
      d.color = BANKS[d.bank].c;
      if (!nameTouched || !$('#aName').value.trim()) $('#aName').value = BANKS[d.bank].n;
      if (['nequi', 'daviplata', 'movii', 'dale', 'mercadopago', 'paypal'].includes(d.bank) && !isEdit) d.type = 'digital';
    }
    sync();
  };
  $('#aType').onclick = e => { const b = e.target.closest('button'); if (b) { d.type = b.dataset.v; sync(); } };
  $('#aColor').onclick = e => { const b = e.target.closest('button'); if (b) { d.color = b.dataset.v; sync(); } };

  $('#aSave').onclick = () => {
    const name = $('#aName').value.trim();
    if (!name) { toast('Ponle un nombre a la cuenta'); $('#aName').focus(); return; }
    let target = parseAmount($('#aBal').value);
    if (isNaN(target)) target = 0;
    if (d.type === 'credito') target = -Math.abs(target);
    const rec = { id: d.id || uid(), name, type: d.type, color: d.color, bank: d.bank || '', last4: d.last4 || '' };
    rec.initial = target - (isEdit ? txDelta(d.id) : 0);
    if (isEdit) S.accounts[S.accounts.findIndex(a => a.id === d.id)] = rec; else { S.accounts.push(rec); selAcc = rec.id; }
    save(); closeSheet(); render();
    toast(isEdit ? 'Cuenta actualizada' : 'Cuenta creada');
  };
  if (isEdit) $('#aDel').onclick = () => {
    const n = S.txs.filter(t => t.account === d.id || t.to === d.id).length;
    if (!confirm(`¿Eliminar "${d.name}"?${n ? `\nTambién se eliminarán ${n} movimientos asociados.` : ''}`)) return;
    S.accounts = S.accounts.filter(a => a.id !== d.id);
    S.txs = S.txs.filter(t => t.account !== d.id && t.to !== d.id);
    save(); closeSheet(); render(); toast('Cuenta eliminada');
  };
  else $('#aCancel').onclick = closeSheet;
}

/* ---------- Gastos mensuales ---------- */
function billSheet(bill) {
  if (!S.accounts.length) { toast('Primero agrega una cuenta'); return accountSheet(); }
  const isEdit = !!bill;
  const d = bill ? { ...bill } : { name: '', amount: '', day: 1, account: S.accounts[0].id, category: 'servicios' };
  openSheet(`
    <h2 class="sheet-title">${isEdit ? 'Editar gasto mensual' : 'Nuevo gasto mensual'}</h2>
    <input class="amount-input" id="bAmt" inputmode="decimal" placeholder="0" value="${d.amount}">
    <p class="amount-cur">${esc(S.settings.currency)} · cada mes</p>
    <div class="field"><label>Nombre</label><input class="input" id="bName" placeholder="Ej. Arriendo, Internet, Netflix" value="${esc(d.name)}"></div>
    <div class="row2">
      <div class="field"><label>Día de pago</label><input class="input" id="bDay" type="number" min="1" max="31" inputmode="numeric" value="${d.day}"></div>
      <div class="field"><label>Se paga desde</label><select class="input" id="bAcc">${accOptions(d.account)}</select></div>
    </div>
    <div class="field"><label>Categoría</label><div class="chips" id="bCat">${catChips('egreso', d.category)}</div></div>
    <button class="btn" id="bSave">${isEdit ? 'Guardar cambios' : 'Agregar'}</button>
    ${isEdit ? '<button class="btn danger" id="bDel">Eliminar gasto mensual</button>' : '<button class="btn ghost" id="bCancel">Cancelar</button>'}
  `);
  if (!isEdit) setTimeout(() => $('#bName').focus(), 350);
  $('#bCat').onclick = e => { const b = e.target.closest('button'); if (b) { d.category = b.dataset.v; $('#bCat').innerHTML = catChips('egreso', d.category); } };
  $('#bName').oninput = () => {
    const g = guessCat($('#bName').value, 'egreso');
    if (g !== 'otros' && !isEdit) { d.category = g; $('#bCat').innerHTML = catChips('egreso', d.category); }
  };
  $('#bSave').onclick = () => {
    const name = $('#bName').value.trim();
    const amount = Math.abs(parseAmount($('#bAmt').value));
    const day = Math.min(31, Math.max(1, parseInt($('#bDay').value) || 1));
    if (!name) { toast('Ponle un nombre'); return $('#bName').focus(); }
    if (!(amount > 0)) { toast('Ingresa el monto'); return $('#bAmt').focus(); }
    const rec = { id: d.id || uid(), name, amount, day, account: $('#bAcc').value, category: d.category };
    if (isEdit) S.bills[S.bills.findIndex(b => b.id === d.id)] = rec; else S.bills.push(rec);
    save(); closeSheet(); render(); toast(isEdit ? 'Gasto actualizado' : 'Gasto mensual agregado');
  };
  if (isEdit) $('#bDel').onclick = () => {
    if (!confirm(`¿Eliminar "${d.name}" de tus gastos mensuales?\nLos pagos ya registrados se mantienen en el historial.`)) return;
    S.bills = S.bills.filter(b => b.id !== d.id);
    save(); closeSheet(); render(); toast('Gasto mensual eliminado');
  };
  else $('#bCancel').onclick = closeSheet;
}

function payBill(id) {
  const b = S.bills.find(x => x.id === id);
  if (!b) return;
  const ym = billMonth;
  const paid = billTx(id, ym);
  if (paid) {
    if (!confirm(`¿Desmarcar "${b.name}"?\nSe eliminará el egreso de ${fmt(paid.amount)} y el dinero vuelve a tu saldo.`)) return;
    S.txs = S.txs.filter(t => t.id !== paid.id);
    save(); render(); return toast('Pago desmarcado');
  }
  if (!S.accounts.length) return toast('Primero agrega una cuenta');
  const isCur = ym === todayISO().slice(0, 7);
  const date = isCur ? todayISO() : `${ym}-${String(Math.min(b.day, daysInMonth(ym))).padStart(2, '0')}`;
  openSheet(`
    <h2 class="sheet-title">Pagar ${esc(b.name)}</h2>
    <input class="amount-input" id="pAmt" inputmode="decimal" value="${b.amount}">
    <p class="amount-cur">${ymLabel(ym)} · puedes ajustar el monto si cambió</p>
    <div class="row2">
      <div class="field"><label>Desde</label><select class="input" id="pAcc">${accOptions(accById(b.account) ? b.account : S.accounts[0].id)}</select></div>
      <div class="field"><label>Fecha</label><input class="input" type="date" id="pDate" value="${date}"></div>
    </div>
    <button class="btn" id="pGo">Marcar como pagado</button>
    <button class="btn ghost" id="pCancel">Cancelar</button>
  `);
  $('#pCancel').onclick = closeSheet;
  $('#pGo').onclick = () => {
    const amount = Math.abs(parseAmount($('#pAmt').value));
    if (!(amount > 0)) return toast('Ingresa un monto válido');
    S.txs.push({ id: uid(), created: Date.now(), type: 'egreso', amount, account: $('#pAcc').value, category: b.category, note: b.name, date: $('#pDate').value || date, billId: b.id, billMonth: ym });
    save(); closeSheet(); render(); toast(`${b.name} pagado · −${fmt(amount)}`);
  };
}

/* ---------- Notas ---------- */
function addNote() {
  const text = $('#nText').value.trim();
  if (!text) { $('#nText').focus(); return; }
  const amount = $('#nAmt') ? Math.abs(parseAmount($('#nAmt').value)) || 0 : 0;
  S.notes.push({ id: uid(), list: noteList, text, amount, done: false, created: Date.now() });
  save(); render();
  setTimeout(() => $('#nText')?.focus(), 50);
}

function toggleNote(id) {
  const n = S.notes.find(x => x.id === id);
  if (!n) return;
  if (n.done) {
    if (n.txId && accById(S.txs.find(t => t.id === n.txId)?.account)) {
      if (!confirm('¿Desmarcar? También se eliminará el movimiento que registraste al completarla.')) return;
      S.txs = S.txs.filter(t => t.id !== n.txId);
    }
    n.done = false; delete n.txId; delete n.doneAt;
    save(); return render();
  }
  const money = NOTE_LISTS[n.list].money && n.amount > 0 && S.accounts.length;
  if (!money) { n.done = true; n.doneAt = Date.now(); save(); return render(); }

  const isIn = n.list === 'medeben';
  openSheet(`
    <h2 class="sheet-title">${isIn ? '¿Ya te pagaron?' : '¿Ya pagaste?'}</h2>
    <p class="hint center" style="margin-top:-6px">${esc(n.text)} · <b>${fmt(n.amount)}</b></p>
    <div class="field"><label>${isIn ? 'Entró a la cuenta' : 'Salió de la cuenta'}</label><select class="input" id="nAcc">${accOptions(S.accounts[0].id)}</select></div>
    <button class="btn" id="nReg">Marcar y registrar ${isIn ? 'ingreso' : 'egreso'}</button>
    <button class="btn ghost" id="nOnly">Solo marcar como completado</button>
  `);
  const finish = withTx => {
    if (withTx) {
      const t = { id: uid(), created: Date.now(), type: isIn ? 'ingreso' : 'egreso', amount: n.amount, account: $('#nAcc').value, category: isIn ? 'prestamo' : 'deudas', note: n.text, date: todayISO() };
      S.txs.push(t); n.txId = t.id;
    }
    n.done = true; n.doneAt = Date.now();
    save(); closeSheet(); render();
    toast(withTx ? `${isIn ? '+' : '−'}${fmt(n.amount)} registrado` : 'Completado');
  };
  $('#nReg').onclick = () => finish(true);
  $('#nOnly').onclick = () => finish(false);
}

function noteSheet(n) {
  openSheet(`
    <h2 class="sheet-title">Editar nota</h2>
    <div class="field"><label>Texto</label><input class="input" id="eText" value="${esc(n.text)}"></div>
    <div class="field"><label>Detalle (opcional)</label><input class="input" id="eDetail" placeholder="Ej. Me paga el viernes" value="${esc(n.detail || '')}"></div>
    <div class="row2">
      <div class="field"><label>Lista</label><select class="input" id="eList">${Object.entries(NOTE_LISTS).map(([k, v]) => `<option value="${k}" ${k === n.list ? 'selected' : ''}>${v.n}</option>`).join('')}</select></div>
      <div class="field"><label>Monto (opcional)</label><input class="input" id="eAmt" inputmode="decimal" value="${n.amount || ''}"></div>
    </div>
    <button class="btn" id="eSave">Guardar</button>
    <button class="btn danger" id="eDel">Eliminar nota</button>
  `);
  $('#eSave').onclick = () => {
    const text = $('#eText').value.trim();
    if (!text) return toast('Escribe algo');
    Object.assign(n, { text, detail: $('#eDetail').value.trim(), list: $('#eList').value, amount: Math.abs(parseAmount($('#eAmt').value)) || 0 });
    save(); closeSheet(); render();
  };
  $('#eDel').onclick = () => { S.notes = S.notes.filter(x => x.id !== n.id); save(); closeSheet(); render(); toast('Nota eliminada'); };
}

/* ---------- SMS del banco ---------- */
function hashText(s) {
  let h = 5381;
  const t = s.toLowerCase().replace(/\s+/g, ' ').trim();
  for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0;
  return 'h' + (h >>> 0).toString(36);
}
function titleCase(s) {
  return s === s.toUpperCase() ? s.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase()) : s;
}

// Convierte un SMS bancario en un movimiento. Devuelve null si no parece una transacción.
function parseSMS(raw) {
  const text = String(raw || '').replace(/\s+/g, ' ').trim();
  if (text.length < 8) return null;
  const m = text.match(/(?:\$|COP|USD)\s?(\d[\d.,]*)/i);
  if (!m) return null;
  if (/c[oó]digo|clave din|otp|contrase/i.test(text) && !/compr|pag|transfer|recib|retir/i.test(text)) return null;
  const amount = Math.abs(parseAmount(m[1]));
  if (!(amount > 0)) return null;

  const strongOut = /compraste|pagaste|transferiste|enviaste|retiraste|compra (?:por|de|aprobada)|pago (?:por|de|a|en)|retiro (?:por|de)|avance|realizaste una compra|debitamos|se debit/i;
  const inRe = /recibiste|te (?:enviaron|envi[oó]|lleg[oó]|transfiri[oó]|consignaron)|abono|consignaci[oó]n|dep[oó]sito|reembolso|devoluci[oó]n|recibido|ingres[oó]|n[oó]mina/i;
  const type = strongOut.test(text) ? 'egreso' : inRe.test(text) ? 'ingreso' : 'egreso';

  // Comercio / persona
  const after = text.slice(m.index + m[0].length);
  const stop = '(?=\\s+(?:con|el|desde|a las|en tu|en la|en su|por|hoy|ref)\\b|\\s+\\d{1,2}[:/]|\\s*[.;,(]|$)';
  let who = '';
  let mm = after.match(new RegExp('^\\s*(?:en|a|para|de)\\s+(.+?)' + stop, 'i'));
  if (mm && !/^(tu|su|la|el)\b/i.test(mm[1])) who = mm[1];
  if (!who) { mm = text.match(new RegExp('\\b(?:en|de)\\s+([A-ZÁÉÍÓÚÑ0-9][A-ZÁÉÍÓÚÑ0-9 &*.\\-\']{2,}?)' + stop)); if (mm) who = mm[1]; }
  who = titleCase(who.replace(/\*+\d*/g, '').trim()).slice(0, 40);

  const bank = detectBank(text);
  const last4 = (text.match(/\*+\s?(\d{4})\b/) || text.match(/termina(?:da)? en (\d{4})/i) || [])[1] || '';
  const dm = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  let date = dm ? parseDate(dm[0]) : todayISO();
  if (date > isoAdd(todayISO(), 1)) date = todayISO();

  const acc = (last4 && S.accounts.find(a => a.last4 === last4))
    || (bank && S.accounts.find(a => a.bank === bank))
    || (bank && S.accounts.find(a => BANKS[bank].re.test(a.name)))
    || S.accounts[0];

  let note = who;
  if (!note) note = /transfer/i.test(text) ? 'Transferencia' : /retir/i.test(text) ? 'Retiro' : type === 'ingreso' ? 'Ingreso' : 'Pago';
  return {
    type, amount, note, date, bank, last4,
    account: acc?.id, category: guessCat(text, type) === 'otros' ? guessCat(note, type) : guessCat(text, type),
    hash: hashText(text),
  };
}

function smsToTx(p) {
  return { id: uid(), created: Date.now(), type: p.type, amount: p.amount, account: p.account, category: p.category, note: p.note, date: p.date, source: 'sms', smsHash: p.hash };
}

// Divide el archivo de SMS en mensajes individuales
function splitMessages(text) {
  let parts = text.split(/\n\s*(?:#{3,}|-{3,}|={3,})\s*(?:\n|$)/);
  if (parts.length === 1) parts = text.split(/\n\s*\n/);
  if (parts.length === 1) parts = text.split(/\n/);
  return parts.map(s => s.trim()).filter(Boolean);
}

function importSMSText(text) {
  const msgs = splitMessages(text);
  let added = 0, dup = 0, skipped = 0;
  for (const msg of msgs) {
    const p = parseSMS(msg);
    if (!p || !p.account) { skipped++; continue; }
    if (S.smsSeen.includes(p.hash)) { dup++; continue; }
    S.txs.push(smsToTx(p)); S.smsSeen.push(p.hash); added++;
  }
  if (S.smsSeen.length > 3000) S.smsSeen = S.smsSeen.slice(-3000);
  S.settings.lastSync = todayISO();
  save();
  return { added, dup, skipped };
}

function smsSyncSheet() {
  if (!S.accounts.length) { toast('Primero agrega una cuenta'); return accountSheet(); }
  openSheet(`
    <h2 class="sheet-title">Sincronizar SMS</h2>
    <p class="hint center" style="margin-top:-6px">Elige el archivo <b>sms.txt</b> donde Atajos guarda los mensajes del banco. Solo se agregan los mensajes nuevos.</p>
    <div class="field"><label>Archivo de mensajes</label><input class="input" type="file" id="sFile" accept=".txt,text/plain"></div>
    <button class="btn" id="sGo">Sincronizar</button>
    <button class="btn ghost" id="sHelp">¿Cómo lo configuro?</button>
  `);
  $('#sHelp').onclick = smsSetupSheet;
  $('#sGo').onclick = async () => {
    const f = $('#sFile').files[0];
    if (!f) return toast('Elige el archivo sms.txt');
    const r = importSMSText(await f.text());
    closeSheet(); render();
    toast(r.added ? `${r.added} movimientos nuevos${r.dup ? ` · ${r.dup} ya estaban` : ''}` : r.dup ? 'Todo al día, no hay mensajes nuevos' : 'No se encontraron transacciones');
  };
}

function smsPasteSheet() {
  if (!S.accounts.length) { toast('Primero agrega una cuenta'); return accountSheet(); }
  openSheet(`
    <h2 class="sheet-title">Registrar desde SMS</h2>
    <p class="hint center" style="margin-top:-6px">Copia el mensaje del banco (mantén presionado → Copiar) y pégalo aquí. Puedes pegar varios a la vez.</p>
    <textarea class="input" id="smsText" rows="5" placeholder="Ej. Bancolombia: Compraste $45.000 en EXITO con tu T.Deb *1234, el 05/11/2026…"></textarea>
    <button class="btn ghost" id="smsPaste">${SVG.msg} Pegar del portapapeles</button>
    <div id="smsPrev"></div>
    <button class="btn" id="smsGo">Registrar</button>
  `);
  const prev = () => {
    const msgs = splitMessages($('#smsText').value);
    const ps = msgs.map(parseSMS).filter(Boolean);
    $('#smsPrev').innerHTML = ps.length ? `<div class="card flush sms-prev">${ps.map(p => txRow({ ...p, id: '', source: 'sms' })).join('')}</div>
      ${ps.some(p => S.smsSeen.includes(p.hash)) ? '<p class="hint">Algunos mensajes ya estaban registrados y se omitirán.</p>' : ''}`
      : $('#smsText').value.trim() ? '<p class="hint center">No se reconoce una transacción en el texto.</p>' : '';
  };
  $('#smsText').oninput = prev;
  $('#smsPaste').onclick = async () => {
    try { $('#smsText').value = await navigator.clipboard.readText(); prev(); }
    catch { toast('Mantén presionado el cuadro y elige Pegar'); $('#smsText').focus(); }
  };
  $('#smsGo').onclick = () => {
    if (!$('#smsText').value.trim()) return toast('Pega primero el SMS');
    const r = importSMSText($('#smsText').value);
    if (!r.added) return toast(r.dup ? 'Ese mensaje ya estaba registrado' : 'No se reconoce una transacción');
    closeSheet(); render(); toast(`${r.added} movimiento${r.added > 1 ? 's' : ''} registrado${r.added > 1 ? 's' : ''}`);
  };
}

function smsSetupSheet() {
  openSheet(`
    <h2 class="sheet-title">Registro automático por SMS</h2>
    <p class="hint" style="margin-top:-6px">El iPhone no permite que ninguna app lea tus mensajes directamente. La forma de lograrlo es que <b>Atajos</b> guarde cada SMS del banco en un archivo, y la app lo lee cuando tocas <b>Sincronizar SMS</b>. No abre nada ni te interrumpe.</p>

    <div class="field"><label>1 · Crear la automatización (una sola vez)</label></div>
    <ol class="steps">
      <li>Abre <b>Atajos</b> → pestaña <b>Automatización</b> → <b>+</b> → <b>Mensaje</b>.</li>
      <li>En <b>El mensaje contiene</b> escribe <b>$</b>. (Opcional: en <b>Remitente</b> elige el contacto de tu banco, ej. Bancolombia 85540).</li>
      <li>Elige <b>Ejecutar inmediatamente</b> y desactiva <b>Notificar al ejecutar</b> → <b>Siguiente</b> → <b>Nuevo atajo en blanco</b>.</li>
      <li>Agrega la acción <b>Texto</b> y dentro pon la variable <b>Entrada del atajo</b> (toca y elige <b>Contenido</b>). Debajo, en una línea nueva, escribe <b>###</b>.</li>
      <li>Agrega la acción <b>Añadir a archivo de texto</b> (<i>Append to Text File</i>): archivo <b>sms.txt</b> en la carpeta <b>Atajos</b> de iCloud Drive, con <b>Nueva línea</b> activado.</li>
    </ol>

    <div class="field"><label>2 · Cuando quieras actualizar</label></div>
    <ol class="steps">
      <li>En la app toca <b>Sincronizar SMS</b> y elige <b>iCloud Drive → Atajos → sms.txt</b>.</li>
      <li>Se registran solo los mensajes nuevos, con categoría y cuenta automáticas.</li>
    </ol>

    <div class="field"><label>Consejos</label></div>
    <ul class="steps">
      <li>Pon los <b>últimos 4 dígitos</b> en cada cuenta para que la app sepa a cuál va cada SMS.</li>
      <li>Si no quieres automatizar, copia un SMS y usa <b>Pegar SMS</b>.</li>
      <li>En Android puedes hacer lo mismo con MacroDroid (“Notificación/SMS recibido” → “Escribir en archivo”).</li>
    </ul>
    <button class="btn" id="sClose">Entendido</button>
  `);
  $('#sClose').onclick = closeSheet;
}

/* ---------- Importar CSV ---------- */
function parseCSV(text) {
  const first = text.split(/\r?\n/)[0] || '';
  const cnt = ch => (first.match(new RegExp(ch, 'g')) || []).length;
  const sep = cnt(';') > cnt(',') ? ';' : cnt('\t') > cnt(',') ? '\t' : ',';
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === sep) { row.push(cell); cell = ''; }
    else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (ch !== '\r') cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim()));
}

function csvToTxs(rows, accountId) {
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  const head = rows[0].map(norm);
  const find = re => head.findIndex(h => re.test(h));
  let iDate = find(/fecha|date/), iDesc = find(/descrip|detalle|glosa|concepto|comercio|movimiento|description|referencia/),
      iAmt = find(/^monto|importe|amount|valor|total/), iOut = find(/cargo|debito|egreso|retiro|debit/), iIn = find(/abono|credito|ingreso|deposito|credit/);
  let start = 1;
  if (iDate < 0 && iAmt < 0 && iOut < 0) { iDate = 0; iDesc = 1; iAmt = 2; start = 0; }
  const out = [];
  for (const r of rows.slice(start)) {
    let amount, type;
    if (iAmt >= 0 && r[iAmt]?.trim()) {
      const v = parseAmount(r[iAmt]); if (!v) continue;
      amount = Math.abs(v); type = v < 0 ? 'egreso' : 'ingreso';
    } else {
      const o = Math.abs(parseAmount(r[iOut])) || 0, n = Math.abs(parseAmount(r[iIn])) || 0;
      if (o > 0) { amount = o; type = 'egreso'; } else if (n > 0) { amount = n; type = 'ingreso'; } else continue;
    }
    const note = (iDesc >= 0 ? r[iDesc] : '').trim();
    out.push({ id: uid(), created: Date.now(), type, amount, account: accountId, note, date: parseDate(r[iDate]), category: guessCat(note, type) });
  }
  return out;
}

function csvSheet() {
  if (!S.accounts.length) { toast('Primero agrega una cuenta'); return accountSheet(); }
  openSheet(`
    <h2 class="sheet-title">Importar extracto</h2>
    <p class="hint center" style="margin-top:-6px">Descarga el extracto de tu banco en CSV (o guarda el Excel como CSV) y súbelo aquí.</p>
    <div class="field"><label>Cuenta destino</label><select class="input" id="cAcc">${accOptions()}</select></div>
    <div class="field"><label>Archivo</label><input class="input" type="file" id="cFile" accept=".csv,.txt,text/csv"></div>
    <ul class="steps">
      <li>Se detectan columnas como <b>Fecha</b>, <b>Descripción</b> y <b>Valor</b> (negativo = egreso), o <b>Débito</b> / <b>Crédito</b>.</li>
      <li>Las categorías se asignan solas y los duplicados se omiten.</li>
    </ul>
    <button class="btn" id="cGo">Importar</button>
    <button class="btn ghost" id="cCancel">Cancelar</button>
  `);
  $('#cCancel').onclick = closeSheet;
  $('#cGo').onclick = async () => {
    const f = $('#cFile').files[0];
    if (!f) { toast('Elige un archivo CSV'); return; }
    try {
      const rows = parseCSV(await f.text());
      if (!rows.length) throw 0;
      const news = csvToTxs(rows, $('#cAcc').value);
      const key = t => [t.account, t.date, t.type, t.amount, t.note].join('|');
      const existing = new Set(S.txs.map(key));
      const fresh = news.filter(t => !existing.has(key(t)));
      S.txs.push(...fresh); save(); closeSheet(); render();
      toast(`${fresh.length} movimientos importados${news.length - fresh.length ? ` · ${news.length - fresh.length} duplicados` : ''}`);
    } catch { toast('No se pudo leer el archivo'); }
  };
}

/* ---------- SMS recibido por enlace (?sms=...) ---------- */
function handleURL() {
  const p = new URLSearchParams(location.search);
  const sms = p.get('sms');
  if (!sms) return;
  history.replaceState(null, '', location.pathname);
  if (!S.accounts.length) return toast('Agrega una cuenta antes de registrar');
  const r = importSMSText(sms);
  setTimeout(() => toast(r.added ? 'Movimiento registrado desde SMS' : r.dup ? 'Ese SMS ya estaba registrado' : 'No se reconoce el SMS'), 300);
}

/* ---------- Respaldo ---------- */
function exportJSON() {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `finanzas-respaldo-${todayISO()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('Respaldo descargado');
}
function importJSON() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.json,application/json';
  inp.onchange = async () => {
    try {
      const d = JSON.parse(await inp.files[0].text());
      if (!Array.isArray(d.accounts) || !Array.isArray(d.txs)) throw 0;
      if (!confirm('Esto reemplazará tus datos actuales. ¿Continuar?')) return;
      localStorage.setItem(KEY, JSON.stringify(d));
      S = load(); save(); render(); toast('Respaldo restaurado');
    } catch { toast('Archivo de respaldo inválido'); }
  };
  inp.click();
}

/* ---------- Navegación y eventos ---------- */
function goTab(t) {
  if (t === tab) return;
  if (t === 'ajustes') prevTab = tab;
  tab = t; window.scrollTo({ top: 0, behavior: 'smooth' }); render();
}

$$('.tabbar [data-tab]').forEach(b => b.onclick = () => goTab(b.dataset.tab));
$('#fab').onclick = () => txSheet();
$('#backdrop').onclick = closeSheet;
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

$('#topActions').addEventListener('click', e => {
  const a = e.target.closest('[data-top]')?.dataset.top;
  if (a === 'settings') goTab('ajustes');
  if (a === 'close') goTab(prevTab);
  if (a === 'add-account') accountSheet();
});

$('#view').addEventListener('click', e => {
  const pay = e.target.closest('[data-pay]');
  if (pay) return payBill(pay.dataset.pay);
  const nc = e.target.closest('[data-note-check]');
  if (nc) return toggleNote(nc.dataset.noteCheck);
  const tx = e.target.closest('[data-tx]');
  if (tx) return txSheet(S.txs.find(t => t.id === tx.dataset.tx));
  const acc = e.target.closest('[data-acc]');
  if (acc) {
    if (acc.dataset.acc === selAcc) return accountSheet(accById(selAcc));
    selAcc = acc.dataset.acc;
    return $$('#stack .wcard').forEach(c => c.classList.toggle('sel', c.dataset.acc === selAcc));
  }
  const bill = e.target.closest('[data-bill]');
  if (bill) return billSheet(S.bills.find(b => b.id === bill.dataset.bill));
  const note = e.target.closest('[data-note]');
  if (note) return noteSheet(S.notes.find(n => n.id === note.dataset.note));
  const nl = e.target.closest('[data-nl]');
  if (nl) { noteList = nl.dataset.nl; return render(); }
  const go = e.target.closest('[data-goto]');
  if (go) return goTab(go.dataset.goto);
  const f = e.target.closest('[data-f]');
  if (f) { movFilter = f.dataset.f; $$('#movSeg button').forEach(b => b.classList.toggle('on', b === f)); return renderMovList(); }
  const a = e.target.closest('[data-action]')?.dataset.action;
  switch (a) {
    case 'add-account': return accountSheet();
    case 'add-bill': return billSheet();
    case 'add-note': return addNote();
    case 'clear-done':
      S.notes = S.notes.filter(n => !(n.list === noteList && n.done)); save(); return render();
    case 'month-prev': movMonth = ymAdd(movMonth, -1); return render();
    case 'month-next': movMonth = ymAdd(movMonth, 1); return render();
    case 'bills-prev': billMonth = ymAdd(billMonth, -1); return render();
    case 'bills-next': billMonth = ymAdd(billMonth, 1); return render();
    case 'sms-paste': return smsPasteSheet();
    case 'sms-sync': return smsSyncSheet();
    case 'sms-setup': return smsSetupSheet();
    case 'import-csv': return csvSheet();
    case 'export': return exportJSON();
    case 'import-json': return importJSON();
    case 'reset':
      if (confirm('¿Borrar todas las cuentas, movimientos, pagos y notas? Esta acción no se puede deshacer.')) {
        S = { accounts: [], txs: [], notes: [], bills: [], smsSeen: [], settings: S.settings }; save(); render(); toast('Datos borrados');
      }
  }
});
$('#view').addEventListener('input', e => {
  if (e.target.id === 'movSearch') { movSearch = e.target.value; renderMovList(); }
});
$('#view').addEventListener('keydown', e => {
  if (e.key === 'Enter' && (e.target.id === 'nText' || e.target.id === 'nAmt')) addNote();
});
$('#view').addEventListener('change', e => {
  if (e.target.id === 'curSel') { S.settings.currency = e.target.value; save(); toast(`Moneda: ${e.target.value}`); }
});

/* ---------- Inicio ---------- */
$('#today').textContent = new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
const openNew = new URLSearchParams(location.search).has('nuevo');
save(); // guarda la migración de datos antiguos
handleURL();
render();
if (openNew) { history.replaceState(null, '', location.pathname); setTimeout(() => txSheet(), 250); }

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
