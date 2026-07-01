# REDESIGN — Blue Senior Living

Auditoria visual profunda + redesign ousado do site institucional, com o objetivo de
elevar o site ao padrão de uma **marca premium de senior living** e eliminar a cara de
"site feito por IA". Direção: **sofisticação editorial** — revista premium de
arquitetura/hospitalidade, não SaaS.

> **Nada de funcionalidade mudou.** Agenda via Supabase do app, máscara/validação de
> WhatsApp, WhatsApp direto, botão flutuante, Trabalhe Conosco, blog e Área do cliente
> funcionam exatamente como antes — todos os fluxos foram re-testados ao final
> (ver §5).

---

## 1. Diagnóstico — vícios de "site de IA" encontrados

Auditoria feita sobre o site anterior (screenshots completos desktop + mobile antes de
qualquer mudança):

| # | Vício encontrado | Onde estava |
|---|---|---|
| 1 | **Grades de cards idênticos** — caixinhas iguais com ícone em cima | 7 pilares em grid 3×3 (com órfão na última linha), 4 quartos em fileira, 3 selos de confiança, 5 caixas de método |
| 2 | **Ritmo monótono** — toda seção com a mesma estrutura (eyebrow → título → lead → grade), mesmo padding, tudo simétrico | Página inteira |
| 3 | **Glassmorphism em tudo** — navbar frosted, caixas de vidro no método, botão ghost com blur | Navbar, método, hero |
| 4 | **Gradientes genéricos** — brilho radial celeste no canto de cada seção navy; gradiente no botão primário; fundo de página em gradiente radial | Todas as seções navy, botões, body |
| 5 | **Sombras exageradas** — `0 40px 80px`, hover com lift + sombra em todo card | Cards, formulário, CTA |
| 6 | **Ícones de biblioteca sem personalidade** dentro de quadradinhos/círculos coloridos | Pilares, método, selos, cards |
| 7 | **Emojis como decoração** nas mensagens do agendamento (💬 💙 😊) | Status/notas do booker (JS) |
| 8 | **Tipografia sem hierarquia real** — uma família só (Plus Jakarta Sans), tudo em peso 600, títulos sem imposição | Página inteira |
| 9 | **Placeholders escuros genéricos** — retângulos navy com gradiente + glow | Espaços e família |
| 10 | **Footer genérico** — 4 colunas + barra, sem assinatura | Footer |
| 11 | **Botões todos iguais** — o mesmo pill celeste com gradiente em todos os contextos | Página inteira |
| 12 | **Raio uniforme** (14px) em todo card, espaçamento uniforme entre seções | Página inteira |

## 2. O que mudou (e por quê)

### 2.1 Sistema visual
- **Par tipográfico com personalidade**: **Fraunces** (serifada display, variável,
  self-hosted) para títulos + **Plus Jakarta Sans** (humanista, mantida) para texto/UI.
  Hierarquia dramática: hero em 82px serifado com acento em *itálico celeste*; títulos
  de seção ~50px em peso 480; corpo tranquilo. A legibilidade para 40–60+ foi mantida
  (corpo ≥ 16px, líne-height 1.65–1.75).
- **Fontes self-hosted** (`assets/fonts/*.woff2`, 4 arquivos variáveis, ~206 KB no
  total, subset latin): elimina a dependência do Google Fonts (a flakiness de CDN
  derrubava a tipografia inteira), melhora LCP e privacidade (LGPD).
- **Paleta expandida com neutros quentes**: papel `#FBF9F5` como fundo (no lugar do
  gradiente azulado frio), areia `#EFE8DB` para os momentos de acolhimento
  (Confiança, Trabalhe Conosco) — o azul da marca (navy `#1C4A6E` + celeste
  `#5CBFE5`) permanece protagonista, agora com mais profundidade e calor de apoio.
- **Hairlines no lugar de vidro e sombra**: divisórias de 1px substituem caixas;
  sombra só onde algo realmente "flutua" (card da agenda, drawer, FAB).
