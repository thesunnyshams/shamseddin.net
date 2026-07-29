/* Three-state theme control. Dark is the default, prefers-color-scheme is
   respected until the reader chooses otherwise, and the choice persists.
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
  paint(stored || "system");
  set.addEventListener("change", function (e) {
    var value = e.target.value;
    if (value === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", value);
    try { localStorage.setItem("theme", value); } catch (err) {}
    paint(value);
  });
})();
