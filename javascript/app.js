/* ============================================================
   BUÉ FIT! — APP (só usado por index.html)
   Toda a interação da página principal: navegação, wizard,
   poke builder, carrinho, totais e animações.
   Os dados estão em /data e a lógica partilhada em funcoes.js.
============================================================ */
/* ============================================================
   DATA — ingredientes.js, semanas.js, pokes.js, sobremesas.js, funcoes.js
============================================================ */
/* grupos do wizard: derivados da coluna 'Grupo' de ingredientes.js,
   pela ordem em que aparecem na lista (null = lista sem grupos) */
function groupsOf(items){
  const seen = [];
  items.forEach(it => { const g = it[4]; if (g && !seen.includes(g)) seen.push(g); });
  return seen.length ? seen : null;
}


/* ============================================================
   HELPERS
============================================================ */
const $ = s => document.querySelector(s);
const eur = n => n.toFixed(2).replace('.', ',') + ' €';
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

function toast(msg){
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 1800);
}

/* Fly a clone of `fromEl` into the order panel (slide + scale, no spin).
   `bare: true` skips the fallback background (e.g. the 3D box). */
function flyToCart(fromEl, { bare = false } = {}){
  const target = window.matchMedia('(max-width:980px)').matches ? $('#mobileBar') : $('#countBadge');
  const a = fromEl.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const clone = fromEl.cloneNode(true);
  clone.classList.add('fly-clone');
  Object.assign(clone.style, {
    left: a.left + 'px', top: a.top + 'px',
    width: a.width + 'px', height: a.height + 'px', margin: 0,
  });
  if (!bare) {
    const srcBg = getComputedStyle(fromEl).backgroundColor;
    const transparent = srcBg === 'transparent' || srcBg === 'rgba(0, 0, 0, 0)';
    Object.assign(clone.style, {
      background: transparent ? 'var(--paper)' : srcBg,
      border: '1px solid var(--line)',
      borderRadius: '10px',
      boxShadow: 'var(--shadow-soft)',
    });
  }
  document.body.appendChild(clone);
  const dx = (b.left + b.width/2) - (a.left + a.width/2);
  const dy = (b.top + b.height/2) - (a.top + a.height/2);
  clone.animate([
    { transform: 'translate(0,0) scale(1)', opacity: 1 },
    { transform: `translate(${dx*0.5}px,${dy*0.5 - 60}px) scale(0.55)`, opacity: 1, offset: 0.55 },
    { transform: `translate(${dx}px,${dy}px) scale(0.08)`, opacity: 0.2 },
  ], { duration: 750, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => clone.remove();
}

function bumpBadge(){
  const badge = $('#countBadge');
  badge.classList.remove('pop'); void badge.offsetWidth; badge.classList.add('pop');
  const val = $('#grandTotal');
  val.classList.remove('pop'); void val.offsetWidth; val.classList.add('pop');
}

/* ============================================================
   ORDER STATE
============================================================ */
const ORDER_KEY = 'buefit-order-v2'; // v2: preços por grupo + campo kind
const order = []; // {key, kind, tag, title, desc, price, extra, qty}

/* zonas de entrega vêm de zonas.js */
ZONES.forEach(([name, fee]) => {
  const opt = document.createElement('option');
  opt.value = name;
  opt.dataset.fee = fee;
  opt.textContent = `${name} — ${eur(fee)}`;
  $('#deliverySel').appendChild(opt);
});
try {
  const saved = JSON.parse(localStorage.getItem(ORDER_KEY) || '[]');
  if (Array.isArray(saved)) order.push(...saved.filter(o => o && o.key && o.qty > 0));
} catch {}

function addToOrder(item){
  const found = order.find(o => o.key === item.key);
  if (found) found.qty++;
  else order.push({ ...item, qty: 1 });
  renderOrder(item.key); // só o item adicionado anima
  bumpBadge();
  // scroll to the end of the list (includes its bottom padding)
  const list = $('#orderList');
  list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
}

function renderOrder(animKey){
  try { localStorage.setItem(ORDER_KEY, JSON.stringify(order)); } catch {}
  const list = $('#orderList');
  list.querySelectorAll('.order-item').forEach(e => e.remove());
  $('#emptyState').style.display = order.length ? 'none' : '';
  $('#clearBtn').style.display = order.length ? '' : 'none';
  order.forEach((o, i) => {
    const item = el('div', 'order-item');
    if (o.key !== animKey) item.style.animation = 'none'; // re-render sem animar os existentes
    item.innerHTML = `
      <div class="oi-top">
        <div class="oi-title"><span class="tag">${o.tag}</span>${o.title}</div>
        <div class="oi-price">${o.extra
          ? `${eur((o.price - o.extra) * o.qty)} <span class="oi-extra">+${eur(o.extra * o.qty)}</span>`
          : eur(o.price * o.qty)}</div>
      </div>
      ${o.desc ? `<div class="oi-desc">${o.desc}</div>` : ''}
      <div class="oi-bottom">
        <div class="qty">
          <button data-i="${i}" data-d="-1" aria-label="menos">−</button>
          <span>${o.qty}</span>
          <button data-i="${i}" data-d="1" aria-label="mais">+</button>
        </div>
        <button class="oi-remove" data-i="${i}">remover</button>
      </div>`;
    list.appendChild(item);
  });
  updateTotals();
}

$('#orderList').addEventListener('click', e => {
  const btn = e.target.closest('button'); if (!btn) return;
  const i = +btn.dataset.i;
  const removeWithAnim = node => {
    if (node.classList.contains('leaving')) return;
    node.style.animation = ''; // limpa o 'animation:none' inline do re-render
    node.classList.add('leaving');
    node.addEventListener('animationend', () => {
      // FLIP: memoriza posições, re-renderiza, e desliza cada item da posição antiga para a nova
      const list = $('#orderList');
      const nodes = [...list.querySelectorAll('.order-item')];
      const before = new Map(order.map((o, idx) => [o.key, nodes[idx]?.getBoundingClientRect().top]));
      order.splice(i, 1);
      renderOrder();
      [...list.querySelectorAll('.order-item')].forEach((n, idx) => {
        const prevTop = before.get(order[idx].key);
        if (prevTop == null) return;
        const dy = prevTop - n.getBoundingClientRect().top;
        if (dy) n.animate(
          [{ transform: `translateY(${dy}px)` }, { transform: 'none' }],
          { duration: 300, easing: 'cubic-bezier(.16,1,.3,1)' });
      });
    }, { once: true });
  };
  if (btn.classList.contains('oi-remove')) {
    removeWithAnim(btn.closest('.order-item'));
  } else if (btn.dataset.d) {
    const next = order[i].qty + +btn.dataset.d;
    if (next <= 0) { removeWithAnim(btn.closest('.order-item')); return; }
    order[i].qty = next;
    renderOrder();
  }
});

/* ---- pacotes: valores fechados por grupo e tamanho (ver precos.js) ---- */
function packInfo(){
  const totals = orderTotals(order);
  return { ...totals, progress: packProgress(order) };
}

/* em mobile o contador de pack sai do painel e fica fixo na base do ecrã */
function placePackNudge(){
  const nudge = $('#packNudge');
  if (matchMedia('(max-width:980px)').matches) {
    if (nudge.parentNode !== document.body) {
      document.body.appendChild(nudge);
      nudge.classList.add('fixed');
    }
  } else if (nudge.classList.contains('fixed')) {
    const foot = document.querySelector('.panel-foot');
    foot.insertBefore(nudge, foot.querySelector('.delivery-row'));
    nudge.classList.remove('fixed');
  }
}
addEventListener('resize', placePackNudge);
placePackNudge();

let lastDiscount = null;
let packRevealPending = false;
let lastPackDone = 0;
const PACK_WINDOW = 3;

/* Tier unlocked: the nudge glides to the center of the screen, grows, holds,
   then glides down into the "Desconto pack" row so the eye follows the discount. */
function celebratePack(pack){
  const nudge = $('#packNudge');
  nudge.style.display = '';
  $('#packText').innerHTML = `<b>Pacote desbloqueado!</b> Estás a poupar ${eur(pack.discount)}.`;
  $('#packDots').innerHTML = '<i class="done"></i>'.repeat(PACK_WINDOW - 1) + '<i class="done pop"></i>';
  nudge.classList.add('complete'); // borda e fundo mudam ao completar os checks
  lastPackDone = 0;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { updatePackUI(packInfo(), false); return; }

  /* Mobile: o contador já está fixo na base — dá um pulo, quica no lugar
     e depois desaparece a deslizar para a base do ecrã. */
  if (matchMedia('(max-width:980px)').matches) {
    nudge.animate([
      { transform: 'translateY(0)',      offset: 0,   easing: 'cubic-bezier(.2,.7,.3,1)' },
      { transform: 'translateY(-90px)',  offset: .2,  easing: 'cubic-bezier(.5,0,.8,.5)' },
      { transform: 'translateY(0)',      offset: .38, easing: 'cubic-bezier(.2,.7,.3,1)' },
      { transform: 'translateY(-32px)',  offset: .5,  easing: 'cubic-bezier(.5,0,.8,.5)' },
      { transform: 'translateY(0)',      offset: .6,  easing: 'cubic-bezier(.2,.7,.3,1)' },
      { transform: 'translateY(-11px)',  offset: .68, easing: 'cubic-bezier(.5,0,.8,.5)' },
      { transform: 'translateY(0)',      offset: .76, easing: 'linear' },
      { transform: 'translateY(0)', opacity: 1, offset: .86, easing: 'cubic-bezier(.5,0,.9,.6)' },
      { transform: 'translateY(150px)', opacity: 0, offset: 1 },
    ], { duration: 2000 }).onfinish = () => {
      packRevealPending = false;
      updateTotals(); // repõe o contador e revela o desconto
      const row = $('#packRow');
      row.classList.remove('pop'); void row.offsetWidth; row.classList.add('pop');
    };
    return;
  }

  /* Arco em duas camadas: o wrapper anima o X e o cartão interior anima o Y,
     cada um com easing próprio — ida: X rápido primeiro; volta: Y rápido primeiro. */
  const a = nudge.getBoundingClientRect();
  const wrap = document.createElement('div');
  wrap.className = 'pack-fly';
  Object.assign(wrap.style, { left: a.left + 'px', top: a.top + 'px', width: a.width + 'px' });
  const mid = document.createElement('div');           // camada do Y
  mid.style.willChange = 'transform';
  const card = nudge.cloneNode(true);                  // camada do scale
  card.style.margin = 0;
  mid.appendChild(card);
  wrap.appendChild(mid);
  document.body.appendChild(wrap);
  nudge.style.visibility = 'hidden';

  const panelHidden = matchMedia('(max-width:980px)').matches && !$('#panel').classList.contains('open');
  // o packRow ainda está escondido durante a animação — apontar para o bloco dos totais
  const target = panelHidden ? $('#mobileBar') : document.querySelector('#panel .totals');
  const b = target.getBoundingClientRect();
  const cx = innerWidth / 2 - (a.left + a.width / 2);
  const cy = innerHeight * .42 - (a.top + a.height / 2); // ligeiramente acima do centro real
  const dx = (b.left + b.width / 2) - (a.left + a.width / 2);
  const dy = (b.top + b.height / 2) - (a.top + a.height / 2);

  const HOLD = 2000;
  // em ecrãs estreitos, limita o crescimento para o cartão não exceder a largura do ecrã
  const SCALE = Math.min(1.5, (innerWidth - 32) / a.width);
  // ida: X é a direção rápida, com ease-out; Y é a lenta, com curva neutra
  wrap.animate(
    [{ transform: 'translateX(0)' }, { transform: `translateX(${cx}px)` }],
    { duration: 220, easing: 'cubic-bezier(.15,.75,.25,1)', fill: 'forwards' });
  card.animate(
    [{ transform: 'scale(1)' }, { transform: `scale(${SCALE})` }],
    { duration: 230, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' }); // termina antes do movimento
  mid.animate(
    [{ transform: 'translateY(0)' }, { transform: `translateY(${cy}px)` }],
    { duration: 340, easing: 'cubic-bezier(.45,0,.35,1)', fill: 'forwards' }
  ).onfinish = () => setTimeout(() => {
    // volta: Y é a direção rápida, com ease-out; X é a lenta, com curva neutra
    card.animate(
      [{ transform: `scale(${SCALE})` }, { transform: 'scale(.25)' }],
      { duration: 280, easing: 'cubic-bezier(.45,0,.5,1)', fill: 'forwards' });
    mid.animate(
      [{ transform: `translateY(${cy}px)` }, { transform: `translateY(${dy}px)` }],
      { duration: 300, easing: 'cubic-bezier(.15,.75,.25,1)', fill: 'forwards' });
    wrap.animate(
      [{ transform: `translateX(${cx}px)`, opacity: 1 },
       { transform: `translateX(${dx}px)`, opacity: 0 }],
      { duration: 440, easing: 'cubic-bezier(.45,0,.35,1)', fill: 'forwards' }
    ).onfinish = () => {
      wrap.remove();
      nudge.style.visibility = '';
      // o desconto entra nos totais no instante em que o cartão aterra
      packRevealPending = false;
      updateTotals();
      const row = $('#packRow');
      row.classList.remove('pop'); void row.offsetWidth; row.classList.add('pop');
    };
  }, HOLD);
}

function updatePackUI(pack, celebrate){
  const nudge = $('#packNudge');
  if (celebrate) { celebratePack(pack); return; }
  const prog = pack.progress;
  const gap = prog ? prog.gap : 0;
  if (prog && gap <= PACK_WINDOW) {
    const wasHidden = nudge.style.display === 'none';
    nudge.classList.remove('complete');
    nudge.style.display = '';
    // em mobile, entra a deslizar vindo da base do ecrã
    if (wasHidden && nudge.classList.contains('fixed')) {
      nudge.classList.remove('enter'); void nudge.offsetWidth; nudge.classList.add('enter');
    }
    $('#packText').innerHTML =
      `Mais <b>${gap}</b> marmita${gap > 1 ? 's' : ''} (${prog.label}) e atinges o <b>pacote de ${prog.next}</b> — poupas mais ${eur(prog.extraSaving)}`;
    const done = PACK_WINDOW - gap;
    // o check mais recente entra com um pop
    $('#packDots').innerHTML =
      '<i class="done"></i>'.repeat(Math.max(0, done - (done > lastPackDone ? 1 : 0))) +
      (done > lastPackDone && done > 0 ? '<i class="done pop"></i>' : '') +
      '<i></i>'.repeat(gap);
    lastPackDone = done;
  } else {
    nudge.style.display = 'none';
    nudge.classList.remove('complete', 'enter');
    lastPackDone = 0;
  }
}

function updateTotals(){
  const pack = packInfo();
  const sub = pack.subtotal;
  const sel = $('#deliverySel');
  const fee = +(sel.selectedOptions[0]?.dataset.fee || 0);
  const zone = sel.value;
  // desbloqueou um pacote novo quando a poupança aumenta
  const crossed = lastDiscount !== null && pack.discount > lastDiscount + 0.001;
  if (crossed && !matchMedia('(prefers-reduced-motion: reduce)').matches) packRevealPending = true;
  // durante a animação de desbloqueio, o desconto só entra nos totais no fim
  const showPack = pack.discount > 0 && !packRevealPending;
  const total = sub - (showPack ? pack.discount : 0) + (zone ? fee : 0);
  $('#subtotal').textContent = eur(sub);
  $('#deliveryFee').textContent = zone ? eur(fee) : '—';
  $('#grandTotal').textContent = zone ? eur(total) : '—';
  $('#packRow').style.display = showPack ? '' : 'none';
  if (showPack) {
    $('#packLabel').textContent = pack.packs.length === 1
      ? `Pacote ${pack.packs[0].label} (${pack.packs[0].packs.join('+')})`
      : 'Desconto pacotes';
    $('#packVal').textContent = '−' + eur(pack.discount);
  }
  updatePackUI(pack, crossed);
  lastDiscount = pack.discount;
  const n = order.reduce((s, o) => s + o.qty, 0);
  $('#countBadge').textContent = n;
  $('#mobileCount').textContent = n;
  $('#waBtn').disabled = !order.length || !zone;
}
const ZONE_KEY = 'buefit-zone';
/* closed select reads "Entrega em {zona}"; the open list keeps the full labels */
function refreshZoneSelect(){
  const s = $('#deliverySel');
  [...s.options].forEach(o => {
    if (!o.dataset.label) o.dataset.label = o.textContent;
    o.textContent = o.dataset.label;
  });
  s.classList.toggle('empty', !s.value);
  if (s.value) s.selectedOptions[0].textContent = 'Entrega em ' + s.value;
}
$('#deliverySel').addEventListener('change', () => {
  try { localStorage.setItem(ZONE_KEY, $('#deliverySel').value); } catch {}
  refreshZoneSelect();
  updateTotals();
});
$('#clearBtn').addEventListener('click', () => {
  order.length = 0; // keeps the saved delivery zone
  renderOrder();
  toast('Encomenda limpa');
});
try {
  const zone = localStorage.getItem(ZONE_KEY);
  if (zone && [...$('#deliverySel').options].some(o => o.value === zone)) $('#deliverySel').value = zone;
} catch {}
refreshZoneSelect();
renderOrder(); // restore saved order + zone on load

/* WhatsApp message */
function buildMessage(){
  const sel = $('#deliverySel');
  const fee = +(sel.selectedOptions[0]?.dataset.fee || 0);
  const code = encodeOrderCode(order, sel.value);
  // mensagem curta: só um link que abre o pedido completo
  if (code) return MSG_PEDIDO.trim().replace('{link}', new URL('pedido.html?c=' + code, location.href).href);
  let msg = '*Encomenda Bué FIT!*\n\n';
  {
    // fallback: se algum item não for codificável, envia a lista completa
    order.forEach(o => {
      msg += `- ${o.qty}x [${o.tag}] ${o.title}`;
      if (o.desc) msg += `\n   ${o.desc}`;
      msg += o.extra
        ? `\n   ${eur((o.price - o.extra) * o.qty)} + ${eur(o.extra * o.qty)} extras\n`
        : `\n   ${eur(o.price * o.qty)}\n`;
    });
  }
  const pack = packInfo();
  msg += `\nSubtotal: ${eur(pack.subtotal)}`;
  pack.packs.forEach(p => {
    msg += `\nPacote ${p.label} (${p.packs.join('+')}): -${eur(p.saving)}`;
  });
  if (sel.value) {
    msg += `\nEntrega (${sel.value}): ${eur(fee)}`;
    msg += `\n*Total: ${eur(pack.total + fee)}*`;
  } else {
    msg += '\nEntrega: zona por definir';
  }
  msg += '\n\nNome:\nMorada:\nData preferida de entrega:';
  return msg;
}
$('#waNum').textContent = WHATSAPP_NUMERO; // número vem de data/mensagens.js
const waDigits = WHATSAPP_NUMERO.replace(/\D/g, ''); // só dígitos, para o wa.me
$('#waBtn').addEventListener('click', () => {
  window.open(`https://wa.me/${waDigits}?text=` + encodeURIComponent(buildMessage()), '_blank');
});
$('#waNum').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(WHATSAPP_NUMERO); toast('Número copiado!'); }
  catch { toast('Não foi possível copiar'); }
});
$('#copyBtn').addEventListener('click', async () => {
  if (!order.length) { toast('A encomenda está vazia'); return; }
  try { await navigator.clipboard.writeText(buildMessage()); toast('Pedido copiado! Cola no WhatsApp 📋'); }
  catch { toast('Não foi possível copiar'); }
});

/* mobile panel */
$('#mobileBar').addEventListener('click', () => $('#panel').classList.add('open'));
$('#panelClose').addEventListener('click', () => $('#panel').classList.remove('open'));

/* ============================================================
   NAV
============================================================ */
$('#nav').addEventListener('click', e => {
  const btn = e.target.closest('.nav-btn'); if (!btn) return;
  document.body.classList.toggle('on-build', btn.dataset.view === 'build');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b === btn));
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const view = $('#view-' + btn.dataset.view);
  view.classList.remove('active'); void view.offsetWidth;
  view.classList.add('active');
});

