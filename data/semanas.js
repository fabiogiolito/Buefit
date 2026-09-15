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
      'Penne Ao Molho Branco c/ Brócolis e frango',
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
  },
   
 '2026-36': {
    marmitas: [
      'Arroz c/ salsa, Chilli de Carne c/ Feijão Encarnado',
      'Arroz c/ cenoura,Feijão Manteiga,Frango Acebolado',
      'Bacalhau c/ Natas',
      'Penne c/ Pesto de manjericão, carne Picada ',
      'Purê de batata Doce,Cenouras e Brócolis,Frango Desfiado ',
      'Arroz Chau Chau, Mix de Repolho e Cenoura, Frango Xadrez',
      'Espaguete com Almondegas ao Sugo',
      'Cuscuz c/ Salsa,Cogumelos e Espinafre,Lombinho de Porco',
      'Quiche de Alho Francês,mix de folhas',
      'Salada de Grão de Bico: pimentos,coentros,cebola roxa, azeitona preta, Atum e Ovos cozidos',
    ],
    sopas: [
      [ 'Sopa de Abobora',       0.0 ],
      [ 'Sopa de Legumes',  0.0 ],
    ],
    sumos: [],
  },
    '2026-37': {
    marmitas: [
      'Arroz c/ brócolis,frango desfiado c/ alho francês',
      'Panqueca à brasileira, carne picada ',
      'Baião de 2, picadinho a brasileira',
      'Cuscuz c/ amêndoas, legumes salteados,peixe ao molho de coco ',
      'Tagliatelle de espinafre c/ tomate cherry, carne picada ',
      'Purê de abóbora,couve refogada, pulled pork',
      'Arroz branco,carne de porco à portuguesa',
      'Quinoa refogada, cogumelos e espinafre, frango em cubos',
      'Massa à parisiense',
      'Arroz c/ ervilha, cenouras, bifanas aceboladas ',
    ],
    sopas: [
      [ 'Sopa de Alho Francês',       0.0 ],
      [ 'Sopa de Cenoura e Coentros',  0.0 ],
    ],
    sumos: [],
  },
     '2026-38': {
    marmitas: [
      'Arroz com cenoura, couve mineira, frango ao molho de mostarda e mel',
      'Creme de cenoura, feijão verde e milho, frango desfiado ',
      'Arroz à grega,cenouras refogadas, frango assado',
      'Escondidinho de batata doce, mozzarella,carne picada',
      'Arroz com açafrão,brócolis,almondegas ao sugo ',
      'Cuscuz com salsa,curgetes refogadas, peixe ao molho de limão',
      'Arroz com coentros,carne estufada com abóbora',
      'Espaguete refogado, cenouras e brócolis,hambúrguer grelhado',
      'Grão de bico refogado,espinafres,tofu ao molho de soja e alho',
      'Batata gratinada, brócolis,frango desfiado ',
    ],
    sopas: [
      [ 'Sopa de Legumes ',       0.0 ],
      [ 'Sopa de Caldo verde',  0.0 ],
    ],
    sumos: [],
  },
  // ↑ Duplique a semana anterior e faça alterações
  // ==============================================

 };
