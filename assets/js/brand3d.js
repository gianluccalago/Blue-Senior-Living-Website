/* =====================================================================
   Blue Senior Living — emblema 3D flutuante (companheiro de scroll)
   --------------------------------------------------------------------
   O emblema da marca, extrudado em 3D a partir do próprio SVG, flutua
   fixo à direita do site e GIRA conforme a rolagem: entra depois do
   hero, acompanha a página inteira e se despede antes do agendamento.
   Decorativo puro: pointer-events none, aria-hidden, desktop (≥1280px).
   - Three.js vendorizado (assets/vendor), carregado preguiçosamente na
     primeira rolagem — zero custo no carregamento inicial.
   - Sem WebGL / erro de carga / reduced-motion: o elemento simplesmente
     não aparece (nada quebra).
   ===================================================================== */
(function () {
  "use strict";

  var host = document.querySelector("[data-brand3d]");
  var canvas = document.querySelector("[data-brand3d-canvas]");
  var hero = document.getElementById("hero");
  var endAnchor = document.getElementById("agendar");
  if (!host || !canvas || !hero || !endAnchor) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { host.remove(); return; }

  var started = false;
  function maybeBoot() {
    if (started) return;
    if (window.innerWidth < 1280) return;               // só desktop
    if ((window.scrollY || 0) < hero.offsetHeight * 0.3) return; // ainda no hero
    started = true;
    window.removeEventListener("scroll", maybeBoot);
    Promise.all([
      import("../vendor/three.module.min.js"),
      import("../vendor/SVGLoader.js"),
      fetch("assets/logo/emblem.svg").then(function (r) { return r.text(); }),
    ]).then(init).catch(function () { host.remove(); });
  }
  window.addEventListener("scroll", maybeBoot, { passive: true });

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
    var WIN = { x0: 548, y0: 184, x1: 856, y1: 584 }; // viewBox do emblema
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
      // Nitidez máxima: resolução nativa do monitor (até 3x) — o canvas é
      // pequeno, então o custo de GPU segue baixo mesmo em 3x.
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 3));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      var tan = Math.tan((camera.fov * Math.PI) / 360);
      camera.position.z = Math.max(h3d / 2 / 0.88 / tan, w3d / 2 / 0.88 / (tan * camera.aspect), 6);
      camera.updateProjectionMatrix();
    }

    /* ---- Métricas do trajeto: cacheadas (nada de reflow por frame) ---- */
    var heroH = 0, endTop = 0, vh = 0, frame = 0;
    function measure() {
      heroH = hero.offsetHeight;
      endTop = endAnchor.offsetTop;
      vh = window.innerHeight;
    }
    measure();
    resize();
    window.addEventListener("resize", function () { measure(); resize(); });

    /* ---- Rolagem → rotação; fade cinematográfico nas pontas ---- */
    var TILT = 0.16;
    var currentY = -0.6;
    var op = 0, hidden = true;
    var clamp01 = function (v) { return Math.min(1, Math.max(0, v)); };
    var smooth = function (v) { v = clamp01(v); return v * v * (3 - 2 * v); }; // smoothstep

    function loop(t) {
      // acompanha mudanças de layout (imagens carregando etc.) sem custo por frame
      if ((frame++ & 63) === 0) measure();
      var sy = window.scrollY || 0;
      var start = heroH * 0.55;                 // entra saindo do hero
      var end = endTop - vh * 0.9;              // despede-se antes do agendamento
      var span = Math.max(1, end - start);
      var p = clamp01((sy - start) / span);

      // duas voltas completas ao longo do site, com amortecimento sedoso
      var targetY = -0.6 + p * Math.PI * 4;
      currentY += (targetY - currentY) * 0.08;

      // fade suave (smoothstep, ~520px) + amortecimento temporal:
      // rolagens bruscas ainda entram e saem com elegância
      var target = smooth((sy - start) / 520) * smooth((end + 520 - sy) / 520) * 0.95;
      if (window.innerWidth < 1280) target = 0;
      op += (target - op) * 0.13;

      if (op > 0.004) {
        hidden = false;
        var k = clamp01(op / 0.95);
        host.style.opacity = op.toFixed(3);
        // entrada exuberante: cresce de 90%→100% e o desfoque resolve para nítido
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
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
})();