/* ============================================================
   MARMITA SVG — ilustração isométrica do builder
   (projeção espelhada: a frente da marmita fica à esquerda)
============================================================ */
const marmita = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = $('#marmitaSvg');
  const iso  = (tx,ty)=>`matrix(-0.866,0.5,0.866,0.5,${tx},${ty})`;
  const proj = (x,y)=>({ X: -0.866*(x - y), Y: 0.5*(x + y) });
  const H = 78, SURF = 20, FLOOR = 38;
  let seed = 7;
  const rnd = ()=> (seed = (seed * 16807) % 2147483647) / 2147483647;
  const sEl = (n, at, p)=>{
    const e = document.createElementNS(NS, n);
    for (const k in at) e.setAttribute(k, at[k]);
    if (p) p.appendChild(e);
    return e;
  };

  /* ---- contentor kraft ---- */
  const walls = svg.querySelector('#mWalls');
  for (let i = 0; i <= 60; i++){
    const t = i / 60, s = 0.82 + 0.18 * t;
    const g = sEl('g', {transform: iso(0, H - H * t)}, walls);
    sEl('use', {href:'#mRim', transform:`scale(${s})`, fill:'url(#mWallGrad)'}, g);
  }
  const shadeBase = sEl('g', {transform: iso(0, H)}, walls);
  sEl('use', {href:'#mRim', transform:'scale(0.82)', fill:'#A97C43', opacity:'.35'}, shadeBase);
  sEl('use', {href:'#mRim', fill:'#E7C08B'}, svg.querySelector('#mRimTop'));

  // "Bué FIT!" impresso na parede frontal
  {
    const tg = sEl('g', {transform:'matrix(0.866,-0.5,0,1,72,102)'}, svg.querySelector('#mWallText'));
    const t = sEl('text', {'text-anchor':'middle',
      'font-family':"'Baloo 2', sans-serif", 'font-weight':'700', 'font-size':'36',
      fill:'#7A5426', opacity:'.85'}, tg);
    t.textContent = 'Bué FIT!';
  }

  // recorte da abertura (tudo o que está dentro fica atrás do rebordo)
  const clip = sEl('clipPath', {id:'mMouthClip'}, svg.querySelector('defs'));
  sEl('rect', {x:-142, y:-97, width:284, height:194, rx:66, ry:66, transform: iso(0,0)}, clip);

  // interior: parede interna escura + fundo kraft claro visível quando vazia
  const cavity = svg.querySelector('#mCavity');
  cavity.setAttribute('clip-path', 'url(#mMouthClip)');
  sEl('use', {href:'#mInner', transform: iso(0,0), fill:'#9C7038'}, cavity);
  const mFloor = sEl('g', {transform: iso(0, FLOOR)}, cavity);
  sEl('use', {href:'#mInner', transform:'scale(0.92)', fill:'#C79A5F'}, mFloor);

  /* ---- compartimentos (1/3 cada, trás → frente = prot → side → base) ---- */
  const BANDS = {
    prot: {x0:-148, x1:-42, cx:-92, label:'PROTEÍNA'},
    side: {x0:-48,  x1:48,  cx:0,   label:'ACOMP.'},
    base: {x0:42,   x1:148, cx:92,  label:'BASE'},
  };
  const foodRoot = svg.querySelector('#mFood');
  const slotG = {};
  ['prot','side','base'].forEach(s => {                       // ordem de profundidade
    slotG[s] = sEl('g', {'clip-path':'url(#mMouthClip)'}, foodRoot);
  });

  // hints com etiqueta, deitados no plano do compartimento
  const hintsRoot = svg.querySelector('#mHints');
  const hintG = {};
  for (const s of ['prot','side','base']){
    const b = BANDS[s];
    const hg = sEl('g', {class:'hint'}, hintsRoot);
    const hc = sEl('g', {'clip-path':'url(#mMouthClip)'}, hg);
    sEl('rect', {x:b.x0+6, y:-90, width:b.x1-b.x0-12, height:180, rx:18,
      class:'hint-shape', transform: iso(0, SURF)}, hc);
    const p = proj(b.cx, 0);
    const lg = sEl('g', {transform:`matrix(0.866,0.5,-0.866,0.5,${p.X},${p.Y + SURF})`}, hg);
    const t = sEl('text', {class:'hint-label', 'text-anchor':'middle', y:'7'}, lg);
    t.textContent = b.label;
    hintG[s] = hg;
  }

  /* ---- áreas clicáveis por compartimento (por cima da comida) ---- */
  let slotClickFn = null;
  const hitRoot = sEl('g', {'clip-path':'url(#mMouthClip)'}, svg);
  const HITS = { prot: [-148, -45], side: [-45, 45], base: [45, 148] };
  for (const s of ['prot','side','base']){
    const [x0, x1] = HITS[s];
    const r = sEl('rect', {x:x0, y:-97, width:x1-x0, height:194,
      transform: iso(0, SURF), fill:'transparent', style:'cursor:pointer'}, hitRoot);
    r.addEventListener('click', () => slotClickFn && slotClickFn(s));
  }

  /* ---- base de uma faixa: lateral com volume + topo ---- */
  function wobblyRect(x0, y0, x1, y1, j){
    const pts = [];
    const edge = (ax, ay, bx, by)=>{
      const steps = Math.max(2, Math.round(Math.hypot(bx-ax, by-ay) / 22));
      for (let i = 0; i < steps; i++){
        const t = i / steps;
        pts.push([ax + (bx-ax)*t + (rnd()*2-1)*j, ay + (by-ay)*t + (rnd()*2-1)*j]);
      }
    };
    edge(x0,y0, x1,y0); edge(x1,y0, x1,y1); edge(x1,y1, x0,y1); edge(x0,y1, x0,y0);
    let d = '';
    for (let i = 0; i < pts.length; i++){
      const [ax,ay] = pts[i], [bx,by] = pts[(i+1) % pts.length];
      const mx = (ax+bx)/2, my = (ay+by)/2;
      d += i === 0 ? `M ${mx} ${my} ` : `Q ${ax} ${ay} ${mx} ${my} `;
    }
    return d + 'Z';
  }
  function band(parent, b, colorSide, colorTop){
    const d = wobblyRect(b.x0, -103, b.x1, 103, 5);
    for (let y = SURF + FLOOR; y >= SURF + 2; y -= 2){
      sEl('path', {d, transform: iso(0, y), fill: colorSide}, parent);
    }
    sEl('path', {d, transform: iso(0, SURF), fill: colorTop}, parent);
  }

  /* ---- geradores de "ilustrações" de ingredientes ---- */
  const pt = (b, pad)=>({
    x: b.x0 + pad + rnd() * (b.x1 - b.x0 - 2*pad),
    y: -84 + rnd() * 168,
  });
  const grid = (b, rows, cols, padX)=>{
    const out = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        out.push({
          x: b.x0 + padX + (c + .5) * (b.x1 - b.x0 - 2*padX) / cols + (rnd()*2-1)*4,
          y: -80 + (r + .5 + (c % 2) * .3) * 160 / rows + (rnd()*2-1)*4,
        });
    return out.sort((a, bb) => (a.x + a.y) - (bb.x + bb.y)); // trás → frente
  };

  const DECOR = {
    grains(g, b, o){
      const {c, w = 7.5, h = 2.6, n = 55, op = .95} = o;
      for (let i = 0; i < n; i++){
        const q = pt(b, 12), p = proj(q.x, q.y);
        const y = p.Y + SURF - rnd() * 4;
        sEl('rect', {x:p.X, y, width:w, height:h, rx:h/2,
          transform:`rotate(${rnd()*180} ${p.X} ${y})`, fill:c, opacity:op}, g);
      }
    },
    dots(g, b, o){
      const {c, r = 2.2, n = 80, op = .9} = o;
      for (let i = 0; i < n; i++){
        const q = pt(b, 12), p = proj(q.x, q.y);
        sEl('circle', {cx:p.X, cy:p.Y + SURF - rnd()*3, r:r*(0.7 + rnd()*.6), fill:c, opacity:op}, g);
      }
    },
    lumps(g, b, o){
      const {c, n = 8} = o;
      for (let i = 0; i < n; i++){
        const q = pt(b, 18), p = proj(q.x, q.y);
        sEl('ellipse', {cx:p.X, cy:p.Y + SURF - 3, rx:13 + rnd()*8, ry:8 + rnd()*4, fill:c, opacity:.8}, g);
      }
    },
    heads(g, b, o){
      const {dark, mid, fleck, multi, rows = 5, cols = 2, r0 = 15, r1 = 21} = o;
      for (const q of grid(b, rows, cols, 20)){
        const r = r0 + rnd() * (r1 - r0);
        const p = proj(q.x, q.y);
        const y = p.Y + SURF - 5 - rnd() * 5;
        const hg = sEl('g', {transform:`translate(${p.X},${y})`}, g);
        const cm = multi ? multi[Math.floor(rnd() * multi.length)] : mid;
        sEl('ellipse', {cx:2, cy:3, rx:r, ry:r*.82, fill: multi ? cm : dark}, hg);
        sEl('ellipse', {cx:-r*.12, cy:-r*.14, rx:r*.88, ry:r*.72, fill:cm}, hg);
        if (fleck) for (let i = 0; i < 7; i++){
          const a = rnd()*Math.PI*2, rr = Math.sqrt(rnd())*r*.55;
          sEl('circle', {cx:Math.cos(a)*rr - r*.12, cy:Math.sin(a)*rr*.72 - r*.16,
            r:2 + rnd()*1.6, fill:fleck, opacity:.9}, hg);
        }
      }
    },
    cubes(g, b, o){
      const {top, l, r, s0 = 10, s1 = 15, rows = 6, cols = 3} = o;
      for (const q of grid(b, rows, cols, 16)){
        const s = s0 + rnd() * (s1 - s0);
        const p = proj(q.x, q.y);
        const x = p.X, y = p.Y + SURF - 6 - rnd() * 4;
        const w = s*.9, h = s*.5, d = s*.8;
        sEl('path', {d:`M ${x-w} ${y} L ${x} ${y+h} L ${x} ${y+h+d} L ${x-w} ${y+d} Z`, fill:l}, g);
        sEl('path', {d:`M ${x+w} ${y} L ${x} ${y+h} L ${x} ${y+h+d} L ${x+w} ${y+d} Z`, fill:r}, g);
        sEl('path', {d:`M ${x} ${y-h} L ${x+w} ${y} L ${x} ${y+h} L ${x-w} ${y} Z`, fill:top}, g);
      }
    },
    strips(g, b, o){
      const {c, w = 18, h = 4, n = 28, op = .85} = o;
      for (let i = 0; i < n; i++){
        const q = pt(b, 14), p = proj(q.x, q.y);
        const y = p.Y + SURF - rnd() * 4;
        sEl('rect', {x:p.X - w/2, y, width:w, height:h, rx:h/2,
          transform:`rotate(${30 + (rnd()*2-1)*12} ${p.X} ${y})`, fill:c, opacity:op}, g);
      }
    },
    balls(g, b, o){
      const {c, shade, r = 12, n = 9} = o;
      for (const q of grid(b, Math.ceil(n/2), 2, 20).slice(0, n)){
        const p = proj(q.x, q.y);
        const y = p.Y + SURF - 4 - rnd() * 4;
        sEl('circle', {cx:p.X + 1.5, cy:y + 2, r, fill:shade}, g);
        sEl('circle', {cx:p.X - r*.12, cy:y - r*.12, r:r*.88, fill:c}, g);
      }
    },
    egg(g, b, o){
      const {n = 8} = o;
      for (const q of grid(b, 4, 2, 20).slice(0, n)){
        const p = proj(q.x, q.y);
        const y = p.Y + SURF - 4;
        sEl('ellipse', {cx:p.X, cy:y, rx:14, ry:9.5, fill:'#FBF4DC'}, g);
        sEl('circle', {cx:p.X, cy:y, r:5.5, fill:'#EEC84A'}, g);
      }
    },
    swirl(g, b, o){
      const {c, n = 7, op = .3} = o;
      for (let i = 0; i < n; i++){
        const q = pt(b, 20), p = proj(q.x, q.y);
        const y = p.Y + SURF - 2;
        sEl('rect', {x:p.X - 22, y, width:44, height:5, rx:2.5,
          transform:`rotate(${30 + (rnd()*2-1)*8} ${p.X} ${y})`, fill:c, opacity:op}, g);
      }
    },
  };

  /* ---- ilustração por textura de ingrediente ---- */
  const TEX = {
    'f-rice':    {top:'#F2E9D0', side:'#CBBB8E', decor:[['lumps',{c:'#FAF3E1'}],['grains',{c:'#D9CCA4'}]]},
    'f-riceY':   {top:'#EFD483', side:'#C9A952', decor:[['lumps',{c:'#F6E3A0'}],['grains',{c:'#D9B84E'}]]},
    'f-riceMix': {top:'#F4E9C8', side:'#CDBC90', decor:[['grains',{c:'#D9CCA4'}],['dots',{c:'#C96F4A',r:3,n:14}],['dots',{c:'#8FA663',r:3,n:14}]]},
    'f-riceHerb':{top:'#F3EED6', side:'#CBBF98', decor:[['grains',{c:'#D9CCA4'}],['dots',{c:'#7A9147',r:2.6,n:20}]]},
    'f-riceBr':  {top:'#DCC9A2', side:'#B29A6E', decor:[['lumps',{c:'#E5D4AE'}],['grains',{c:'#B7A071'}]]},
    'f-pure':    {top:'#F5E7C4', side:'#CDB988', decor:[['lumps',{c:'#FBF0D6'}],['swirl',{c:'#C9A96B'}]]},
    'f-pureO':   {top:'#F0C787', side:'#C79A55', decor:[['lumps',{c:'#F6D9A6'}],['swirl',{c:'#C98F3F'}]]},
    'f-cuscuz':  {top:'#EFDFB2', side:'#C6B27E', decor:[['dots',{c:'#B08A46',r:1.6,n:130}]]},
    'f-pasta':   {top:'#F2DA8F', side:'#C9AC58', decor:[['strips',{c:'#D9B854',w:30,h:4.5,n:26}]]},
    'f-pastaBr': {top:'#D9BE87', side:'#AE9159', decor:[['strips',{c:'#B29057',w:30,h:4.5,n:26}]]},
    'f-grain':   {top:'#E7D5A4', side:'#BCA671', decor:[['dots',{c:'#A88B4D',r:1.8,n:100}]]},
    'f-lentil':  {top:'#C7A97B', side:'#9C7E50', decor:[['dots',{c:'#7E5E33',r:2.6,n:90}]]},
    'f-chick':   {top:'#EAD299', side:'#C0A25C', decor:[['balls',{c:'#E3C782',shade:'#C6A257',r:5.5,n:34}]]},
    'f-root':    {top:'#E8B678', side:'#BC8543', decor:[['cubes',{top:'#EFC084',l:'#D89A50',r:'#C08034'}]]},
    'f-mush':    {top:'#DED2BC', side:'#B3A488', decor:[['heads',{dark:'#B7A88C',mid:'#D3C6AB'}]]},
    'f-green':   {top:'#6E7A47', side:'#55613A', decor:[['heads',{dark:'#5C6A3D',mid:'#7E8A55',fleck:'#95A263'}]]},
    'f-cabbage': {top:'#9C7191', side:'#77506D', decor:[['strips',{c:'#B48CA9',w:24}],['strips',{c:'#6E4664',w:20,n:16}]]},
    'f-veg':     {top:'#C9BC7E', side:'#9E9155', decor:[['heads',{multi:['#C96F4A','#8FA663','#E8B76E'],r0:11,r1:16,rows:6}]]},
    'f-cauli':   {top:'#F0EAD5', side:'#C9C0A4', decor:[['heads',{dark:'#DAD0B2',mid:'#EFE8D2',fleck:'#E0D7BC'}]]},
    'f-carrot':  {top:'#E89E52', side:'#BC7529', decor:[['balls',{c:'#F2B269',shade:'#D08334',r:8,n:16}]]},
    'f-beet':    {top:'#A85C6E', side:'#7E3E50', decor:[['cubes',{top:'#B96C7E',l:'#94485C',r:'#7E3A4C'}]]},
    'f-beans':   {top:'#BD8D5F', side:'#94663B', decor:[['grains',{c:'#8A5E31',w:9,h:4.5,n:70}]]},
    'f-gbean':   {top:'#A3B368', side:'#7C8C46', decor:[['grains',{c:'#7E9448',w:17,h:3.5,n:45}]]},
    'f-meat':    {top:'#A9755B', side:'#7E5240', decor:[['strips',{c:'#8A5940'}]]},
    'f-meatD':   {top:'#8C5B47', side:'#66402F', decor:[['strips',{c:'#6E4432'}]]},
    'f-balls':   {top:'#B27A5C', side:'#8A573E', decor:[['balls',{c:'#A5674C',shade:'#8A5138',r:12,n:9}]]},
    'f-chicken': {top:'#DCA96C', side:'#B27F42', decor:[['strips',{c:'#C08D4B'}]]},
    'f-turkey':  {top:'#E3BC8B', side:'#BC9257', decor:[['strips',{c:'#C9A063'}]]},
    'f-egg':     {top:'#F4E7B7', side:'#CBBB84', decor:[['egg',{}]]},
    'f-fish':    {top:'#EBE0C8', side:'#C2B494', decor:[['strips',{c:'#CFC0A0'}]]},
    'f-salmon':  {top:'#EFA184', side:'#C67350', decor:[['strips',{c:'#D9825F'}],['strips',{c:'#F6C0A9',w:14,h:2.5,n:18}]]},
    'f-tuna':    {top:'#C77E6E', side:'#9C5546', decor:[['strips',{c:'#A8604F'}]]},
    'f-shrimp':  {top:'#F2A483', side:'#C67750', decor:[['balls',{c:'#EE9573',shade:'#D0704C',r:9,n:12}]]},
    'f-pork':    {top:'#C4906E', side:'#996843', decor:[['strips',{c:'#A6714C'}]]},
    'f-tofu':    {top:'#F5EFDC', side:'#CCC4A8', decor:[['cubes',{top:'#FBF6E6',l:'#E8E0C6',r:'#D8CEB0'}]]},
    'f-tempeh':  {top:'#D8BD90', side:'#AE9263', decor:[['dots',{c:'#8A6A38',r:2.4,n:80}]]},
  };

  /* ---- API ---- */
  function fill(slot, tex){
    slotG[slot].innerHTML = '';
    const conf = TEX[tex] || TEX['f-rice'];
    const g = sEl('g', {class:'food-rise'}, slotG[slot]);
    band(g, BANDS[slot], conf.side, conf.top);
    (conf.decor || []).forEach(([type, opts]) => DECOR[type](g, BANDS[slot], opts || {}));
    hintG[slot].classList.add('hidden');
  }
  function clear(slot){
    slotG[slot].innerHTML = '';
    hintG[slot].classList.remove('hidden');
  }
  function clearAll(){ ['base','side','prot'].forEach(clear); }
  function step(s){
    for (const k in hintG) hintG[k].classList.toggle('on', k === s);
  }
  // a animação de entrada do <main> (riseIn, fill both) mantém um efeito de
  // transform que prende elementos position:fixed — como a marmita mobile.
  // Removemos a animação assim que termina para soltar o containing block.
  document.querySelector('main').addEventListener('animationend', function(e){
    if (e.target === this) this.style.animation = 'none';
  });

  return { fill, clear, clearAll, step, onSlotClick: fn => { slotClickFn = fn; } };
})();

