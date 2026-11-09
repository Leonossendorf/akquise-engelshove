/* Testseite Modell: 1 Drohnenflug zum Ziehen, 2 Haus im Strich-Stil als 3D (Drehen, Strich zu Stein), 3 CAD-Modell im Viewer. */
import * as THREE from "./lib/three.module.min.js";
import { OrbitControls } from "./lib/OrbitControls.js";

// 1 Drohnenflug: 56 Einzelbilder, mit der Maus oder dem Finger durch die Fahrt ziehen
(function () {
  var el = document.querySelector(".mo-flug"); if (!el) return;
  var img = el.querySelector("img"), n = parseInt(el.dataset.n, 10), i = 0, x0 = 0, i0 = 0, auto = true, ziel = 0, richtung = 1;
  var bilder = []; for (var k = 1; k <= n; k++) { var b = new Image(); b.src = "img/modell/flug-" + (k < 10 ? "0" + k : k) + ".webp"; bilder.push(b); }
  var zeig = function (j) { i = Math.max(0, Math.min(n - 1, Math.round(j))); img.src = bilder[i].src; el.style.setProperty("--p", (i / (n - 1)).toFixed(3)); };
  el.addEventListener("pointerdown", function (e) { auto = false; x0 = e.clientX; i0 = i; el.setPointerCapture(e.pointerId); el.classList.add("zieht"); });
  el.addEventListener("pointermove", function (e) { if (!el.hasPointerCapture || !el.hasPointerCapture(e.pointerId)) return; zeig(i0 + (e.clientX - x0) / el.clientWidth * n * 1.4); });
  el.addEventListener("pointerup", function () { el.classList.remove("zieht"); });
  el.addEventListener("pointercancel", function () { el.classList.remove("zieht"); });
  // Solange niemand zieht, pendelt die Fahrt langsam hin und her
  var takt = 0; (function lauf() { if (auto) { takt++; if (takt % 3 === 0) { ziel += richtung; if (ziel >= n - 1 || ziel <= 0) richtung *= -1; zeig(ziel); } } requestAnimationFrame(lauf); })();
})();

// 2 Haus als 3D im Strich-Stil: weiße Kanten auf Schwarz, drehbar; der Regler füllt die Flächen wie Stein
(function () {
  var box = document.querySelector(".mo-haus"); if (!box) return;
  var regler = document.querySelector(".mo-regler"), W = box.clientWidth, H = box.clientHeight;
  var r = new THREE.WebGLRenderer({ antialias: true, alpha: true }); r.setPixelRatio(Math.min(2, devicePixelRatio)); r.setSize(W, H); box.appendChild(r.domElement);
  var szene = new THREE.Scene(), kam = new THREE.PerspectiveCamera(32, W / H, .1, 200); kam.position.set(16, 9, 20);
  var st = new OrbitControls(kam, r.domElement); st.target.set(0, 2.2, 0); st.enableDamping = true; st.dampingFactor = .06; st.enablePan = false; st.minDistance = 12; st.maxDistance = 40; st.maxPolarAngle = Math.PI / 2 - .04; st.autoRotate = true; st.autoRotateSpeed = .6;
  var kante = new THREE.LineBasicMaterial({ color: 0xf3f2ef, transparent: true, opacity: .95 });
  var fein = new THREE.LineBasicMaterial({ color: 0xf3f2ef, transparent: true, opacity: .32 });
  var stein = new THREE.MeshStandardMaterial({ color: 0xcfcac2, roughness: .9, metalness: 0, transparent: true, opacity: 0 });
  var dunkel = new THREE.MeshStandardMaterial({ color: 0x1b1b19, roughness: .8, metalness: 0, transparent: true, opacity: 0 });
  var glas = new THREE.MeshStandardMaterial({ color: 0xe3b27a, emissive: 0xe3b27a, emissiveIntensity: .5, roughness: .3, transparent: true, opacity: 0 });
  var flaechen = [];
  var quader = function (w, h, d, x, y, z, mat) {
    var g = new THREE.BoxGeometry(w, h, d), m = new THREE.Mesh(g, mat); m.position.set(x, y + h / 2, z); szene.add(m); flaechen.push(m);
    var l = new THREE.LineSegments(new THREE.EdgesGeometry(g), kante); l.position.copy(m.position); szene.add(l); return m;
  };
  // Grobe Massen des Hauses aus dem Hero: Kubus mit zwei Geschossen, Garage, Carport, Fensterbänder
  quader(10, 3.2, 9, 0, 0, 0, stein); quader(10.6, 3.0, 9.4, .3, 3.2, -.2, stein);
  quader(7, 2.9, 7, 8.2, 0, 1.2, stein);                       // Garage
  quader(.25, 2.8, .25, -7.6, 0, 3.8, dunkel); quader(.25, 2.8, .25, -7.6, 0, -3.8, dunkel); quader(6, .3, 8.4, -5, 2.8, 0, dunkel); // Carport
  quader(6.4, 1.3, .3, .6, 4.2, 4.6, glas); quader(4.2, 2.2, .3, -1.2, .5, 4.6, glas); quader(5.6, 2.4, .2, 8.2, .2, 4.8, dunkel); // Fensterband, Terrassentür, Garagentor
  // Feine Linien: Klinkerschichten als Andeutung
  var lin = [];
  for (var y = .4; y < 6.2; y += .55) { lin.push(-5, y, 4.52, 5, y, 4.52); lin.push(5.02, y, 4.5, 5.02, y, -4.5); }
  var g2 = new THREE.BufferGeometry(); g2.setAttribute("position", new THREE.Float32BufferAttribute(lin, 3)); szene.add(new THREE.LineSegments(g2, fein));
  // Boden als Linie und Licht
  var bod = new THREE.BufferGeometry(); bod.setAttribute("position", new THREE.Float32BufferAttribute([-22, 0, 8, 22, 0, 8], 3)); szene.add(new THREE.Line(bod, fein));
  szene.add(new THREE.HemisphereLight(0xf3f2ef, 0x101010, .9)); var sonne = new THREE.DirectionalLight(0xffe2bd, .9); sonne.position.set(-8, 12, 6); szene.add(sonne);
  var setze = function (t) { flaechen.forEach(function (m) { m.material.opacity = t; }); kante.opacity = .95 - .55 * t; fein.opacity = .32 * (1 - t); };
  regler.addEventListener("input", function () { setze(parseFloat(regler.value)); });
  st.enableZoom = false; box.addEventListener("pointerdown", function () { st.autoRotate = false; st.enableZoom = true; }); box.addEventListener("pointerleave", function () { st.enableZoom = false; });
  window.addEventListener("resize", function () { W = box.clientWidth; H = box.clientHeight; kam.aspect = W / H; kam.updateProjectionMatrix(); r.setSize(W, H); });
  (function lauf() { st.update(); r.render(szene, kam); requestAnimationFrame(lauf); })();
})();

