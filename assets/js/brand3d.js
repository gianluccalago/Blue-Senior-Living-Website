/* =====================================================================
   Blue Senior Living — emblema 3D: nasce da gota e acompanha o scroll
   --------------------------------------------------------------------
   Coreografia em quatro estados:
   1. waiting   — o vídeo do hero toca; aguardamos o instante do impacto
   2. birth     — no auge da coroa d'água (BIRTH_T), o emblema emerge do
                  ponto do splash: nasce pequeno e desfocado, sobe com a
                  física do splash, resolve para nítido com brilho celeste
   3. dive      — devolve-se à água: mergulha, desfoca e some (hero limpo)
   4. companion — no scroll, ressurge no corredor central e gira 3,5
                  voltas ao longo do site (comportamento consolidado)
   Regras: decorativo puro (pointer-events none, aria-hidden), desktop
   ≥1280px; rolar cedo cancela o nascimento com elegância; sem WebGL /
   reduced-motion / autoplay bloqueado ⇒ nada quebra, só não nasce.
   ===================================================================== */
(function () {
  "use strict";

  var host = document.querySelector("[data-brand3d]");
  var canvas = document.querySelector("[data-brand3d-canvas]");
  var hero = document.getElementById("hero");
  var heroVideo = document.querySelector("[data-hero-video]");
  var endAnchor = document.getElementById("espacos"); // a jornada termina na quebra navy→claro
  if (!host || !canvas || !hero || !endAnchor) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { host.remove(); return; }

  /* Momento e ponto do nascimento no vídeo do hero (medidos no arquivo) */
  var BIRTH_T = 1.38;          // logo abaixo da gota, coroa subindo (s)
  var BIRTH_LATE = 2.3;        // depois disso, não vale a pena nascer
  var SPLASH_U = 0.49, SPLASH_V = 0.56; // ponto do impacto no frame (0..1)

  var started = false;
  function boot() {
    if (started) return;
    if (window.innerWidth < 1280) return;
    started = true;
    Promise.all([
      import("../vendor/three.module.min.js"),
      import("../vendor/SVGLoader.js"),
      fetch("assets/logo/emblem.svg").then(function (r) { return r.text(); }),
    ]).then(init).catch(function () { host.remove(); });
  }
  // Carrega cedo: assim que o vídeo do hero começa a tocar (o nascimento
  // acontece ~1,5s depois) — e, como rede de segurança, na primeira rolagem.
  if (heroVideo) {
    ["playing", "timeupdate"].forEach(function (ev) {
      heroVideo.addEventListener(ev, boot, { once: true });
    });
  }
  window.addEventListener("scroll", boot, { passive: true, once: true });

  function init(deps) {
    var THREE = deps[0];
    var SVGLoader = deps[1].SVGLoader;
    var svgText = deps[2];

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas, alpha: true, antialias: true,
        powerPreference: "high-performance",
      });
    } catch (e) { host.remove(); return; }
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 10);

    /* ---- Geometria: shapes do SVG (só a janela do emblema) ---- */
    var svg = new SVGLoader().parse(svgText);
    var WIN = { x0: 548, y0: 184, x1: 856, y1: 584 };
    var group = new THREE.Group();
    var material = new THREE.MeshStandardMaterial({
      color: 0x1c4a6e, metalness: 0.3, roughness: 0.36,
    });
    svg.paths.forEach(function (path) {
      SVGLoader.createShapes(path).forEach(function (shape) {
        var probe = new THREE.ShapeGeometry(shape);
        probe.computeBoundingBox();
        var bb = probe.boundingBox;
        probe.dispose();
        var cx = (bb.min.x + bb.max.x) / 2, cy = (bb.min.y + bb.max.y) / 2;
        if (cx < WIN.x0 || cx > WIN.x1 || cy < WIN.y0 || cy > WIN.y1) return;
        var geo = new THREE.ExtrudeGeometry(shape, {
          depth: 34, curveSegments: 40,
          bevelEnabled: true, bevelThickness: 4, bevelSize: 3, bevelSegments: 5,
        });
        group.add(new THREE.Mesh(geo, material));
      });
    });
    if (!group.children.length) { host.remove(); return; }

    var box = new THREE.Box3().setFromObject(group);
    var center = box.getCenter(new THREE.Vector3());
    var size = box.getSize(new THREE.Vector3());
    group.children.forEach(function (m) { m.geometry.translate(-center.x, -center.y, -center.z); });
    var scale = 4.6 / Math.max(size.x, size.y);
    group.scale.set(scale, -scale, scale);
    scene.add(group);
    var w3d = size.x * scale, h3d = size.y * scale;

    /* ---- Luz: chave branca + contorno celeste ---- */
    scene.add(new THREE.AmbientLight(0xbfd9ea, 0.5));
    var key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(2.5, 3, 4);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0x5cbfe5, 2.2);
    rim.position.set(-3, -1.5, -4);
    scene.add(rim);
    var fill = new THREE.PointLight(0x9ad8f0, 12, 30);
    fill.position.set(-3, 2, 5);
    scene.add(fill);

    function resize() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 3));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      var tan = Math.tan((camera.fov * Math.PI) / 360);
      camera.position.z = Math.max(h3d / 2 / 0.88 / tan, w3d / 2 / 0.88 / (tan * camera.aspect), 6);
      camera.updateProjectionMatrix();
    }

    /* ---- Métricas do trajeto (cacheadas) ---- */
    var heroH = 0, endTop = 0, vh = 0, frame = 0;
    function measure() {
      heroH = hero.offsetHeight;
      endTop = endAnchor.offsetTop;
      vh = window.innerHeight;
    }
    measure();
    resize();
    window.addEventListener("resize", function () { measure(); resize(); });

    /* ---- Utilidades de easing ---- */
    var clamp01 = function (v) { return Math.min(1, Math.max(0, v)); };
    var smooth = function (v) { v = clamp01(v); return v * v * (3 - 2 * v); };
    var easeOutCubic = function (v) { v = clamp01(v); return 1 - Math.pow(1 - v, 3); };
    var easeInCubic = function (v) { v = clamp01(v); return v * v * v; };
    var easeOutBack = function (v) { v = clamp01(v); var c = 1.35; return 1 + (c + 1) * Math.pow(v - 1, 3) + c * Math.pow(v - 1, 2); };

    /* Ponto do splash em coordenadas de tela (object-fit: cover do vídeo 16:9) */
    function splashPoint() {
      var r = hero.getBoundingClientRect();
      var AR = 16 / 9, cAR = r.width / r.height;
      var rw, rh, ox, oy;
      if (cAR > AR) { rw = r.width; rh = r.width / AR; ox = 0; oy = (r.height - rh) / 2; }
      else { rh = r.height; rw = r.height * AR; oy = 0; ox = (r.width - rw) / 2; }
      return { x: r.left + ox + SPLASH_U * rw, y: r.top + oy + SPLASH_V * rh };
    }

    /* ---- Máquina de estados ---- */
    var state = "waiting";     // waiting | birth | dive | companion
    var birthStart = 0, diveStart = 0;
    var born = false; // nasce uma única vez por carga — na primeira passagem
                      // da gota depois que o 3D está pronto (qualquer volta)
    var TILT = 0.16;
    var currentY = -0.6;
    var op = 0, hidden = true;

    function toCompanion() {
      state = "companion";
      // devolve o host ao centro (CSS padrão do corredor)
      host.style.left = ""; host.style.top = "";
      host.style.transform = ""; host.style.filter = "";
      host.style.opacity = "0";
      op = 0; hidden = true;
      rim.intensity = 2.2;
    }

    function setBirthPose(px, py, s, blur, alpha, rotY, glow) {
      host.style.left = px.toFixed(1) + "px";
      host.style.top = py.toFixed(1) + "px";
      host.style.transform = "translate(-50%, -50%) scale(" + s.toFixed(4) + ")";
      host.style.filter = "blur(" + blur.toFixed(2) + "px)";
      host.style.opacity = alpha.toFixed(3);
      group.rotation.x = TILT;
      group.rotation.y = rotY;
      group.position.y = 0;
      rim.intensity = 2.2 + glow;
      renderer.render(scene, camera);
    }

    function loop(t) {
      if ((frame++ & 63) === 0) measure();
      host.dataset.st = state;
      var sy = window.scrollY || 0;

      /* rolagem cancela a cerimônia do hero com elegância */
      if ((state === "waiting" || state === "birth" || state === "dive") && sy > heroH * 0.3) {
        toCompanion();
      }

      if (state === "waiting") {
        if (heroVideo && !born) {
          var vt = heroVideo.currentTime || 0;
          if (vt >= BIRTH_T && vt <= BIRTH_LATE && !heroVideo.paused) {
            state = "birth";
            born = true;
            birthStart = t;
          }
        }
      } else if (state === "birth") {
        var p = (t - birthStart) / 2300;
        if (p >= 1) { state = "dive"; diveStart = t; p = 1; }
        var sp = splashPoint();
        var hr = hero.getBoundingClientRect();
        // destino do voo: zona livre de texto (direita-alta do hero, sobre a água);
        // em telas mais justas o título alcança mais longe — o destino sobe para o
        // vão entre a navbar e a primeira linha do título
        var dx = Math.min(hr.left + hr.width * 0.8, hr.left + hr.width - 190);
        var dy = hr.top + hr.height * (hr.width < 1500 ? 0.21 : 0.3);
        var m = smooth(p);
        var px = sp.x + (dx - sp.x) * m;                     // arco ascendente
        var py = sp.y + (dy - sp.y) * easeOutCubic(p) - Math.sin(Math.PI * p) * vh * 0.05;
        var s = 0.10 + easeOutBack(p) * 0.26;                // pequeno enquanto cruza, cresce no destino
        var blur = 16 * Math.pow(1 - p, 2);                  // resolve para nítido
        // etéreo na travessia (sobre o texto passa translúcido); encorpa no destino
        var alpha = clamp01(p * 4) * (0.5 + 0.47 * smooth((p - 0.55) / 0.4));
        var rotY = -0.6 + p * 1.6;                           // apresentação em meia-volta
        var glow = 2.6 * Math.sin(Math.PI * clamp01((p - 0.35) / 0.65)); // brilho no destino
        currentY = rotY;
        setBirthPose(px, py, s, blur, alpha, rotY, glow);
      } else if (state === "dive") {
        var q = (t - diveStart) / 950;
        if (q >= 1) { toCompanion(); }
        else {
          var hr2 = hero.getBoundingClientRect();
          var dx2 = Math.min(hr2.left + hr2.width * 0.8, hr2.left + hr2.width - 190);
          var dy2 = hr2.top + hr2.height * (hr2.width < 1500 ? 0.21 : 0.3);
          var fall = easeInCubic(q);
          var py2 = dy2 + fall * vh * 0.3;                   // mergulha na água à direita
          var s2 = 0.36 - fall * 0.26;
          var blur2 = 14 * fall;
          var alpha2 = (1 - fall) * 0.97;
          var rotY2 = currentY + q * 0.8;
          setBirthPose(dx2, py2, s2, blur2, alpha2, rotY2, 0);
        }
      } else { /* companion — comportamento consolidado do corredor */
        var start = heroH * 0.55;
        var end = endTop - vh * 1.2;
        // sensibilidade constante: uma volta a cada ~2300px rolados
        var targetY = -0.6 + Math.max(0, sy - start) / 2300 * Math.PI * 2;
        currentY += (targetY - currentY) * 0.08;
        var target = smooth((sy - start) / 520) * smooth((end + 520 - sy) / 520) * 0.95;
        if (window.innerWidth < 1280) target = 0;
        // saída mais decidida que a entrada: rolagens rápidas não deixam
        // resíduo do emblema sobre as seções claras
        op += (target - op) * (target < op ? 0.24 : 0.13);
        if (op > 0.004) {
          hidden = false;
          var k = clamp01(op / 0.95);
          host.style.opacity = op.toFixed(3);
          host.style.transform = "translate(-50%, -50%) scale(" + (0.9 + 0.105 * k).toFixed(4) + ")";
          host.style.filter = "blur(" + (10 * (1 - k) * (1 - k)).toFixed(2) + "px)";
          group.rotation.x = TILT + Math.sin(t / 2600) * 0.05;
          group.rotation.y = currentY;
          group.position.y = Math.sin(t / 2100) * 0.07;
          renderer.render(scene, camera);
        } else if (!hidden) {
          hidden = true;
          host.style.opacity = "0";
        }
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
})();