/* ============================================================
   BUILDER
============================================================ */
const sel = { base: null, side: null, prot: null, size: 'M' };
const STEP_ORDER = ['base', 'side', 'prot'];
const WIZ_STEPS = ['base', 'side', 'prot', 'summary'];
const STEP_META = {
  base:    { label: 'Base',           title: 'Escolhe a tua base' },
  side:    { label: 'Acompanhamento', title: 'Escolhe o teu acompanhamento' },
  prot:    { label: 'Proteína',       title: 'Escolhe a tua proteína' },
  summary: { label: 'Resumo' },
};
let wizStep = 'base';

function renderChips(pane, items, groups, slot){
  const container = $('#pane-' + pane);
  const makeChips = subset => {
    const wrap = el('div', 'chips');
    subset.forEach(it => {
      const [code, name, sup] = it;
      const chip = el('button', 'chip');
      chip.dataset.code = code;
      chip.innerHTML = `<span class="code">${code}</span>${name}${sup ? `<span class="sup">+${sup.toFixed(1).replace('.', ',')}€</span>` : ''}`;
      chip.addEventListener('click', () => pick(slot, it));
      wrap.appendChild(chip);
    });
    return wrap;
  };
  if (groups) {
    groups.forEach(label => {
      container.appendChild(el('div', 'chip-group-label', label));
      container.appendChild(makeChips(items.filter(it => it[4] === label)));
    });
  } else {
    container.appendChild(makeChips(items));
  }
}

