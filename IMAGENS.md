# Imagens do empreendimento — renders (perspectivas ilustrativas)

Registro da curadoria feita em jul/2026: quais renders foram usados, onde, e quais
foram descartados. Todas as imagens são **perspectivas artísticas do projeto**, não
fotos — o rótulo "Imagem ilustrativa" aparece de forma discreta junto a cada uso e
uma nota única cobre a seção de acomodações.

## Onde cada imagem está

| Arquivo (base) | Conteúdo | Uso no site |
| --- | --- | --- |
| `acomodacao-suite` | Quarto com armário, mesa junto à janela e banheiro adaptado | Card **01 · Suíte** (seção Os espaços) |
| `acomodacao-suite-premium` | Quarto amplo com varanda, marcenaria planejada e banheiro com chuveiro acessível | Card **02 · Suíte Premium** |
| `acomodacao-long-stay` | Ambiente integrado: cama, estar, mesa de refeições e copa | Card **03 · Long Stay** |
| `acomodacao-apartamento` | Sala de estar, jantar, copa e dormitório com varanda ao fundo | Card **04 · Apartamento** |
| `exterior-fachada` | Fachada elevada do edifício, com skyline de Curitiba ao fundo | Destaque da seção **Localização** (no lugar do mapa-placeholder) e `og:image` (`og-fachada.jpg`) |
| `exterior-portaria` | Entrada com portão, letreiro e moradora caminhando com cuidadora | Seção **Para a família** (crop 4:3 intencional para manter as pessoas no enquadramento) |
| `exterior-aerea` | Aérea do complexo ao pôr do sol, entre araucárias | Fundo decorativo da seção **Conceito**, sob véu navy (overlay em CSS) |

Observação sobre a correspondência Long Stay × Apartamento: os nomes originais dos
arquivos não chegaram ao ambiente (as imagens vieram anexadas ao chat), então o
pareamento foi feito pelo conteúdo — o render com a cama em primeiro plano ficou no
Long Stay e o com a sala em primeiro plano no Apartamento. Se estiver invertido em
relação ao projeto, basta trocar os arquivos de nome (ver "Como trocar por fotos
reais").

## Descartadas (e por quê)

| Render | Motivo |
| --- | --- |
| Aérea vertical (top-down dos 5 blocos) | Enquadramento plano e escuro: telhados e estacionamento dominam a cena, pouco apelo comercial. Redundante com a aérea ao pôr do sol. |
| Fachada frontal com fonte | Ângulo redundante com a fachada elevada (que é mais forte e mostra a cidade ao fundo); portões de garagem em evidência na base. |

Nenhuma imagem apresentou marca d'água ou artefato impeditivo — o letreiro "Blue
Senior Living" que aparece nas cenas faz parte do projeto.

## Formatos, tamanhos e performance

- Diretório único: `assets/img/renders/`. Cada imagem existe em **AVIF + WebP**
  (via `<picture>`) em 3–4 larguras (`480/768/1080/1440`; a aérea em `768/1280/1672`),
  com `srcset`/`sizes` responsivos e `loading="lazy"` em tudo.
- `originals/` guarda o arquivo-fonte de cada render usado (qualidade alta, não
  referenciado pelas páginas) para permitir novos crops/reprocessamentos.
- Payload medido percorrendo a página inteira: **~317 KB no desktop (1440px @1x)** e
  **~593 KB no mobile (390px @3x)** somando todos os renders — todos lazy, nada entra
  no carregamento inicial (o hero continua sendo o vídeo). Nenhum arquivo passa de
  ~190 KB.
- `og-fachada.jpg` (1200×630, JPEG) substitui o poster do vídeo como imagem de
  compartilhamento social.

## Como trocar por fotos reais

1. Gere os derivados da foto nova nas mesmas larguras e formatos (AVIF + WebP).
2. Salve em `assets/img/renders/` **com os mesmos nomes** (ex.:
   `acomodacao-suite-480.avif` … `acomodacao-suite-1440.webp`). Nenhum HTML precisa
   mudar.
3. Remova/ajuste o rótulo "Imagem ilustrativa": as legendas ficam nos `<figcaption
   class="render-note">` (Localização, Família), na nota `.spaces__note` (acomodações)
   e no `<p class="render-note">` da seção Conceito, todos em `index.html`.
4. Os SVGs de placeholder antigos (`espaco-*.svg`, `familia.svg`) foram removidos do
   repositório nesta troca.
