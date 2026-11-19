
// Umbau: Vorher/Nachher umschalten und Schieber
document.querySelectorAll("[data-vn]").forEach(function (v) {
  var k = v.querySelector(".vn-knopf"), m = v.querySelector(".vn-marke");
  k.addEventListener("click", function () {
    var an = !v.classList.contains("zeigt-vor");
    v.classList.toggle("zeigt-vor", an); k.setAttribute("aria-pressed", an ? "true" : "false");
    k.textContent = an ? "Nachher zeigen" : "Vorher zeigen"; m.textContent = an ? "Vorher" : "Nachher";
  });
});
document.querySelectorAll("[data-schieber]").forEach(function (s) {
  var r = s.querySelector("input");
  var setze = function () { s.style.setProperty("--p", r.value + "%"); };
  r.addEventListener("input", setze); setze();
});