function pick(slot, item, { advance = true } = {}){
  sel[slot] = item;
  const pane = $('#pane-' + slot);
  pane.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
  pane.querySelector(`.chip[data-code="${item[0]}"]`)?.classList.add('selected');

  // enche o compartimento na marmita
  marmita.fill(slot, item[3]);
  $('#mini-' + slot).className = item[3]; // mobile mini-box mirror

  // pequeno "assentar" da marmita
  $('#scene').animate(
    [{ transform: 'translateY(0)' },
     { transform: 'translateY(7px)', offset: 0.45 },
     { transform: 'translateY(0)' }],
    { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });

  updateRecipe();

  // auto-advance to the next step after the food lands
  if (advance) {
    const next = WIZ_STEPS[WIZ_STEPS.indexOf(slot) + 1];
    setTimeout(() => { if (sel[slot] === item) setStep(next); }, 380);
  }
}

/* clicar num compartimento da ilustração troca por outra opção aleatória
   (respeita as restrições alimentares; nunca repete a atual) */
marmita.onSlotClick(slot => {
  const items = { base: BASES, side: SIDES, prot: PROTS }[slot];
  const ok = items.filter(it => it !== sel[slot] && !violatesAny(it[0], activeDiets));
  const pool = ok.length ? ok : items.filter(it => it !== sel[slot]);
  if (!pool.length) return;
  pick(slot, pool[Math.floor(Math.random() * pool.length)], { advance: false });
  if (wizStep === 'summary') renderSummary(); // reflete a troca no resumo
});

