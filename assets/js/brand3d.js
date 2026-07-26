/* =====================================================================
   Blue Senior Living — emblema 3D que gira com o scroll
   --------------------------------------------------------------------
   Constrói o emblema em 3D real (extrusão do próprio SVG da marca) e
   amarra a rotação ao progresso de rolagem da seção fixada (pin+scrub).
   - Carregamento preguiçoso: Three.js (vendorizado em assets/vendor) só
     entra quando a seção se aproxima do viewport.
   - Sem WebGL / erro de carga: cai para o emblema plano (SVG).
   - prefers-reduced-motion: emblema estático em ângulo de apresentação.
   ===================================================================== */
(function () {
  "use strict";

  var section = document.querySelector("[data-brand3d]");
  var canvas = document.querySelector("[data-brand3d-canvas]");
  if (!section || !canvas) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var started = false;

  function flatFallback() { section.classList.add("brand3d--flat"); }

  function boot() {
    if (started) return;
    started = true;
    Promise.all([
      import("../vendor/three.module.min.js"),
      import("../vendor/SVGLoader.js"),
      fetch("assets/logo/emblem.svg").then(function (r) { return r.text(); }),
    ]).then(init).catch(flatFallback);
  }

  function init(deps) {
    var THREE = deps[0];
    var SVGLoader = deps[1].SVGLoader;
    var svgText = deps[2];

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (e) { flatFallback(); return; }
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 10);

    /* ---- Geometria: shapes do SVG (só os que estão na janela do emblema) ---- */
    var svg = new SVGLoader().parse(svgText);
    // viewBox do emblem.svg: 548 184 308 400 — o arquivo carrega o logo inteiro,
    // o recorte visual é o viewBox; filtramos os shapes fora dessa janela.
    var WIN = { x0: 548, y0: 184, x1: 856, y1: 584 };
    var group = new THREE.Group();
    var material = new THREE.MeshStandardMaterial({
      color: 0x1c4a6e,       // navy da marca
      metalness: 0.3,
      roughness: 0.36,
    });
    var depth = 34;
    svg.paths.forEach(function (path) {
      SVGLoader.createShapes(path).forEach(function (shape) {
        var probe = new THREE.ShapeGeometry(shape);
        probe.computeBoundingBox();
        var bb = probe.boundingBox;
        probe.dispose();
        var cx = (bb.min.x + bb.max.x) / 2, cy = (bb.min.y + bb.max.y) / 2;
        if (cx < WIN.x0 || cx > WIN.x1 || cy < WIN.y0 || cy > WIN.y1) return;
        var geo = new THREE.ExtrudeGeometry(shape, {
          depth: depth, curveSegments: 20,
          bevelEnabled: true, bevelThickness: 4, bevelSize: 3, bevelSegments: 3,
        });
        group.add(new THREE.Mesh(geo, material));
      });
    });
    if (!group.children.length) { flatFallback(); return; }

    // Centraliza e normaliza a escala (o SVG vem em pt, com Y para baixo)
    var box = new THREE.Box3().setFromObject(group);
    var center = box.getCenter(new THREE.Vector3());
    var size = box.getSize(new THREE.Vector3());
    group.children.forEach(function (m) { m.geometry.translate(-center.x, -center.y, -center.z); });
    var scale = 4.6 / Math.max(size.x, size.y);
    group.scale.set(scale, -scale, scale); // -Y: SVG cresce para baixo
    scene.add(group);
    // Dimensões em cena (para a câmera enquadrar sem cortar em nenhum aspecto)
    var w3d = size.x * scale, h3d = size.y * scale;

    /* ---- Luz: chave branca + contorno celeste (identidade) ---- */
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

    /* ---- Enquadramento / retina ---- */
    function resize() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Recuo dinâmico: o emblema cabe inteiro (com folga de 12%) em
      // qualquer proporção de tela, mesmo de perfil durante o giro.
      var tan = Math.tan((camera.fov * Math.PI) / 360);
      var zH = h3d / 2 / 0.88 / tan;
      var zW = w3d / 2 / 0.88 / (tan * camera.aspect);
      camera.position.z = Math.max(zH, zW, 6);
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", function () { resize(); render(); });

    /* ---- Rotação amarrada ao scroll (pin + scrub) ---- */
    var TILT = 0.16;                 // leve inclinação para leitura de volume
    var currentY = -0.6, targetY = -0.6;
    function progress() {
      var r = section.getBoundingClientRect();
      var total = r.height - window.innerHeight;
      if (total <= 0) return 0;
      return Math.min(1, Math.max(0, -r.top / total));
    }
    function render(t) {
      group.rotation.x = TILT + Math.sin((t || 0) / 2600) * 0.05;
      group.rotation.y = currentY;
      group.position.y = Math.sin((t || 0) / 2100) * 0.07; // flutuação sutil
      renderer.render(scene, camera);
    }

    if (reduce.matches) {
      // Sem animação: ângulo de apresentação, render único (e em resize)
      currentY = -0.55;
      render(0);
      return;
    }

    var inView = false, rafId = null;
    function loop(t) {
      targetY = -0.6 + progress() * Math.PI * 2; // uma volta completa na seção
      currentY += (targetY - currentY) * 0.09;   // amortecimento — giro sedoso
      render(t);
      rafId = inView ? requestAnimationFrame(loop) : null;
    }
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView && rafId === null) rafId = requestAnimationFrame(loop);
    }, { rootMargin: "120px" }).observe(section);
    render(0);
  }

  /* Carrega só quando a seção se aproxima (600px antes) */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries, io) {
      if (entries[0].isIntersecting) { io.disconnect(); boot(); }
    }, { rootMargin: "600px" }).observe(section);
  } else {
    boot();
  }
})();
