/* ============================================================
   BUÉ FIT! — PREÇOS E PACOTES
   Tabelas de preço por quantidade: { quantidade: preço total }.
   A quantidade 1 é o preço unitário; as outras são pacotes de
   valor fechado. Os pacotes só contam itens do mesmo grupo
   (e do mesmo tamanho, nas marmitas).
   Os extras de cada item (ingredientes, etc.) são somados à
   parte e não entram no preço do pacote.
============================================================ */

const PRECOS = {

  /* marmitas do menu da semana */
  semanal: {
    M: { 
      1:  7.60,   
      // 5: 38,   
      10: 74,   
      15: 108,   
      20: 140,   
      30: 186,   
      45: 267,   
      60: 348 
    },
    L: { 
      1:  9.00,   
      // 5: 45,   
      10: 88,   
      15: 130,   
      20: 170,   
      30: 220,   
      45: 315,   
      60: 405 
    },
  },

  /* marmitas personalizadas (monta a tua) */
  propria: {
    M: { 
      1:  9.00,   
      // 5: 45,   
      10: 88,   
      15: 129,   
      20: 168,   
      30: 240,   
      45: 345,   
      60: 440 
    },
    L: { 
      1: 10.00,   
      // 5: 50,   
      10: 98,   
      15: 144,   
      20: 188,   
      30: 270,   
      45: 390,   
      60: 495 
    },
  },

  poke: { 1: 10 }, // Preço base

  sobremesa: { 
    1:  3.50,   
    5: 16.50,   
    10: 32,   
    15: 46.50,   
    20: 60 
  },

  sopa: { 
    1:  2.80,   
    // 5: 14.00,   
    10: 27,   
    15: 39.00 
  },

  sumo: { 
    1:  2.50,   
    5: 12.00,   
    10: 22,   
    15: 31.50 
  },

};

/* Pokes */
const POKE_INCLUDED_INGS = 5; // Quantos ingredientes incluidos no preço base
const POKE_EXTRA_ING = 1.5;   // Custo por cada ingrediente extra

/* Nomes dos grupos para mostrar no site e no resumo do pedido */
const GROUP_LABELS = {
  semanal:    'Menu da semana',
  propria:    'Personalizado',
  sobremesa:  'Sobremesas',
  sopa:       'Sopas',
  sumo:       'Sumos',
  poke:       'Pokes',
};