function clearSlot(slot){
  sel[slot] = null;
  $('#pane-' + slot).querySelectorAll('.chip.selected').forEach(c => c.classList.remove('selected'));
  marmita.clear(slot);
  $('#mini-' + slot).className = 'empty';
}

function updateRecipe(){
  const sup = STEP_ORDER.reduce((s, k) => s + (sel[k] ? sel[k][2] : 0), 0);
  $('#recipePrice').textContent = eur(PRECOS.propria[sel.size][1] + sup);
  updateWizardUI();
}

/* refresh header, dots, rings and footer for the current wizard step */
function updateWizardUI(){
  const meta = STEP_META[wizStep];
  $('#wizStepLabel').textContent = wizStep === 'summary' ? 'Resumo · escolhe o tamanho' : meta.title;
  $('#wizBack').hidden = wizStep === 'base';
  [...$('#wizDots').children].forEach((d, i) => d.classList.toggle('on', WIZ_STEPS[i] === wizStep));
  marmita.step(STEP_ORDER.includes(wizStep) ? wizStep : null);
  const btn = $('#wizNext');
  if (wizStep === 'summary') {
    btn.style.display = '';
    btn.textContent = 'Adicionar à encomenda';
    btn.disabled = !STEP_ORDER.every(s => sel[s]);
    $('#wizHint').textContent = '';
  } else {
    btn.style.display = 'none';
    $('#wizHint').textContent = 'Escolhe 1 base + 1 acompanhamento + 1 proteína.';
  }
}

