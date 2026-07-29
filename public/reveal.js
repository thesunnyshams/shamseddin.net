(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) return;

  var records = [];

  document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
    var items = Array.prototype.filter.call(group.children, function (child) {
      return child.tagName !== "SCRIPT";
    });
    if (!items.length) return;
    items.forEach(function (item, index) {
      item.classList.add("reveal-pending");
      item.style.setProperty("--reveal-order", Math.min(index, 5));
    });
    records.push({ target: group, items: items });
  });

  document.querySelectorAll("[data-reveal]").forEach(function (item) {
    if (item.parentElement && item.parentElement.hasAttribute("data-reveal-group")) return;
    item.classList.add("reveal-pending");
    item.style.setProperty("--reveal-order", "0");
    records.push({ target: item, items: [item] });
  });

  if (!records.length) return;

  function reveal(record) {
    record.items.forEach(function (item) {
      item.classList.add("is-revealed");
    });
  }

  var observerResponded = false;
  var observer = new IntersectionObserver(function (entries) {
    observerResponded = true;
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var record = records.find(function (candidate) {
        return candidate.target === entry.target;
      });
      if (!record) return;
      reveal(record);
      observer.unobserve(record.target);
    });
  }, {
    threshold:0.08,
    rootMargin:"0px 0px -12% 0px"
  });

  records.forEach(function (record) {
    observer.observe(record.target);
  });

  window.setTimeout(function () {
    if (!observerResponded) records.forEach(reveal);
  }, 1200);
})();