- **Botões com hierarquia real**: primário celeste sólido (pill), escuro navy,
  contorno, e link editorial com seta ("Conheça o Blue →"). Sem gradiente, sem glow.
- **Cantos**: botões pill, cards 20px, imagens 16px — suaves, sem uniformidade dura.
- **Emojis removidos** das mensagens de status do agendamento (texto aprovado intacto).

### 2.2 Composição, seção a seção
- **Navbar**: transparente sobre o vídeo (sem blur), sólida em papel ao rolar; links
  em versalete espaçado com sublinhado animado; "Área do cliente" discreto; CTA pill.
- **Hero**: vídeo mantido. Overlay recomposto (vinheta à esquerda + fade inferior que
  emenda o hero na seção navy seguinte — abertura contínua, como capa de revista).
  Título serifado com "*com propósito*" em itálico celeste; CTA primário + link
  editorial; indicador de rolagem em linha fina animada.
- **Conceito (Blue Zones)**: os 5 círculos de ícone viraram um **índice numerado**
  (01–05) com hairlines, em grade assimétrica com a declaração à esquerda.
- **7 Pilares**: a grade 3×3 virou um **índice editorial** — cabeçalho fixo (sticky) à
  esquerda, sete entradas numeradas com divisórias à direita. É a maior quebra do
  padrão "template" da página.
- **Método/ILPI**: caixas de vidro viraram **linha do tempo** (fio + marcadores
  celestes), com a tagline como citação em itálico.
- **Espaços**: 4 cards idênticos viraram **galeria assimétrica** (destaque 7/12 +
  vertical 5/12 + metades desiguais), legendas editoriais numeradas fora da imagem.
  O CTA de valores virou faixa com hairlines (sem caixa branca).
- **Confiança**: seção em areia; texto longo em **duas colunas editoriais**; selos
  viraram lista em linha com divisórias (sem caixinhas). Título com acento itálico.
- **Família**: imagem clara flutuando sobre navy; o bloco da culpa virou
  **pull-quote serifado em itálico** — o momento mais emocional da página, tratado
  como tal.
- **Localização**: mapa ilustrativo re-tintado em areia, pin navy sólido, ícones em
  círculos de hairline.
- **Trabalhe Conosco**: faixa curta em areia (ritmo de pausa), botões navy + WhatsApp.
- **Agendamento**: intro à esquerda com contatos em **linhas de hairline** (sem
  caixas de vidro); card da agenda em papel quente, calendário com células
  **circulares**, chips de horário em pill. Todo o HTML funcional (`data-*`) intocado.
- **Footer**: ganhou **assinatura editorial** — a headline aprovada em serifa grande
  + CTA — sobre as colunas de navegação/contato/acesso.
- **Placeholders**: os retângulos navy viraram **ilustrações line-art quentes**
  (cama, poltrona, sofá, duas xícaras de café) em areia com traço navy — continuam
  claramente marcadas como "imagem ilustrativa", prontas para troca por fotos reais.

### 2.3 Microinterações
- **Reveal no scroll** (fade-up sutil, 1× por elemento) via IntersectionObserver.
  Sem JS ou com `prefers-reduced-motion`, o conteúdo fica **sempre visível** (a
  classe `has-reveal` só entra quando o navegador permite animar).
- Hovers discretos: sublinhado que cresce (nav), seta que desliza (botões), zoom
  lento de imagem (espaços), linhas de contato que deslizam 10px.
- Zoom do vídeo do hero mais lento e sutil (44s, 1.02→1.09).
- `prefers-reduced-motion` respeitado globalmente (animações desligam, vídeo pausa).

### 2.4 Performance
- Fontes self-hosted com `preload` + `font-display: swap` (4 woff2 ≈ 206 KB, subset).
- Removidos `background-attachment: fixed`, gradientes de página e a maioria dos blurs.
- Zero bibliotecas novas — só CSS + IntersectionObserver nativo.
- Placeholders SVG de ~1,4 KB cada (antes ~1 KB, mesmos custos).

## 3. O que foi preservado (travas)

