/* =========================================================
   Finanzas — control personal de gastos
   Datos guardados localmente en el navegador (localStorage).
   ========================================================= */

const KEY = 'finanzas.v1';

const COLORS = ['#0a84ff', '#30d158', '#ff9f0a', '#ff453a', '#bf5af2', '#64d2ff', '#ff375f', '#5e5ce6', '#3a3a3c', '#a2845e'];

const ACC_TYPES = {
  debito:    { n: 'Débito',            i: '💳' },
  credito:   { n: 'Crédito',           i: '💳' },
  efectivo:  { n: 'Efectivo',          i: '💵' },
  ahorro:    { n: 'Ahorro',            i: '🏦' },
  digital:   { n: 'Billetera digital', i: '📱' },
  inversion: { n: 'Inversión',         i: '📈' },
};

const CATS = {
  egreso: [
    ['comida', 'Comida', '🍽️'], ['super', 'Supermercado', '🛒'], ['transporte', 'Transporte', '🚗'],
    ['hogar', 'Hogar', '🏠'], ['servicios', 'Servicios', '💡'], ['salud', 'Salud', '🩺'],
    ['ocio', 'Ocio', '🎬'], ['compras', 'Compras', '🛍️'], ['educacion', 'Educación', '📚'],
    ['suscripciones', 'Suscripciones', '🔁'], ['otros', 'Otros', '🔹'],
  ],
  ingreso: [
    ['sueldo', 'Sueldo', '💼'], ['freelance', 'Freelance', '🧑‍💻'], ['ventas', 'Ventas', '🏷️'],
    ['inversiones', 'Inversiones', '📈'], ['regalo', 'Regalo', '🎁'], ['otros_in', 'Otros', '🔹'],
  ],
};

// Palabras clave para categorizar automáticamente (CSV y registro por URL)
const KEYWORDS = [
  [/uber eats|rappi|pedidos ?ya|restaur|caf[eé]|starbucks|mcdonald|burger|pizza|sushi|comida/i, 'comida'],
  [/super|jumbo|lider|walmart|carrefour|tottus|unimarc|soriana|oxxo|mercado/i, 'super'],
  [/uber|cabify|didi|taxi|metro|bus|bencin|gasolin|combustible|copec|shell|peaje|parking|estacionamiento/i, 'transporte'],
  [/netflix|spotify|disney|hbo|max|prime|youtube|apple\.com|icloud|google|chatgpt|openai|claude/i, 'suscripciones'],
  [/luz|agua|gas|internet|telefon|movistar|entel|claro|vtr|wom|enel/i, 'servicios'],
  [/farmacia|cruz verde|salcobrand|ahumada|cl[ií]nica|m[eé]dic|dental|hospital/i, 'salud'],
  [/cine|cinemark|steam|playstation|xbox|nintendo|bar |concierto|ticket/i, 'ocio'],
  [/arriendo|alquiler|renta|ikea|sodimac|easy|home ?center|condominio/i, 'hogar'],
  [/amazon|mercado ?libre|falabella|ripley|paris|zara|h&m|aliexpress|shein|tienda/i, 'compras'],
  [/universidad|colegio|curso|udemy|platzi|libro/i, 'educacion'],
];
const KEYWORDS_IN = [
  [/sueldo|salario|remuneraci|n[oó]mina|payroll/i, 'sueldo'],
  [/honorario|freelance|factura|upwork|fiverr/i, 'freelance'],
  [/dividend|inter[eé]s|rescate|fondo/i, 'inversiones'],
];

const LOCALES = { USD: 'es-US', EUR: 'es-ES', CLP: 'es-CL', ARS: 'es-AR', MXN: 'es-MX', COP: 'es-CO', PEN: 'es-PE', UYU: 'es-UY', BOB: 'es-BO', PYG: 'es-PY', GTQ: 'es-GT', CRC: 'es-CR', DOP: 'es-DO', VES: 'es-VE' };

