
// Mitlaufender Bewerben-Knopf: ausgeblendet, solange die Knöpfe oben oder das Formular zu sehen sind
(function () {
  var k = document.querySelector(".bw-float"), f = document.querySelector(".kb-form"), o = document.querySelector(".kh-wege");
  if (!k || !f || !("IntersectionObserver" in window)) return;
  var sicht = {};
  function pruefe() { k.classList.toggle("weg", !!(sicht.f || sicht.o)); }
  new IntersectionObserver(function (e) { sicht.f = e[0].isIntersecting; pruefe(); }, { rootMargin: "0px 0px -35% 0px" }).observe(f);
  if (o) new IntersectionObserver(function (e) { sicht.o = e[0].isIntersecting; pruefe(); }).observe(o);
})();
