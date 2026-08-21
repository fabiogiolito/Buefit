/* ============================================================
   BUÉ FIT! — INGREDIENTES DAS MARMITAS
   Formato: ['código', 'Nome', extra em €, 'ícone', 'Grupo', 'restrições']
   O extra soma ao preço base da marmita (0 = sem extra).
   O Grupo é o título da secção no site (a ordem das secções
   segue a ordem em que aparecem na lista).
   As restrições são as dietas que o ingrediente VIOLA (chaves
   da lista DIETAS abaixo, separadas por espaço) — um ingrediente
   novo fica logo filtrável só com esta coluna.
   Não mude códigos já usados — só acrescente novos no fim.
============================================================ */

/* Filtros disponíveis no site: [ chave, 'Nome no site', 'Categoria' ] */
const DIETAS = [
  [ 'gluten',   'Sem glúten',                    'Alergéneos'        ],
  [ 'lactose',  'Sem lactose',                   'Alergéneos'        ],
  [ 'ovo',      'Sem ovo',                       'Alergéneos'        ],
  [ 'nuts',     'Sem amendoim e frutos secos',   'Alergéneos'        ],
  [ 'peixe',    'Sem peixe',                     'Alergéneos'        ],
  [ 'marisco',  'Sem marisco',                   'Alergéneos'        ],
  [ 'soja',     'Sem soja',                      'Alergéneos'        ],
  [ 'veg',      'Vegetariana',                   'Dietas especiais'  ],
  [ 'vegan',    'Vegan',                         'Dietas especiais'  ],
  [ 'fodmap',   'Low FODMAP',                    'Dietas especiais'  ],
];


const BASES = [
  [ 'B1',     'Arroz Branco',               0.0,   'f-rice',       'Arrozes',   ''                       ],
  [ 'B2',     'Arroz de Cenoura',           0.0,   'f-carrot',     'Arrozes',   ''                       ],
  [ 'B3',     'Arroz Chau-Chau',            0.0,   'f-riceMix',    'Arrozes',   ''                       ],
  [ 'B4',     'Arroz Coentros',             0.0,   'f-riceHerb',   'Arrozes',   ''                       ],
  [ 'B5',     'Arroz Salsa',                0.0,   'f-riceHerb',   'Arrozes',   ''                       ],
  [ 'B6',     'Arroz Açafrão',              0.0,   'f-riceY',      'Arrozes',   ''                       ],
  [ 'B7',     'Arroz c/ Amêndoas',          0.0,   'f-rice',       'Arrozes',   'nuts'                   ],
  [ 'B8',     'Arroz Colorido',             0.0,   'f-riceMix',    'Arrozes',   ''                       ],
  [ 'B9',     'Arroz Baião de 2',           0.0,   'f-riceMix',    'Arrozes',   'fodmap'                 ],
  [ 'B10',    'Arroz à Grega',              0.0,   'f-riceMix',    'Arrozes',   ''                       ],
  [ 'B33',    'Arroz Integral',             0.0,   'f-riceBr',     'Arrozes',   ''                       ],
  [ 'B11',    'Puré de Batata',             0.0,   'f-pure',       'Purés (Opção sem lactose disponível)',     'vegan'          ],
  [ 'B12',    'Puré de Batata Doce',        0.0,   'f-pureO',      'Purés (Opção sem lactose disponível)',     'vegan'          ],
  [ 'B13',    'Puré de Abóbora',            0.0,   'f-pureO',      'Purés (Opção sem lactose disponível)',     'vegan'          ],
  [ 'B14',    'Puré de Mandioca',           1.5,   'f-pure',       'Purés (Opção sem lactose disponível)',     'vegan'          ],
  [ 'B15',    'Puré de Inhame',             1.5,   'f-pure',       'Purés (Opção sem lactose disponível)',     'vegan'          ],
  [ 'B16',    'Cuscuz Simples',             0.0,   'f-cuscuz',     'Cuscuz',    'gluten fodmap'          ],
  [ 'B17',    'Cuscuz c/ Amêndoas',         0.0,   'f-cuscuz',     'Cuscuz',    'gluten fodmap nuts'     ],
  [ 'B18',    'Cuscuz c/ Salsa',            0.0,   'f-cuscuz',     'Cuscuz',    'gluten fodmap'          ],
  [ 'B19',    'Cuscuz c/ Coentros',         0.0,   'f-cuscuz',     'Cuscuz',    'gluten fodmap'          ],
  [ 'B20',    'Cuscuz Vegetariano',         0.0,   'f-cuscuz',     'Cuscuz',    'gluten fodmap'          ],
  [ 'B21',    'Cuscuz c/ Bacon',            0.0,   'f-cuscuz',     'Cuscuz',    'gluten fodmap veg vegan' ],
  [ 'B22',    'Cuscuz Mediterrâneo',        0.0,   'f-cuscuz',     'Cuscuz',    'gluten fodmap'          ],
  [ 'B23',    'Cuscuz Napolitana',          0.0,   'f-cuscuz',     'Cuscuz',    'gluten fodmap'          ],
  [ 'B24',    'Esparguete',                 0.0,   'f-pasta',      'Massas',    'gluten fodmap'          ],
  [ 'B25',    'Esparguete Integral',        0.0,   'f-pastaBr',    'Massas',    'gluten fodmap'          ],
  [ 'B26',    'Penne',                      0.0,   'f-pasta',      'Massas',    'gluten fodmap'          ],
  [ 'B27',    'Tagliatelle',                0.0,   'f-pasta',      'Massas',    'gluten fodmap'          ],
  [ 'B28',    'Fusili',                     0.0,   'f-pasta',      'Massas',    'gluten fodmap'          ],
  [ 'B29',    'Linguíni',                   0.0,   'f-pasta',      'Massas',    'gluten fodmap'          ],
  [ 'B30',    'Quinoa Refogada',            0.0,   'f-grain',      'Grãos',     ''                       ],
  [ 'B31',    'Lentilhas Refogadas',        0.0,   'f-lentil',     'Grãos',     'fodmap'                 ],
  [ 'B32',    'Grão de Bico Salteado',      0.0,   'f-chick',      'Grãos',     'fodmap'                 ],
];

