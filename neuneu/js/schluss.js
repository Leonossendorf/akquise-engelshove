/* Abschluss der Startseite: ein warmer Lichtpunkt folgt der Maus, zieht einen Schweif und zieht den Knopf „Bauvorhaben anfragen“ zu sich. Nur mit Maus. */
(function () {
  "use strict";
  var st = document.querySelector(".k-schluss .k-stage");
  if (!st || !window.matchMedia || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  var z = st.querySelector(".zeiger"), cta = st.querySelector(".s-cta");
  if (!z || !cta) return;
  var punkt = z.querySelector(".z-punkt"), ring = z.querySelector(".z-ring"), wort = z.querySelector("span");
  var funken = Array.prototype.slice.call(z.querySelectorAll(".z-f"));
  var mx = 0, my = 0, px = 0, py = 0, rx = 0, ry = 0, gross = 1, fx = [], fy = [], drin = false, laeuft = false, nah = false, still = 0, tx = 0, ty = 0;
  funken.forEach(function () { fx.push(0); fy.push(0); });
  var set = function (e, x, y, s) { e.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)" + (s ? " scale(" + s.toFixed(3) + ")" : ""); };
  var schritt = function () {
    laeuft = false;
    px += (mx - px) * .32; py += (my - py) * .32;
    rx += (mx - rx) * .11; ry += (my - ry) * .11;
    var lx = px, ly = py, unruhe = Math.abs(mx - px) + Math.abs(my - py) + Math.abs(mx - rx) + Math.abs(my - ry);
    funken.forEach(function (f, i) {
      var k = .24 - i * .035;
      fx[i] += (lx - fx[i]) * k; fy[i] += (ly - fy[i]) * k;
      unruhe += Math.abs(lx - fx[i]) + Math.abs(ly - fy[i]);
      set(f, fx[i], fy[i], 1 - i * .14); lx = fx[i]; ly = fy[i];
    });
    // Nähe zum Knopf: der Knopf rückt der Maus entgegen, der Lichtpunkt wird zum Ring
    var r = cta.getBoundingClientRect(), cx = r.left + r.width / 2 - tx, cy = r.top + r.height / 2 - ty;
    var dx = mx - cx, dy = my - cy, n = Math.abs(dx) < r.width * .62 && Math.abs(dy) < r.height * 1.6;
    if (n !== nah) { nah = n; z.classList.toggle("nah", n); cta.classList.toggle("nah", n); }
    tx += ((n ? dx * .14 : 0) - tx) * .2; ty += ((n ? dy * .22 : 0) - ty) * .2;
    cta.style.transform = "translate3d(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px,0)";
    gross += ((n ? 3.4 : 1) - gross) * .18; unruhe += Math.abs((n ? 3.4 : 1) - gross) * 10 + Math.abs(tx) * .1;
    set(punkt, px, py, gross); set(ring, rx, ry, n ? 1.5 : 1); set(wort, px, py);
    if (drin && unruhe > .4) { laeuft = true; requestAnimationFrame(schritt); }
  };
  var los = function () { if (!laeuft) { laeuft = true; requestAnimationFrame(schritt); } };
  var sagen = function () { clearTimeout(still); z.classList.remove("sag"); still = setTimeout(function () { if (drin && !nah) z.classList.add("sag"); }, 650); };
  // Beim Hereinkommen, auch wenn die Maus schon über der Stelle stand, als sie ins Bild gescrollt wurde
  var rein = function (e) {
    drin = true; mx = px = rx = e.clientX; my = py = ry = e.clientY;
    fx = fx.map(function () { return mx; }); fy = fy.map(function () { return my; });
    z.classList.add("da"); st.classList.add("zeig"); sagen(); los();
  };
  st.addEventListener("pointerenter", rein);
  st.addEventListener("pointermove", function (e) { if (!drin) return rein(e); mx = e.clientX; my = e.clientY; sagen(); los(); });
  st.addEventListener("pointerleave", function () {
    drin = false; nah = false; clearTimeout(still);
    z.classList.remove("da", "sag", "nah"); st.classList.remove("zeig"); cta.classList.remove("nah"); cta.style.transform = ""; tx = ty = 0;
  });
})();
