/* =====================================================================
   gate-common.js — peças compartilhadas por lock-site.js e unlock-site.js
   ===================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

/* Marca que identifica uma página já trancada. */
const MARKER = "bsl-payload";

/* PBKDF2: alto o bastante para tornar ataque de força bruta caro,
   baixo o bastante para abrir em ~0,5s num celular. */
const ITERATIONS = 600000;

/* Todas as páginas HTML publicadas. */
function discoverPages() {
  const pages = [];
  for (const f of fs.readdirSync(root)) {
    if (f.endsWith(".html")) pages.push(f);
  }
  const blogDir = path.join(root, "blog");
  if (fs.existsSync(blogDir)) {
    for (const f of fs.readdirSync(blogDir)) {
      if (f.endsWith(".html")) pages.push("blog/" + f);
    }
  }
  return pages.sort();
}

const PAGES = discoverPages();

/* O destrancador roda no navegador. Mantido como string para ser
   embutido em cada página trancada. */
const DECRYPTOR = `
(function () {
  "use strict";
  var P = JSON.parse(document.getElementById("bsl-payload").textContent);
  var STORE = "bsl-gate";
  var gate = document.getElementById("g-gate");
  var form = document.getElementById("g-form");
  var input = document.getElementById("g-pw");
  var err = document.getElementById("g-err");
  var btn = document.getElementById("g-btn");

  if (!window.crypto || !crypto.subtle) {
    gate.classList.remove("is-checking");
    err.textContent = "Este navegador nao suporta a abertura segura desta pagina.";
    err.hidden = false;
    return;
  }

  function bytes(b64) {
    var bin = atob(b64), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function attempt(pw) {
    return crypto.subtle
      .importKey("raw", new TextEncoder().encode(pw), { name: "PBKDF2" }, false, ["deriveKey"])
      .then(function (km) {
        return crypto.subtle.deriveKey(
          { name: "PBKDF2", salt: bytes(P.s), iterations: P.it, hash: "SHA-256" },
          km, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
        );
      })
      .then(function (key) {
        return crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes(P.i) }, key, bytes(P.c));
      })
      .then(function (buf) { return new TextDecoder().decode(buf); })
      .catch(function () { return null; });
  }

  /* Scripts trazidos por DOMParser nascem inertes: e preciso recriar cada
     tag para o navegador executar. Rodamos em ordem, aguardando os
     externos, para preservar a semantica de "defer". */
  function runScripts(done) {
    var list = [].slice.call(document.querySelectorAll("script"));
    var i = 0;
    (function next() {
      if (i >= list.length) return done();
      var old = list[i++];
      var fresh = document.createElement("script");
      for (var a = 0; a < old.attributes.length; a++) {
        fresh.setAttribute(old.attributes[a].name, old.attributes[a].value);
      }
      fresh.removeAttribute("defer");
      fresh.removeAttribute("async");
      if (old.src) {
        fresh.onload = fresh.onerror = next;
        old.parentNode.replaceChild(fresh, old);
      } else {
        fresh.textContent = old.textContent;
        old.parentNode.replaceChild(fresh, old);
        next();
      }
    })();
  }

  function reveal(html, pw) {
    try { sessionStorage.setItem(STORE, pw); } catch (e) {}
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    var parsed = new DOMParser().parseFromString(html, "text/html");
    document.replaceChild(document.importNode(parsed.documentElement, true), document.documentElement);
    runScripts(function () {
      document.dispatchEvent(new Event("DOMContentLoaded", { bubbles: true }));
      window.dispatchEvent(new Event("load"));
    });
  }

  function showForm() {
    gate.classList.remove("is-checking");
    if (input) input.focus();
  }

  /* 1) senha no link (#k=...)  2) senha ja usada nesta sessao */
  var fromHash = /^#k=/.test(location.hash) ? decodeURIComponent(location.hash.slice(3)) : null;
  var remembered = null;
  try { remembered = sessionStorage.getItem(STORE); } catch (e) {}
  var auto = fromHash || remembered;

  if (auto) {
    attempt(auto).then(function (html) {
      if (html) return reveal(html, auto);
      try { sessionStorage.removeItem(STORE); } catch (e) {}
      showForm();
    });
  } else {
    showForm();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var pw = input.value.trim();
    if (!pw) return;
    err.hidden = true;
    btn.disabled = true;
    btn.textContent = "Abrindo\\u2026";
    attempt(pw).then(function (html) {
      if (html) return reveal(html, pw);
      btn.disabled = false;
      btn.textContent = "Entrar";
      err.textContent = "Senha incorreta.";
      err.hidden = false;
      input.select();
    });
  });
})();
`;