// 5 Lebendiges Foto: eine KI-Tiefenkarte gibt dem Foto Relief, die Kamera fährt hinein; Maus und Finger verschieben den Blick
document.querySelectorAll(".mo-par").forEach(function (box) {
  var W = box.clientWidth, H = box.clientHeight, ar = parseFloat(box.dataset.ar) || 1.5;
  var r = new THREE.WebGLRenderer({ antialias: true }); r.setPixelRatio(Math.min(2, devicePixelRatio)); r.setSize(W, H); r.outputColorSpace = THREE.LinearSRGBColorSpace; box.appendChild(r.domElement);
  var szene = new THREE.Scene(), kam = new THREE.PerspectiveCamera(26, W / H, .01, 50);
  var lader = new THREE.TextureLoader(), bild = lader.load(box.dataset.img), tiefe = lader.load(box.dataset.tiefe);
  bild.colorSpace = THREE.NoColorSpace; bild.minFilter = THREE.LinearFilter; tiefe.minFilter = THREE.LinearFilter;
  var m = new THREE.ShaderMaterial({ uniforms: { bild: { value: bild }, tiefe: { value: tiefe }, staerke: { value: parseFloat(box.dataset.staerke) || .24 } },
    vertexShader: "uniform sampler2D tiefe;uniform float staerke;varying vec2 vUv;void main(){vUv=uv;float d=texture2D(tiefe,uv).r;vec3 p=position;p.z=(d-.5)*staerke;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}",
    fragmentShader: "uniform sampler2D bild;varying vec2 vUv;void main(){gl_FragColor=texture2D(bild,vUv);}" });
  szene.add(new THREE.Mesh(new THREE.PlaneGeometry(ar, 1, 400, 260), m));
  // Abstand, bei dem das Bild den Kasten gerade füllt (Höhe 1 oder Breite ar, je nach Seitenverhältnis des Kastens)
  var voll = function () { var t = Math.tan(kam.fov * Math.PI / 360); return Math.max(.5 / t, (ar / 2) / (t * kam.aspect)) * .985; };
  var zx = 0, zy = 0, mx = 0, my = 0;
  box.addEventListener("pointermove", function (e) { var b = box.getBoundingClientRect(); zx = ((e.clientX - b.left) / b.width - .5) * 2; zy = ((e.clientY - b.top) / b.height - .5) * 2; });
  box.addEventListener("pointerleave", function () { zx = 0; zy = 0; });
  window.addEventListener("resize", function () { W = box.clientWidth; H = box.clientHeight; kam.aspect = W / H; kam.updateProjectionMatrix(); r.setSize(W, H); });
  var t0 = performance.now();
  (function lauf() {
    var t = (performance.now() - t0) / 1000, u = (1 - Math.cos(t / 9 * Math.PI * 2)) / 2; // 0 bis 1 bis 0, 9 Sekunden je Runde
    mx += (zx - mx) * .04; my += (zy - my) * .04;
    var d = voll(); kam.position.set(Math.sin(t / 9 * Math.PI * 2) * .035 + mx * .07, Math.cos(t / 9 * Math.PI * 2) * .015 - my * .045, d - u * d * .22);
    kam.lookAt(mx * .02, -my * .012, 0); r.render(szene, kam); requestAnimationFrame(lauf);
  })();
});

// Mausrad zoomt erst nach einem Klick ins Modell, vorher rollt die Seite normal weiter (Leon, 05.11.)
document.querySelectorAll("model-viewer").forEach(function (mv) {
  mv.setAttribute("disable-zoom", ""); mv.setAttribute("interaction-prompt", "none");
  var hinweis = document.createElement("span"); hinweis.className = "mo-zoom"; hinweis.textContent = "Klicken, dann drehen und zoomen"; mv.appendChild(hinweis);
  mv.addEventListener("pointerdown", function () { mv.removeAttribute("disable-zoom"); mv.classList.add("aktiv"); });
  mv.addEventListener("pointerleave", function () { mv.setAttribute("disable-zoom", ""); mv.classList.remove("aktiv"); });
});
