/* Startseite: Film oben, darunter „Der Strich. Der Stein. Das Licht.“ Der Bildschirm bleibt stehen, das Scrollen treibt den Ablauf. */
(function () {
  "use strict";
  var reduziert = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var knoepfe = Array.prototype.slice.call(document.querySelectorAll(".umschalter [data-wahl]"));
  var kopf = document.querySelector(".top");
  var ablauf = document.querySelector(".ablauf");
  var spiegel = document.querySelector(".held--spiegel");
  var buehne = ablauf.querySelector(".held-buehne");
  var szene = ablauf.querySelector(".szene");
  var el = function (s) { return ablauf.querySelector(s); };
  var E = { film: el(".film-schicht"), tag: el(".e-tag"), mauer: el(".e-mauer"), linien: el(".e-linien"), boden: el(".boden"), mittel: el(".mittel"), fein: el(".fein"), dunkel: el(".e-dunkel"),
    l1: el(".l1"), l2: el(".l2"), l3: el(".l3"), umfeld: el(".e-umfeld"), w1: el(".w1"), w2: el(".w2"), w3: el(".w3"), ende: el(".ende") };
  var kontur = Array.prototype.slice.call(ablauf.querySelectorAll(".kontur path"));
  var aktiv = 1;
  var teil = function (a, b, p) { var t = Math.max(0, Math.min(1, (p - a) / (b - a))); return t * t * (3 - 2 * t); };
  var strecke = function (a, b, p) { return Math.max(0, Math.min(1, (p - a) / (b - a))); };

  // Mauer: das Tagbild wird Stein für Stein von unten aufgebaut, außerhalb des Hauses blendet es weich ein
  var gl = null, gp = null, mauerBereit = false;
  var mauerStart = function () {
    if (reduziert) return;
    var c = E.mauer;
    gl = c.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
    if (!gl) return;
    c.addEventListener("webglcontextlost", function () { mauerBereit = false; E.mauer.style.visibility = "hidden"; malen(stand); });
    gl.clearColor(0, 0, 0, 0);
    var sh = function (t, q) { var s = gl.createShader(t); gl.shaderSource(s, q); gl.compileShader(s); return s; };
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, "attribute vec2 a;varying vec2 u;void main(){u=vec2(a.x,-a.y)*.5+.5;gl_Position=vec4(a,0.,1.);}"));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, [
      "precision highp float;varying vec2 u;uniform sampler2D b,m;uniform float p;",
      "float h(vec2 c){return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);}",
      "void main(){vec4 f=texture2D(b,u);float haus=1.-smoothstep(.02,.4,texture2D(m,u).a);",
      "float v=1.-u.y,Z=72.,r=floor(v*Z),x=u.x*26.+mod(r,2.)*.5,c=floor(x);",
      "float s=(r/Z)*.86+h(vec2(c,r))*.1,a=smoothstep(s,s+.035,p*1.02);",
      "float z=smoothstep(.84,1.,p);float t=mix(z,a,haus);gl_FragColor=vec4(f.rgb*t,t);}"].join("")));
    gl.linkProgram(pr); gl.useProgram(pr);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var a = gl.getAttribLocation(pr, "a"); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    gp = gl.getUniformLocation(pr, "p");
    var bild = function (i, img, n) {
      var t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.uniform1i(gl.getUniformLocation(pr, n), i);
    };
    var bereit = function (img, f) { if (img.complete && img.naturalWidth) f(); else img.addEventListener("load", f, { once: true }); };
    bereit(E.tag, function () { bereit(E.umfeld, function () {
      bild(0, E.tag, "b"); bild(1, E.umfeld, "m"); mauerBereit = true; E.tag.style.clipPath = ""; groesse(); malen(stand);
    }); });
  };
  var groesse = function () {
    if (!gl) return;
    var r = Math.min(window.devicePixelRatio || 1, 2), b = szene.offsetWidth * r, h = szene.offsetHeight * r;
    if (b > 2560) { h *= 2560 / b; b = 2560; }
    E.mauer.width = Math.round(b); E.mauer.height = Math.round(h);
    gl.viewport(0, 0, E.mauer.width, E.mauer.height);
  };

  // Ablauf. p läuft von 0 (oben) bis 1 (Seite geht weiter)
  var stand = 0, ziel = 0, laeuft = false, filmWeg = false;
  var malen = function (p) {
    var f = teil(0, .075, p);
    E.film.style.transform = "translate3d(0," + (-f * 101) + "%,0)";
    E.film.style.visibility = f >= 1 ? "hidden" : "visible";
    filmLage(f);

    E.boden.style.strokeDashoffset = 1 - strecke(.065, .115, p);
    for (var i = 0; i < kontur.length; i++) {
      var a = .1 + i / kontur.length * .13;
      kontur[i].style.strokeDashoffset = 1 - teil(a, a + .045, p);
    }
    E.mittel.style.opacity = teil(.2, .26, p);
    E.fein.style.opacity = teil(.25, .31, p) * .68;
    E.w1.style.opacity = teil(.075, .11, p) * (1 - teil(.255, .29, p));

    var q = strecke(.31, .55, p);
    if (mauerBereit) {
      gl.uniform1f(gp, q); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
      E.mauer.style.visibility = q > 0 && q < 1 ? "visible" : "hidden";
      E.tag.style.opacity = q >= 1 ? 1 : 0;
    } else {
      E.tag.style.opacity = q > 0 ? 1 : 0;
      E.tag.style.clipPath = "inset(" + (1 - q) * 100 + "% 0 0 0)";
    }
    E.w2.style.opacity = teil(.3, .34, p) * (1 - teil(.46, .5, p));
    E.linien.style.opacity = 1 - teil(.47, .56, p);
    E.linien.style.visibility = p > .56 ? "hidden" : "visible";

    E.dunkel.style.opacity = teil(.6, .7, p);
    E.l1.style.opacity = teil(.69, .73, p);
    E.l2.style.opacity = teil(.73, .78, p);
    E.l3.style.opacity = teil(.78, .84, p);
    E.w3.style.opacity = teil(.7, .74, p) * (1 - teil(.88, .91, p));
    E.umfeld.style.opacity = teil(.84, .94, p);
    var t = teil(.91, .97, p);
    E.ende.style.opacity = t; E.ende.style.visibility = t < .02 ? "hidden" : "visible";

    var k = 1 + .05 * teil(.5, .96, p);
    szene.style.transform = "translateX(-50%) scale(" + k.toFixed(4) + ")";
    kopf.classList.toggle("dunkelschrift", aktiv === 1 && p > .515 && p < .635);
  };
  var bilden = function () {
    laeuft = false;
    stand += (ziel - stand) * .13;
    if (Math.abs(ziel - stand) < .0004) stand = ziel; else { laeuft = true; requestAnimationFrame(bilden); }
    malen(stand);
  };
  var messen = function () {
    if (reduziert || aktiv !== 1) return;
    var r = ablauf.getBoundingClientRect(), weg = r.height - buehne.offsetHeight;
    var oben = parseFloat(getComputedStyle(buehne).top) || 0;
    ziel = Math.max(0, Math.min(1, (oben - r.top) / weg));
    if (!laeuft) { laeuft = true; requestAnimationFrame(bilden); }
  };
  var kopfGrund = function () { kopf.classList.toggle("fest", (aktiv === 1 ? ablauf : spiegel).getBoundingClientRect().bottom < 120); };

  // Film: läuft stumm los, „Ton an“ schaltet die Musik dazu, beim Wegscrollen wird sie leise
  var film = el("video"), tonKnopf = el(".ton"), haltKnopf = el(".halt");
  var sparen = navigator.connection && navigator.connection.saveData;
  var angehalten = !!(reduziert || sparen);
  var filmLaden = function () {
    if (film.getAttribute("src")) return;
    film.setAttribute("src", Math.max(window.innerWidth, window.innerHeight) > 1280 ? film.dataset.gross : film.dataset.klein);
  };
  var filmStart = function () {
    filmLaden();
    var v = film.play();
    if (v && v.catch) v.catch(function () { angehalten = true; knopfText(); });
  };
  var knopfText = function () { haltKnopf.textContent = angehalten ? "Film abspielen" : "Film anhalten"; tonKnopf.textContent = film.muted ? "Ton an" : "Ton aus"; };
  var filmLage = function (f) {
    var weg = f >= 1;
    if (weg !== filmWeg) { filmWeg = weg; if (weg) film.pause(); else if (!angehalten && aktiv === 1) filmStart(); }
    if (!film.muted) film.volume = Math.max(0, 1 - f);
  };
  haltKnopf.addEventListener("click", function () {
    angehalten = !angehalten;
    if (angehalten) film.pause(); else filmStart();
    knopfText();
  });
  tonKnopf.addEventListener("click", function () {
    film.muted = !film.muted;
    if (!film.muted) { film.volume = 1; angehalten = false; filmStart(); }
    knopfText();
  });

  var zeigen = function (n, erst) {
    aktiv = n;
    ablauf.hidden = n !== 1; spiegel.hidden = n !== 2;
    knoepfe.forEach(function (k) { k.setAttribute("aria-pressed", +k.dataset.wahl === n ? "true" : "false"); });
    if (!erst) {
      var a = new URL(window.location.href); a.searchParams.set("hero", n);
      try { history.replaceState(null, "", a.pathname + a.search); } catch (e) {}
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    kopf.classList.remove("fest", "dunkelschrift");
    if (n === 1) { stand = ziel = 0; if (!reduziert) malen(0); if (!angehalten) filmStart(); }
    else { film.pause(); spiegel.classList.remove("held--auf"); void spiegel.offsetWidth; spiegel.classList.add("held--auf"); }
  };

  if (!reduziert) { ablauf.classList.add("laeuft"); malen(0); mauerStart(); }
  knopfText();
  knoepfe.forEach(function (k) { k.addEventListener("click", function () { zeigen(+k.dataset.wahl); }); });
  var plan = false;
  var beimScrollen = function () {
    messen();
    if (!plan) { plan = true; requestAnimationFrame(function () { plan = false; kopfGrund(); }); }
  };
  window.addEventListener("scroll", beimScrollen, { passive: true });
  window.addEventListener("resize", function () { groesse(); beimScrollen(); });
  zeigen(new URLSearchParams(window.location.search).get("hero") === "2" ? 2 : 1, true);
  messen(); kopfGrund();
})();
