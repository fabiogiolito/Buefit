/* ============================================================
   BUÉ FIT! — FUNÇÕES (semana ativa, preços, código de pedido)
   Normalmente não precisas de mexer aqui: os dados editáveis
   estão em ingredientes.js, semanas.js, pokes.js, outros.js,
   zonas.js e precos.js. Carregar sempre depois desses ficheiros.
============================================================ */

/* ---------- Semana ativa ---------- */

/* Semana ISO de uma data → [ano, nº semana] */
function isoWeekOf(date){
  const t = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const year = t.getUTCFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  return [year, Math.ceil(((t - start) / 864e5 + 1) / 7)];
}
function weekKeyOf(date){
  const [y, w] = isoWeekOf(date);
  return y + '-' + String(w).padStart(2, '0');
}
/* Semana ativa: a atual se existir, senão a mais recente publicada */
const ACTIVE_WEEK_KEY = WEEKS[weekKeyOf(new Date())]
  ? weekKeyOf(new Date())
  : Object.keys(WEEKS).sort().pop();
const WEEK = WEEKS[ACTIVE_WEEK_KEY];

/* ---------- Dietas ---------- */

/* mapa código → restrições que o ingrediente viola,
   construído a partir da última coluna de ingredientes.js */
const RESTRICOES = {};
for (const it of [...BASES, ...SIDES, ...PROTS])
  RESTRICOES[it[0]] = new Set(String(it[5] || '').split(/[\s,]+/).filter(Boolean));

function violatesDiet(code, diet){ return RESTRICOES[code] ? RESTRICOES[code].has(diet) : false; }
function violatesAny(code, diets){ return [...diets].some(d => violatesDiet(code, d)); }
function dietLabel(key){ const d = DIETAS.find(x => x[0] === key); return d ? d[1] : key; }

/* ---------- Preços e pacotes ---------- */

/* Preço do poke: base + extras de tipo/base/ingredientes
   + ingredientes acima dos incluídos */
function pokePriceFor(type, base, ings){
  const extras = type[1] + base[1] + ings.reduce((s, g) => s + g[1], 0);
  return PRECOS.poke[1] + extras
    + Math.max(0, ings.length - POKE_INCLUDED_INGS) * POKE_EXTRA_ING;
}

/* Tabela de pacotes de um item (null = sem pacotes, ex. poke) */
function packTableFor(kind, size){
  if (kind === 'semanal' || kind === 'propria') return (PRECOS[kind] || {})[size] || null;
  if (kind === 'sobremesa' || kind === 'sopa' || kind === 'sumo') return PRECOS[kind];
  return null;
}

/* Melhor preço de `count` unidades com a tabela {qtd: preço}:
   maior pacote primeiro, resto a preço unitário. */
function tierPrice(count, table){
  const sizes = Object.keys(table).map(Number).sort((a, b) => b - a);
  let rest = count, total = 0;
  const packs = [];
  for (const s of sizes) while (rest >= s) {
    total += table[s];
    if (s > 1) packs.push(s);
    rest -= s;
  }
  return { total, packs };
}

function groupLabel(kind, size){
  return GROUP_LABELS[kind] + (size ? ' ' + size : '');
}

/* Totais de uma lista de itens {kind, tag, qty, price, extra}.
   O preço unitário inclui extras; o pacote aplica-se só ao valor
   base, por isso o desconto é calculado sobre (price - extra). */
function orderTotals(items){
  let subtotal = 0;
  const groups = {};
  for (const o of items) {
    subtotal += o.price * o.qty;
    const size = (o.tag === 'M' || o.tag === 'L') ? o.tag : null;
    const table = packTableFor(o.kind, size);
    if (!table) continue;
    const gk = o.kind + (size ? ':' + size : '');
    (groups[gk] ||= { kind: o.kind, size, table, count: 0 }).count += o.qty;
  }
  let discount = 0;
  const packs = [];
  for (const gk in groups) {
    const g = groups[gk];
    const { total, packs: sizes } = tierPrice(g.count, g.table);
    const saving = g.table[1] * g.count - total;
    if (saving > 0.001) {
      discount += saving;
      packs.push({ kind: g.kind, size: g.size, label: groupLabel(g.kind, g.size), packs: sizes, count: g.count, saving });
    }
  }
  return { subtotal, discount, total: subtotal - discount, packs };
}

/* Progresso para o próximo pacote de marmitas (para o aviso no site):
   devolve o grupo mais perto de desbloquear um pacote maior, ou null. */