/* ---------- Estado ---------- */
let S = load();
let tab = 'inicio';
let movMonth = todayISO().slice(0, 7);
let movFilter = 'todos';
let movSearch = '';

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && Array.isArray(d.accounts)) return { settings: { currency: 'USD' }, txs: [], ...d };
  } catch (e) { /* datos dañados → empezar de cero */ }
  return { accounts: [], txs: [], settings: { currency: 'USD' } };
}
function save() { localStorage.setItem(KEY, JSON.stringify(S)); }

/* ---------- Utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function fmt(n) {
  const cur = S.settings.currency || 'USD';
  try {
    return new Intl.NumberFormat(LOCALES[cur] || 'es', { style: 'currency', currency: cur, maximumFractionDigits: 2 }).format(n || 0);
  } catch { return (n || 0).toFixed(2); }
}

function toISO(d) { return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); }
function todayISO() { return toISO(new Date()); }
function isoAdd(iso, days) { const d = new Date(iso + 'T12:00'); d.setDate(d.getDate() + days); return toISO(d); }
function ymAdd(ym, n) { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
function ymLabel(ym, opts = { month: 'long', year: 'numeric' }) {
  const [y, m] = ym.split('-').map(Number);
  const s = new Date(y, m - 1, 1).toLocaleDateString('es', opts);
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function relDay(iso) {
  const t = todayISO();
  if (iso === t) return 'Hoy';
  if (iso === isoAdd(t, -1)) return 'Ayer';
  const s = new Date(iso + 'T12:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Acepta "1.500", "1,500.50", "1.500,50", "$ -2.300", "(45,00)"
function parseAmount(v) {
  if (typeof v === 'number') return v;
  let s = String(v ?? '').trim();
  const neg = /^\(.*\)$/.test(s) || /-/.test(s);
  s = s.replace(/[^\d.,]/g, '');
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
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
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

/* ---------- Componentes ---------- */
function txRow(t) {
  const acc = accById(t.account);
  const tint = `background:color-mix(in srgb, ${acc?.color || '#8e8e93'} 16%, transparent)`;
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
  return `<div class="row" data-tx="${t.id}">
    <div class="icon" style="${tint}">${icon}</div>
    <div class="meta"><div class="title">${esc(title)}</div><div class="sub">${esc(sub)}</div></div>
    <div class="amt ${cls}">${sign}${fmt(t.amount)}</div>
  </div>`;
}

function accCard(a) {
  const t = ACC_TYPES[a.type] || ACC_TYPES.debito;
  return `<button class="acc-card" style="--c:${a.color}" data-acc="${a.id}">
    <div class="top"><span>${t.i} ${t.n}</span></div>
    <div><div class="name">${esc(a.name)}</div><div class="bal">${fmt(accBalance(a.id))}</div></div>
  </button>`;
}

function emptyState(em, text, btn) {
  return `<div class="empty"><span class="em">${em}</span>${text}${btn ? `<div style="margin-top:16px"><button class="btn sm" data-action="${btn[1]}">${btn[0]}</button></div>` : ''}</div>`;
}

function animateNumber(el, to) {
  if (!el) return;
  const start = performance.now(), dur = 800;
  const step = now => {
    const p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(to * e);
    if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(to);
  };
  requestAnimationFrame(step);
}

// Las barras arrancan en 0 y crecen después de pintar para la animación suave
function growBars() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelectorAll('[data-w]').forEach(el => el.style.width = el.dataset.w);
    document.querySelectorAll('[data-h]').forEach(el => el.style.height = el.dataset.h);
  }));
}

/* ---------- Vistas ---------- */
const TITLES = { inicio: 'Inicio', movimientos: 'Movimientos', cuentas: 'Cuentas', ajustes: 'Ajustes' };

