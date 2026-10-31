/* Engelshove Bau – Entwurf. Kein Tracking, keine externen Dienste. Formulare verschicken nichts. */
(function () {
  "use strict";
  var reduziert = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Sanftes Einblenden beim Scrollen (Abschnitte, Karten, Kacheln, Phasen)
  var ziele = document.querySelectorAll("body:not(.start) .abschnitt .wrap > *, body:not(.start) .karte, body:not(.start) .phase, body:not(.start) .presse-liste li, body:not(.start) .team-gross li, body:not(.start) .g-item, body:not(.start) .kopf .wrap > *");
  if (!reduziert) {
    var offen = [];
    ziele.forEach(function (el, i) { el.classList.add("einblenden"); el.style.setProperty("--verz", ((i % 6) * 70) + "ms"); offen.push(el); });
    var pruefen = function () {
      var h = window.innerHeight || document.documentElement.clientHeight;
      offen = offen.filter(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < h * 0.94 && r.bottom > 0) { el.classList.add("sichtbar"); return false; }
        return true;
      });
      if (!offen.length) { window.removeEventListener("scroll", geplant); window.removeEventListener("resize", geplant); }
    };
    var tick = false;
    var geplant = function () { if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; pruefen(); }); } };
    window.addEventListener("scroll", geplant, { passive: true });
    window.addEventListener("resize", geplant);
    pruefen(); setTimeout(pruefen, 300); setTimeout(pruefen, 1500);
    // Sicherheitsnetz: nach kurzer Zeit alles zeigen, was noch nicht gezeigt wurde und im Bild ist; Rest beim Scrollen
    setTimeout(function () { if (document.hidden) offen.forEach(function (el) { el.classList.add("sichtbar"); }); }, 2500);
  }

  // Menü am Handy
  var mb = document.querySelector(".menu-btn"), nav = document.querySelector(".nav");
  if (mb && nav) {
    mb.addEventListener("click", function () {
      var offen = nav.classList.toggle("offen");
      mb.setAttribute("aria-expanded", offen ? "true" : "false");
    });
  }

  // Satellitenkarte: Punkt zeigt Bild und Text
  var sat = document.querySelector("[data-sat]");
  if (sat) {
    var si = sat.querySelector(".sat-info"), simg = si.querySelector("img"), sh = si.querySelector("h3"), sp = si.querySelector("p");
    sat.querySelectorAll(".sat-pkt,.sat-weit").forEach(function (b) {
      var waehlen = function () {
        sat.querySelectorAll(".sat-pkt,.sat-weit").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        simg.src = b.dataset.bild; sh.textContent = b.dataset.titel; sp.textContent = b.dataset.text;
      };
      b.addEventListener("click", waehlen); b.addEventListener("mouseenter", waehlen);
    });
  }

  // Projektfilter
  var filter = document.querySelector("[data-filter]");
  if (filter) {
    var karten = Array.prototype.slice.call(document.querySelectorAll("[data-art]"));
    var treffer = document.querySelector(".treffer");
    var aktiv = { art: "alle", ort: "alle" };
    var anwenden = function () {
      var n = 0;
      karten.forEach(function (k) {
        var ok = (aktiv.art === "alle" || k.dataset.art === aktiv.art) && (aktiv.ort === "alle" || k.dataset.ort === aktiv.ort);
        k.hidden = !ok; if (ok) n++;
      });
      if (treffer) treffer.textContent = n === 1 ? "1 Projekt" : n + " Projekte";
    };
    filter.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-wert]"); if (!b) return;
      var gruppe = b.dataset.gruppe;
      filter.querySelectorAll('button[data-gruppe="' + gruppe + '"]').forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", "true");
      aktiv[gruppe] = b.dataset.wert; anwenden();
    });
    // Ort aus der Karte oder aus dem Link (#ort=rheine)
    var h = location.hash.match(/ort=([a-z-]+)/);
    if (h) { var btn = filter.querySelector('button[data-gruppe="ort"][data-wert="' + h[1] + '"]'); if (btn) btn.click(); }
    anwenden();
  }

  // Galerien: alle Fotos zeigen
  document.querySelectorAll("[data-mehr]").forEach(function (b) {
    b.addEventListener("click", function () {
      b.closest(".galerie").querySelectorAll(".g-item[hidden]").forEach(function (f) { f.hidden = false; });
      b.parentNode.remove();
    });
  });

  // Formulare mit Weichen
  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    var weichen = form.querySelectorAll("[data-weiche]");
    var radios = form.querySelectorAll('input[name="thema"]');
    var thema = function () {
      var el = form.querySelector('input[name="thema"]:checked') || form.querySelector('input[name="thema"][type="hidden"]');
      return el ? el.value : "";
    };
    var zeigen = function () {
      var wert = thema();
      weichen.forEach(function (w) { w.classList.toggle("aktiv", w.dataset.weiche === wert); });
    };
    radios.forEach(function (r) { r.addEventListener("change", zeigen); });
    // Vorwahl aus Link: ?thema=energie oder #thema=bewerbung
    var m = (location.search + location.hash).match(/thema=([a-z-]+)/);
    if (m) { var r = form.querySelector('input[name="thema"][value="' + m[1] + '"]'); if (r) { r.checked = true; } }
    var s = (location.search + location.hash).match(/stelle=([a-z-]+)/);
    if (s) { var st = form.querySelector('input[name="stelle"][value="' + s[1] + '"]'); if (st) st.checked = true; }
    zeigen();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var tel = form.querySelector('input[name="telefon"]'), mail = form.querySelector('input[name="email"]');
      var feld = form.querySelector(".feld.rueck");
      var ok = (tel && tel.value.trim()) || (mail && mail.value.trim());
      if (feld) feld.classList.toggle("ungueltig", !ok);
      if (!ok) { (tel || mail).focus(); return; }
      var best = form.querySelector(".bestaetigung");
      if (best) {
        var text = best.querySelector("[data-text]");
        if (text) {
          var texte = {
            bauvorhaben: "In der fertigen Seite landet Ihre Anfrage mit diesen Eckdaten bei Engelshove Bau, und Sie bekommen eine Kopie per E-Mail. Das Büro meldet sich bei Ihnen.",
            energie: "In der fertigen Seite geht Ihre Anfrage zur Energie-Beratung an Engelshove Bau, mit Kopie an Sie. Das Büro meldet sich bei Ihnen.",
            frage: "In der fertigen Seite geht Ihre Nachricht an info@engelshove.de, mit Kopie an Sie.",
            bewerbung: "In der fertigen Seite geht Ihre Bewerbung an info@engelshove.de. Sie bekommen eine Eingangsbestätigung, das Büro meldet sich bei Ihnen."
          };
          text.textContent = texte[thema()] || texte.frage;
        }
        best.classList.add("sichtbar"); best.setAttribute("tabindex", "-1"); best.focus();
      }
    });
  });

  // Kacheln, die eine Formular-Option vorwählen (data-vorwahl="thema=energie")
  document.querySelectorAll("[data-vorwahl]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var ziel = document.querySelector(a.getAttribute("href").split("?")[0].split("#")[0] || "x");
      var form = document.querySelector("form[data-demo]");
      if (!form) return; // Link führt auf die Kontaktseite, dort wird vorgewählt
      var kv = a.dataset.vorwahl.split("=");
      var r = form.querySelector('input[name="' + kv[0] + '"][value="' + kv[1] + '"]');
      if (r) { e.preventDefault(); r.checked = true; r.dispatchEvent(new Event("change")); form.scrollIntoView({ behavior: reduziert ? "auto" : "smooth" }); }
    });
  });

  // Aktuelle Seite im Menü
  var pfad = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a").forEach(function (a) {
    if ((a.getAttribute("href") || "").split("#")[0] === pfad) a.setAttribute("aria-current", "page");
  });
})();