function packProgress(items){
  const counts = {};
  for (const o of items) {
    if ((o.kind === 'semanal' || o.kind === 'propria') && (o.tag === 'M' || o.tag === 'L')) {
      const gk = o.kind + ':' + o.tag;
      counts[gk] = (counts[gk] || 0) + o.qty;
    }
  }
  let best = null;
  for (const gk in counts) {
    const [kind, size] = gk.split(':');
    const table = packTableFor(kind, size);
    const count = counts[gk];
    const next = Object.keys(table).map(Number).sort((a, b) => a - b).find(s => s > 1 && s > count);
    if (!next) continue;
    const gap = next - count;
    const nowSaving = table[1] * count - tierPrice(count, table).total;
    const nextSaving = table[1] * next - table[next];
    const extraSaving = nextSaving - nowSaving;
    if (!best || gap < best.gap) best = { kind, size, label: groupLabel(kind, size), count, next, gap, extraSaving };
  }
  return best;
}

/* ============================================================
   CÓDIGO DE PEDIDO
   Formato: BF-[W<ano><semana>]-<item>-<item>-…-E<zona>-<check>
   W2633: menu da semana 33 de 2026 (presente quando o pedido tem
          marmitas semanais; diz ao decode que menu usar)
   Item:  [qtd]B3A5P12L    marmita própria (códigos do menu + tamanho)
          [qtd]S4M         marmita semanal nº4, tamanho M
          [qtd]K1B2I1.3.5  poke (tipo nº1, base nº2, ingredientes 1,3,5)
          [qtd]D2 / Z1 / U1   sobremesa / sopa / sumo (nº na lista)
   Último segmento: carácter de verificação (apanha erros de escrita).
============================================================ */
const CODE_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function codeChecksum(body){
  let s = 0;
  for (let i = 0; i < body.length; i++) s = (s * 7 + body.charCodeAt(i)) % 36;
  return CODE_ALPHABET[s];
}

function findByCode(list, code){ return list.find(it => it[0] === code) || null; }

function weekTokenFor(key){ // '2026-33' → 'W2633'
  const [y, w] = key.split('-');
  return 'W' + y.slice(2) + w;
}

/* order: [{key, qty}] com as keys usadas no index.html */
function encodeOrderCode(order, zoneName){
  const segs = [];
  if (order.some(o => /^week:/.test(o.key))) segs.push(weekTokenFor(ACTIVE_WEEK_KEY));
  for (const o of order) {
    let tok = null, m;
    if ((m = o.key.match(/^marmita:(B\d+)\+(A\d+)\+(P\d+):(M|L)$/))) {
      tok = m[1] + m[2] + m[3] + m[4];
    } else if ((m = o.key.match(/^week:(\d+):(M|L)$/))) {
      tok = 'S' + m[1] + m[2];
    } else if ((m = o.key.match(/^poke:([^:]*):([^:]*):(.*)$/))) {
      const ti = POKE_TYPES.findIndex(p => p[0] === m[1]);
      const bi = POKE_BASES.findIndex(p => p[0] === m[2]);
      const names = m[3] ? m[3].split(',') : [];
      const idx = names.map(n => POKE_INGS.findIndex(p => p[0] === n) + 1);
      if (ti >= 0 && bi >= 0 && !idx.includes(0))
        tok = 'K' + (ti + 1) + 'B' + (bi + 1)
            + (idx.length ? 'I' + idx.sort((a, b) => a - b).join('.') : '');
    } else if (o.key.startsWith('DOCE:')) {
      const i = DESSERTS.findIndex(d => d[0] === o.key.slice(5));
      if (i >= 0) tok = 'D' + (i + 1);
    } else if (o.key.startsWith('SOPA:')) {
      const i = SOUPS.findIndex(s => s[0] === o.key.slice(5));
      if (i >= 0) tok = 'Z' + (i + 1);
    } else if (o.key.startsWith('SUMO:')) {
      const i = JUICES.findIndex(j => j[0] === o.key.slice(5));
      if (i >= 0) tok = 'U' + (i + 1);
    }
    if (!tok) return null; // item não codificável → sem código, usa-se o texto completo
    segs.push((o.qty > 1 ? o.qty : '') + tok);
  }
  if (!segs.length) return null;
  const zi = ZONES.findIndex(z => z[0] === zoneName);
  if (zi >= 0) segs.push('E' + (zi + 1));
  const body = segs.join('-');
  return 'BF-' + body + '-' + codeChecksum(body);
}

function pokeItemFor(qty, type, base, ings){
  return {
    qty, kind: 'poke', tag: 'POKE', title: `Poke de ${type[0]}`,
    desc: `Base: ${base[0]}${ings.length ? ' · ' + ings.map(g => g[0]).join(', ') : ''}`,
    price: pokePriceFor(type, base, ings), extra: 0,
  };
}

/* Devolve {items:[{qty,kind,tag,title,desc,price,extra}], zone:[nome,taxa]|null,
   weekKey:string, checksumOk:boolean, errors:[string]} */