function renderSummary(){
  $('#recipeCode').textContent = STEP_ORDER.map(s => sel[s][0]).join(' + ');
  $('#summaryLines').innerHTML = STEP_ORDER.map(s => {
    const [code, name] = sel[s];
    return `<div class="summary-line"><span class="sl-code">${code}</span>${name}<span class="sl-cat">${STEP_META[s].label}</span></div>`;
  }).join('');
  updateDietAlert();
}

/* avisa se algum item escolhido choca com as restrições selecionadas */
function updateDietAlert(){
  const alert = $('#dietAlert');
  const issues = [];
  STEP_ORDER.forEach(s => {
    if (!sel[s]) return;
    const [code, name] = sel[s];
    [...activeDiets].forEach(d => {
      if (violatesDiet(code, d)) issues.push(`<b>${name}</b> não é compatível com a dieta <b>${dietLabel(d)}</b>`);
    });
  });
  alert.hidden = !issues.length;
  if (issues.length) alert.innerHTML = '<b>Atenção às tuas restrições:</b><br>' + issues.join('<br>');
}

function setStep(step){
  wizStep = step;
  if (step === 'summary') renderSummary();
  const cur = document.querySelector('.chip-pane.active');
  const next = $('#pane-' + step);
  updateWizardUI();
  if (cur === next) return;
  const show = () => {
    document.querySelectorAll('.chip-pane').forEach(p => p.classList.toggle('active', p === next));
    $('#wizPanes').scrollTop = 0;
    // stacked layout: the page scrolls, not the pane — jump back to the top of the wizard
    if (matchMedia('(max-width:1120px)').matches)
      document.querySelector('.wizard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    next.animate(
      [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }],
      { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
  };
  if (cur) {
    cur.animate(
      [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-10px)' }],
      { duration: 150, easing: 'ease-in' }).onfinish = show;
    // rede de segurança: troca na mesma se a animação não reportar o fim
    setTimeout(() => { if (!next.classList.contains('active')) show(); }, 220);
  } else show();
}

$('#sizeToggle').addEventListener('click', e => {
  const btn = e.target.closest('button'); if (!btn) return;
  sel.size = btn.dataset.size;
  document.querySelectorAll('#sizeToggle button').forEach(b => b.classList.toggle('on', b === btn));
  updateRecipe();
});

$('#recipeClear').addEventListener('click', () => {
  STEP_ORDER.forEach(clearSlot); // empties chips, 3D box and mini-box
  updateRecipe();
  setStep('base');
});

$('#wizBack').addEventListener('click', () => {
  const i = WIZ_STEPS.indexOf(wizStep);
  if (i <= 0) return;
  const target = WIZ_STEPS[i - 1];
  clearSlot(target); // free the compartment so a new item can be chosen
  updateRecipe();
  setStep(target);
});

$('#wizNext').addEventListener('click', () => {
  if (wizStep !== 'summary') {
    setStep(WIZ_STEPS[WIZ_STEPS.indexOf(wizStep) + 1]);
    return;
  }
  if (STEP_ORDER.some(s => !sel[s])) return;
  const sup = STEP_ORDER.reduce((s, k) => s + sel[k][2], 0);
  const codes = STEP_ORDER.map(s => sel[s][0]).join('+');
  const names = STEP_ORDER.map(s => sel[s][1]).join(' + ');
  addToOrder({
    key: `marmita:${codes}:${sel.size}`,
    tag: sel.size,
    title: `Marmita ${codes}`,
    desc: names,
    kind: 'propria',
    price: PRECOS.propria[sel.size][1] + sup,
    extra: sup, // suplementos de ingredientes — fora do desconto de pack
  });
  // on mobile the 3D box is hidden — fly from the summary card instead
  const flySrc = $('#scene').offsetParent ? $('#scene') : document.querySelector('#pane-summary .recipe');
  flyToCart(flySrc, { bare: flySrc === $('#scene') });
  resetBox();
});

function resetBox(){
  // clear selection + chips
  STEP_ORDER.forEach(s => { sel[s] = null; });
  document.querySelectorAll('.chip.selected').forEach(c => c.classList.remove('selected'));

  // hide instantly (the clone is flying); then slide a fresh box in
  const wrap = $('#sceneWrap');
  wrap.style.opacity = 0;
  setTimeout(() => {
    marmita.clearAll();
    document.querySelectorAll('.mini-box i').forEach(m => m.className = 'empty');
    wrap.style.opacity = 1;
    wrap.animate(
      [{ transform: 'translateX(-130%)', opacity: 0 },
       { transform: 'translateX(0)', opacity: 1 }],
      { duration: 700, easing: 'cubic-bezier(.16,1,.3,1)' });
    updateRecipe();
    setStep('base');
  }, 420);
}

renderChips('base', BASES, groupsOf(BASES), 'base');
renderChips('side', SIDES, groupsOf(SIDES), 'side');
renderChips('prot', PROTS, groupsOf(PROTS), 'prot');

/* ---- filtro de dietas ----
   As restrições vivem na última coluna de ingredientes.js e a lista
   de filtros em DIETAS — adicionar ingredientes ou dietas novas não
   precisa de mexer aqui. Um item passa se não violar nenhum filtro. */
{
  // opções do menu geradas a partir de DIETAS, agrupadas por categoria
  const menu = $('#dietMenu');
  let lastCat = null;
  DIETAS.forEach(([key, label, cat]) => {
    if (cat !== lastCat) { menu.appendChild(el('div', 'diet-cat', cat)); lastCat = cat; }
    const opt = el('label', 'diet-opt');
    opt.innerHTML = `<input type="checkbox" value="${key}">${label}`;
    menu.appendChild(opt);
  });
}
const DIETS_KEY = 'buefit-diets';
const activeDiets = new Set();
try {
  const saved = JSON.parse(localStorage.getItem(DIETS_KEY) || '[]');
  if (Array.isArray(saved)) saved.filter(d => DIETAS.some(x => x[0] === d)).forEach(d => activeDiets.add(d));
} catch {}
function applyDietFilter(){
  document.querySelectorAll('#wizPanes .chip').forEach(ch => {
    ch.classList.toggle('faded', violatesAny(ch.dataset.code, activeDiets));
  });
}
function refreshDietTrigger(){
  const n = activeDiets.size;
  $('#dietTriggerLabel').textContent =
    n === 0 ? 'Restrições alimentares' :
    n === 1 ? dietLabel([...activeDiets][0]) :
    `${n} restrições selecionadas`;
  $('#dietTrigger').classList.toggle('active', n > 0);
}
$('#dietTrigger').addEventListener('click', () => {
  const menu = $('#dietMenu');
  menu.hidden = !menu.hidden;
  $('#dietBar').classList.toggle('open', !menu.hidden);
});
document.addEventListener('click', e => {
  if (!e.target.closest('#dietBar')) {
    $('#dietMenu').hidden = true;
    $('#dietBar').classList.remove('open');
  }
});
$('#dietMenu').addEventListener('change', e => {
  const cb = e.target;
  cb.checked ? activeDiets.add(cb.value) : activeDiets.delete(cb.value);
  try { localStorage.setItem(DIETS_KEY, JSON.stringify([...activeDiets])); } catch {}
  refreshDietTrigger();
  applyDietFilter();
  updateDietAlert();
});
// restore saved restrictions on load
$('#dietMenu').querySelectorAll('input').forEach(cb => { cb.checked = activeDiets.has(cb.value); });
refreshDietTrigger();
applyDietFilter();
updateRecipe();

$('#randomBtn').addEventListener('click', () => {
  $('#dietMenu').hidden = true; $('#dietBar').classList.remove('open');
  const rand = a => a[Math.floor(Math.random() * a.length)];
  // respect the selected dietary restrictions (fall back to all if nothing passes)
  const allowed = items => {
    const ok = items.filter(it => !violatesAny(it[0], activeDiets));
    return ok.length ? ok : items;
  };
  [['base', BASES], ['side', SIDES], ['prot', PROTS]].forEach(([slot, items], i) => {
    setTimeout(() => pick(slot, rand(allowed(items))), i * 380);
  });
});

/* ============================================================
   WEEK MENU
============================================================ */
const weekGrid = $('#weekGrid');
$('#weekLegend').innerHTML =
  `<span><b>M</b>300g: ${eur(PRECOS.semanal.M[1])}</span><span class="sep">·</span><span><b>L</b>400g: ${eur(PRECOS.semanal.L[1])}</span>`;
WEEK.marmitas.forEach((desc, i) => {
  const row = el('div', 'week-row');
  row.innerHTML = `
    <span class="week-num">${String(i + 1).padStart(2, '0')}</span>
    <div class="week-desc">${desc}</div>
    <div class="week-actions">
      <button class="size-add" data-size="M" title="300g · ${eur(PRECOS.semanal.M[1])}">M</button>
      <button class="size-add" data-size="L" title="400g · ${eur(PRECOS.semanal.L[1])}">L</button>
    </div>`;
  row.querySelectorAll('.size-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const size = btn.dataset.size;
      addToOrder({
        key: `week:${i + 1}:${size}`,
        tag: size,
        title: `Marmita ${i + 1} (semanal)`,
        desc,
        kind: 'semanal',
        price: PRECOS.semanal[size][1],
      });
      flyToCart(row);
    });
  });
  weekGrid.appendChild(row);
});

