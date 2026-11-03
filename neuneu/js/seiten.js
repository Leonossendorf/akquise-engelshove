/* Galerie (gemischte Reihenfolge, Diashow, Musik) und Stil-Seite (Beispiele aufklappen). */
(function () {
  "use strict";
  var alle = function (w, s) { return Array.prototype.slice.call(w.querySelectorAll(s)); };

  var strom = document.querySelector(".gal-strom");
  if (strom) {
    // Bei jedem Besuch neu gemischt
    var figs = alle(strom, ".gal-b");
    for (var i = figs.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = figs[i]; figs[i] = figs[j]; figs[j] = t; }
    figs.forEach(function (f) { strom.appendChild(f); });
    var musik = document.querySelector(".gal-musik"), audio = document.querySelector(".gal-audio"), auto = document.querySelector(".gal-auto"), lauf = null;
    var aktuell = function () {
      var m = window.innerHeight / 2, best = 0, bd = 1e9;
      figs.forEach(function (f, i) { var r = f.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - m); if (d < bd) { bd = d; best = i; } });
      return best;
    };
    var geh = function (i) { i = Math.max(0, Math.min(figs.length - 1, i)); figs[i].scrollIntoView({ behavior: "smooth", block: "center" }); };
    var stopp = function () { if (lauf) { clearInterval(lauf); lauf = null; auto.textContent = "Diashow"; auto.setAttribute("aria-pressed", "false"); } };
    auto.addEventListener("click", function () {
      if (lauf) return stopp();
      auto.textContent = "Diashow läuft"; auto.setAttribute("aria-pressed", "true");
      geh(aktuell() + 1); lauf = setInterval(function () { var a = aktuell(); if (a >= figs.length - 1) return stopp(); geh(a + 1); }, 5200);
    });
    musik.addEventListener("click", function () {
      if (audio.paused) { audio.volume = .7; audio.play().then(function () { musik.textContent = "Musik aus"; }).catch(function () {}); }
      else { audio.pause(); musik.textContent = "Musik an"; }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); stopp(); geh(aktuell() + 1); }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); stopp(); geh(aktuell() - 1); }
    });
    ["wheel", "touchstart"].forEach(function (ev) { strom.addEventListener(ev, stopp, { passive: true }); });
    // Bilder werden sichtbar, sobald sie geladen sind
    figs.forEach(function (f) { var im = f.querySelector("img"); if (im.complete) f.classList.add("da"); else im.addEventListener("load", function () { f.classList.add("da"); }); });
  }

  alle(document, ".stil-kopf").forEach(function (k) {
    k.addEventListener("click", function () {
      var m = k.parentNode.querySelector(".stil-mehr"), auf = k.getAttribute("aria-expanded") === "true";
      alle(document, ".stil-kopf").forEach(function (x) { x.setAttribute("aria-expanded", "false"); x.parentNode.querySelector(".stil-mehr").hidden = true; x.parentNode.classList.remove("auf"); });
      if (!auf) { k.setAttribute("aria-expanded", "true"); m.hidden = false; k.parentNode.classList.add("auf"); setTimeout(function () { m.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 50); }
    });
  });
})();
