/**
 * ============================================================================
 *  BLUE SENIOR LIVING — CONTEÚDOS (BLOG)
 *  Esta é a FONTE ÚNICA dos posts. Para publicar, edite só este arquivo.
 * ============================================================================
 *
 *  COMO ADICIONAR UM NOVO POST (passo a passo — não precisa ser programador):
 *
 *  1) Copie um bloco { ... } inteiro abaixo (de "{" até "}," ) e cole no TOPO
 *     da lista, logo depois de "const posts = [". O primeiro da lista é o mais
 *     recente e aparece primeiro na página de Conteúdos.
 *
 *  2) Troque os campos:
 *       slug      → endereço do post. Só letras minúsculas e hifens, sem acento
 *                   nem espaço. Ex.: "rotina-de-cuidado"  ( vira /blog/rotina-de-cuidado.html )
 *       title     → título do post (vira o <h1> e o título da aba / SEO).
 *       excerpt   → resumo de 1–2 linhas (aparece no card e na descrição de SEO).
 *       date      → "AAAA-MM-DD". Ex.: "2026-06-14".
 *       category  → uma categoria. Ex.: "Cuidado", "Longevidade", "Nutrição", "Família".
 *       cover     → imagem de capa. Coloque o arquivo em  assets/img/blog/  e aponte aqui.
 *       coverAlt  → descrição da imagem (acessibilidade e SEO).
 *       author    → quem assina (opcional; pode deixar "").
 *       content   → o corpo do artigo, em blocos, na ordem de leitura:
 *                       { type: "p",  text: "um parágrafo..." }   → parágrafo
 *                       { type: "h2", text: "Um subtítulo" }      → subtítulo (bom p/ SEO)
 *
 *  3) Salve o arquivo.
 *
 *  4) Gere as páginas. Na pasta do projeto, rode no terminal:
 *           node tools/build-blog.js
 *     Isso recria /blog/index.html e a página de cada post (com SEO).
 *
 *  5) Faça commit e push. Pronto: o post está no ar.
 *
 *  (O filtro de categorias da listagem é montado automaticamente a partir
 *   das categorias usadas nos posts — não precisa configurar nada.)
 * ============================================================================
 */

