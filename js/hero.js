/* Startseite: Umschalter zwischen den drei Hero-Entwürfen, Ablauf „Das Licht geht an“, Film. */
(function () {
  "use strict";
  var reduziert = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var helden = Array.prototype.slice.call(document.querySelectorAll(".held"));
  var knoepfe = Array.prototype.slice.call(document.querySelectorAll(".umschalter [data-wahl]"));
  var kopf = document.querySelector(".top");
  var aktiv = 1;

  // Ablauf: Strich, Tag, Dämmerung ohne Licht, Lichter nacheinander, Umgebung fällt ins Schwarze
  var licht = document.querySelector(".held--licht");
  var buehne = licht.querySelector(".held-buehne");
  var el = function (s) { return licht.querySelector(s); };
  var E = { tag: el(".e-tag"), linien: el(".e-linien"), dunkel: el(".e-dunkel"), l1: el(".l1"), l2: el(".l2"), l3: el(".l3"), umfeld: el(".e-umfeld"), text: el(".held-text"), blick: el(".held-blick") };
  var teil = function (a, b, p) { var t = Math.max(0, Math.min(1, (p - a) / (b - a))); return t * t * (3 - 2 * t); };
  var stand = 0, ziel = 0, laeuft = false;
  var malen = function (p) {
    E.tag.style.opacity = teil(.05, .28, p);
    E.linien.style.opacity = 1 - teil(.2, .36, p);
    E.dunkel.style.opacity = teil(.34, .56, p);
    E.l1.style.opacity = teil(.54, .62, p);
    E.l2.style.opacity = teil(.61, .71, p);
    E.l3.style.opacity = teil(.69, .81, p);
    E.umfeld.style.opacity = teil(.76, .95, p);
    var t = Math.max(1 - teil(.02, .1, p), teil(.86, .97, p));
    E.text.style.opacity = t; E.text.style.visibility = t < .02 ? "hidden" : "visible";
    E.blick.style.opacity = 1 - teil(.01, .05, p);
    kopf.classList.toggle("dunkelschrift", aktiv === 1 && p > .16 && p < .44);
  };
  var bilden = function () {
    laeuft = false;
    stand += (ziel - stand) * .14;
    if (Math.abs(ziel - stand) < .0006) stand = ziel; else { laeuft = true; requestAnimationFrame(bilden); }
    malen(stand);
  };
  var messen = function () {
    if (reduziert || aktiv !== 1) return;
    var r = licht.getBoundingClientRect(), weg = r.height - buehne.offsetHeight;
    var oben = parseFloat(getComputedStyle(buehne).top) || 0;
    ziel = Math.max(0, Math.min(1, (oben - r.top) / weg));
    if (!laeuft) { laeuft = true; requestAnimationFrame(bilden); }
  };

  // Kopf bekommt nach dem Hero einen festen Grund
  var kopfGrund = function () { kopf.classList.toggle("fest", helden[aktiv - 1].getBoundingClientRect().bottom < 120); };

  // Film: Datei wird erst geladen, wenn der Entwurf gewählt ist
  var film = document.querySelector(".held--film video");
  var filmKnopf = document.querySelector(".held--film .held-knopf");
  var sparen = navigator.connection && navigator.connection.saveData;
  var filmLaden = function () {
    if (film.getAttribute("src")) return;
    film.setAttribute("poster", film.dataset.bild);
    var scharf = Math.max(window.innerWidth, window.innerHeight) > 1280;
    film.setAttribute("src", scharf ? film.dataset.gross : film.dataset.klein);
  };
  var filmStart = function () {
    filmLaden();
    var v = film.play();
    if (v && v.catch) v.catch(function () { filmKnopf.textContent = "Film abspielen"; });
  };
  filmKnopf.addEventListener("click", function () {
    if (film.paused) { filmStart(); filmKnopf.textContent = "Film anhalten"; }
    else { film.pause(); filmKnopf.textContent = "Film abspielen"; }
  });
  if (reduziert || sparen) filmKnopf.textContent = "Film abspielen";

  var zeigen = function (n, erst) {
    aktiv = n;
    helden.forEach(function (h, i) { h.hidden = i !== n - 1; });
    knoepfe.forEach(function (k) { k.setAttribute("aria-pressed", +k.dataset.wahl === n ? "true" : "false"); });
    if (!erst) {
      var a = new URL(window.location.href); a.searchParams.set("hero", n);
      try { history.replaceState(null, "", a.pathname + a.search); } catch (e) {}
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    kopf.classList.remove("fest", "dunkelschrift");
    if (n === 3) { if (reduziert || sparen) film.setAttribute("poster", film.dataset.bild); else filmStart(); } else film.pause();
    if (n === 1) {
      if (!reduziert) {
        stand = ziel = 0; malen(0);
        E.linien.classList.remove("zeichnen"); void E.linien.getBoundingClientRect(); E.linien.classList.add("zeichnen");
      }
    } else {
      var h = helden[n - 1];
      h.classList.remove("held--auf"); void h.offsetWidth; h.classList.add("held--auf");
    }
  };

  if (!reduziert) { licht.classList.add("laeuft"); malen(0); }
  knoepfe.forEach(function (k) { k.addEventListener("click", function () { zeigen(+k.dataset.wahl); }); });
  var plan = false;
  var beimScrollen = function () {
    messen();
    if (!plan) { plan = true; requestAnimationFrame(function () { plan = false; kopfGrund(); }); }
  };
  window.addEventListener("scroll", beimScrollen, { passive: true });
  window.addEventListener("resize", beimScrollen);
  var w = +new URLSearchParams(window.location.search).get("hero");
  zeigen(w >= 1 && w <= 3 ? w : 1, true);
  messen(); kopfGrund();
})();
