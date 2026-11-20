
// Umbau: Vorher-Nachher-Regler. Ziehen (Maus, Finger), Tippen springt, Pfeiltasten über das unsichtbare Schiebefeld.
// Beim ersten Erscheinen fährt der Regler einmal langsam durchs Bild, damit man sieht, dass er sich bewegen lässt.
(function () {
  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-vs]").forEach(function (v) {
    var r = v.querySelector(".vs-r"), zieht = false, beruehrt = false, anim = 0;
    function setze(p) {
      p = Math.max(0, Math.min(100, p));
      v.style.setProperty("--p", p + "%"); r.value = Math.round(p);
      v.classList.toggle("nur-nach", p < 6); v.classList.toggle("nur-vor", p > 94);
    }
    function ausX(x) { var b = v.getBoundingClientRect(); return (x - b.left) / b.width * 100; }
    v.addEventListener("pointerdown", function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      beruehrt = true; cancelAnimationFrame(anim); zieht = true; v.classList.add("zieht");
      try { v.setPointerCapture(e.pointerId); } catch (_) {}
      setze(ausX(e.clientX));
    });
    v.addEventListener("pointermove", function (e) { if (zieht) setze(ausX(e.clientX)); });
    function los() { zieht = false; v.classList.remove("zieht"); }
    v.addEventListener("pointerup", los); v.addEventListener("pointercancel", los); v.addEventListener("lostpointercapture", los);
    r.addEventListener("input", function () { beruehrt = true; cancelAnimationFrame(anim); setze(+r.value); });
    function fahre() {
      if (ruhig || beruehrt) return;
      var start = performance.now(), wege = [[50, 88, 700], [88, 14, 1300], [14, 50, 800]], i = 0, t0 = start;
      function schritt(t) {
        if (beruehrt) return;
        var w = wege[i], k = Math.min(1, (t - t0) / w[2]), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        setze(w[0] + (w[1] - w[0]) * e);
        if (k >= 1) { i++; t0 = t; if (i >= wege.length) return; }
        anim = requestAnimationFrame(schritt);
      }
      anim = requestAnimationFrame(schritt);
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); setTimeout(fahre, 250); } }, { threshold: .55 });
      io.observe(v);
    }
    setze(50);
  });
  var ende = document.querySelector(".ub-ende");
  if (ende) {
    if (!("IntersectionObserver" in window) || ruhig) ende.classList.add("da");
    else { var io2 = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { ende.classList.add("da"); io2.disconnect(); } }, { threshold: .3 }); io2.observe(ende); }
  }
})();
