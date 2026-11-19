
// Mitlaufender Bewerben-Knopf: blendet aus, solange das Formular zu sehen ist
(function () {
  var k = document.querySelector(".bw-float"), f = document.getElementById("bewerbung");
  if (!k || !f || !("IntersectionObserver" in window)) return;
  new IntersectionObserver(function (e) { k.classList.toggle("weg", e[0].isIntersecting); }, { rootMargin: "0px 0px -35% 0px" }).observe(f);
})();