const SIDES = [
  [ 'A1',     'Batata Inglesa Assada',      0.0,   'f-root',       '',   ''         ],
  [ 'A2',     'Batata Doce Assada',         0.0,   'f-root',       '',   ''         ],
  [ 'A3',     'Cogumelos Brancos',          0.0,   'f-mush',       '',   'fodmap'   ],
  [ 'A4',     'Cogumelos e Espinafres',     0.0,   'f-mush',       '',   'fodmap'   ],
  [ 'A5',     'Espinafres',                 0.0,   'f-green',      '',   ''         ],
  [ 'A6',     'Couve Refogada',             0.0,   'f-green',      '',   ''         ],
  [ 'A7',     'Grelos Refogados',           0.0,   'f-green',      '',   ''         ],
  [ 'A8',     'Repolho Roxo',               0.0,   'f-cabbage',    '',   ''         ],
  [ 'A9',     'Legumes Salteados',          0.0,   'f-veg',        '',   ''         ],
  [ 'A10',    'Brócolos',                   0.0,   'f-green',      '',   ''         ],
  [ 'A11',    'Salada de Couve-Flor',       0.0,   'f-cauli',      '',   'fodmap'   ],
  [ 'A12',    'Cenouras',                   0.0,   'f-carrot',     '',   ''         ],
  [ 'A13',    'Brócolos e Cenouras',        0.0,   'f-veg',        '',   ''         ],
  [ 'A14',    'Mix de Repolhos Refogados',  0.0,   'f-cabbage',    '',   ''         ],
  [ 'A15',    'Beterrabas',                 0.0,   'f-beet',       '',   ''         ],
  [ 'A16',    'Feijão Frade',               0.0,   'f-beans',      '',   'fodmap'   ],
  [ 'A17',    'Feijão Manteiga',            0.0,   'f-beans',      '',   'fodmap'   ],
  [ 'A18',    'Feijão Preto',               0.0,   'f-beans',      '',   'fodmap'   ],
  [ 'A19',    'Feijão Encarnado',           0.0,   'f-beans',      '',   'fodmap'   ],
  [ 'A20',    'Feijão Verde',               0.0,   'f-gbean',      '',   ''         ],
];

