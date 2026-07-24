/* =====================================================================
   Blue Senior Living — interactions
   --------------------------------------------------------------------
   EDIT HERE: troque os placeholders abaixo pelos dados reais.
   ===================================================================== */
const CONFIG = {
  // Link do aplicativo / área do cliente (abre em nova aba).
  APP_URL: "https://app.blueseniorliving.com.br",

  // WhatsApp em formato internacional, só dígitos (DDI 55 + DDD + número).
  WHATSAPP: "5541999999999",                               // <-- PLACEHOLDER (editar)
  WHATSAPP_MSG: "Olá! Gostaria de conhecer o Blue Senior Living e agendar uma visita.",

  // Telefone para ligação.
  PHONE_DISPLAY: "(41) 0000-0000",                         // <-- PLACEHOLDER (editar)
  PHONE_TEL: "+554100000000",                              // <-- PLACEHOLDER (editar)

  // E-mail de contato (recebe o formulário de visita).
  EMAIL: "contato@blueseniorliving.com.br",                // <-- PLACEHOLDER (editar)

  /* ---- TRABALHE CONOSCO (RH) — canal separado do comercial ----
     Troque pelos dados reais do RH quando existirem. */
  VAGAS_EMAIL: "vagas@blueseniorliving.com.br",            // <-- PLACEHOLDER RH (editar)
  // WhatsApp do RH, só dígitos com DDI (55 + DDD + número). Ideal: número DIFERENTE do comercial.
  // Se ficar vazio (""), o botão usa o WhatsApp comercial como fallback (com a mensagem de
  // currículo) — assim o canal nunca some. Muitos cuidadores/téc. de enfermagem só usam WhatsApp.
  VAGAS_WHATSAPP: "",                                      // <-- PLACEHOLDER RH (defina quando tiver)
  VAGAS_WHATSAPP_MSG: "Olá! Sou da área da saúde e gostaria de enviar meu currículo para o Blue Senior Living.",
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

    // Trabalhe conosco (RH)
    $$("[data-vagas-email]").forEach((a) => {
      a.href = `mailto:${CONFIG.VAGAS_EMAIL}?subject=${encodeURIComponent("Currículo — Trabalhe no Blue Senior Living")}`;
    });
    // RH dedicado se existir; senão usa o WhatsApp comercial (com a mensagem de currículo).
    const vagasWa = (CONFIG.VAGAS_WHATSAPP || CONFIG.WHATSAPP || "").replace(/\D/g, "");
    $$("[data-vagas-whatsapp]").forEach((a) => {
      if (vagasWa) {
        a.href = `https://wa.me/${vagasWa}?text=${encodeURIComponent(CONFIG.VAGAS_WHATSAPP_MSG)}`;
        a.hidden = false;
      } else {
        a.hidden = true; // nenhum número configurado: não publica link quebrado
      }
    });
    const yr = $("[data-year]");
    if (yr) yr.textContent = new Date().getFullYear();
  }

  /* ---------- 2. Scroll-aware navbar ----------
     A barra é transparente SÓ no topo absoluto. Qualquer rolagem já traz o
     fundo opaco: antes o gatilho era o fim do hero (~1 tela inteira), e o
     texto do hero deslizava por baixo da barra transparente, sobrepondo o
     logo e os botões. */
  function navOnScroll() {
    const nav = $("[data-nav]");
    if (!nav) return;
    const threshold = () => 8;
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

  /* ---------- 3. Mobile drawer ----------
     Movido para assets/js/drawer.js (compartilhado com o blog): fecha no
     botão voltar do celular, prende o foco no painel e trava o scroll
     também no iOS. */

  /* ---------- 4. Hero video — robust mobile autoplay + reduced motion ---------- */
  function heroVideo() {
    const video = $("[data-hero-video]");
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Mobile autoplay policies (iOS Safari, in-app browsers) require muted/inline
    // to be set as PROPERTIES, not just attributes.
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    // O vídeo só fica visível quando REALMENTE está tocando. Enquanto não toca
    // (autoplay bloqueado / Low Power), ele fica opacity:0 — junto com o botão de
    // play nativo, que vive dentro do elemento — e o pôster (fundo do container) aparece.
    // Só considera "tocando" quando o currentTime AVANÇA (playback real) — sinal
    // definitivo e seguro: vídeo bloqueado fica em currentTime 0, então nunca aparece.
    const markPlaying = () => {
      if (video.classList.contains("is-playing")) return;
      if (!video.paused && !video.ended && video.readyState >= 2 && video.currentTime > 0) {
        video.classList.add("is-playing");
        video.removeEventListener("timeupdate", markPlaying);
        if (poll) { clearInterval(poll); poll = null; }
      }
    };
    // "playing" pode ter passado antes do JS; "timeupdate" e o poll pegam o vídeo já em andamento.
    video.addEventListener("playing", markPlaying);
    video.addEventListener("timeupdate", markPlaying);
    let poll = setInterval(markPlaying, 250);
    setTimeout(() => { if (poll) { clearInterval(poll); poll = null; } }, 6000);

    const play = () => {
      if (reduce.matches) return;
      const p = video.play();
      if (p && typeof p.then === "function") p.then(markPlaying).catch(() => {/* retry on gesture */});
      else markPlaying();
    };
    const stop = () => video.pause();

    if (reduce.matches) {
      video.removeAttribute("autoplay");
      stop();
    } else {
      play();
      // Retry as the media becomes ready / the tab returns to view.
      ["loadeddata", "canplay", "canplaythrough"].forEach((ev) => video.addEventListener(ev, play));
      document.addEventListener("visibilitychange", () => { if (!document.hidden) play(); });
      // Last resort: the first user interaction unlocks muted playback.
      const onGesture = () => play();
      ["touchstart", "pointerdown", "click", "scroll"].forEach((ev) =>
        window.addEventListener(ev, onGesture, { once: true, passive: true })
      );
    }

    if (reduce.addEventListener) {
      reduce.addEventListener("change", () => { reduce.matches ? stop() : play(); });
    }
  }

  /* ---------- 4b. Scroll reveals — sutis, e só quando o navegador permite ----------
     Sem JS ou com "reduzir movimento" ativo, o conteúdo fica sempre visível. */
  function reveals() {
    const els = $$("[data-reveal]");
    if (!els.length) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches || !("IntersectionObserver" in window)) return;
    document.documentElement.classList.add("has-reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -5% 0px", threshold: 0.04 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- 4c. FAB do WhatsApp — entra suave após um pequeno scroll ----------
     Sem JS o botão fica sempre visível (o CSS só o esconde sob html.has-fab). */
  function fab() {
    const el = $(".fab");
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    document.documentElement.classList.add("has-fab");
    const show = () => el.classList.add("is-in");
    if (reduce.matches) { show(); return; }
    if (window.scrollY > 200) { show(); return; }
    const onScroll = () => {
      if (window.scrollY > 200) { show(); window.removeEventListener("scroll", onScroll); }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- 4d. Imagens — fade-in ao carregar (evita "pop") ----------
     Gate via html.has-imgfade: sem JS ou com reduced-motion, nada fica oculto. */
  function mediaFade() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    const imgs = $$("img");
    if (!imgs.length) return;
    document.documentElement.classList.add("has-imgfade");
    imgs.forEach((img) => {
      const done = () => img.classList.add("is-loaded");
      if (img.complete && img.naturalWidth > 0) { done(); return; }
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    });
  }

  /* ---------- 4e. Lightbox das acomodações — galeria ----------
     Clique amplia num overlay acessível com navegação entre as fotos
     (setas, teclado e swipe) e legenda por foto. ESC, clique fora e o
     botão VOLTAR do celular fecham (mesmo padrão de histórico do drawer).
     O fechamento NÃO pode mexer no scroll: pushState acontece ANTES do
     trava-scroll (senão o histórico grava posição 0), a restauração de
     rolagem do navegador fica em modo manual e o foco volta sem scroll. */
  function lightbox() {
    const triggers = $$("[data-lightbox]");
    if (!triggers.length) return;
    try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) {}

    const NOTE = "Imagem ilustrativa — perspectiva artística do projeto";
    const items = triggers.map((t) => {
      const img = $("img", t);
      const parts = (img.getAttribute("srcset") || "").split(",").map((p) => p.trim()).filter(Boolean);
      return {
        src: parts.length ? parts[parts.length - 1].split(/\s+/)[0] : (img.currentSrc || img.src),
        alt: img.alt || "",
        title: (t.closest(".space")?.querySelector(".space__cap h3")?.textContent || "").trim(),
      };
    });

    let overlay = null, big = null, cap = null, lastFocus = null, scrollY = 0, idx = 0;
    const isOpen = () => !!overlay;

    const lock = () => {
      scrollY = window.scrollY || 0;
      const s = document.body.style;
      s.position = "fixed"; s.top = -scrollY + "px"; s.left = "0"; s.right = "0"; s.width = "100%";
    };
    // Restaura a posição SEM animação: o html tem scroll-behavior smooth, e um
    // scrollTo animado aqui faria a página "rolar do topo de volta" ao fechar.
    const instantScroll = (y) => {
      const de = document.documentElement;
      const prev = de.style.scrollBehavior;
      de.style.scrollBehavior = "auto";
      window.scrollTo(0, y);
      de.style.scrollBehavior = prev;
    };
    const unlock = () => {
      const s = document.body.style;
      s.position = ""; s.top = ""; s.left = ""; s.right = ""; s.width = "";
      instantScroll(scrollY);
    };

    const mkBtn = (cls, label, path) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = cls;
      b.setAttribute("aria-label", label);
      b.innerHTML = `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`;
      return b;
    };

    function show(i) {
      idx = (i + items.length) % items.length;
      const it = items[idx];
      big.style.opacity = "0.25";
      big.src = it.src; big.alt = it.alt;
      cap.textContent = `${it.title} (${idx + 1}/${items.length}) · ${NOTE}`;
      overlay.setAttribute("aria-label", `Imagem ampliada — ${it.title}`);
      // pré-carrega as vizinhas para a troca ser instantânea
      [idx + 1, idx - 1].forEach((j) => { const p = new Image(); p.src = items[(j + items.length) % items.length].src; });
    }

    function open(startIdx) {
      if (isOpen()) return;
      lastFocus = document.activeElement;
      // ANTES do lock: o histórico grava a posição de rolagem real
      try { history.pushState({ blueLightbox: true }, ""); } catch (e) { /* file:// */ }

      overlay = document.createElement("div");
      overlay.className = "lightbox";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");

      const closeBtn = mkBtn("lightbox__close", "Fechar imagem ampliada", "M6 6l12 12M18 6L6 18");
      const prevBtn = mkBtn("lightbox__nav lightbox__nav--prev", "Foto anterior", "M15 6l-6 6 6 6");
      const nextBtn = mkBtn("lightbox__nav lightbox__nav--next", "Próxima foto", "M9 6l6 6-6 6");

      const fig = document.createElement("figure");
      fig.className = "lightbox__fig";
      big = document.createElement("img");
      // O gate de fade (.has-imgfade img { opacity: 0 }) só marca is-loaded nas
      // imagens presentes no init — sem isto, a imagem do lightbox fica invisível.
      big.classList.add("is-loaded");
      big.addEventListener("load", () => { big.style.opacity = "1"; });
      cap = document.createElement("figcaption");
      cap.className = "lightbox__cap";
      fig.appendChild(big); fig.appendChild(cap);
      overlay.appendChild(closeBtn); overlay.appendChild(prevBtn); overlay.appendChild(nextBtn); overlay.appendChild(fig);
      document.body.appendChild(overlay);

      lock();
      show(startIdx);

      closeBtn.addEventListener("click", () => close(false));
      prevBtn.addEventListener("click", () => show(idx - 1));
      nextBtn.addEventListener("click", () => show(idx + 1));
      // fecha só no clique do fundo (não nos botões/figura)
      overlay.addEventListener("click", (e) => { if (e.target === overlay) close(false); });
      // swipe lateral (celular)
      let tx = 0, ty = 0;
      overlay.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
      overlay.addEventListener("touchend", (e) => {
        const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) { dx > 0 ? show(idx - 1) : show(idx + 1); }
      }, { passive: true });
      closeBtn.focus();
    }

    function close(fromPop) {
      if (!isOpen()) return;
      overlay.remove(); overlay = null; big = null; cap = null;
      unlock();
      const y = scrollY;
      // reafirma a posição após o popstate — nenhuma restauração do navegador
      // pode ganhar dessa (scrollRestoration=manual + este rAF)
      requestAnimationFrame(() => instantScroll(y));
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
      if (!fromPop && history.state && history.state.blueLightbox) history.back();
    }

    document.addEventListener("keydown", (e) => {
      if (!isOpen()) return;
      if (e.key === "Escape") { e.preventDefault(); close(false); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); show(idx + 1); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); show(idx - 1); return; }
      if (e.key === "Tab") {
        const f = $$("button", overlay);
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener("popstate", () => { if (isOpen()) close(true); });

    triggers.forEach((t, i) => t.addEventListener("click", () => open(i)));
  }

  /* ---------- 5. Visit scheduler (calendar backed by the app's Supabase) ----------
     Lê os horários disponíveis em "visita_disponibilidade" e grava solicitações
     de visita (status pendente) em "visita_agendamento" — fonte única: o app. */
  function scheduler() {
    const root = $("[data-booker]");
    if (!root) return;

    const calWrap = $("[data-cal]", root);
    const grid = $("[data-cal-grid]", root);
    const monthLabel = $("[data-cal-month]", root);
    const prevBtn = $("[data-cal-prev]", root);
    const nextBtn = $("[data-cal-next]", root);
    const slotsWrap = $("[data-slots]", root);
    const slotsGrid = $("[data-slots-grid]", root);
    const slotsLabel = $("[data-slots-label]", root);
    const bookForm = $("[data-booker-form]", root);
    const nameInput = $("[data-b-name]", root);
    const waInput = $("[data-b-wa]", root);
    const emailInput = $("[data-b-email]", root);
    const confirmBtn = $("[data-b-confirm]", root);
    const note = $("[data-booker-note]", root);
    const statusEl = $("[data-booker-status]", root);

    // Dedicated supabase-js client for the agenda (separate from any other client).
    const env = window.AGENDA_SUPABASE || {};
    let db = null;
    try {
      if (window.supabase && env.url && env.anonKey) {
        db = window.supabase.createClient(env.url, env.anonKey, { auth: { persistSession: false } });
      }
    } catch (e) { db = null; }

    const MONTHS = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
    const WEEK = ["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];
    const pad = (n) => String(n).padStart(2, "0");
    const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
    const today = startOfDay(new Date());
    const todayStr = ymd(today);

    const availByDate = new Map(); // "YYYY-MM-DD" -> ["09:00", ...]
    const requested = new Set();   // "YYYY-MM-DD HH:MM" já solicitados nesta sessão
    let view = new Date(today.getFullYear(), today.getMonth(), 1);
    let selDate = null, selTime = null;

    const fmtLong = (s) => { const [y, m, dd] = s.split("-").map(Number); const d = new Date(y, m - 1, dd); return `${WEEK[d.getDay()]}, ${dd} de ${MONTHS[m - 1]}`; };
    const monthKey = (d) => d.getFullYear() * 12 + d.getMonth();
    function availMonthRange() {
      const keys = [...availByDate.keys()].sort();
      if (!keys.length) return null;
      const f = keys[0].split("-").map(Number), l = keys[keys.length - 1].split("-").map(Number);
      return { min: f[0] * 12 + (f[1] - 1), max: l[0] * 12 + (l[1] - 1) };
    }
    function setStatus(html, kind) {
      if (!statusEl) return;
      if (!html) { statusEl.hidden = true; statusEl.innerHTML = ""; return; }
      statusEl.hidden = false;
      statusEl.className = "booker__status" + (kind ? " booker__status--" + kind : "");
      statusEl.innerHTML = html;
      const r = $("[data-retry]", statusEl);
      if (r) r.addEventListener("click", loadAvailability, { once: true });
    }
    function setNote(html, kind) {
      note.innerHTML = html;
      note.hidden = false;
      note.className = "booker__note" + (kind ? " booker__note--" + kind : "");
    }

    function renderCal() {
      monthLabel.textContent = `${MONTHS[view.getMonth()]} ${view.getFullYear()}`;
      grid.innerHTML = "";
      const startPad = new Date(view.getFullYear(), view.getMonth(), 1).getDay();
      const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
      for (let i = 0; i < startPad; i++) {
        const e = document.createElement("span"); e.className = "cal__cell cal__cell--empty"; grid.appendChild(e);
      }
      for (let day = 1; day <= daysInMonth; day++) {
        const s = `${view.getFullYear()}-${pad(view.getMonth() + 1)}-${pad(day)}`;
        const btn = document.createElement("button");
        btn.type = "button"; btn.className = "cal__cell"; btn.textContent = String(day);
        // Bloqueia hoje (e o passado): não faz sentido agendar uma visita para o mesmo dia.
        if (availByDate.has(s) && s > todayStr) {
          btn.classList.add("is-open");
          if (s === selDate) btn.classList.add("is-selected");
          btn.setAttribute("aria-label", fmtLong(s));
          btn.addEventListener("click", () => { selDate = s; selTime = null; if (note) note.hidden = true; renderCal(); renderSlots(); });
        } else {
          btn.disabled = true; btn.classList.add("is-off");
        }
        grid.appendChild(btn);
      }
      const range = availMonthRange(), vk = monthKey(view);
      prevBtn.disabled = !range || vk <= range.min;
      nextBtn.disabled = !range || vk >= range.max;
    }

    function renderSlots() {
      const times = (availByDate.get(selDate) || []).slice().sort();
      if (!selDate || !times.length) { slotsWrap.hidden = true; bookForm.hidden = true; return; }
      slotsWrap.hidden = false;
      slotsLabel.textContent = `Horários disponíveis — ${fmtLong(selDate)}`;
      slotsGrid.innerHTML = "";
      times.forEach((t) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "slot"; b.textContent = t;
        if (requested.has(`${selDate} ${t}`)) {
          b.disabled = true; b.classList.add("is-requested");
          b.setAttribute("aria-label", `${t} — você já solicitou este horário`);
        } else {
          if (t === selTime) b.classList.add("is-selected");
          b.addEventListener("click", () => {
            selTime = t; renderSlots(); bookForm.hidden = false;
            if (note) note.hidden = true;
            if (nameInput) nameInput.focus({ preventScroll: true });
          });
        }
        slotsGrid.appendChild(b);
      });
      bookForm.hidden = !selTime;
    }

    async function loadAvailability(opts) {
      const preserve = !!(opts && opts.preserve); // keep the visitor's selected date/month
      const silent = !!(opts && opts.silent);     // background refresh: no loading/error flash
      const keepDate = selDate, keepTime = selTime, keepView = view;

      if (!db) {
        if (!silent) setStatus('A agenda online está indisponível neste instante — mas não se preocupe: agende em segundos pelo WhatsApp aqui embaixo. <button type="button" class="booker__retry" data-retry>Tentar de novo</button>', "error");
        return;
      }
      if (!preserve) { calWrap.hidden = true; slotsWrap.hidden = true; bookForm.hidden = true; availByDate.clear(); selDate = null; selTime = null; }
      if (!silent) setStatus('<span class="booker__spin" aria-hidden="true"></span> Buscando os melhores horários para você…', "loading");
      try {
        const { data, error } = await db
          .from("visita_disponibilidade")
          .select("data,hora,bloqueada")
          .eq("bloqueada", false)
          .gte("data", todayStr)
          .order("data", { ascending: true })
          .order("hora", { ascending: true });
        if (error) throw error;

        // Rebuild availability from scratch so a slot booked elsewhere drops off here too.
        const next = new Map();
        (data || []).forEach((r) => {
          const t = (r.hora || "").slice(0, 5);
          if (!t || !r.data) return;
          if (r.data <= todayStr) return; // sem agendamento para hoje/passado
          if (!next.has(r.data)) next.set(r.data, []);
          if (next.get(r.data).indexOf(t) === -1) next.get(r.data).push(t);
        });
        availByDate.clear();
        next.forEach((v, k) => availByDate.set(k, v));

        if (availByDate.size === 0) {
          calWrap.hidden = true; slotsWrap.hidden = true; bookForm.hidden = true;
          selDate = null; selTime = null;
          setStatus("Os horários estão concorridos no momento! Fale com a gente pelo WhatsApp que encontramos o dia perfeito para a sua visita.", "info");
          return;
        }
        setStatus("", null);
        calWrap.hidden = false;

        // Keep the visitor where they were on a refresh; otherwise open the first available month.
        if (preserve && keepDate && availByDate.has(keepDate)) {
          selDate = keepDate;
          selTime = (keepTime && availByDate.get(keepDate).indexOf(keepTime) !== -1) ? keepTime : null;
          view = keepView;
        } else {
          if (preserve && keepDate && !availByDate.has(keepDate)) { selDate = null; selTime = null; }
          const firstKey = [...availByDate.keys()].sort()[0].split("-").map(Number);
          view = (preserve && keepView) ? keepView : new Date(firstKey[0], firstKey[1] - 1, 1);
        }
        renderCal();
        renderSlots();
      } catch (e) {
        if (!silent) setStatus('Tivemos um probleminha para abrir a agenda. Tente de novo ou fale com a gente no WhatsApp — respondemos rapidinho. <button type="button" class="booker__retry" data-retry>Tentar de novo</button>', "error");
      }
    }

    confirmBtn.addEventListener("click", async () => {
      const name = (nameInput.value || "").trim();
      const wa = (waInput.value || "").trim();
      const email = ((emailInput && emailInput.value) || "").trim();
      const digits = wa.replace(/\D/g, "");          // celular BR: DDD(2) + 9 + 8 = 11 dígitos
      const validWa = digits.length === 11 && Number(digits.slice(0, 2)) >= 11 && digits[2] === "9";
      let err = "";
      if (!selDate || !selTime) err = "Escolha uma data e um horário.";
      else if (name.split(/\s+/).filter(Boolean).length < 2) err = "Digite seu nome completo (nome e sobrenome).";
      else if (!validWa) err = "Informe um WhatsApp válido com DDD.";
      else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err = "Confira o e-mail digitado.";
      if (err) { setNote(err, "error"); return; }
      if (!db) { setNote("Sistema de agenda indisponível agora. Por favor, agende pelo WhatsApp logo abaixo.", "error"); return; }

      // Grava sempre limpo, com DDI, para o app abrir o wa.me sem erro: "5541999998888".
      const waClean = "55" + digits;

      const dateStr = selDate, timeStr = selTime;
      confirmBtn.disabled = true;
      confirmBtn.classList.add("is-loading");
      const label = confirmBtn.textContent;
      confirmBtn.textContent = "Enviando…";
      try {
        // origem ("site") e status ("pendente") são definidos por padrão no banco.
        const payload = { nome_completo: name, whatsapp: waClean, data: dateStr, hora: timeStr + ":00" };
        if (email) payload.email = email;
        const { error } = await db.from("visita_agendamento").insert(payload);
        if (error) throw error;
        const firstName = name.split(/\s+/)[0];
        requested.add(`${dateStr} ${timeStr}`);
        setNote(
          `<strong>Tudo certo, ${firstName}!</strong> Sua solicitação de visita para ${fmtLong(dateStr)} às ${timeStr} foi recebida. ` +
          `Nossa equipe vai falar com você pelo WhatsApp para confirmar — fique de olho nas mensagens. Estamos ansiosos para receber vocês.` +
          `<span class="booker__note-sub">Pedido enviado — sua visita ainda <strong>não está confirmada</strong>.</span>`,
          "ok"
        );
        selTime = null;
        if (nameInput) nameInput.value = ""; if (waInput) waInput.value = ""; if (emailInput) emailInput.value = "";
        renderSlots(); // o horário escolhido passa a aparecer como "Solicitado"
        // Re-sincroniza com o banco: quando o gatilho bloqueia o slot, ele some para todos.
        setTimeout(() => loadAvailability({ preserve: true, silent: true }), 1200);
      } catch (e) {
        setNote(
          "Esse horário acabou de ser reservado! Escolha outro logo abaixo — ainda dá tempo. Se preferir, fale com a gente no WhatsApp.",
          "error"
        );
        loadAvailability({ preserve: true, silent: true });
      } finally {
        confirmBtn.disabled = false;
        confirmBtn.classList.remove("is-loading");
        confirmBtn.textContent = label;
      }
    });

    // Máscara de WhatsApp brasileira enquanto digita: (DD) NNNNN-NNNN.
    function maskWhatsApp(v) {
      const d = (v || "").replace(/\D/g, "").slice(0, 11);
      if (d.length <= 2) return d ? "(" + d : "";
      if (d.length <= 7) return "(" + d.slice(0, 2) + ") " + d.slice(2);
      return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
    }
    if (waInput) waInput.addEventListener("input", () => { waInput.value = maskWhatsApp(waInput.value); });

    [nameInput, waInput, emailInput].forEach((el) => el && el.addEventListener("input", () => {
      if (note && note.classList.contains("booker__note--error")) note.hidden = true;
    }));
    prevBtn.addEventListener("click", () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); renderCal(); });
    nextBtn.addEventListener("click", () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); renderCal(); });

    // Mantém a agenda fresca: um horário reservado por outra pessoa (bloqueado pelo
    // gatilho do banco) some daqui também, sem o visitante precisar recarregar.
    function refresh() {
      if (!db || document.hidden) return;
      if (selTime) return; // não atrapalha quem está finalizando um agendamento
      loadAvailability({ preserve: true, silent: true });
    }
    document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
    window.addEventListener("focus", refresh);
    setInterval(refresh, 60000);

    loadAvailability();
  }

  /* ---------- init ---------- */
  function init() {
    applyConfig();
    navOnScroll();
    heroVideo();
    reveals();
    fab();
    mediaFade();
    lightbox();
    scheduler();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