/* sopas e sumos da semana (secções escondidas quando a lista está vazia) */
if (WEEK.sopas.length) {
  $('#weekSoups').hidden = false;
  renderExtras('#weekSoupGrid', WEEK.sopas, 'SOPA', 'sopa', '🥣');
}
if (WEEK.sumos.length) {
  $('#weekJuices').hidden = false;
  renderExtras('#weekJuiceGrid', WEEK.sumos, 'SUMO', 'sumo', '🥤');
}

/* ============================================================
   POKE
============================================================ */
const poke = { type: POKE_TYPES[0], base: null, ings: new Set() };

/* etiqueta de extra num chip: "+1,5€" */
const supTag = sup => sup ? `<span class="sup">+${sup.toFixed(1).replace('.', ',')}€</span>` : '';

const pokeTypesEl = $('#pokeTypes');
POKE_TYPES.forEach(([name, sup], i) => {
  const w = el('div', 'radio-chip');
  w.innerHTML = `<input type="radio" name="ptype" id="pt${i}" ${i === 0 ? 'checked' : ''}>
    <label for="pt${i}">${name} <span class="p">${eur(PRECOS.poke[1] + sup)}</span></label>`;
  w.querySelector('input').addEventListener('change', () => { poke.type = POKE_TYPES[i]; updatePoke(); });
  pokeTypesEl.appendChild(w);
});
const pokeBasesEl = $('#pokeBases');
POKE_BASES.forEach(([name, sup], i) => {
  const w = el('div', 'radio-chip');
  w.innerHTML = `<input type="radio" name="pbase" id="pb${i}"><label for="pb${i}">${name}${supTag(sup)}</label>`;
  w.querySelector('input').addEventListener('change', () => { poke.base = POKE_BASES[i]; updatePoke(); });
  pokeBasesEl.appendChild(w);
});
const pokeIngsEl = $('#pokeIngs');
POKE_INGS.forEach(([name, sup], i) => {
  const w = el('div', 'radio-chip');
  w.innerHTML = `<input type="checkbox" id="pi${i}"><label for="pi${i}">${name}${supTag(sup)}</label>`;
  w.querySelector('input').addEventListener('change', e => {
    e.target.checked ? poke.ings.add(name) : poke.ings.delete(name);
    updatePoke();
  });
  pokeIngsEl.appendChild(w);
});

