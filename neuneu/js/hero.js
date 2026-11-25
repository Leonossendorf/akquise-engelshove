/* Startseite: Film oben, darunter „Der Strich. Der Stein. Das Licht.“ Der Bildschirm bleibt stehen, das Scrollen treibt den Ablauf. */
(function () {
  "use strict";
  var reduziert = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var kopf = document.querySelector(".top");
  var ablauf = document.querySelector(".ablauf");
  var buehne = ablauf.querySelector(".held-buehne");
  var szene = ablauf.querySelector(".szene");
  var el = function (s) { return ablauf.querySelector(s); };
  var E = { film: el(".film-schicht"), tag: el(".e-tag"), mauer: el(".e-mauer"), linien: el(".e-linien"), boden: el(".boden"), mittel: el(".mittel"), fein: el(".fein"), dunkel: el(".e-dunkel"),
    l1: el(".l1"), l2: el(".l2"), l3: el(".l3"), umfeld: el(".e-umfeld"), w1: el(".w1"), w2: el(".w2"), w3: el(".w3"), ende: el(".ende"), wink: el(".wink") };
  var kontur = Array.prototype.slice.call(ablauf.querySelectorAll(".kontur path"));
  var aktiv = 1;
  var teil = function (a, b, p) { var t = Math.max(0, Math.min(1, (p - a) / (b - a))); return t * t * (3 - 2 * t); };
  var strecke = function (a, b, p) { return Math.max(0, Math.min(1, (p - a) / (b - a))); };

  // Reihenfolge der Linien: von unten nach oben. Der Film schiebt sich nach oben weg, darunter wächst die Zeichnung mit dem Scrollen nach;
  // das Dach und das Wort kommen erst, wenn der Film ganz weg ist.
  var rang = kontur.map(function () { return 0; }), rangMax = 1;
  try {
    var mitte = kontur.map(function (p) { var b = p.getBBox(); return b.y + b.height / 2; });
    var folge = kontur.map(function (_, i) { return i; }).sort(function (a, b) { return mitte[b] - mitte[a]; });
    folge.forEach(function (i, pos) { rang[i] = pos; });
    rangMax = Math.max(1, kontur.length - 1);
  } catch (e) { kontur.forEach(function (_, i) { rang[i] = i; }); rangMax = Math.max(1, kontur.length - 1); }

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
  var stand = 0, ziel = 0, laeuft = false, filmWeg = false, vorgeladen = false;
  // Der Film schiebt sich über ein Fünftel des Wegs langsam nach oben weg; darunter wächst die Zeichnung von unten mit.
  var malen = function (p) {
    var f = teil(0, .2, p);
    E.film.style.transform = "translate3d(0," + (-f * 101) + "%,0)";
    E.film.style.visibility = f >= 1 ? "hidden" : "visible";
    filmLage(f);
    if (E.wink) E.wink.classList.toggle("da", winkAn && p < .005);

    E.boden.style.strokeDashoffset = 1 - strecke(.01, .06, p);
    for (var i = 0; i < kontur.length; i++) {
      var a = .02 + rang[i] / rangMax * .2;
      kontur[i].style.strokeDashoffset = 1 - teil(a, a + .05, p);
    }
    E.mittel.style.opacity = teil(.28, .33, p);
    E.fein.style.opacity = teil(.31, .36, p) * .68;
    E.w1.style.opacity = teil(.23, .27, p) * (1 - teil(.36, .39, p));

    var q = strecke(.38, .6, p);
    if (mauerBereit) {
      gl.uniform1f(gp, q); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
      E.mauer.style.visibility = q > 0 && q < 1 ? "visible" : "hidden";
      E.tag.style.opacity = q >= 1 ? 1 : 0;
    } else {
      E.tag.style.opacity = q > 0 ? 1 : 0;
      E.tag.style.clipPath = "inset(" + (1 - q) * 100 + "% 0 0 0)";
    }
    E.w2.style.opacity = teil(.38, .42, p) * (1 - teil(.56, .6, p));
    E.linien.style.opacity = 1 - teil(.56, .64, p);
    E.linien.style.visibility = p > .64 ? "hidden" : "visible";

    E.dunkel.style.opacity = teil(.62, .78, p);   // langsamere Dämmerung (19.11.)
    E.l1.style.opacity = teil(.70, .76, p);
    E.l2.style.opacity = teil(.73, .80, p);
    E.l3.style.opacity = teil(.76, .83, p);
    E.w3.style.opacity = teil(.74, .79, p) * (1 - teil(.88, .9, p));
    E.umfeld.style.opacity = teil(.85, .9, p);
    // Zuhause steht ab 94 % und bleibt bis zum Ende des Wegs stehen, damit es wirken kann
    var t = teil(.9, .94, p);
    E.ende.style.opacity = t; E.ende.style.visibility = t < .02 ? "hidden" : "visible";
    E.ende.style.transform = "translate3d(0," + ((1 - t) * 28).toFixed(1) + "px,0)";

    var k = 1 + .05 * teil(.6, .94, p);
    szene.style.transform = "translateX(-50%) scale(" + k.toFixed(4) + ")";
    kopf.classList.toggle("dunkelschrift", aktiv === 1 && p > .59 && p < .7);

    // Die Bilder der Jahre schon entpacken, bevor sie dran sind: dann kommt das erste Bild scharf
    if (!vorgeladen && p > .7) {
      vorgeladen = true;
      Array.prototype.forEach.call(document.querySelectorAll(".k-jahre img, .k-wand img"), function (im) { if (im.decode) im.decode().catch(function () {}); });
    }
  };
  var bilden = function () {
    laeuft = false;
    stand += (ziel - stand) * .13;
    if (Math.abs(ziel - stand) < .0004) stand = ziel; else { laeuft = true; requestAnimationFrame(bilden); }
    malen(stand);
  };
  var erst = true;
  var messen = function () {
    if (reduziert || aktiv !== 1) return;
    var r = ablauf.getBoundingClientRect(), weg = r.height - buehne.offsetHeight;
    var oben = parseFloat(getComputedStyle(buehne).top) || 0;
    ziel = Math.max(0, Math.min(1, (oben - r.top) / weg));
    if (erst) { erst = false; stand = ziel; }   // beim Neuladen mitten auf der Seite sofort am richtigen Stand, ohne Anlauf
    if (!laeuft) { laeuft = true; requestAnimationFrame(bilden); }
  };
  var kopfGrund = function () { kopf.classList.toggle("fest", ablauf.getBoundingClientRect().bottom < 120); };

  // Film: läuft mit Ton los, wenn der Browser das erlaubt, sonst stumm. Der Film läuft einmal und bleibt stehen, danach lädt ein Hinweis zum Scrollen ein.
  // Feste Regeln (Leon 24.11.): „Film anhalten / abspielen“ schaltet nur den Film, „Ton an / aus“ nur den Ton, ein Tipp aufs laufende Bild
  // schaltet den Ton wie der Ton-Knopf. Sonst hält kein Tipp den Film an. Die Knöpfe zeigen immer, was der Film gerade wirklich tut
  // (abgelesen am Video selbst), nicht, was das Skript vorhatte.
  // Vorher kam der Ton bei der ersten Berührung der Seite (pointerdown): Auf dem Handy gilt das nicht als Erlaubnis, der Browser hielt den Film
  // dann an, und der Knopf zeigte weiter „Film anhalten“.
  var film = el("video"), tonKnopf = el(".ton"), haltKnopf = el(".halt");
  // Datensparmodus oder sehr langsames Netz (2G/3G): kein Film von selbst, das Standbild bleibt, der Knopf „Film abspielen“ startet ihn.
  var netz = navigator.connection || {};
  var sparen = !!netz.saveData || /(^|-)2g|3g/.test(netz.effectiveType || "");
  var angehalten = !!(reduziert || sparen);   // der Film soll stehen: vom Besucher angehalten, zu Ende gelaufen oder gar nicht erst gestartet
  var tonGewollt = !reduziert, winkAn = false;
  // Hochkant (Handy): eigener Hochkant-Film, rund 2 MB. Quer: 720p, auf großen Schirmen 1080p.
  var hoch = window.matchMedia && window.matchMedia("(max-aspect-ratio:4/5)").matches;
  var filmLaden = function () {
    if (film.getAttribute("src")) return;
    film.setAttribute("src", hoch && film.dataset.hoch ? film.dataset.hoch : Math.max(window.innerWidth, window.innerHeight) > 1280 ? film.dataset.gross : film.dataset.klein);
  };
  var steht = function () { return film.getAttribute("src") ? film.paused || film.ended : angehalten; };   // vor dem Laden zählt die Absicht
  var knopfText = function () {
    var h = film.ended ? "Film noch einmal" : steht() ? "Film abspielen" : "Film anhalten", t = film.muted ? "Ton an" : "Ton aus";
    if (haltKnopf.textContent !== h) haltKnopf.textContent = h;
    if (tonKnopf.textContent !== t) tonKnopf.textContent = t;
  };
  var wink = function (an) { winkAn = an; if (E.wink) E.wink.classList.toggle("da", an && stand < .01); };
  var laut = function () { var f = teil(0, .2, stand); return isFinite(f) ? Math.min(1, Math.max(0, 1 - f)) : 1; };
  var stummWeiter = function () {   // Ton (noch) nicht erlaubt: der Film läuft stumm, der Wunsch nach Ton bleibt für später gemerkt
    film.muted = true;
    var v = film.play(); if (v && v.catch) v.catch(knopfText);
    knopfText();
  };
  var filmStart = function () {
    filmLaden();
    if (film.ended) film.currentTime = 0;
    wink(false);
    film.muted = !tonGewollt;
    if (!film.muted) film.volume = laut();
    var v = film.play();
    if (v && v.catch) v.catch(function () { if (film.muted) knopfText(); else stummWeiter(); });   // selbst stumm nicht erlaubt (Stromsparmodus): Standbild und „Film abspielen“
    knopfText();
  };
  var sollLaufen = function () { return !angehalten && !filmWeg && aktiv === 1 && !document.hidden; };
  var tonSchalten = function () {
    var an = film.muted;
    tonGewollt = an; film.muted = !an;
    if (an) film.volume = laut();
    knopfText();
    // Sicherung: hält der Browser den Film beim Einschalten des Tons doch an, läuft er stumm weiter statt stehen zu bleiben
    if (an) setTimeout(function () { if (sollLaufen() && film.paused && !film.ended) stummWeiter(); }, 80);
  };
  var filmLage = function (f) {
    var weg = f >= 1;
    if (weg !== filmWeg) { filmWeg = weg; if (weg) film.pause(); else if (sollLaufen()) filmStart(); }
    if (!film.muted && isFinite(f)) film.volume = Math.min(1, Math.max(0, 1 - f));
  };
  ["play", "playing", "pause", "volumechange", "emptied"].forEach(function (n) { film.addEventListener(n, knopfText); });
  film.addEventListener("ended", function () { angehalten = true; knopfText(); wink(true); });
  haltKnopf.addEventListener("click", function () {
    if (steht()) { angehalten = false; filmStart(); } else { angehalten = true; film.pause(); knopfText(); }
  });
  tonKnopf.addEventListener("click", tonSchalten);
  E.film.addEventListener("click", function (e) {   // Tipp aufs laufende Bild: Ton an oder aus. Links und Knöpfe machen nur ihr Eigenes.
    if (e.target.closest("a,button") || film.paused || film.ended || filmWeg) return;
    tonSchalten();
  });
  // Zurück im Fenster oder aus dem Verlauf: Hat der Browser den Film von sich aus angehalten, läuft er weiter
  var bereit = false;
  var wieder = function () { if (bereit && sollLaufen() && film.paused && !film.ended) filmStart(); else knopfText(); };
  document.addEventListener("visibilitychange", wieder);
  window.addEventListener("pageshow", function (e) { if (e.persisted) wieder(); });

  if (!reduziert) { ablauf.classList.add("laeuft"); malen(0); mauerStart(); }
  knopfText();
  var plan = false;
  var beimScrollen = function () {
    messen();
    if (!plan) { plan = true; requestAnimationFrame(function () { plan = false; kopfGrund(); }); }
  };
  window.addEventListener("scroll", beimScrollen, { passive: true });
  window.addEventListener("resize", function () { groesse(); beimScrollen(); });
  // Der Film kommt zuletzt: erst wenn Seite, Schrift und Standbild da sind, damit er im Mobilnetz nichts ausbremst.
  // Die Bilder der Licht-Szene (Tagbild, Abendbild, Lichter) liegen unter dem Film und werden erst beim Scrollen sichtbar. Sie stehen im HTML
  // nur als data-src und laden kurz nach dem Start oder bei der ersten Berührung. Grund (Leon 25.11.): Lagen sie gleich im HTML, wertete
  // Googles PageSpeed je nach Lauf eines von ihnen oder die Überschrift als „größtes Element“, die Wertung schwankte zwischen 81 und 96.
  var szeneDa = false;
  var szeneLaden = function () {
    if (szeneDa) return; szeneDa = true;
    Array.prototype.forEach.call(ablauf.querySelectorAll("img[data-src]"), function (b) {
      if (b.dataset.srcset) b.setAttribute("srcset", b.dataset.srcset);
      b.setAttribute("src", b.dataset.src);
    });
  };
  if (reduziert) szeneLaden();
  else ["scroll", "wheel", "touchstart", "pointerdown", "keydown"].forEach(function (n) { window.addEventListener(n, szeneLaden, { passive: true, once: true }); });
  var filmLos = function () { setTimeout(szeneLaden, 2500); setTimeout(function () { bereit = true; if (sollLaufen() && film.paused) filmStart(); }, 150); };
  if (document.readyState === "complete") filmLos(); else window.addEventListener("load", filmLos);
  // Wer keinen Film sieht, bekommt den Hinweis nach ein paar Sekunden
  setTimeout(function () { if (film.paused) wink(true); }, 8000);
  messen(); kopfGrund();
})();
