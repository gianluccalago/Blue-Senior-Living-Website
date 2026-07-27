/* =====================================================================
   Blue Senior Living — GTM + consentimento de cookies (LGPD)
   --------------------------------------------------------------------
   EDIT AQUI: cole o ID do seu contêiner do Google Tag Manager abaixo
   (crie em https://tagmanager.google.com → o ID tem o formato GTM-XXXXXXX).
   Enquanto estiver vazio, NADA acontece: sem banner, sem cookies, sem GTM.

   Como funciona quando ativo:
   - Google Consent Mode v2: o GTM carrega com TUDO negado por padrão;
     nenhum cookie de marketing/analytics é gravado antes do aceite.
   - Banner LGPD discreto: "Aceitar" libera analytics + ads; "Só
     essenciais" mantém tudo negado. A escolha vale por 180 dias.
   - Eventos de lead são empurrados ao dataLayer (sempre, mesmo sem GTM
     — são inofensivos e ficam prontos): whatsapp_click, phone_click,
     app_click e solicitacao_visita (enviado pelo agendamento).
   ===================================================================== */
(function () {
  "use strict";

  /* ========== EDIT AQUI ========== */
  var GTM_ID = "GTM-K5FVSS2P";     /* contêiner do Blue Senior Living */
  /* =============================== */

  var KEY = "blue-consent-v1";
  var MAX_AGE_DAYS = 180;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  /* ---- Eventos de lead: sempre registrados no dataLayer ---- */
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.href || "";
    if (href.indexOf("wa.me") !== -1) window.dataLayer.push({ event: "whatsapp_click" });
    else if (href.indexOf("tel:") === 0) window.dataLayer.push({ event: "phone_click" });
    else if (href.indexOf("app.blueseniorliving") !== -1) window.dataLayer.push({ event: "app_click" });
  }, true);

  if (!GTM_ID) return; // sem contêiner configurado: sem cookies e sem banner

  /* ---- Consent Mode v2: negado por padrão, antes do GTM ---- */
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500,
  });

  /* ---- GTM (carrega em modo negado; cookies só após o aceite) ---- */
  window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(GTM_ID);
  document.head.appendChild(s);

  function grantAll() {
    gtag("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
    });
    window.dataLayer.push({ event: "consent_aceito" });
  }
  function save(marketing) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ m: !!marketing, t: Date.now() }));
    } catch (e) {}
  }
  function load() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!v || (Date.now() - v.t) > MAX_AGE_DAYS * 864e5) return null;
      return v;
    } catch (e) { return null; }
  }

  var saved = load();
  if (saved) {
    if (saved.m) grantAll();
    return;
  }

  /* ---- Banner LGPD ---- */
  function showBanner() {
    var base = location.pathname.indexOf("/blog/") !== -1 ? "../" : "";
    var el = document.createElement("div");
    el.className = "consent";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Preferências de cookies");
    el.innerHTML =
      '<p class="consent__text">Usamos cookies para entender como o site é usado e melhorar sua experiência. ' +
      'Você decide: <a href="' + base + 'privacidade.html">saiba como cuidamos dos seus dados</a>.</p>' +
      '<div class="consent__actions">' +
      '<button type="button" class="btn btn--primary consent__accept">Aceitar cookies</button>' +
      '<button type="button" class="btn consent__essentials">Só os essenciais</button>' +
      "</div>";
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("is-in"); });
    function closeWith(marketing) {
      save(marketing);
      if (marketing) grantAll();
      el.classList.remove("is-in");
      setTimeout(function () { el.remove(); }, 350);
    }
    el.querySelector(".consent__accept").addEventListener("click", function () { closeWith(true); });
    el.querySelector(".consent__essentials").addEventListener("click", function () { closeWith(false); });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showBanner);
  } else {
    showBanner();
  }
})();
