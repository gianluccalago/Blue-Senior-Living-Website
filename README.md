# Blue Senior Living — Landing page

Landing page institucional e comercial do **Blue Senior Living**, residencial sênior de
alto padrão em Curitiba-PR, inspirado na filosofia das *Blue Zones*.

Site **estático** (HTML + CSS + JS, sem build e sem backend), responsivo e leve.
Objetivo principal: **agendamento de visita**. Objetivo secundário: **acesso ao app /
área do cliente**.

## Estrutura

```
index.html                 Página única (todas as seções + sprite de ícones SVG)
assets/
  css/styles.css           Design system "Air" adaptado (navy profundo + frosted glass)
  js/main.js               Configuração editável + interações
  video/hero.mp4           Vídeo de fundo do hero (otimizado p/ web, sem áudio)
  img/
    hero-poster.jpg         Imagem de fallback do vídeo (poster)
    favicon.svg             Favicon (emblema da marca)
    espaco-*.svg            Placeholders das acomodações (trocar por fotos reais)
    familia.svg             Placeholder da seção "Para a família"
  logo/emblem.svg           Emblema da marca (vetor, navy)
```

## Como editar (o que você provavelmente vai querer trocar)

Tudo que é placeholder está centralizado no topo de **`assets/js/main.js`**, no objeto
`CONFIG`:

| Campo | O que é |
|-------|---------|
| `APP_URL` | Link do app / **Área do cliente** (abre em nova aba) |
| `WHATSAPP` | Número do WhatsApp em formato internacional, só dígitos: `55` + DDD + número |
| `WHATSAPP_MSG` | Mensagem pré-preenchida do WhatsApp |
| `PHONE_DISPLAY` / `PHONE_TEL` | Telefone exibido e o link de ligação (`tel:`) |
| `EMAIL` | E-mail de contato (recebe o formulário de visita) |

Esses valores são aplicados automaticamente a todos os links/botões da página
(navbar, hero, rodapé, botão flutuante e formulário).

### Outras edições comuns

- **Endereço:** o número da R. Eduardo Sprada foi deixado em aberto de propósito.
  Procure por `Eduardo Sprada` em `index.html` (seção *Localização* e rodapé).
- **Fotos:** as acomodações e a seção da família usam imagens **placeholder** marcadas
  como *"imagem ilustrativa"*. Para usar fotos reais, basta substituir os arquivos em
  `assets/img/espaco-*.svg` e `familia.svg` (ou trocar o `src`/`alt` no `index.html`)
  por imagens de idosos ativos e ambientes luminosos. Mantenha sempre o texto `alt`.
- **Mapa:** a seção *Localização* usa um mapa ilustrativo. Pode ser trocado por um
  `<iframe>` do Google Maps quando o endereço completo estiver definido.

## Blog / Conteúdos

Blog **estático**, gerado por código (sem servidor). Os textos ficam num único
arquivo de dados e as páginas HTML são geradas a partir dele.

- **Fonte dos posts:** `blog/posts.js` — edite só esse arquivo para publicar. O
  topo dele tem um passo a passo completo de **como adicionar um post** (sem
  precisar ser programador).
- **Gerar as páginas:** depois de editar, rode na pasta do projeto:

  ```bash
  node tools/build-blog.js
  ```

  Isso (re)cria `blog/index.html` (listagem) e uma página por post
  (`blog/<slug>.html`), com SEO próprio (title, meta description, Open Graph,
  JSON-LD e headings semânticos). Faça commit e push.
- **SEO:** abra `tools/build-blog.js` e ajuste a constante **`SITE_URL`** para o
  domínio final do site — ela é usada na URL canônica e no preview de
  compartilhamento.
- **Capas:** ficam em `assets/img/blog/` (placeholders por enquanto; troque pelos
  arquivos reais e atualize o campo `cover` do post).

## Decisões de design

Baseado no design system **"Air"** (sky canvas + frosted glass), com o tom adaptado para
um residencial sênior: **sereno, sofisticado e acolhedor**, com a paleta puxada para
tons mais profundos de **navy** (`#1C4A6E`) combinados com o **celeste** da marca
(`#5CBFE5`) e o vídeo de água do hero.

- Tipografia: **Cinzel** (logotipo), **Cormorant Garamond** (títulos) e **Inter** (texto/UI).
- Tokens fiéis ao Design.md: base 4px, *section gap* generoso, cards 14px, botões 8px,
  inputs 4px; superfícies *Cloud White* / *Haze Grey* sobre o *sky canvas*; *frosted glass*
  via `backdrop-filter`.
- Cor contida: azul como protagonista; celeste reservado para as ações principais.

## Acessibilidade & performance

- Texto de corpo sempre em superfícies neutras (branco/haze) ou em navy — nunca direto
  sobre o sky canvas de baixo contraste.
- Foco de teclado visível, *skip link*, `alt` nas imagens, botão flutuante com `aria-label`.
- `prefers-reduced-motion`: o vídeo do hero é pausado (mostra o poster) e as animações são
  atenuadas.
- Vídeo otimizado (sem áudio, `+faststart`), `playsinline` para autoplay no mobile, com
  poster de fallback. Imagens com `loading="lazy"`.

## Rodar localmente

É um site estático — abra `index.html` no navegador, ou sirva a pasta:

```bash
python3 -m http.server 8000
# acesse http://localhost:8000
```

> As fontes vêm do Google Fonts; sem internet, o site usa fontes do sistema (serif/sans)
> como *fallback*, mantendo o visual.

---

*As Blue Zones são referência de estilo de vida e inspiração — não constituem promessa de
resultado médico.*