const posts = [
  {
    slug: "como-saber-se-e-hora-residencial-idosos",
    title: "Como saber se é hora de considerar um residencial para idosos",
    excerpt:
      "Sinais no dia a dia, a conversa em família e como decidir sem culpa o melhor momento para buscar apoio.",
    date: "2026-06-12",
    category: "Família",
    cover: "assets/img/blog/como-saber-se-e-hora.svg",
    coverAlt: "Mãos de uma pessoa idosa e de um familiar unidas, em gesto de cuidado.",
    author: "Equipe Blue Senior Living",
    content: [
      { type: "p", text: `Poucas decisões pesam tanto quanto essa. Reconhecer que cuidar de um pai ou de uma mãe em casa ficou difícil é um gesto de amor e de responsabilidade, não uma derrota. Ainda assim, a dúvida quase sempre vem acompanhada de culpa e da mesma pergunta: "será que já é hora?".` },
      { type: "p", text: `Não existe uma data certa. Mas existem sinais. Observados com carinho e honestidade, eles ajudam a família a decidir antes de uma crise, não depois dela.` },
      { type: "h2", text: "Sinais de que vale a pena considerar" },
      { type: "p", text: `Alguns aparecem aos poucos: quedas ou desequilíbrios, remédios tomados na hora errada (ou esquecidos), perda de peso, refeições puladas. Outros são mais silenciosos: o isolamento, a tristeza, o desânimo de quem passa horas sozinho. E há o sinal que fala da família, o cuidador principal exausto, sem descanso, abrindo mão da própria saúde.` },
      { type: "p", text: `Nenhum sinal isolado significa que "chegou a hora". Mas, quando vários se somam e se repetem, é o momento de conversar.` },
      { type: "h2", text: "A conversa em família" },
      { type: "p", text: `Decisões assim não deveriam recair sobre uma pessoa só. Reúna quem ama e cuida, ouça o próprio idoso sempre que possível e fale abertamente sobre o que cada um sente e teme. Lembrar do objetivo ajuda: o que está em jogo é garantir segurança e convívio, coisas que dentro de casa quase ninguém consegue oferecer sozinho.` },
      { type: "h2", text: "Decidir sem culpa" },
      { type: "p", text: `Escolher um residencial não é abrir mão de cuidar. É escolher que seu pai ou sua mãe seja cuidado por uma equipe inteira, o tempo todo, com recursos que uma casa não comporta. A culpa costuma vir do mito de que "cuidar de verdade" é cuidar sozinho. Não é.` },
      { type: "p", text: `Se você chegou até aqui, talvez já saiba a resposta. O próximo passo é simples e sem compromisso: conhecer de perto. Uma visita vale mais do que qualquer folheto.` },
    ],
  },
  {
    slug: "visitar-residencial-o-que-observar",
    title: "Visitar um residencial: o que observar para escolher com segurança",
    excerpt:
      "Um guia prático do que reparar na hora da visita: as pessoas, o ambiente e o que um bom lar não esconde.",
    date: "2026-05-28",
    category: "Cuidado",
    cover: "assets/img/blog/visitar-residencial.svg",
    coverAlt: "Ambiente luminoso e acolhedor de um residencial sênior.",
    author: "Equipe Blue Senior Living",
    content: [
      { type: "p", text: `A melhor forma de escolher um residencial é visitando. Fotos encantam e textos convencem, mas é no lugar, sentindo o ambiente e olhando nos olhos de quem cuida, que dá para saber. Abaixo, o que vale observar.` },
      { type: "h2", text: "As pessoas, antes de tudo" },
      { type: "p", text: `Repare na equipe. Os cuidadores parecem atentos e gentis? Chamam os residentes pelo nome? Há enfermagem presente, e em qual proporção? Pergunte sobre acompanhamento médico, sobre o que acontece numa emergência de madrugada, sobre como a medicação é organizada e conferida. Cuidado bom tem método e não tem pressa em responder.` },
      { type: "h2", text: "O ambiente e o clima" },
      { type: "p", text: `Um bom lar se percebe pelos sentidos. O lugar é limpo, claro e arejado? Tem cheiro de cuidado ou de descuido? Os residentes estão arrumados, em convívio, ocupados, ou largados diante de uma televisão? Observe os espaços comuns, os quartos, a segurança (corrimãos, pisos, banheiros adaptados) e, principalmente, o clima: as pessoas parecem bem ali?` },
      { type: "h2", text: "Transparência e rotina" },
      { type: "p", text: `Pergunte como a família acompanha o dia a dia. Existem canais abertos, contato fácil com a equipe? Como é a alimentação: tem nutricionista, cardápio, respeito a restrições? Que atividades acontecem ao longo da semana? Um residencial seguro não tem nada a esconder: mostra a rotina com naturalidade e responde com clareza.` },
      { type: "h2", text: "Confie no que você sente" },
      { type: "p", text: `Leve suas perguntas por escrito, visite mais de uma vez se puder e em horários diferentes. Alguns dados são objetivos, mas a sensação também conta. Você consegue se imaginar deixando quem ama ali, tranquilo? Essa resposta costuma valer mais do que a lista.` },
    ],
  },
  {
    slug: "o-que-sao-as-blue-zones",
    title: "O que são as Blue Zones e o que elas ensinam sobre envelhecer bem",
    excerpt:
      "Nas regiões onde mais se vive, a longevidade não é sorte. Os hábitos simples que inspiram o nosso jeito de cuidar.",
    date: "2026-05-15",
    category: "Longevidade",
    cover: "assets/img/blog/o-que-sao-as-blue-zones.svg",
    coverAlt: "Paisagem serena que remete às regiões de grande longevidade.",
    author: "Equipe Blue Senior Living",
    content: [
      { type: "p", text: `Existem lugares no mundo onde chegar aos 90 ou 100 anos com saúde e lucidez é mais comum do que em qualquer outro. São as Blue Zones, as Zonas Azuis. Não são spas nem clínicas: são comunidades comuns, em cinco cantos diferentes do planeta, que compartilham um jeito parecido de viver.` },
      { type: "h2", text: "Não é sorte. É um jeito de viver." },
      { type: "p", text: `O que mais surpreende é a simplicidade. Nessas regiões, as pessoas se mantêm em movimento naturalmente ao longo do dia. Comem comida de verdade, na medida certa, em boa companhia. Cultivam amizades que duram a vida inteira e pertencem a uma comunidade. E acordam com um motivo para o dia, algo que em Okinawa, no Japão, chamam de ikigai.` },
      { type: "p", text: `Nenhum desses hábitos é milagroso sozinho. Juntos, ao longo de décadas, mudam a quantidade de anos e a qualidade de cada um deles.` },
      { type: "h2", text: "O que isso ensina sobre o cuidado sênior" },
      { type: "p", text: `As Blue Zones lembram algo fácil de esquecer: envelhecer bem tem menos a ver com remédios e mais com sentido. Propósito, vínculos, movimento, boa comida e o sentimento de pertencer são parte do cuidado, não luxo.` },
      { type: "p", text: `É essa a inspiração que carregamos no Blue: traduzir esses princípios em rotina. Dias com convívio e propósito, refeições preparadas com carinho, o corpo ativo no ritmo de cada um, dentro de um cuidado sério e seguro. Porque viver mais só vale a pena quando se vive bem.` },
    ],
  },
];

module.exports = posts;