const PROTS = [
  [ 'P1',     'Carne de Vitela Desfiada',             1.0,    'f-meat',      'Carnes',         'veg vegan'          ],
  [ 'P2',     'Carne de Vitela Salteada',             1.0,    'f-meat',      'Carnes',         'veg vegan'          ],
  [ 'P3',     'Carne Picada de Vaca',                 0.0,    'f-meat',      'Carnes',         'veg vegan'          ],
  [ 'P4',     'Bifes de Fígado Acebolado',            0.0,    'f-meatD',     'Carnes',         'veg vegan'          ],
  [ 'P5',     'Bifes de Vaca',                        2.0,    'f-meatD',     'Carnes',         'veg vegan'          ],
  [ 'P6',     'Hambúrguer 200g',                      0.0,    'f-meat',      'Carnes',         'veg vegan'          ],
  [ 'P7',     'Almôndegas (5 un.)',                   0.0,    'f-balls',     'Carnes',         'gluten veg vegan'   ],
  [ 'P8',     'Frango Grelhado',                      0.0,    'f-chicken',   'Aves',           'veg vegan'          ],
  [ 'P9',     'Frango Desfiado',                      0.0,    'f-chicken',   'Aves',           'veg vegan'          ],
  [ 'P10',    'Frango em Cubos',                      0.0,    'f-chicken',   'Aves',           'veg vegan'          ],
  [ 'P11',    'Frango Xadrez',                        0.0,    'f-chicken',   'Aves',           'veg vegan'          ],
  [ 'P12',    'Frango Assado',                        1.0,    'f-chicken',   'Aves',           'veg vegan'          ],
  [ 'P13',    'Peru Grelhado',                        0.0,    'f-turkey',    'Aves',           'veg vegan'          ],
  [ 'P14',    'Almôndegas de Peru',                   0.0,    'f-balls',     'Aves',           'gluten veg vegan'   ],
  [ 'P15',    'Hambúrguer de Peru c/ Espinafres',     0.0,    'f-turkey',    'Aves',           'veg vegan'          ],
  [ 'P16',    'Ovos Cozidos',                         0.0,    'f-egg',       'Ovos',           'ovo vegan'          ],
  [ 'P17',    'Omelete de Espinafres',                0.0,    'f-egg',       'Ovos',           'ovo vegan'          ],
  [ 'P18',    'Omelete c/ Queijo',                    0.0,    'f-egg',       'Ovos',           'ovo lactose vegan'  ],
  [ 'P19',    'Filetes de Pescada',                   0.0,    'f-fish',      'Peixes & Mar',   'peixe veg vegan'    ],
  [ 'P20',    'Peixe ao Molho de Tomate',             0.0,    'f-fish',      'Peixes & Mar',   'peixe veg vegan'    ],
  [ 'P21',    'Peixe ao Molho de Limão e Ervas',      0.0,    'f-fish',      'Peixes & Mar',   'peixe veg vegan'    ],
  [ 'P22',    'Peixe ao Molho de Coco',               0.0,    'f-fish',      'Peixes & Mar',   'peixe veg vegan'    ],
  [ 'P23',    'Peixe à Moda Mediterrânea',            0.0,    'f-fish',      'Peixes & Mar',   'peixe veg vegan'    ],
  [ 'P24',    'Posta de Bacalhau',                    1.5,    'f-fish',      'Peixes & Mar',   'peixe veg vegan'    ],
  [ 'P25',    'Bacalhau Desfiado',                    1.5,    'f-fish',      'Peixes & Mar',   'peixe veg vegan'    ],
  [ 'P26',    'Lombo de Salmão Grelhado',             3.0,    'f-salmon',    'Peixes & Mar',   'peixe veg vegan'    ],
  [ 'P27',    'Bifes de Atum Fresco',                 2.5,    'f-tuna',      'Peixes & Mar',   'peixe veg vegan'    ],
  [ 'P28',    'Camarão Salteado',                     3.0,    'f-shrimp',    'Peixes & Mar',   'marisco veg vegan'  ],
  [ 'P29',    'Linguiça Toscana',                     0.0,    'f-pork',      'Porco',          'veg vegan'          ],
  [ 'P30',    'Salsicha Fresca',                      0.0,    'f-pork',      'Porco',          'veg vegan'          ],
  [ 'P31',    'Lombinho de Porco',                    0.0,    'f-pork',      'Porco',          'veg vegan'          ],
  [ 'P32',    'Bifanas',                              0.0,    'f-pork',      'Porco',          'veg vegan'          ],
  [ 'P33',    'Hambúrguer Beyond Meat',               0.0,    'f-tempeh',    'Vegan',          ''                   ],
  [ 'P34',    'Tofu Grelhado',                        0.0,    'f-tofu',      'Vegan',          'soja'               ],
  [ 'P35',    'Tofu Agridoce',                        0.0,    'f-tofu',      'Vegan',          'soja'               ],
  [ 'P36',    'Tofu c/ Açafrão',                      0.0,    'f-riceY',     'Vegan',          'soja'               ],
  [ 'P37',    'Tempeh Salteado',                      0.0,    'f-tempeh',    'Vegan',          'soja'               ],
  [ 'P38',    'Grão de Bico',                         0.0,    'f-chick',     'Vegan',          'fodmap'             ],
  [ 'P39',    'Cogumelo Portobello',                  0.0,    'f-mush',      'Vegan',          'fodmap'             ],
];
