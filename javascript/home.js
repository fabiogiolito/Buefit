/* ============================================================
   BUÉ FIT! — PÁGINA INICIAL (só usado por index.html)
   Preenche o menu da semana, zonas, galeria e contactos a partir
   dos ficheiros em data/. Carregar sempre depois de funcoes.js.
============================================================ */

const $ = s => document.querySelector(s);
const eur = n => n.toFixed(2).replace('.', ',') + ' €';
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

$('#menuList').innerHTML = WEEK.marmitas.map(m => `<li>${esc(m.trim())}</li>`).join('');
if (WEEK.sopas.length) {
  $('#menuSoups').hidden = false;
  $('#menuSoups').innerHTML = '<b>Sopas da semana:</b> ' + WEEK.sopas.map(s => esc(s[0])).join(' · ');
}

/* pacotes do menu da semana (tamanho M): preço por marmita e quanto se poupa
   face a comprar o mesmo número de marmitas uma a uma */
const packs = PRECOS.semanal.M;
$('#unitPrice').textContent = eur(packs[1]);
$('#packList').innerHTML = Object.keys(packs).map(Number).filter(q => q > 1).sort((a, b) => a - b).map(q => `<li>
  <span>${q} marmitas</span>
  <b>${eur(packs[q] / q)}</b>
  <em>Poupas ${eur(q * packs[1] - packs[q]).replace(',00', '')}</em>
</li>`).join('');

$('#zoneNote').textContent = 'Entregas em ' + new Intl.ListFormat('pt', { type: 'conjunction' }).format(ZONES.map(z => z[0])) + '.';

$('#waLink').href = $('#waFoot').href = 'https://wa.me/' + WHATSAPP_NUMERO.replace(/\D/g, '');

$('#gallery').insertAdjacentHTML('afterbegin', GALERIA.map(([file, alt, link]) => {
  const src = 'images/galeria/' + encodeURIComponent(file);
  const media = /\.(mp4|webm|mov)$/i.test(file)
    ? `<video class="autoplay" src="${src}" poster="${src.replace(/\.\w+$/, '.poster.jpg')}" muted loop playsinline preload="none" aria-label="${esc(alt || '')}"></video>`
    : `<img src="${src}" alt="${esc(alt || '')}" loading="lazy">`;
  return `<a href="${esc(link || 'https://www.instagram.com/buefit_/')}" target="_blank" rel="noopener">${media}</a>`;
}).join(''));

/* vídeos só tocam enquanto estão visíveis; com "reduzir movimento" ficam parados, com controlos */
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('video').forEach(v => { v.autoplay = false; v.pause(); v.controls = true; });
} else {
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause()), { threshold: .25 });
  document.querySelectorAll('video.autoplay').forEach(v => io.observe(v));
}
