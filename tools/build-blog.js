/* ============================================================================
 *  Gerador estático do blog do Blue Senior Living.
 *  Lê blog/posts.js e gera:  blog/index.html  +  blog/<slug>.html
 *
 *  Rode:   node tools/build-blog.js
 * ----------------------------------------------------------------------------
 *  SEO: o título e a meta description de cada página saem do título/resumo do
 *  post. Para o compartilhamento social e a URL canônica funcionarem 100%,
 *  ajuste SITE_URL abaixo para o domínio final do site.
 * ==========================================================================*/

const fs = require("fs");
const path = require("path");
const posts = require("../blog/posts.js");

/* ----- Configuração (edite aqui) ----- */
const SITE = "Blue Senior Living";
const SITE_URL = "https://blueseniorliving.com.br"; // <-- EDITE para o domínio final (SEO / preview social)
const APP_URL = "https://app.blueseniorliving.com.br"; // Área do cliente
const WHATSAPP = "5541999999999"; // só dígitos (DDI 55 + DDD + número)

const ROOT = path.join(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "blog");
const BASE = "../"; // todas as páginas do blog ficam em /blog/ (um nível abaixo da raiz)

/* ----- Helpers ----- */
const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const fmtDate = (iso) => {
  const d = new Date(iso + "T12:00:00");
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" }).format(d);
};

// Fontes self-hosted (declaradas via @font-face em styles.css); só o preload aqui.
const fonts =
  `<link rel="preload" href="${BASE}assets/fonts/fraunces.woff2" as="font" type="font/woff2" crossorigin>` +
  `<link rel="preload" href="${BASE}assets/fonts/plus-jakarta-sans.woff2" as="font" type="font/woff2" crossorigin>`;

