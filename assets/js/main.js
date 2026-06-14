/* =====================================================================
   Blue Senior Living — interactions
   --------------------------------------------------------------------
   EDIT HERE: troque os placeholders abaixo pelos dados reais.
   ===================================================================== */
const CONFIG = {
  // Link do aplicativo / área do cliente (abre em nova aba).
  APP_URL: "https://app.blueseniorliving.com.br",          // <-- PLACEHOLDER (editar)

  // WhatsApp em formato internacional, só dígitos (DDI 55 + DDD + número).
  WHATSAPP: "5541999999999",                               // <-- PLACEHOLDER (editar)
  WHATSAPP_MSG: "Olá! Gostaria de agendar uma visita ao Blue Senior Living.",

  // Telefone para ligação.
  PHONE_DISPLAY: "(41) 0000-0000",                         // <-- PLACEHOLDER (editar)
  PHONE_TEL: "+554100000000",                              // <-- PLACEHOLDER (editar)

  // E-mail de contato (recebe o formulário de visita).
  EMAIL: "contato@blueseniorliving.com.br",                // <-- PLACEHOLDER (editar)
};

(function () {
  "use strict";

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const waLink = (msg) =>
    `https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(msg || CONFIG.WHATSAPP_MSG)}`;

  /* ---------- 1. Apply config to placeholders ---------- */
  function applyConfig() {
    $$("[data-app-link]").forEach((a) => {
      a.href = CONFIG.APP_URL;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    });
    $$("[data-whatsapp]").forEach((a) => { a.href = waLink(); });
    $$("[data-phone]").forEach((a) => { a.href = `tel:${CONFIG.PHONE_TEL}`; });
    $$("[data-email]").forEach((a) => { a.href = `mailto:${CONFIG.EMAIL}`; });
    $$("[data-phone-display]").forEach((el) => { el.textContent = CONFIG.PHONE_DISPLAY; });
    $$("[data-email-display]").forEach((el) => { el.textContent = CONFIG.EMAIL; });
    const yr = $("[data-year]");
    if (yr) yr.textContent = new Date().getFullYear();
  }

  /* ---------- 2. Scroll-aware navbar ---------- */
  function navOnScroll() {
    const nav = $("[data-nav]");
    const hero = $("#hero");
    if (!nav) return;
    const threshold = () => (hero ? hero.offsetHeight - 90 : 120);
    let ticking = false;
    const update = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > threshold());
      ticking = false;
    };
    update();
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ---------- 3. Mobile drawer ---------- */
  function drawer() {
    const drawerEl = $("[data-drawer]");
    const toggle = $("[data-menu-toggle]");
    if (!drawerEl || !toggle) return;
    let lastFocus = null;

    const open = () => {
      lastFocus = document.activeElement;
      drawerEl.hidden = false;
      requestAnimationFrame(() => drawerEl.classList.add("is-open"));
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      const first = $(".drawer__close", drawerEl);
      if (first) first.focus();
    };
    const close = () => {
      drawerEl.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      setTimeout(() => { drawerEl.hidden = true; }, 320);
      if (lastFocus) lastFocus.focus();
    };

    toggle.addEventListener("click", open);
    $$("[data-drawer-close]", drawerEl).forEach((el) => el.addEventListener("click", close));
    $$("[data-drawer-link]", drawerEl).forEach((el) => el.addEventListener("click", close));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !drawerEl.hidden) close();
    });
  }

  /* ---------- 4. Hero video + reduced motion ---------- */
  function heroVideo() {
    const video = $("[data-hero-video]");
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (reduce.matches) {
        video.removeAttribute("autoplay");
        video.pause();
      } else {
        const p = video.play();
        if (p && typeof p.catch === "function") p.catch(() => {/* autoplay blocked: poster stays */});
      }
    };
    apply();
    if (reduce.addEventListener) reduce.addEventListener("change", apply);
  }

  /* ---------- 5. Visit form ---------- */
  function visitForm() {
    const form = $("[data-form]");
    if (!form) return;
    const note = $("[data-form-note]", form);

    const setNote = (msg, isError) => {
      if (!note) return;
      note.textContent = msg;
      note.hidden = false;
      note.classList.toggle("is-error", !!isError);
    };

    // Compose WhatsApp message from filled fields (form's WhatsApp button)
    const waBtn = $("[data-whatsapp]", form);
    if (waBtn) {
      waBtn.addEventListener("click", () => {
        const nome = form.nome.value.trim();
        const tel = form.telefone.value.trim();
        const msg = form.mensagem.value.trim();
        let text = CONFIG.WHATSAPP_MSG;
        if (nome || tel || msg) {
          text = `Olá! Gostaria de agendar uma visita ao Blue Senior Living.`
               + (nome ? `\nNome: ${nome}` : "")
               + (tel ? `\nTelefone: ${tel}` : "")
               + (msg ? `\nMensagem: ${msg}` : "");
        }
        waBtn.href = waLink(text);
      });
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = form.nome;
      const tel = form.telefone;
      const email = form.email;
      const msg = form.mensagem;
      let ok = true;

      [nome, tel].forEach((f) => {
        const wrap = f.closest(".field");
        const valid = f.value.trim().length > 1;
        if (wrap) wrap.classList.toggle("field--invalid", !valid);
        if (!valid) ok = false;
      });

      if (!ok) {
        setNote("Por favor, preencha pelo menos o nome e o telefone para retornarmos o contato.", true);
        return;
      }

      const subject = `Agendamento de visita — ${nome.value.trim()}`;
      const body =
        `Nome: ${nome.value.trim()}\n` +
        `Telefone: ${tel.value.trim()}\n` +
        `E-mail: ${email.value.trim() || "—"}\n\n` +
        `Mensagem:\n${msg.value.trim() || "—"}\n`;
      const mailto = `mailto:${CONFIG.EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      setNote("Obrigado! Estamos abrindo seu aplicativo de e-mail para concluir o envio. Se preferir, fale com a gente pelo WhatsApp logo abaixo. 💙", false);
      window.setTimeout(() => { window.location.href = mailto; }, 350);
    });

    // Clear invalid state as the user types
    $$("input, textarea", form).forEach((f) => {
      f.addEventListener("input", () => {
        const wrap = f.closest(".field");
        if (wrap) wrap.classList.remove("field--invalid");
      });
    });
  }

  /* ---------- init ---------- */
  function init() {
    applyConfig();
    navOnScroll();
    drawer();
    heroVideo();
    visitForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
