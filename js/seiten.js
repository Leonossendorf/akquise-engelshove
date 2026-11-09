/* Galerie (gemischte Reihenfolge, Diashow, Musik) und Stil-Seite (Beispiele aufklappen). */
(function () {
  "use strict";
  var alle = function (w, s) { return Array.prototype.slice.call(w.querySelectorAll(s)); };

  var strom = document.querySelector(".gal-strom");
  if (strom) {
    // Die Highlights am Anfang bleiben in ihrer Reihenfolge, der Rest wird bei jedem Besuch neu gemischt
    var start = alle(strom, ".gal-b.start"), rest = alle(strom, ".gal-b:not(.start)");
    for (var i = rest.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = rest[i]; rest[i] = rest[j]; rest[j] = t; }
    var figs = start.concat(rest); figs.forEach(function (f) { strom.appendChild(f); });
    var musik = document.querySelector(".gal-musik"), audio = document.querySelector(".gal-audio"), auto = document.querySelector(".gal-auto"), zaehler = document.querySelector(".gal-zaehler"), lauf = null;
    var aktuell = function () {
      var m = window.innerHeight / 2, best = 0, bd = 1e9;
      figs.forEach(function (f, i) { var r = f.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - m); if (d < bd) { bd = d; best = i; } });
      return best;
    };
    var geh = function (i) { i = Math.max(0, Math.min(figs.length - 1, i)); figs[i].scrollIntoView({ behavior: "smooth", block: "center" }); };
    var stopp = function () { if (lauf) { clearInterval(lauf); lauf = null; auto.setAttribute("aria-pressed", "false"); } };
    auto.addEventListener("click", function () {
      if (lauf) return stopp();
      auto.setAttribute("aria-pressed", "true");
      geh(aktuell() + 1); lauf = setInterval(function () { var a = aktuell(); if (a >= figs.length - 1) return stopp(); geh(a + 1); }, 5200);
    });
    musik.addEventListener("click", function () {
      if (audio.paused) { audio.volume = .55; audio.play().then(function () { musik.setAttribute("aria-pressed", "true"); }).catch(function () {}); }
      else { audio.pause(); musik.setAttribute("aria-pressed", "false"); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); stopp(); geh(aktuell() + 1); }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); stopp(); geh(aktuell() - 1); }
    });
    ["wheel", "touchstart"].forEach(function (ev) { strom.addEventListener(ev, stopp, { passive: true }); });
    var zeig = function (f) { var im = f.querySelector(".gal-bild"); if (im.complete && im.naturalWidth) f.classList.add("da"); else im.addEventListener("load", function () { f.classList.add("da"); }); };
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (e) { e.forEach(function (y) { if (y.isIntersecting) { zeig(y.target); } }); }, { rootMargin: "20% 0px 20% 0px" });
      figs.forEach(function (f) { io.observe(f); });
    } else figs.forEach(zeig);
    var zaehlen = function () { zaehler.textContent = (aktuell() + 1) + " / " + figs.length; };
    window.addEventListener("scroll", zaehlen, { passive: true }); zaehlen();
    // Die Diashow läuft von selbst los; wer selbst scrollt, übernimmt. Musik startet mit der ersten Berührung, solange sie nicht abgeschaltet wurde.
    var starte = function () { if (!lauf && !document.hidden) { auto.setAttribute("aria-pressed", "true"); lauf = setInterval(function () { var a = aktuell(); if (a >= figs.length - 1) return stopp(); geh(a + 1); }, 5200); } };
    setTimeout(starte, 2600);
    var musikAus = false; musik.addEventListener("click", function () { musikAus = !audio.paused ? false : true; });
    var erste = function () { if (!musikAus && audio.paused) { audio.volume = .55; audio.play().then(function () { musik.setAttribute("aria-pressed", "true"); }).catch(function () {}); } };
    ["pointerdown", "keydown", "touchstart"].forEach(function (ev) { window.addEventListener(ev, erste, { once: true, passive: true }); });
  }

  // Bewerbung: die Person in der Mitte des Bildschirms wird farbig
  var kb = alle(document, ".kb-liste li");
  if (kb.length && "IntersectionObserver" in window) {
    var iok = new IntersectionObserver(function (e) { e.forEach(function (y) { y.target.classList.toggle("nah", y.isIntersecting); }); }, { rootMargin: "-22% 0px -22% 0px", threshold: .2 });
    kb.forEach(function (li) { iok.observe(li); });
  } else kb.forEach(function (li) { li.classList.add("nah"); });

  alle(document, ".stil-kopf").forEach(function (k) {
    k.addEventListener("click", function () {
      var m = k.parentNode.querySelector(".stil-mehr"), auf = k.getAttribute("aria-expanded") === "true";
      alle(document, ".stil-kopf").forEach(function (x) { x.setAttribute("aria-expanded", "false"); x.parentNode.querySelector(".stil-mehr").hidden = true; x.parentNode.classList.remove("auf"); });
      if (!auf) { k.setAttribute("aria-expanded", "true"); m.hidden = false; k.parentNode.classList.add("auf"); setTimeout(function () { m.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 50); }
    });
  });
})();
