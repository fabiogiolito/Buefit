/* ============================================================
   BUÉ FIT! — POKES
   Todos os itens seguem o padrão ['Nome', extra]: o extra é
   somado ao preço base do poke (em precos.js). 0 = sem extra.
   A posição na lista faz parte do código de pedido —
   acrescente itens novos no fim, não reordene os existentes.
============================================================ */

const POKE_TYPES = [
  [ 'Salmão',   4.0 ],
  [ 'Atum',     2.0 ],
  [ 'Frango',   0.0 ],
  [ 'Tofu',     0.0 ],
];

const POKE_BASES = [
  [ 'Arroz',    0.0 ],
  [ 'Quinoa',   0.0 ],
];

/* ['Nome', extra, 'cor no site'] */
const POKE_INGS = [
  [ 'Abacate',        0.0,   '#8FA663' ],
  [ 'Ananás',         0.0,   '#F2D992' ],
  [ 'Manga',          0.0,   '#F0B95C' ],
  [ 'Edamame',        0.0,   '#A3B368' ],
  [ 'Sunomono',       0.0,   '#C9D19A' ],
  [ 'Cenoura',        0.0,   '#E89E52' ],
  [ 'Philadelphia',   0.0,   '#F5EFDC' ],
  [ 'Milho Doce',     0.0,   '#F2D25C' ],
  [ 'Tomate Cherry',  0.0,   '#CB5F4C' ],
  [ 'Cebola Frita',   0.0,   '#D8A868' ],
];
