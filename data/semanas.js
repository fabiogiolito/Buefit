/* ============================================================
   BUÉ FIT! — MARMITAS DA SEMANA
   Para adicionar uma semana nova, acrescenta uma entrada com a
   chave 'AAAA-SS' (ano + nº da semana, 01-53) e as 10 marmitas,
   uma por linha.
   O site mostra automaticamente a semana atual (ou a mais
   recente, se a atual ainda não existir).
   Não apagues semanas antigas: são precisas para descodificar
   códigos de pedidos dessas semanas.
============================================================ */

const WEEKS = {

  '2026-33': [
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

  '2026-34': [
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

};