function head({ title, desc, cover, canonical, article }) {
  const img = SITE_URL && cover ? `${SITE_URL}/${cover}` : (cover || "");
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="theme-color" content="#0E2233">
  ${canonical ? `<link rel="canonical" href="${esc(canonical)}">` : ""}
  <meta property="og:type" content="${article ? "article" : "website"}">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  ${img ? `<meta property="og:image" content="${esc(img)}">` : ""}
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${BASE}assets/img/favicon.svg" type="image/svg+xml">
  ${fonts}
  <link rel="stylesheet" href="${BASE}assets/css/styles.css">
  <link rel="stylesheet" href="${BASE}assets/css/blog.css">
</head>`;
}

function navbar(current) {
  return `<body class="blog-page">
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <header class="nav is-scrolled blog-nav">
    <div class="nav__inner">
      <a class="brand" href="${BASE}index.html" aria-label="${SITE} — início">
        <img class="brand__emblem-img" src="${BASE}assets/logo/emblem.svg" alt="" width="30" height="46">
        <span class="brand__text"><span class="brand__name">BLUE</span><span class="brand__sub">SENIOR LIVING</span></span>
      </a>
      <nav class="nav__links" aria-label="Navegação principal">
        <a href="${BASE}index.html">Início</a>
        <a href="index.html"${current === "blog" ? ' aria-current="page"' : ""}>Conteúdos</a>
        <a href="${BASE}index.html#trabalhe">Trabalhe conosco</a>
      </nav>
      <div class="nav__actions">
        <a class="btn-app" href="${APP_URL}" target="_blank" rel="noopener noreferrer">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Área do cliente</span>
        </a>
        <a class="btn btn--primary nav__cta" href="${BASE}index.html#agendar"><span class="nav__cta--full">Agendar visita</span><span class="nav__cta--mini">Agendar</span></a>
      </div>
    </div>
  </header>`;
}

function footer() {
  return `<footer class="footer blog-footer">
    <div class="wrap footer__inner">
      <div class="footer__brand">
        <a class="footer__logo" href="${BASE}index.html" aria-label="${SITE} — início">
          <img src="${BASE}assets/logo/blue-senior-living-white.svg" alt="${SITE}" width="176">
        </a>
        <p class="footer__tagline">Inspirado nas Blue Zones.<br>Cuidado sênior com afeto e propósito, em Curitiba.</p>
      </div>
      <nav class="footer__col" aria-label="Navegue">
        <h4>Navegue</h4>
        <a href="${BASE}index.html#conceito">O conceito</a>
        <a href="${BASE}index.html#espacos">Os espaços</a>
        <a href="${BASE}index.html#familia">Para a família</a>
        <a href="index.html">Conteúdos</a>
      </nav>
      <div class="footer__col">
        <h4>Acesso</h4>
        <a class="footer__app" href="${APP_URL}" target="_blank" rel="noopener noreferrer">Área do cliente</a>
        <a class="btn btn--primary footer__cta" href="${BASE}index.html#agendar">Agendar visita</a>
      </div>
    </div>
    <div class="footer__bar">
      <p>© <span>${new Date().getFullYear()}</span> ${SITE} · Residencial para idosos · ILPI</p>
    </div>
  </footer>
  <a class="fab" href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá! Gostaria de conhecer o " + SITE + " e agendar uma visita.")}" target="_blank" rel="noopener noreferrer" aria-label="Fale com a gente pelo WhatsApp">
    <svg aria-hidden="true" viewBox="0 0 24 24"><path fill="currentColor" d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.02ZM12.04 20.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 5.83 2.42 8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z"/></svg>
    <span class="fab__label">Fale com a gente</span>
  </a>
</body>
</html>`;
}

/* ----- Page: listing ----- */
function buildListing() {
  const sorted = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
  const cats = [...new Set(sorted.map((p) => p.category))];

  const filterBar =
    sorted.length > 1
      ? `<div class="blog-filter" role="group" aria-label="Filtrar por categoria">
        <button class="blog-filter__btn is-active" data-cat="all" aria-pressed="true">Todos</button>
        ${cats.map((c) => `<button class="blog-filter__btn" data-cat="${esc(c)}" aria-pressed="false">${esc(c)}</button>`).join("\n        ")}
      </div>`
      : "";

  const cards = sorted
    .map(
      (p) => `<article class="post-card" data-category="${esc(p.category)}">
        <a class="post-card__link" href="${esc(p.slug)}.html">
          <span class="post-card__media"><img src="${BASE}${esc(p.cover)}" alt="${esc(p.coverAlt || p.title)}" loading="lazy" width="1200" height="675"></span>
          <span class="post-card__body">
            <span class="post-card__meta"><span class="post-card__cat">${esc(p.category)}</span><time datetime="${esc(p.date)}">${esc(fmtDate(p.date))}</time></span>
            <h2 class="post-card__title">${esc(p.title)}</h2>
            <p class="post-card__excerpt">${esc(p.excerpt)}</p>
            <span class="post-card__more">Ler conteúdo →</span>
          </span>
        </a>
      </article>`
    )
    .join("\n      ");

  const grid =
    sorted.length === 0
      ? `<div class="blog-empty">
        <p class="blog-empty__title">Em breve, novos conteúdos.</p>
        <p>Estamos preparando textos sobre cuidado, longevidade e família. Volte logo ou venha conversar com a gente.</p>
        <a class="btn btn--primary" href="${BASE}index.html#agendar">Agende uma visita</a>
      </div>`
      : `<div class="blog-grid">\n      ${cards}\n    </div>`;

  const body = `${navbar("blog")}
  <main id="conteudo" class="blog">
    <header class="blog-hero">
      <div class="wrap">
        <p class="eyebrow">Conteúdos</p>
        <h1 class="blog-hero__title">Conversas sobre cuidado, longevidade e família</h1>
        <p class="blog-hero__lead">Textos sem jargão para ajudar a sua família a decidir e a cuidar melhor.</p>
      </div>
    </header>
    <div class="wrap">
      ${filterBar}
      ${grid}
    </div>
  </main>
  ${footer()}`;

  const html =
    head({
      title: `Conteúdos · ${SITE}`,
      desc: "Textos sobre cuidado sênior, longevidade e família — para ajudar a decidir e a cuidar melhor, com afeto e sem jargão.",
      cover: "assets/img/hero-poster.jpg",
      canonical: SITE_URL ? `${SITE_URL}/blog/` : "",
      article: false,
    }) +
    "\n" +
    body +
    `\n<script>
  // Filtro de categorias (progressivo, acessível)
  (function () {
    var btns = document.querySelectorAll('.blog-filter__btn');
    var cards = document.querySelectorAll('.post-card');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var cat = b.getAttribute('data-cat');
        btns.forEach(function (x) { x.classList.toggle('is-active', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        cards.forEach(function (c) { c.style.display = (cat === 'all' || c.getAttribute('data-category') === cat) ? '' : 'none'; });
      });
    });
  })();