function render() {
  $('#title').textContent = TITLES[tab];
  document.querySelectorAll('.tabbar [data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  const html = { inicio: viewInicio, movimientos: viewMovimientos, cuentas: viewCuentas, ajustes: viewAjustes }[tab]();
  $('#view').innerHTML = `<div class="view">${html}</div>`;
  if (tab === 'inicio') animateNumber($('#heroNum'), totals().net);
  if (tab === 'movimientos') renderMovList();
  growBars();
}

function viewInicio() {
  if (!S.accounts.length) {
    return `<div class="card">${emptyState('👋', 'Bienvenido. Empieza agregando tus tarjetas, cuentas o efectivo.<br>Todo se sumará en un saldo total.', ['Agregar mi primera cuenta', 'add-account'])}</div>`;
  }
  const T = totals();
  const ym = todayISO().slice(0, 7);
  const M = monthStats(ym);
  const saveRate = M.inc > 0 ? Math.round((M.net / M.inc) * 100) : null;

  // Gastos por categoría
  const cats = Object.entries(M.byCat).sort((a, b) => b[1] - a[1]);
  const maxCat = cats[0]?.[1] || 1;
  const catHtml = cats.length
    ? cats.slice(0, 6).map(([id, v]) => {
        const c = catInfo(id);
        return `<div class="cat-row"><div class="top"><span>${c.i}&nbsp; ${c.n}</span><span>${fmt(v)}</span></div>
          <div class="track"><div data-w="${(v / maxCat) * 100}%"></div></div></div>`;
      }).join('')
    : `<div class="empty" style="padding:16px">Sin gastos este mes 🎉</div>`;

  // Últimos 6 meses
  const months = [];
  for (let i = 5; i >= 0; i--) { const k = ymAdd(ym, -i); months.push([k, monthStats(k)]); }
  const maxM = Math.max(1, ...months.map(([, s]) => Math.max(s.inc, s.exp)));
  const bars = months.map(([k, s]) => `<div class="bar-group">
      <div class="bar-pair"><div class="bar in" data-h="${(s.inc / maxM) * 100}%" title="Ingresos ${fmt(s.inc)}"></div><div class="bar out" data-h="${(s.exp / maxM) * 100}%" title="Egresos ${fmt(s.exp)}"></div></div>
      <div class="bar-label">${ymLabel(k, { month: 'short' }).replace('.', '')}</div></div>`).join('');

  const recent = sortedTxs(S.txs).slice(0, 5);

  return `
    <div class="card hero">
      <div class="label">Saldo total</div>
      <div class="big" id="heroNum">${fmt(T.net)}</div>
      <div class="split"><span>Activos <b>${fmt(T.assets)}</b></span><span>Deudas <b>${fmt(T.debts)}</b></span></div>
    </div>

    <div class="grid grid-2">
      <div class="card stat"><div class="label"><span class="dot" style="background:var(--green)"></span>Ingresos del mes</div><div class="value">${fmt(M.inc)}</div></div>
      <div class="card stat"><div class="label"><span class="dot" style="background:var(--red)"></span>Egresos del mes</div><div class="value">${fmt(M.exp)}</div></div>
      <div class="card stat"><div class="label"><span class="dot" style="background:var(--accent)"></span>Balance del mes</div><div class="value ${M.net < 0 ? 'negc' : ''}">${fmt(M.net)}</div></div>
      <div class="card stat"><div class="label"><span class="dot" style="background:#bf5af2"></span>Tasa de ahorro</div><div class="value">${saveRate === null ? '—' : saveRate + '%'}</div></div>
    </div>

    <div class="section-title">Mis cuentas <button class="link" data-goto="cuentas">Ver todas</button></div>
    <div class="wallet">${S.accounts.map(accCard).join('')}<button class="acc-card add" data-action="add-account"><span>+</span>Agregar</button></div>

    <div class="section-title" style="margin-top:14px">Gastos por categoría</div>
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

function viewCuentas() {
  if (!S.accounts.length) {
    return `<div class="card">${emptyState('💳', 'Agrega tarjetas de débito, crédito, efectivo, billeteras digitales o ahorros.', ['Agregar cuenta', 'add-account'])}</div>`;
  }
  const T = totals();
  const positives = S.accounts.map(a => [a, accBalance(a.id)]).filter(([, b]) => b > 0);
  return `
    <div class="card hero">
      <div class="label">Balance general</div>
      <div class="big">${fmt(T.net)}</div>
      <div class="split"><span>Activos <b>${fmt(T.assets)}</b></span><span>Deudas <b>${fmt(T.debts)}</b></span></div>
      ${positives.length ? `<div class="dist">${positives.map(([a, b]) => `<div style="flex:${b};background:${a.color}"></div>`).join('')}</div>
      <div class="legend">${positives.map(([a, b]) => `<span><i style="background:${a.color}"></i>${esc(a.name)} · ${Math.round((b / T.assets) * 100)}%</span>`).join('')}</div>` : ''}
    </div>
    <div class="section-title">Todas las cuentas <button class="link" data-action="add-account">Agregar</button></div>
    <div class="acc-grid">${S.accounts.map(accCard).join('')}</div>
    <p class="hint" style="margin-top:14px">Toca una cuenta para editarla o ajustar su saldo. Las tarjetas de crédito con deuda se restan del total.</p>
  `;
}

function viewAjustes() {
  const cur = S.settings.currency;
  const opts = Object.keys(LOCALES).map(c => `<option ${c === cur ? 'selected' : ''}>${c}</option>`).join('');
  return `
    <div class="card flush">
      <div class="set-row"><div class="icon" style="background:#30d158">$</div><div class="meta">Moneda</div>
        <select class="input" id="curSel">${opts}</select></div>
    </div>

    <div class="section-title">Conectar y automatizar</div>
    <div class="card flush">
      <button class="set-row" data-action="import-csv"><div class="icon" style="background:#0a84ff">⇪</div><div class="meta">Importar cartola / CSV del banco<div class="sub">Carga los movimientos exportados desde tu banco</div></div><span class="chev">›</span></button>
      <button class="set-row" data-action="shortcut"><div class="icon" style="background:#ff9f0a">⚡︎</div><div class="meta">Registro automático (Atajos / URL)<div class="sub">Registra pagos con Apple Pay o notificaciones</div></div><span class="chev">›</span></button>
    </div>

    <div class="section-title">Respaldo</div>
    <div class="card flush">
      <button class="set-row" data-action="export"><div class="icon" style="background:#5e5ce6">↓</div><div class="meta">Exportar respaldo (JSON)</div><span class="chev">›</span></button>
      <button class="set-row" data-action="import-json"><div class="icon" style="background:#64d2ff">↑</div><div class="meta">Restaurar respaldo</div><span class="chev">›</span></button>
      <button class="set-row" data-action="reset"><div class="icon" style="background:#ff453a">✕</div><div class="meta" style="color:var(--red)">Borrar todos los datos</div></button>
    </div>
    <p class="hint" style="text-align:center;margin-top:20px">${S.accounts.length} cuentas · ${S.txs.length} movimientos<br>Tus datos se guardan solo en este dispositivo.</p>
  `;
}

/* ---------- Hoja modal ---------- */
function openSheet(html) {
  $('#sheetBody').innerHTML = html;
  $('#sheet').scrollTop = 0;
  $('#sheet').classList.add('open');
  $('#backdrop').classList.add('open');
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

/* ---------- Formulario de movimiento ---------- */
function txSheet(tx) {
  if (!S.accounts.length) { toast('Primero agrega una cuenta'); return accountSheet(); }
  const isEdit = !!tx;
  const d = tx ? { ...tx } : {
    type: 'egreso', amount: '', account: S.accounts[0].id,
    to: S.accounts[1]?.id || '', category: 'comida', note: '', date: todayISO(),
  };
  const accOpts = sel => S.accounts.map(a => `<option value="${a.id}" ${a.id === sel ? 'selected' : ''}>${esc(a.name)}</option>`).join('');

  openSheet(`
    <h2 class="sheet-title">${isEdit ? 'Editar movimiento' : 'Nuevo movimiento'}</h2>
    <div class="segmented" id="tType">
      <button data-v="egreso">Egreso</button><button data-v="ingreso">Ingreso</button><button data-v="transferencia">Transferencia</button>
    </div>
    <input class="amount-input" id="tAmt" inputmode="decimal" placeholder="0" autocomplete="off" value="${d.amount}">
    <p class="amount-cur">${esc(S.settings.currency)}</p>
    <div class="field"><label id="tAccLabel">Cuenta</label><select class="input" id="tAcc">${accOpts(d.account)}</select></div>
    <div class="field" id="tToWrap"><label>Hacia</label><select class="input" id="tTo">${accOpts(d.to)}</select></div>
    <div class="field" id="tCatWrap"><label>Categoría</label><div class="chips" id="tCat"></div></div>
    <div class="row2">
      <div class="field"><label>Nota</label><input class="input" id="tNote" placeholder="Ej. Café, Uber…" value="${esc(d.note)}"></div>
      <div class="field"><label>Fecha</label><input class="input" type="date" id="tDate" value="${d.date}"></div>
    </div>
    <button class="btn" id="tSave">${isEdit ? 'Guardar cambios' : 'Agregar'}</button>
    ${isEdit ? '<button class="btn danger" id="tDel">Eliminar movimiento</button>' : '<button class="btn ghost" id="tCancel">Cancelar</button>'}
  `);

  const sync = () => {
    document.querySelectorAll('#tType button').forEach(b => b.classList.toggle('on', b.dataset.v === d.type));
    const isT = d.type === 'transferencia';
    $('#tToWrap').style.display = isT ? '' : 'none';
    $('#tCatWrap').style.display = isT ? 'none' : '';
    $('#tAccLabel').textContent = isT ? 'Desde' : 'Cuenta';
    $('#tAmt').style.color = d.type === 'ingreso' ? 'var(--green)' : d.type === 'egreso' ? 'var(--text)' : 'var(--accent)';
    if (!isT) {
      const list = CATS[d.type];
      if (!list.some(c => c[0] === d.category)) d.category = list[0][0];
      $('#tCat').innerHTML = list.map(([id, n, i]) => `<button class="chip ${id === d.category ? 'on' : ''}" data-v="${id}">${i} ${n}</button>`).join('');
    }
  };
  sync();
  if (!isEdit) setTimeout(() => $('#tAmt').focus(), 350);

  $('#tType').onclick = e => { const b = e.target.closest('button'); if (b) { d.type = b.dataset.v; sync(); } };
  $('#tCat').onclick = e => { const b = e.target.closest('button'); if (b) { d.category = b.dataset.v; sync(); } };
  $('#tAmt').onkeydown = e => { if (e.key === 'Enter') $('#tSave').click(); };

  $('#tSave').onclick = () => {
    const amount = Math.abs(parseAmount($('#tAmt').value));
    if (!(amount > 0)) { toast('Ingresa un monto válido'); $('#tAmt').focus(); return; }
    const rec = {
      id: d.id || uid(), created: d.created || Date.now(),
      type: d.type, amount, account: $('#tAcc').value,
      note: $('#tNote').value.trim(), date: $('#tDate').value || todayISO(),
    };
    if (d.type === 'transferencia') {
      rec.to = $('#tTo').value;
      if (rec.to === rec.account) { toast('Elige cuentas distintas'); return; }
    } else rec.category = d.category;
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
  const d = acc ? { ...acc } : { name: '', type: 'debito', color: COLORS[S.accounts.length % COLORS.length], initial: 0 };
  const current = isEdit ? accBalance(acc.id) : 0;

  openSheet(`
    <h2 class="sheet-title">${isEdit ? 'Editar cuenta' : 'Nueva cuenta'}</h2>
    <div class="preview-wrap" id="aPrev"></div>
    <div class="field"><label>Nombre</label><input class="input" id="aName" placeholder="Ej. Visa Banco, Efectivo, PayPal" value="${esc(d.name)}"></div>
    <div class="field"><label>Tipo</label><div class="chips" id="aType">${Object.entries(ACC_TYPES).map(([k, v]) => `<button class="chip" data-v="${k}">${v.i} ${v.n}</button>`).join('')}</div></div>
    <div class="field"><label>Color</label><div class="swatches" id="aColor">${COLORS.map(c => `<button class="swatch" data-v="${c}" style="background:${c};color:${c}" aria-label="Color"></button>`).join('')}</div></div>
    <div class="field"><label id="aBalLabel"></label><input class="input" id="aBal" inputmode="decimal" placeholder="0" value="${isEdit ? Math.abs(current) || '' : ''}"></div>
    <p class="hint" id="aHint"></p>
    <button class="btn" id="aSave">${isEdit ? 'Guardar cambios' : 'Crear cuenta'}</button>
    ${isEdit ? '<button class="btn danger" id="aDel">Eliminar cuenta</button>' : '<button class="btn ghost" id="aCancel">Cancelar</button>'}
  `);

  const sync = () => {
    d.name = $('#aName').value;
    const t = ACC_TYPES[d.type];
    $('#aPrev').innerHTML = `<div class="acc-card" style="--c:${d.color};cursor:default"><div class="top"><span>${t.i} ${t.n}</span></div>
      <div><div class="name">${esc(d.name || 'Nombre de la cuenta')}</div><div class="bal">${fmt((d.type === 'credito' ? -1 : 1) * Math.abs(parseAmount($('#aBal').value) || 0))}</div></div></div>`;
    document.querySelectorAll('#aType .chip').forEach(b => b.classList.toggle('on', b.dataset.v === d.type));
    document.querySelectorAll('#aColor .swatch').forEach(b => b.classList.toggle('on', b.dataset.v === d.color));
    const cred = d.type === 'credito';
    $('#aBalLabel').textContent = cred ? 'Deuda actual' : (isEdit ? 'Saldo actual' : 'Saldo inicial');
    $('#aHint').textContent = cred
      ? 'Lo que debes hoy en la tarjeta. Se resta de tu saldo total; los egresos con esta tarjeta aumentan la deuda.'
      : isEdit ? 'Si cambias el saldo, se ajusta para que coincida con tu banco sin modificar tus movimientos.' : 'El dinero que tienes hoy en esta cuenta.';
  };
  sync();

  $('#aName').oninput = sync;
  $('#aBal').oninput = sync;
  $('#aType').onclick = e => { const b = e.target.closest('button'); if (b) { d.type = b.dataset.v; sync(); } };
  $('#aColor').onclick = e => { const b = e.target.closest('button'); if (b) { d.color = b.dataset.v; sync(); } };

  $('#aSave').onclick = () => {
    const name = $('#aName').value.trim();
    if (!name) { toast('Ponle un nombre a la cuenta'); $('#aName').focus(); return; }
    let target = parseAmount($('#aBal').value);
    if (isNaN(target)) target = 0;
    if (d.type === 'credito') target = -Math.abs(target);
    const rec = { id: d.id || uid(), name, type: d.type, color: d.color };
    rec.initial = target - (isEdit ? txDelta(d.id) : 0);
    if (isEdit) S.accounts[S.accounts.findIndex(a => a.id === d.id)] = rec; else S.accounts.push(rec);
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

/* ---------- Importar CSV ---------- */
function parseCSV(text) {
  const first = text.split(/\r?\n/)[0] || '';
  const sep = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';'
    : (first.match(/\t/g) || []).length > (first.match(/,/g) || []).length ? '\t' : ',';
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
  if (iDate < 0 && iAmt < 0 && iOut < 0) { iDate = 0; iDesc = 1; iAmt = 2; start = 0; } // sin encabezado
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
    <h2 class="sheet-title">Importar movimientos</h2>
    <p class="hint" style="text-align:center;margin-top:-6px">Descarga la cartola de tu banco en formato CSV (o guarda el Excel como CSV) y súbela aquí.</p>
    <div class="field"><label>Cuenta destino</label><select class="input" id="cAcc">${S.accounts.map(a => `<option value="${a.id}">${esc(a.name)}</option>`).join('')}</select></div>
    <div class="field"><label>Archivo</label><input class="input" type="file" id="cFile" accept=".csv,.txt,text/csv"></div>
    <ul class="steps">
      <li>Se detectan columnas como <b>Fecha</b>, <b>Descripción</b> y <b>Monto</b> (negativo = egreso), o <b>Cargo</b> / <b>Abono</b>.</li>
      <li>Las categorías se asignan solas según el comercio.</li>
      <li>Los movimientos duplicados se omiten.</li>
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

/* ---------- Registro automático por URL ---------- */
// Ejemplo: index.html?tipo=egreso&monto=4500&cuenta=Visa&nota=Starbucks
function handleURL() {
  const p = new URLSearchParams(location.search);
  const raw = p.get('monto') || p.get('amount');
  if (!raw) return;
  history.replaceState(null, '', location.pathname); // evita duplicar al recargar
  const amount = Math.abs(parseAmount(raw));
  if (!(amount > 0)) return toast('Monto inválido en el enlace');
  if (!S.accounts.length) return toast('Agrega una cuenta antes de registrar');
  let type = (p.get('tipo') || 'egreso').toLowerCase();
  if (!['ingreso', 'egreso'].includes(type)) type = 'egreso';
  const q = (p.get('cuenta') || '').toLowerCase().trim();
  const acc = S.accounts.find(a => a.name.toLowerCase() === q) || S.accounts.find(a => q && (a.name.toLowerCase().includes(q) || q.includes(a.name.toLowerCase()))) || S.accounts[0];
  const note = (p.get('nota') || p.get('comercio') || '').trim();
  let cat = p.get('cat');
  if (!CATS[type].some(c => c[0] === cat)) cat = guessCat(note, type);
  S.txs.push({ id: uid(), created: Date.now(), type, amount, account: acc.id, note, date: p.get('fecha') ? parseDate(p.get('fecha')) : todayISO(), category: cat });
  save();
  setTimeout(() => toast(`${type === 'ingreso' ? '+' : '−'}${fmt(amount)} registrado en ${acc.name}`), 300);
}

function shortcutSheet() {
  const base = location.href.split('?')[0].split('#')[0];
  const url = `${base}?tipo=egreso&monto=MONTO&cuenta=NOMBRE_CUENTA&nota=COMERCIO`;
  openSheet(`
    <h2 class="sheet-title">Registro automático</h2>
    <p class="hint" style="margin-top:-6px">La app registra un movimiento al abrir un enlace con estos datos. Así puedes conectarla con automatizaciones del teléfono:</p>
    <div class="code" id="urlCode">${esc(url)}</div>
    <button class="btn ghost" data-copy>Copiar enlace</button>

    <div class="field"><label>iPhone · Apple Pay (app Atajos)</label></div>
    <ol class="steps">
      <li>Abre <b>Atajos → Automatización → Nueva → Transacción</b> (Wallet).</li>
      <li>Elige tus tarjetas y activa <b>Ejecutar inmediatamente</b>.</li>
      <li>Agrega la acción <b>Abrir URL</b> con el enlace de arriba, reemplazando MONTO, NOMBRE_CUENTA y COMERCIO por las variables <b>Importe</b>, <b>Tarjeta</b> y <b>Comercio</b>.</li>
    </ol>

    <div class="field"><label>Android · Notificaciones del banco</label></div>
    <ol class="steps">
      <li>Usa <b>MacroDroid</b> o <b>Tasker</b> con el disparador “Notificación recibida” de la app de tu banco.</li>
      <li>Extrae el monto del texto y abre el enlace con la acción <b>Abrir sitio web</b>.</li>
    </ol>
    <p class="hint">Parámetros: <b>tipo</b> (egreso/ingreso), <b>monto</b>, <b>cuenta</b>, <b>nota</b>, <b>cat</b> y <b>fecha</b> (opcionales). Para usarlo desde el teléfono la app debe estar publicada en una dirección web (por ejemplo GitHub Pages) y los datos se guardan en el navegador de ese teléfono.</p>
    <button class="btn" id="sClose">Listo</button>
  `);
  $('#sClose').onclick = closeSheet;
  $('[data-copy]').onclick = async () => {
    try { await navigator.clipboard.writeText(url); toast('Enlace copiado'); }
    catch { toast('Selecciona el texto y cópialo'); }
  };
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
      S = { settings: { currency: 'USD' }, ...d }; save(); render(); toast('Respaldo restaurado');
    } catch { toast('Archivo de respaldo inválido'); }
  };
  inp.click();
}

/* ---------- Eventos ---------- */
document.querySelectorAll('.tabbar [data-tab]').forEach(b => b.onclick = () => {
  if (tab === b.dataset.tab) return;
  tab = b.dataset.tab; window.scrollTo({ top: 0, behavior: 'smooth' }); render();
});
$('#fab').onclick = () => txSheet();
$('#backdrop').onclick = closeSheet;
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

$('#view').addEventListener('click', e => {
  const tx = e.target.closest('[data-tx]');
  if (tx) return txSheet(S.txs.find(t => t.id === tx.dataset.tx));
  const acc = e.target.closest('[data-acc]');
  if (acc) return accountSheet(accById(acc.dataset.acc));
  const go = e.target.closest('[data-goto]');
  if (go) { tab = go.dataset.goto; window.scrollTo({ top: 0, behavior: 'smooth' }); return render(); }
  const f = e.target.closest('[data-f]');
  if (f) { movFilter = f.dataset.f; document.querySelectorAll('#movSeg button').forEach(b => b.classList.toggle('on', b === f)); return renderMovList(); }
  const a = e.target.closest('[data-action]')?.dataset.action;
  switch (a) {
    case 'add-account': return accountSheet();
    case 'month-prev': movMonth = ymAdd(movMonth, -1); return render();
    case 'month-next': movMonth = ymAdd(movMonth, 1); return render();
    case 'import-csv': return csvSheet();
    case 'shortcut': return shortcutSheet();
    case 'export': return exportJSON();
    case 'import-json': return importJSON();
    case 'reset':
      if (confirm('¿Borrar todas las cuentas y movimientos? Esta acción no se puede deshacer.')) {
        S = { accounts: [], txs: [], settings: S.settings }; save(); render(); toast('Datos borrados');
      }
  }
});
$('#view').addEventListener('input', e => {
  if (e.target.id === 'movSearch') { movSearch = e.target.value; renderMovList(); }
});
$('#view').addEventListener('change', e => {
  if (e.target.id === 'curSel') { S.settings.currency = e.target.value; save(); toast(`Moneda: ${e.target.value}`); }
});

/* ---------- Inicio ---------- */
$('#today').textContent = new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
const openNew = new URLSearchParams(location.search).has('nuevo');
handleURL();
render();
if (openNew) { history.replaceState(null, '', location.pathname); setTimeout(() => txSheet(), 250); }

// Modo sin conexión (solo cuando la app se sirve desde una dirección web, no con doble clic)
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
