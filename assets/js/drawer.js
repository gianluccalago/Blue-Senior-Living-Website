/* =====================================================================
   Blue Senior Living — drawer mobile (compartilhado: home + blog)
   --------------------------------------------------------------------
   Comportamentos:
   - Abre/fecha com animação; ESC, backdrop e botão fecham.
   - Botão VOLTAR do celular fecha o menu em vez de sair da página
     (history.pushState ao abrir; popstate fecha; fechamentos via UI
     consomem o estado com history.back()).
   - Links do menu adiam a navegação até o estado ser consumido, para
     não sujar o histórico (âncoras usam location.replace).
   - Foco preso no painel (fallback de Tab) + fundo inerte via [inert].
   - Trava de scroll robusta também no iOS (position:fixed no body).
   ===================================================================== */
(function () {
  "use strict";

  var drawerEl = document.querySelector("[data-drawer]");
  var toggle = document.querySelector("[data-menu-toggle]");
  if (!drawerEl || !toggle) return;

  var panel = drawerEl.querySelector(".drawer__panel") || drawerEl;
  var lastFocus = null;
  var scrollY = 0;
  var hideTimer = null;
  var pendingNav = null; // navegação adiada até o histórico do menu ser consumido

  function isOpen() { return !drawerEl.hidden; }

  /* Fundo inerte enquanto o menu está aberto (leitores de tela + Tab). */
  function setBackgroundInert(on) {
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el === drawerEl || /^(SCRIPT|STYLE|LINK|TEMPLATE)$/.test(el.tagName)) return;
      if (on) el.setAttribute("inert", "");
      else el.removeAttribute("inert");
    });
  }

  /* Trava de scroll: iOS ignora overflow:hidden no body, então fixamos o body
     na posição atual e restauramos ao fechar. */
  function lockScroll() {
    scrollY = window.scrollY || window.pageYOffset || 0;
    var s = document.body.style;
    s.position = "fixed"; s.top = -scrollY + "px";
    s.left = "0"; s.right = "0"; s.width = "100%";
    s.overflow = "hidden";
  }
  function unlockScroll() {
    var s = document.body.style;
    s.position = ""; s.top = ""; s.left = ""; s.right = ""; s.width = ""; s.overflow = "";
    window.scrollTo(0, scrollY);
  }

  function focusables() {
    return Array.prototype.filter.call(
      panel.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      function (el) { return el.getClientRects().length > 0; }
    );
  }

  function open() {
    if (isOpen()) return;
    lastFocus = document.activeElement;
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    drawerEl.hidden = false;
    requestAnimationFrame(function () { drawerEl.classList.add("is-open"); });
    toggle.setAttribute("aria-expanded", "true");
    lockScroll();
    setBackgroundInert(true);
    // O voltar do celular passa a fechar o menu em vez de sair da página.
    try { history.pushState({ blueDrawer: true }, ""); } catch (e) { /* file:// etc. */ }
    var first = drawerEl.querySelector(".drawer__close");
    if (first) first.focus();
  }

  /* fromPop = fechamento disparado pelo próprio botão voltar (estado já consumido). */
  function close(fromPop) {
    if (!isOpen()) return;
    drawerEl.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    setBackgroundInert(false);
    unlockScroll();
    hideTimer = setTimeout(function () { drawerEl.hidden = true; hideTimer = null; }, 320);
    if (lastFocus && !pendingNav && document.contains(lastFocus)) lastFocus.focus();
    if (!fromPop && history.state && history.state.blueDrawer) {
      history.back(); // consome o estado; o popstate executa a navegação pendente
    } else {
      runPendingNav();
    }
  }

  function runPendingNav() {
    if (!pendingNav) return;
    var dest = pendingNav;
    pendingNav = null;
    if (dest.charAt(0) === "#") {
      // Âncora na mesma página, sem criar entrada extra no histórico.
      location.replace(dest);
      // O replace nem sempre realiza o scroll do fragmento — garante aqui
      // (scrollIntoView respeita o scroll-padding-top da navbar fixa).
      var target = document.getElementById(dest.slice(1));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      location.href = dest;
    }
  }

  window.addEventListener("popstate", function () {
    if (isOpen()) close(true);
    else runPendingNav();
  });

  toggle.addEventListener("click", open);
  Array.prototype.forEach.call(drawerEl.querySelectorAll("[data-drawer-close]"), function (el) {
    el.addEventListener("click", function () { close(false); });
  });
  Array.prototype.forEach.call(drawerEl.querySelectorAll("[data-drawer-link]"), function (el) {
    el.addEventListener("click", function (e) {
      var href = el.getAttribute("href") || "";
      if (el.target === "_blank" || !href) { close(false); return; } // nova aba: segue normal
      e.preventDefault();
      pendingNav = href;
      close(false);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (!isOpen()) return;
    if (e.key === "Escape") { e.preventDefault(); close(false); return; }
    if (e.key !== "Tab") return;
    // Cinto de segurança para navegadores sem [inert]: Tab circula no painel.
    var f = focusables();
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
      e.preventDefault(); first.focus();
    }
  });
})();
