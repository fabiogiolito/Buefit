/* ============================================================
   BUÉ FIT! — MENU DA SEMANA (marmitas, sopas e sumos)
   Para adicionar uma semana nova, acrescenta uma entrada com a
   chave 'AAAA-SS' (ano + nº da semana, 01-53) com três listas:
     marmitas: uma por linha (normalmente 10, mas o número pode
               variar — o site ajusta-se ao tamanho da lista).
     sopas:    as sopas da semana, no formato [ 'Nome', extra ]
               (o extra soma ao preço base de sopa em precos.js;
               0.0 = preço base).
     sumos:    os sumos da semana, mesmo formato das sopas.
               Deixa [] se não houver sumos — a secção não
               aparece no site.
   O site mostra automaticamente a semana atual (ou a mais
   recente, se a atual ainda não existir).
   Não apagues semanas antigas: são precisas para descodificar
   códigos de pedidos dessas semanas.
============================================================ */

const WEEKS = {

  '2026-33': {
    marmitas: [
      'Baião de 2, Picadinho à brasileira',
      'Arroz c/ açafrão, Brócolis, Almôndegas ao sugo',
      'Tagliatelle cremoso com tomate cherry e camarão',
      'Escondidinho de batata doce, Mozzarella, Carne picada',
      'Arroz c/ amêndoas caramelizadas, Curgetes salteadas, Frango assado',
      'Puré de abóbora, Brócolis e cenoura, Frango desfiado temperado',
      'Fusili tricolor com tomate e atum',
      'Arroz c/ salsa, Mix de repolho e cenoura, Rojões acebolados',
      'Puré de batata, Couve mineira, Frango ao molho de laranja',
      'Salada de quinoa (tomate cherry, brócolis, cogumelos e cenoura), Frango em cubos',
    ],
    sopas: [
      [ 'Sopa de Abóbora',       0.0 ],
      [ 'Sopa de Alho Francês',  0.0 ],
    ],
    sumos: [],
  },

  '2026-34': {
    marmitas: [
      'Penne ao molho branco c/ brócolis e frango',
      'Arroz c/ salsa, Feijão verde e cenoura, Frango à parmegiana',
      'Grão de bico, Grelos refogados, Peixe ao sugo',
      'Arroz integral, Carne estufada com abóbora',
      'Cuscuz vegetariano, Beterraba, Peru acebolado',
      'Arroz c/ brócolis, Caril de frango',
      'Arroz à grega, Couve mineira, Lombinho de porco ao molho de mostarda',
      'Puré de batata, Couve-flor refogada, Peixe grelhado',
      'Batata à murro, Cogumelos e espinafre, Frango desfiado cremoso',
      'Salada de feijão frade c/ batata, agrião, tomate e cebola roxa, Bacalhau e ovos cozidos',
    ],
    sopas: [
      [ 'Caldo Verde',       0.0 ],
      [ 'Sopa de Legumes',  0.0 ],
    ],
    sumos: [],
  },
   
 '2026-35': {
    marmitas: [
      'Penne refogado no alho, Legumes salteados, Carne Picada',
      'Batata Doce Assada, Cogumelos Salteados,Frango Grelhado',
      'Espaguete à Napolitana',
      'Arroz Branco, Cenoura, Strogonoff de Frango ',
      'Tagliatelle c/ azeite trufado, Cogumelos Portobelo',
      'Arroz c/ ervilha, Legumes salteados, Bifanas Aceboladas',
      'Purê de batata, Cenoura, Fígado Acebolado',
      'Lentilhas Refogadas, Curgetes, Frango em cubos',
      'Arroz c/ açafrão, Mix de repolho, Carne Picada',
      'Arroz Integral c/ lentilha, Salada de Pepino e hortelã, Quibe assado',
    ],
    sopas: [
      [ 'Sopa de Cenoura',       0.0 ],
      [ 'Sopa de Alho Francês',  0.0 ],
    ],
    sumos: [],
 };