/* Página-cadeado: discreta de propósito. Não menciona o negócio, a
   cidade nem a data de abertura — só a marca. */
function gateHtml(payload, base) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">
<meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet, noimageindex">
<meta name="theme-color" content="#0E2233">
<title>Blue Senior Living</title>
<link rel="icon" href="${base}assets/img/favicon.svg" type="image/svg+xml">
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    margin: 0; background: #0b1c2a; color: #e9f1f8;
    font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    display: flex; align-items: center; justify-content: center; padding: 24px;
    background-image: radial-gradient(120% 90% at 50% 0%, #143349 0%, #0b1c2a 62%);
  }
  .g-card {
    width: min(400px, 100%); text-align: center;
    animation: g-in .6s cubic-bezier(.22,1,.36,1) both;
  }
  @keyframes g-in { from { opacity: 0; transform: translateY(10px); } }
  .g-mark { width: 38px; height: 48px; margin: 0 auto 22px; display: block; opacity: .92;
    filter: brightness(0) saturate(100%) invert(78%) sepia(23%) saturate(624%) hue-rotate(164deg) brightness(97%) contrast(93%); }
  .g-title { font-family: Fraunces, Georgia, "Times New Roman", serif; font-weight: 450;
    font-size: 25px; letter-spacing: .01em; margin: 0 0 10px; }
  .g-sub { font-size: 14.5px; line-height: 1.6; color: rgba(233,241,248,.62); margin: 0 0 26px; }
  .g-body { transition: opacity .3s ease; }
  .is-checking .g-body { opacity: 0; pointer-events: none; }
  .g-field { display: flex; flex-direction: column; gap: 10px; }
  .g-input {
    width: 100%; padding: 14px 16px; font: inherit; font-size: 15px; text-align: center;
    letter-spacing: .06em; color: #e9f1f8; background: rgba(255,255,255,.06);
    border: 1px solid rgba(233,241,248,.18); border-radius: 12px; outline: none;
    transition: border-color .2s ease, background .2s ease;
  }
  .g-input::placeholder { color: rgba(233,241,248,.32); letter-spacing: normal; }
  .g-input:focus { border-color: #6cc4e8; background: rgba(255,255,255,.09); }
  .g-btn {
    width: 100%; padding: 14px 18px; font: inherit; font-size: 15px; font-weight: 600;
    color: #08151f; background: #6cc4e8; border: 0; border-radius: 12px; cursor: pointer;
    transition: filter .2s ease, transform .12s ease;
  }
  .g-btn:hover:not(:disabled) { filter: brightness(1.07); }
  .g-btn:active:not(:disabled) { transform: translateY(1px); }
  .g-btn:disabled { opacity: .6; cursor: default; }
  .g-err { margin: 14px 0 0; font-size: 13.5px; color: #ff9d9d; }
  .g-foot { margin: 26px 0 0; font-size: 12px; color: rgba(233,241,248,.34); line-height: 1.5; }
</style>
</head>
<body>
<main class="g-card is-checking" id="g-gate">
  <img class="g-mark" src="${base}assets/logo/emblem.svg" alt="" width="38" height="48">
  <div class="g-body">
    <h1 class="g-title">Acesso restrito</h1>
    <p class="g-sub">Este material é confidencial e ainda não foi divulgado. Informe a senha para continuar.</p>
    <form class="g-field" id="g-form" autocomplete="off">
      <input class="g-input" id="g-pw" type="password" placeholder="Senha" aria-label="Senha de acesso"
             autocomplete="current-password" spellcheck="false" autocapitalize="off">
      <button class="g-btn" id="g-btn" type="submit">Entrar</button>
    </form>
    <p class="g-err" id="g-err" role="alert" hidden></p>
    <p class="g-foot">Se você recebeu um link de acesso, ele abre esta página automaticamente.</p>
  </div>
  <noscript><p class="g-sub">É necessário ativar o JavaScript para abrir esta página.</p></noscript>
</main>
<script id="bsl-payload" type="application/json">${JSON.stringify(payload)}</script>
<script>${DECRYPTOR}</script>
</body>
</html>
`;
}

module.exports = { PAGES, ITERATIONS, MARKER, root, gateHtml };
