/* Startseite: Dialoge für "Alles aus einer Hand" und das Team. Läuft auch ohne Bewegung. */
(function () {
  "use strict";
  var alle = function (w, s) { return Array.prototype.slice.call(w.querySelectorAll(s)); };
  var oeffnen = function (d) { if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", ""); document.documentElement.classList.add("dialog-auf"); };
  var zu = function (d) { if (d.open && typeof d.close === "function") d.close(); else d.removeAttribute("open"); document.documentElement.classList.remove("dialog-auf"); };
  alle(document, "dialog").forEach(function (d) {
    var k = d.querySelector(".d-zu"); if (k) k.addEventListener("click", function () { zu(d); });
    d.addEventListener("click", function (e) { if (e.target === d) zu(d); });
    d.addEventListener("close", function () { document.documentElement.classList.remove("dialog-auf"); });
  });

  // Aus einer Hand
  var hd = document.getElementById("hd-dialog"), daten = document.getElementById("hd-daten");
  if (hd && daten) {
    var D = JSON.parse(daten.textContent), akt = 0;
    var bild = hd.querySelector(".hd-d-bild"), plan = hd.querySelector(".plan"), h3 = hd.querySelector("h3"), x = hd.querySelector(".hd-d-x");
    var zeig = function (i) {
      akt = (i + D.length) % D.length; var d = D[akt];
      bild.innerHTML = d.b.replace('loading="lazy"', ""); plan.textContent = d.g + " · Schritt " + (akt + 1) + " von " + D.length; h3.textContent = d.t; x.textContent = d.x;
    };
    alle(document, ".hd-k").forEach(function (b) { b.addEventListener("click", function () { zeig(parseInt(b.dataset.i, 10)); oeffnen(hd); }); });
    hd.querySelector(".hd-d-vor").addEventListener("click", function () { zeig(akt - 1); });
    hd.querySelector(".hd-d-weiter").addEventListener("click", function () { zeig(akt + 1); });
    hd.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") zeig(akt + 1); if (e.key === "ArrowLeft") zeig(akt - 1); });
  }

  // Team
  var tu = document.getElementById("tu-dialog");
  if (tu) {
    var tb = tu.querySelector(".tu-d-bild"), tp = tu.querySelector(".plan"), th = tu.querySelector("h3"), tr = tu.querySelector(".tu-d-rolle");
    alle(document, ".tu-p").forEach(function (b) {
      b.addEventListener("click", function () {
        tb.innerHTML = b.dataset.bild ? '<img src="' + b.dataset.bild + '" alt="">' : '<span class="tu-leer"></span>';
        tp.textContent = b.dataset.bereich; th.textContent = b.dataset.name; tr.textContent = b.dataset.rolle; oeffnen(tu);
      });
    });
    // Gesichter erscheinen nacheinander
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (e) { e.forEach(function (y) { if (y.isIntersecting) { y.target.classList.add("da"); io.unobserve(y.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
      alle(document, ".tu-grid li, .tu-chefs li").forEach(function (li, i) { li.style.transitionDelay = (i % 6) * 60 + "ms"; io.observe(li); });
    } else alle(document, ".tu-grid li, .tu-chefs li").forEach(function (li) { li.classList.add("da"); });
  }
})();