function decodeOrderCode(input){
  const clean = String(input || '').toUpperCase().replace(/\s+/g, '')
    .replace(/[–—]/g, '-').replace(/^BF-?/, '');
  const segs = clean.split('-').filter(Boolean);
  if (segs.length < 2) return { items: [], zone: null, weekKey: ACTIVE_WEEK_KEY, checksumOk: false, errors: ['Código demasiado curto ou vazio.'] };
  const check = segs.pop();
  const checksumOk = check === codeChecksum(segs.join('-'));
  const items = [], errors = [];
  let zone = null;

  /* menu da semana a usar: o indicado no código (W2633), senão o ativo */
  let weekKey = ACTIVE_WEEK_KEY;
  const wSeg = segs.find(s => /^W\d{4}$/.test(s));
  if (wSeg) {
    const key = '20' + wSeg.slice(1, 3) + '-' + wSeg.slice(3);
    if (WEEKS[key]) weekKey = key;
    else errors.push(`Menu da semana ${key} não encontrado — adiciona-o em semanas.js.`);
  }
  const weekMenu = WEEKS[weekKey] || [];

  for (const seg of segs) {
    const parts = seg.match(/^(\d*)([A-Z].*)$/);
    if (!parts) { errors.push(`Segmento inválido: “${seg}”`); continue; }
    const qty = parts[1] ? parseInt(parts[1], 10) : 1;
    const tok = parts[2];
    let m;

    if ((m = tok.match(/^B(\d+)A(\d+)P(\d+)(M|L)$/))) {
      const b = findByCode(BASES, 'B' + m[1]), a = findByCode(SIDES, 'A' + m[2]), p = findByCode(PROTS, 'P' + m[3]);
      if (!b || !a || !p) { errors.push(`Ingrediente desconhecido em “${seg}”`); continue; }
      const extra = b[2] + a[2] + p[2];
      items.push({
        qty, kind: 'propria', tag: m[4], title: `Marmita B${m[1]}+A${m[2]}+P${m[3]}`,
        desc: `${b[1]} + ${a[1]} + ${p[1]}`,
        price: PRECOS.propria[m[4]][1] + extra, extra,
      });
    } else if (tok === wSeg) {
      continue; // segmento da semana, já tratado acima
    } else if ((m = tok.match(/^S(\d+)(M|L)$/))) {
      const w = weekMenu[+m[1] - 1];
      if (!w) { errors.push(`Marmita semanal nº${m[1]} não existe no menu da semana ${weekKey}`); continue; }
      items.push({ qty, kind: 'semanal', tag: m[2], title: `Marmita ${m[1]} (semana ${weekKey})`, desc: w, price: PRECOS.semanal[m[2]][1], extra: 0 });
    } else if ((m = tok.match(/^K(\d+)B(\d+)(?:I([\d.]+))?$/))) {
      const type = POKE_TYPES[+m[1] - 1], base = POKE_BASES[+m[2] - 1];
      const ings = (m[3] ? m[3].split('.') : []).map(n => POKE_INGS[+n - 1]);
      if (!type || !base || ings.includes(undefined)) { errors.push(`Poke desconhecido em “${seg}”`); continue; }
      items.push(pokeItemFor(qty, type, base, ings));
    } else if ((m = tok.match(/^K([SAFT])([AQ])(\d*)$/))) {
      /* formato antigo de poke (códigos emitidos antes da mudança) */
      const type = POKE_TYPES['SAFT'.indexOf(m[1])], base = POKE_BASES['AQ'.indexOf(m[2])];
      const ings = [...m[3]].map(d => POKE_INGS[(d === '0' ? 10 : +d) - 1]);
      if (!type || !base || ings.includes(undefined)) { errors.push(`Poke desconhecido em “${seg}”`); continue; }
      items.push(pokeItemFor(qty, type, base, ings));
    } else if ((m = tok.match(/^D(\d+)$/)) && DESSERTS[+m[1] - 1]) {
      const [name, extra] = DESSERTS[+m[1] - 1];
      items.push({ qty, kind: 'sobremesa', tag: 'DOCE', title: name, desc: '', price: PRECOS.sobremesa[1] + extra, extra });
    } else if ((m = tok.match(/^Z(\d+)$/)) && SOUPS[+m[1] - 1]) {
      const [name, extra] = SOUPS[+m[1] - 1];
      items.push({ qty, kind: 'sopa', tag: 'SOPA', title: name, desc: '', price: PRECOS.sopa[1] + extra, extra });
    } else if ((m = tok.match(/^U(\d+)$/)) && JUICES[+m[1] - 1]) {
      const [name, extra] = JUICES[+m[1] - 1];
      items.push({ qty, kind: 'sumo', tag: 'SUMO', title: name, desc: '', price: PRECOS.sumo[1] + extra, extra });
    } else if ((m = tok.match(/^E(\d+)$/)) && ZONES[+m[1] - 1]) {
      zone = ZONES[+m[1] - 1];
    } else {
      errors.push(`Segmento não reconhecido: “${seg}”`);
    }
  }
  return { items, zone, weekKey, checksumOk, errors };
}