- **Funcionalidades**: agenda (leitura `visita_disponibilidade` + inserção
  `visita_agendamento` no Supabase do app), máscara/validação do WhatsApp, gravação
  limpa com DDI, opção WhatsApp direto, botão flutuante, Trabalhe Conosco com
  placeholders de RH, blog estático + gerador, Área do cliente (`APP_URL`). Nenhum
  seletor funcional (`data-*`, classes usadas pelo JS) foi renomeado.
- **Marca**: celeste `#5CBFE5` e navy `#1C4A6E` seguem as cores da marca; logo
  (gota/folha) intacto; conceito Blue Zones e tom acolhedor-premium mantidos.
- **Copy aprovada**: headline do hero, 7 pilares, quebra de objeção, bloco da culpa
  e textos de agendamento — **palavra por palavra**. Únicas intervenções de texto:
  remoção dos emojis decorativos das mensagens de status e `&nbsp;`/`<em>` para
  controle de quebra/ênfase visual. Endereço segue sem número; imagens de pessoas
  seguem placeholders; nenhuma promessa médica, número ou depoimento inventado.
- **Vídeo do hero** permanece como hero (autoplay mobile robusto intacto).

## 4. Decisões que merecem revisão humana

1. **Itálico celeste no hero** ("com propósito") — ênfase visual em parte da headline
   aprovada. O texto é o mesmo; se a ênfase incomodar, é 1 linha para reverter.
2. **Footer reutiliza a headline aprovada** como assinatura editorial. Mesma lógica.
3. **Placeholders line-art** — desenhei ilustrações minimalistas (cama, sofá, xícaras).
   Continuam "imagem ilustrativa", mas o traço é uma interpretação; troquem por fotos
   reais quando existirem.
4. **Emojis removidos** das mensagens do agendamento — a diretriz de redesign trata
   emoji decorativo como vício; o texto aprovado permaneceu. Se o time preferir os
   emojis, é só reintroduzi-los em `assets/js/main.js`.
5. **Navbar colapsa para menu (hambúrguer) abaixo de 1281px** — com 7 itens + ações,
   não há largura útil antes disso sem apertar o design. Notebooks 1280×800 verão o
   menu compacto.
6. **Fontes self-hosted** — se preferirem voltar ao Google Fonts (ex.: para ganhar
   atualizações automáticas), basta restaurar o `<link>` e remover os `@font-face`.

## 5. Verificação (após o redesign)

Suíte automatizada (Playwright/Chromium) — **40/40 verificações aprovadas**:

- **Agenda**: calendário renderiza a disponibilidade (resposta real da API de
  produção), seleção de dia → horários → formulário; máscara `(41) 99999-8888`;
  número incompleto bloqueia o envio (zero requisições); envio válido grava payload
  `whatsapp: "5541999998888"` (DDI + dígitos), sem `origem`/`status` (defaults do
  banco); mensagem pós-solicitação aprovada ("Tudo certo, [nome]… ainda **não está
  confirmada**"); horário marcado "✓" após solicitar. *(No sandbox de teste o
  Chromium não alcança CDNs externos; a API real foi validada por fora — HTTP 200,
  292 horários — e o fluxo E2E rodou sobre essa resposta real interceptada.)*
- **WhatsApp**: FAB, "Falar agora pelo WhatsApp", vagas (e-mail com assunto +
  WhatsApp com mensagem de currículo), telefone `tel:` — todos os links corretos.
- **Área do cliente**: `APP_URL` em nova aba (navbar, drawer e footer).
- **Drawer mobile**: abre com os 9 links, fecha por botão/backdrop.
- **Blog**: listagem com 3 posts, página de post íntegra, tipografia nova herdada.
- **Overflow**: zero rolagem lateral em 320/360/390/414/768/1281/1440 px.
- **Reduced motion**: conteúdo 100% visível sem reveals, vídeo pausado, sem erros.
- **Contraste (AA)**: corpo/papel 6.07:1 · título/areia 12.84:1 · lead/navy ≥ 10:1 ·
  botão primário 8.83:1 · eyebrow 6.56:1 · legal 6.07:1.
- **Console**: zero erros de JS.
