/* Engelshove Bau – Entwurf. Kein Tracking, keine externen Dienste. Formulare verschicken nichts. */
(function () {
  "use strict";
  var reduziert = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Sanftes Einblenden beim Scrollen (Abschnitte, Karten, Kacheln, Phasen)
  var ziele = document.querySelectorAll("body:not(.start) .kopf .wrap > *, body:not(.start) .phase");
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

  // Satellitenkarte: Ein Ort zeigt alle Projekte von dort
  var sat = document.querySelector("[data-sat]");
  if (sat) {
    var knoepfe = sat.querySelectorAll(".sat-pkt,.sat-weit"), orte = sat.querySelectorAll(".sat-ort");
    knoepfe.forEach(function (b) {
      var waehlen = function () {
        knoepfe.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        orte.forEach(function (o) { o.hidden = o.dataset.ort !== b.dataset.ort; });
      };
      b.addEventListener("click", waehlen); b.addEventListener("mouseenter", waehlen);
    });
  }

  // Großer Abschluss: Bild und Text erscheinen, sobald er ins Bild kommt
  var enden = document.querySelectorAll(".ende");
  if (enden.length) {
    if (reduziert || !("IntersectionObserver" in window)) enden.forEach(function (e) { e.classList.add("da"); });
    else {
      document.documentElement.classList.add("bewegt-ende");
      var ioe = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("da"); ioe.unobserve(x.target); } }); }, { threshold: .28 });
      enden.forEach(function (e) { ioe.observe(e); });
    }
  }

  // Große Ansicht für Fotos und Scans
  var lb = null, lbListe = [], lbNr = 0;
  var lbZeige = function (n) {
    lbNr = (n + lbListe.length) % lbListe.length;
    lb.querySelector("img").src = lbListe[lbNr].href;
    var t = lbListe[lbNr].dataset.t;
    lb.querySelector(".lb-t").textContent = (t ? t + " · " : "") + (lbListe.length > 1 ? (lbNr + 1) + " / " + lbListe.length : "");
  };
  var lbZu = function () { if (lb) { lb.remove(); lb = null; document.documentElement.style.overflow = ""; } };
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-lb]");
    if (!a) return;
    e.preventDefault();
    // Gruppe: eine Fotostrecke oder die Bilder eines Projekts (data-lbg, dort liegen die weiteren Bilder unsichtbar bereit)
    var gruppe = a.closest("[data-lbg], .p-fotos, .g-grid, .scans"), frei = gruppe && gruppe.hasAttribute("data-lbg");
    lbListe = Array.prototype.slice.call((gruppe || document).querySelectorAll("a[data-lb]")).filter(function (x) { return frei || x.offsetParent !== null; });
    lb = document.createElement("div"); lb.className = "lb";
    lb.innerHTML = '<img alt=""><span class="lb-t"></span><button type="button" class="lb-zu">Schließen</button><button type="button" class="lb-z">Zurück</button><button type="button" class="lb-v">Weiter</button>';
    document.body.appendChild(lb); document.documentElement.style.overflow = "hidden";
    lbZeige(lbListe.indexOf(a));
    lb.addEventListener("click", function (x) {
      if (x.target.classList.contains("lb-v")) lbZeige(lbNr + 1);
      else if (x.target.classList.contains("lb-z")) lbZeige(lbNr - 1);
      else lbZu();
    });
  });
  document.addEventListener("keydown", function (e) {
    if (!lb) return;
    if (e.key === "Escape") lbZu(); else if (e.key === "ArrowRight") lbZeige(lbNr + 1); else if (e.key === "ArrowLeft") lbZeige(lbNr - 1);
  });

  // Projektfilter
  var filter = document.querySelector("[data-filter]");
  if (filter) {
    var karten = Array.prototype.slice.call(document.querySelectorAll(".karte[data-art]"));
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
  var geladen = Date.now();
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
    var ar = (location.search + location.hash).match(/art=([a-z-]+)/);
    if (ar) { var at = form.querySelector('input[name="art"][value="' + ar[1] + '"]'); if (at) at.checked = true; }
    zeigen();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var tel = form.querySelector('input[name="telefon"]'), mail = form.querySelector('input[name="email"]');
      var feld = form.querySelector(".feld.rueck");
      var ok = (tel && tel.value.trim()) || (mail && mail.value.trim());
      if (feld) feld.classList.toggle("ungueltig", !ok);
      if (!ok) { (tel || mail).focus(); return; }
      var best = form.querySelector(".bestaetigung");
      // Echter Versand, sobald das Formular ein Ziel hat (data-ziel). Ohne Ziel bleibt es bei der Vorschau unten.
      if (form.dataset.ziel) {
        var knopf = form.querySelector('button[type="submit"]'), alt = knopf.textContent, meldung = form.querySelector(".form-fehler");
        if (!meldung) { meldung = document.createElement("p"); meldung.className = "form-fehler"; meldung.setAttribute("role", "alert"); knopf.parentNode.insertBefore(meldung, knopf.nextSibling); }
        var daten = new FormData(form);
        daten.set("thema", thema()); daten.set("dauer", String(Date.now() - geladen)); daten.set("seite", location.pathname.split("/").pop() || "index.html");
        daten.set("id", form.dataset.id || (form.dataset.id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : "00000000-0000-4000-8000-" + String(Date.now()).slice(-12)));
        knopf.disabled = true; knopf.textContent = "Wird gesendet …"; meldung.textContent = "";
        fetch(form.dataset.ziel, { method: "POST", body: daten }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); }).then(function (x) {
          knopf.disabled = false; knopf.textContent = alt;
          if (!x.ok) { meldung.textContent = (x.j && x.j.errors && (x.j.errors.telefon || x.j.errors.email || x.j.errors.lebenslauf)) || (x.j && x.j.error) || "Das hat leider nicht geklappt. Bitte rufen Sie uns an: 05973 / 90 923 0."; return; }
          form.dataset.id = "";
          if (best) { var tx = best.querySelector("[data-text]"); if (tx) tx.textContent = thema() === "bewerbung" ? "Ihre Bewerbung ist bei uns. Wir melden uns bei Ihnen." : "Ihre Nachricht ist bei uns. Wir melden uns bei Ihnen."; best.classList.add("sichtbar"); best.setAttribute("tabindex", "-1"); best.focus(); }
          form.reset(); zeigen();
        }).catch(function () { knopf.disabled = false; knopf.textContent = alt; meldung.textContent = "Keine Verbindung. Bitte noch einmal versuchen oder anrufen: 05973 / 90 923 0."; });
        return;
      }
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