</script>`;

  fs.writeFileSync(path.join(BLOG_DIR, "index.html"), html);
  return sorted;
}

/* ----- Page: single post ----- */
function buildPost(post, sorted) {
  const url = SITE_URL ? `${SITE_URL}/blog/${post.slug}.html` : "";
  const bodyBlocks = post.content
    .map((b) => (b.type === "h2" ? `<h2>${esc(b.text)}</h2>` : `<p>${esc(b.text)}</p>`))
    .join("\n        ");

  const jsonld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    articleSection: post.category,
    author: { "@type": "Organization", name: post.author || SITE },
    publisher: { "@type": "Organization", name: SITE },
  };
  if (url) jsonld.mainEntityOfPage = url;
  if (SITE_URL) jsonld.image = `${SITE_URL}/${post.cover}`;

  const body = `${navbar("blog")}
  <main id="conteudo" class="blog">
    <article class="post">
      <div class="wrap post__wrap">
        <a class="post__back" href="index.html">← Voltar aos conteúdos</a>
        <p class="post__cat">${esc(post.category)}</p>
        <h1 class="post__title">${esc(post.title)}</h1>
        <p class="post__meta"><time datetime="${esc(post.date)}">${esc(fmtDate(post.date))}</time>${post.author ? ` · ${esc(post.author)}` : ""}</p>
      </div>
      <figure class="post__cover">
        <img src="${BASE}${esc(post.cover)}" alt="${esc(post.coverAlt || post.title)}" width="1200" height="675">
      </figure>
      <div class="wrap post__wrap">
        <div class="post__body">
        ${bodyBlocks}
        </div>

        <div class="post__share" aria-label="Compartilhar">
          <span>Compartilhar:</span>
          <button class="post__share-btn" data-share="whatsapp" type="button">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path fill="currentColor" d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.02ZM12.04 20.15a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.24 8.23Z"/></svg>
            WhatsApp
          </button>
          <button class="post__share-btn" data-share="copy" type="button">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/></svg>
            <span class="post__copy-label">Copiar link</span>
          </button>
        </div>

        <aside class="post__cta">
          <h2>Gostou? O melhor é conhecer de perto.</h2>
          <p>Uma visita vale mais do que mil palavras. Venha tomar um café, conhecer os espaços e a equipe — sem compromisso.</p>
          <a class="btn btn--primary btn--lg" href="${BASE}index.html#agendar">Agende uma visita ao Blue</a>
        </aside>
      </div>
    </article>
  </main>
  ${footer()}`;

  const html =
    head({
      title: `${post.title} · ${SITE}`,
      desc: post.excerpt,
      cover: post.cover,
      canonical: url,
      article: true,
    }).replace(
      "</head>",
      `  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>\n</head>`
    ) +
    "\n" +
    body +
    `\n<script>
  (function () {
    document.querySelectorAll('[data-share]').forEach(function (b) {
      b.addEventListener('click', function () {
        var url = location.href, title = document.title;
        if (b.dataset.share === 'whatsapp') {
          window.open('https://wa.me/?text=' + encodeURIComponent(title + ' ' + url), '_blank', 'noopener');
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function () {
            var l = b.querySelector('.post__copy-label'); if (!l) return;
            var t = l.textContent; l.textContent = 'Link copiado!';
            setTimeout(function () { l.textContent = t; }, 1800);
          });
        }
      });
    });
  })();
</script>`;

  fs.writeFileSync(path.join(BLOG_DIR, `${post.slug}.html`), html);
}

/* ----- Run ----- */
function run() {
  if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });
  const sorted = buildListing();
  sorted.forEach((p) => buildPost(p, sorted));
  console.log(`Blog gerado: blog/index.html + ${sorted.length} post(s).`);
}

run();
