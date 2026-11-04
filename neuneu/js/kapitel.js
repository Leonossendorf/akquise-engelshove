/* Startseite: Kapitel unter dem Hero. Jedes Kapitel bekommt seinen Fortschritt p von 0 bis 1, weich nachgezogen. */
(function () {
  "use strict";
  if (!document.documentElement.classList.contains("bewegt")) return;
  var alle = function (w, s) { return Array.prototype.slice.call(w.querySelectorAll(s)); };
  var teil = function (a, b, p) { var t = Math.max(0, Math.min(1, (p - a) / (b - a))); return t * t * (3 - 2 * t); };
  var strecke = function (a, b, p) { return Math.max(0, Math.min(1, (p - a) / (b - a))); };

  var K = {
    jahre: function (el) {
      var bilder = alle(el, ".jb"), txt = alle(el, ".jt li"), st = alle(el, ".st i");
      var stops = [[.1, 1994], [.28, 2000], [.52, 2012], [.76, 2026]];
      var wert = function (p) {
        var v = 1994;
        for (var i = 1; i < stops.length; i++) v += (stops[i][1] - stops[i - 1][1]) * teil(stops[i - 1][0] + .07, stops[i][0] + .07, p);
        return v;
      };
      return function (p) {
        var v = wert(p), rest = v;
        // Zählwerk: rechts läuft durch, die Stelle davor rollt erst beim Übertrag
        [1000, 100, 10, 1].forEach(function (b, i) {
          var d = Math.floor(v / b) % 10, ueber = b === 1 ? v % 1 : Math.max(0, (v % b) - (b - 1));
          st[i].style.transform = "translate3d(0," + (-(d + ueber) * 9.0909).toFixed(3) + "%,0)";
        });
        var sb = [0, .24, .48, .72];
        // Nur die Bilder, die gerade zu sehen sind, liegen auf dem Bildschirm. So bleibt die Zahl ganz und nichts flackert.
        bilder.forEach(function (b, i) {
          var a = sb[i], o = i === 0 ? teil(0, .08, p) : teil(a, a + .1, p);
          if (i < bilder.length - 1 && p > sb[i + 1] + .1) o = 0;
          b.style.opacity = o; b.style.visibility = o > 0 ? "visible" : "hidden";
          if (o > 0) b.firstElementChild.style.transform = "scale(" + (1.14 - .14 * strecke(a - .05, a + .34, p)).toFixed(4) + ")";
        });
        txt.forEach(function (t, i) {
          var a = sb[i] + .03, o = teil(a, a + .06, p) * (i === 3 ? 1 : 1 - teil(sb[i + 1], sb[i + 1] + .05, p));
          t.style.opacity = o; t.style.transform = "translate3d(0," + (1 - teil(a, a + .08, p)) * 26 + "px,0)";
        });
      };
    },
    wand: function (el) {
      var w = el.querySelector(".wand"), dunkel = el.querySelector(".wand-dunkel"), text = el.querySelector(".wand-text"), zahl = el.querySelector(".wand-zahl"), mitte = el.querySelector(".wand-mitte");
      return function (p) {
        var t = teil(.1, .78, p), s = Math.pow(14, 1 - t), r = w.getBoundingClientRect;
        // Mitte der Kachel liegt zu Beginn in der Bildmitte, am Ende an ihrem Platz in der Wand
        w.style.transform = "translate(-50%,-50%) translate(" + (-3.571 * (1 - t)).toFixed(3) + "%," + (-6.25 * (1 - t)).toFixed(3) + "%) scale(" + s.toFixed(4) + ")";
        dunkel.style.opacity = .68 * teil(.52, .82, p);
        text.style.opacity = teil(.46, .6, p);
        var n = Math.round(800 * Math.pow(strecke(.46, .86, p), 1.6));
        zahl.textContent = n >= 800 ? "800+" : String(Math.max(1, n));
      };
    },
    haeuser: function (el) {
      var kopf = el.querySelector(".h-kopf"), te = alle(el, ".h-teil"), mehr = el.querySelector(".h-mehr"), leiste = alle(el, ".h-leiste i"), n = te.length, s = .08, slot = (1 - s - .04) / n;
      return function (p) {
        kopf.style.opacity = 1 - teil(.03, .09, p);
        te.forEach(function (x, i) {
          var a = s + i * slot, q = strecke(a, a + slot, p), rein = i === 0 ? teil(.02, .09, p) : teil(a, a + slot * .3, p);
          var sicht = p >= a - slot * .2 && p < a + slot * 2.2;
          x.style.visibility = sicht || i === n - 1 ? "visible" : "hidden";
          if (!sicht && i !== n - 1) return;
          x.style.opacity = rein; x.style.pointerEvents = rein > .5 ? "auto" : "none";
          x.firstElementChild.style.transform = "scale(" + (1.12 - .12 * q).toFixed(4) + ")";
          var name = x.querySelector(".h-name"); name.style.opacity = teil(.18, .4, q) * (i === n - 1 ? 1 : 1 - teil(.9, 1, q)); name.style.transform = "translate3d(0," + ((1 - teil(.18, .45, q)) * 24).toFixed(1) + "px,0)";
          if (leiste[i]) leiste[i].style.transform = "scaleX(" + q.toFixed(3) + ")";
        });
        mehr.style.opacity = teil(.9, .97, p);
      };
    },
    hand: function (el) {
      var reihe = el.querySelector(".hd-reihe"), kopf = el.querySelector(".hd-kopf"), lauf = el.querySelector(".hd-lauf i"), st = el.querySelector(".k-stage");
      var weg = 0, mess = function () { weg = Math.max(0, reihe.scrollWidth - st.clientWidth); };
      mess(); window.addEventListener("resize", mess); window.addEventListener("load", mess);
      return function (p) {
        var t = strecke(.1, .94, p);
        reihe.style.transform = "translate3d(" + (-weg * t).toFixed(1) + "px,0,0)";
        kopf.style.opacity = 1 - teil(.86, .94, p);
        lauf.style.transform = "scaleX(" + t.toFixed(4) + ")";
      };
    },
    umbau: function (el) {
      var vor = el.querySelector(".u-vor"), linie = el.querySelector(".u-linie"), st = el.querySelector(".k-stage");
      var a = el.querySelector(".u-wort.a"), b = el.querySelector(".u-wort.b");
      return function (p) {
        var t = teil(.16, .82, p), x = (1 - t) * 100;
        vor.style.clipPath = "inset(0 " + (100 - x).toFixed(2) + "% 0 0)";
        linie.style.transform = "translate3d(" + (x / 100 * st.clientWidth).toFixed(1) + "px,0,0)";
        linie.style.opacity = t > .001 && t < .999 ? 1 : 0;
        a.style.opacity = 1 - teil(.5, .7, p); b.style.opacity = teil(.3, .5, p);
      };
    },
    bauen: function (el) {
      var bild = el.querySelector(".b-bild img"), ph = alle(el, ".ph"), n = ph.length;
      return function (p) {
        bild.style.transform = "scale(" + (1.34 - .34 * p).toFixed(4) + ")";
        ph.forEach(function (x, i) {
          var a = .06 + i * .3, o = teil(a, a + .07, p) * (i === n - 1 ? 1 : 1 - teil(a + .24, a + .3, p));
          x.style.opacity = o; x.style.transform = "translate3d(0," + (1 - teil(a, a + .1, p)) * 34 + "px,0)";
        });
      };
    },
    presse: function (el) {
      var r = el.querySelector(".ring"), li = el.querySelector(".note-linie i"), z = el.querySelector(".note-zahl"), note = el.querySelector(".p-note"), high = el.querySelector(".p-high");
      return function (p) {
        r.style.transform = "rotate(" + (28 - 56 * p).toFixed(3) + "deg)";
        var t = teil(.2, .8, p); li.style.transform = "scaleX(" + t.toFixed(4) + ")"; z.textContent = (t * 4.9).toFixed(1).replace(".", ","); note.style.opacity = teil(.12, .26, p);
        if (high) { var h = teil(.06, .3, p); high.style.opacity = h; high.style.transform = "translate3d(0," + ((1 - h) * 40).toFixed(1) + "px,0) scale(" + (.94 + .06 * h).toFixed(4) + ")"; }
      };
    }
  };

  var liste = alle(document, ".k[data-k]").map(function (el) {
    return { el: el, st: el.querySelector(".k-stage"), fn: K[el.dataset.k](el), stand: 0, ziel: 0 };
  });
  var laeuft = false;
  var schritt = function () {
    laeuft = false;
    liste.forEach(function (k) {
      if (k.stand === k.ziel) return;
      k.stand += (k.ziel - k.stand) * .15;
      if (Math.abs(k.ziel - k.stand) < .0004) k.stand = k.ziel; else laeuft = true;
      k.fn(k.stand);
    });
    if (laeuft) requestAnimationFrame(schritt);
  };
  var erst = true;
  var messen = function () {
    var h = window.innerHeight;
    liste.forEach(function (k) {
      var r = k.el.getBoundingClientRect();
      if (r.bottom < -h || r.top > h * 2) { if (r.bottom < -h && k.ziel !== 1) { k.ziel = 1; } else if (r.top > h * 2 && k.ziel !== 0) { k.ziel = 0; } return; }
      var weg = r.height - k.st.offsetHeight, oben = parseFloat(getComputedStyle(k.st).top) || 0;
      k.ziel = Math.max(0, Math.min(1, (oben - r.top) / weg));
    });
    // Beim Neuladen mitten auf der Seite steht jedes Kapitel sofort richtig, statt von vorn anzulaufen
    if (erst) { erst = false; liste.forEach(function (k) { k.stand = k.ziel; k.fn(k.stand); }); }
    if (!laeuft) { laeuft = true; requestAnimationFrame(schritt); }
  };
  liste.forEach(function (k) { k.fn(0); });
  window.addEventListener("scroll", messen, { passive: true });
  window.addEventListener("resize", messen);
  messen();

  // Große Wörter erscheinen, wenn sie ins Bild kommen
  var io = new IntersectionObserver(function (e) { e.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("sichtbar"); io.unobserve(x.target); } }); }, { rootMargin: "0px 0px -10% 0px" });
  alle(document, ".ins-bild").forEach(function (x, i) { x.style.transitionDelay = (i % 4) * 70 + "ms"; io.observe(x); });
})();