const pokeIngObjs = () => [...poke.ings].map(n => POKE_INGS.find(p => p[0] === n));
function pokePrice(){
  return pokePriceFor(poke.type, poke.base || ['', 0], pokeIngObjs());
}
function updatePoke(){
  $('#pokeTitle').textContent = 'Poke de ' + poke.type[0];
  const bits = [];
  if (poke.base) bits.push('Base: ' + poke.base[0]);
  if (poke.ings.size) bits.push([...poke.ings].join(', '));
  $('#pokeDesc').textContent = bits.length ? bits.join(' · ') : 'Escolhe a base e os ingredientes…';
  const extra = Math.max(0, poke.ings.size - POKE_INCLUDED_INGS);
  $('#ingCount').innerHTML = `<b>${poke.ings.size}</b>/${POKE_INCLUDED_INGS} ingredientes escolhidos` +
    (extra ? ` · <b style="color:#8C5B34">+${extra} adicional (${eur(extra * POKE_EXTRA_ING)})</b>` : '');
  $('#pokePrice').textContent = eur(pokePrice());
  $('#addPokeBtn').disabled = !(poke.base && poke.ings.size >= 1);

  // bowl visual
  const bowl = $('#bowlFood');
  bowl.style.background = poke.base?.[0] === 'Quinoa' ? '#E7D5A4' : '#F7F1DD';
  bowl.querySelectorAll('.topping').forEach(t => t.remove());
  [...poke.ings].forEach((name, i) => {
    const color = POKE_INGS.find(p => p[0] === name)[2];
    const t = el('div', 'topping');
    const n = poke.ings.size;
    t.style.background = color;
    t.style.left = (8 + (i % 4) * 28 + (Math.floor(i / 4) % 2) * 12) + 'px';
    t.style.top = (6 + Math.floor(i / 4) * 24) + 'px';
    bowl.appendChild(t);
  });
}
$('#addPokeBtn').addEventListener('click', () => {
  addToOrder({
    key: `poke:${poke.type[0]}:${poke.base[0]}:${[...poke.ings].sort().join(',')}`,
    kind: 'poke',
    tag: 'POKE',
    title: `Poke de ${poke.type[0]}`,
    desc: `Base: ${poke.base[0]} · ${[...poke.ings].join(', ')}`,
    price: pokePrice(),
  });
  flyToCart($('#pokeSummary'));
  toast('Poke adicionado! 🥣');
  // reset ingredients but keep type
  poke.ings.clear();
  pokeIngsEl.querySelectorAll('input').forEach(i => i.checked = false);
  updatePoke();
});
updatePoke();

/* ============================================================
   EXTRAS
============================================================ */
function renderExtras(gridId, items, tag, kind, emoji){
  const grid = $(gridId);
  items.forEach(([name, extra]) => {
    const price = PRECOS[kind][1] + extra;
    const item = el('div', 'extra-item');
    item.innerHTML = `<div class="extra-name">${name}</div>
      <span class="extra-price">${eur(price)}</span>
      <button class="extra-add" aria-label="adicionar">+</button>`;
    item.querySelector('button').addEventListener('click', () => {
      addToOrder({ key: `${tag}:${name}`, kind, tag, title: name, desc: '', price, extra });
      flyToCart(item);
      toast(`${name} ${emoji}`);
    });
    grid.appendChild(item);
  });
}
renderExtras('#dessertGrid', DESSERTS, 'DOCE', 'sobremesa', '🍮');

/* ============================================================
   WIZARD HEIGHT — fill the viewport exactly, no body scroll
============================================================ */
function fitWizard(){
  const wiz = document.querySelector('.wizard');
  if (matchMedia('(max-width:1120px)').matches) { wiz.style.height = ''; return; }
  const mainEl = document.querySelector('main');
  const top = mainEl.getBoundingClientRect().top + window.scrollY
            + parseFloat(getComputedStyle(mainEl).paddingTop);
  wiz.style.height = Math.max(420, window.innerHeight - top - 32) + 'px';
}
addEventListener('resize', fitWizard);
fitWizard();
if (document.fonts?.ready) document.fonts.ready.then(fitWizard);

/* ============================================================
   INTRO (page-load animation)
============================================================ */
(function(){
  const intro = $('#intro');
  const reveal = () => {
    document.body.classList.remove('preload');
    document.body.classList.add('revealed');
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    intro.remove(); reveal(); return;
  }
  // after the logo + name reveal, glide both into their header positions
  setTimeout(() => {
    const flyTo = (el, target) => {
      const a = el.getBoundingClientRect();
      const b = target.getBoundingClientRect();
      return el.animate([
        { transform: 'translate(0,0) scale(1)' },
        { transform: `translate(${(b.left + b.width/2) - (a.left + a.width/2)}px, ${(b.top + b.height/2) - (a.top + a.height/2)}px) scale(${b.width / a.width})` }
      ], { duration: 750, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
    };
    flyTo(intro.querySelector('.intro-logo'), document.querySelector('.logo-mark'));
    const wordAnim = flyTo(intro.querySelector('.intro-word'), document.querySelector('.wordmark'));
    wordAnim.onfinish = () => {
      reveal();
      intro.classList.add('done');
      setTimeout(() => intro.remove(), 450);
    };
  }, 1400);
})();
