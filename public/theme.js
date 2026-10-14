/* Two-state theme control. Dark is the default regardless of the system
   preference; light only applies once the reader picks it, and the choice
   persists. A stored "system" from the old three-state control reads as dark.
   The page is complete without this file: it only wires the footer control. */
(function () {
  var set = document.getElementById("theme-toggle");
  if (!set) return;
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) {}
  var inputs = set.querySelectorAll('input[name="theme"]');
  function paint(value) {
    for (var i = 0; i < inputs.length; i++) {
      var on = inputs[i].value === value;
      inputs[i].checked = on;
      inputs[i].parentNode.classList.toggle("theme-option--on", on);
    }
  }
  paint(stored === "light" ? "light" : "dark");
  set.addEventListener("change", function (e) {
    var value = e.target.value;
    if (value === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
    try { localStorage.setItem("theme", value); } catch (err) {}
    paint(value);
  });
})();
