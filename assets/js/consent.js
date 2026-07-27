/* =====================================================================
   Blue Senior Living — Analytics (GA4) + GTM + consentimento (LGPD)
   --------------------------------------------------------------------
   IDs configurados abaixo. Para trocar no futuro, é só editar aqui.

   Como funciona:
   - Consent Mode v2: tudo negado por padrão. Antes do aceite, o GA4 roda
     em modo "sem cookies" (só medição anônima). Nenhum cookie de
     analytics/marketing é gravado antes de o visitante clicar em Aceitar.
   - Banner LGPD: "Aceitar" libera analytics + ads; "Só essenciais"
     mantém tudo negado. A escolha vale por 180 dias.
   - GA4 é carregado DIRETO aqui (não precisa configurar nada no GTM).
     Os eventos de conversão vão direto ao GA4:
       page_view (automático) · whatsapp_click · phone_click ·
       app_click · solicitacao_visita (agendamento concluído).
   - O GTM também é carregado, vazio, pronto para o futuro (ex.: Meta
     Pixel). IMPORTANTE: NÃO adicione uma tag de configuração do GA4
     dentro do GTM — o GA4 já está aqui; duas cópias contariam em dobro.
   ===================================================================== */
(function () {
  "use strict";

  /* ========== IDs (editar aqui se mudar) ========== */
  var GTM_ID = "GTM-K5FVSS2P";     /* Google Tag Manager */
  var GA4_ID = "G-FSEL20RGB1";     /* Google Analytics 4  */
  /* ================================================ */

  var KEY = "blue-consent-v1";
  var MAX_AGE_DAYS = 180;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  /* Envia um evento tanto para o GA4 (direto) quanto para o GTM (futuro). */
  function track(name, params) {
    window.dataLayer.push({ event: name });          // GTM (uso futuro)
    if (GA4_ID) gtag("event", name, params || {});   // GA4 (direto)
  }
  window.blueTrack = track;

  /* ---- Eventos de lead: cliques de contato ---- */
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.href || "";
    if (href.indexOf("wa.me") !== -1) track("whatsapp_click");
    else if (href.indexOf("tel:") === 0) track("phone_click");
    else if (href.indexOf("app.blueseniorliving") !== -1) track("app_click");
  }, true);

  if (!GTM_ID && !GA4_ID) return; // nada configurado: sem cookies, sem banner

  /* ---- Consent Mode v2: negado por padrão, ANTES de qualquer tag ---- */
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500,
  });

  /* ---- GA4 direto (gtag.js) — respeita o Consent Mode ---- */
  if (GA4_ID) {
    var g = document.createElement("script");
    g.async = true;
    g.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA4_ID);
    document.head.appendChild(g);
    gtag("js", new Date());
    gtag("config", GA4_ID);
  }

  /* ---- GTM (vazio, para o futuro) ---- */
  if (GTM_ID) {
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(GTM_ID);
    document.head.appendChild(s);
  }

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
