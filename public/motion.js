/* Motion, driven by GSAP and ScrollTrigger (self-hosted in vendor/, so the site
   still makes no third-party request).

   Two jobs:

   1. The scroll reveals that reveal.js used to do, with real easing and a
      proper stagger instead of a CSS transition-delay ladder.
   2. The margin reticle: a scale down the open right field whose point tracks
      the reader's position in the document and whose fiducials light as their
      section comes up.

   Both are enhancements and neither is load-bearing. Content is visible by
   default in CSS, the reticle does not exist in the markup, and if GSAP fails
   to load this file returns immediately and the site is exactly what it was
   before: correct, complete, and still.

   prefers-reduced-motion skips all of it, including the reticle, because a
   point that slides is still motion whatever it reports. */

(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.registerPlugin(ScrollTrigger);

  /* ---- reveals ----------------------------------------------------------- */

  function reveal(items, trigger) {
    if (!items.length) return;
    gsap.from(items, {
      opacity: 0,
      y: 14,
      duration: 0.62,
      ease: "power3.out",
      stagger: 0.055,
      scrollTrigger: {
        trigger: trigger,
        start: "top 88%",
        once: true
      }
    });
  }

  /* Everything the reveal touches, kept so a failure part-way through can be
     undone. gsap.from hides its targets the moment it is called; if the loop
     then threw, the page would be left with invisible sections and no way back.
     Clearing props is the difference between a degraded page and a blank one. */
  var revealed = [];

  try {
    document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
      var items = Array.prototype.filter.call(group.children, function (child) {
        return child.tagName !== "SCRIPT" && !child.hasAttribute("hidden");
      });
      revealed = revealed.concat(items);
      reveal(items, group);
    });

    document.querySelectorAll("[data-reveal]").forEach(function (item) {
      if (item.parentElement && item.parentElement.hasAttribute("data-reveal-group")) return;
      revealed.push(item);
      reveal([item], item);
    });
  } catch (error) {
    if (revealed.length) gsap.set(revealed, { clearProps: "all" });
  }

  /* reveal.js carried a timed fallback in case its observer never answered.
     The same guarantee is needed here, for a different reason: GSAP hides its
     targets synchronously but restores them on a requestAnimationFrame ticker.
     If that ticker never runs, the page is left blank rather than merely
     unanimated. So if the ticker has not advanced while the page has been
     visible, the reveal is abandoned and every target put back. Checked again
     on unhide, because a tab loaded in the background has a paused ticker and
     is the ordinary way to hit this. */
  function guardReveal() {
    if (document.hidden || !revealed.length) return;
    if (gsap.ticker.frame > 20) return;
    gsap.set(revealed, { clearProps: "all" });
  }
  window.setTimeout(guardReveal, 2500);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) window.setTimeout(guardReveal, 2500);
  });

  /* ---- the margin reticle ------------------------------------------------ */

  var sections = Array.prototype.filter.call(
    document.querySelectorAll("main section[aria-labelledby]"),
    function (section) {
      return !!document.getElementById(section.getAttribute("aria-labelledby"));
    }
  );
  if (!sections.length) return;

  var reticle = document.createElement("aside");
  reticle.className = "field-reticle";
  reticle.setAttribute("aria-hidden", "true");

  var track = document.createElement("div");
  track.className = "reticle-track";
  track.innerHTML =
    '<span class="reticle-rule"></span>' +
    '<span class="reticle-cap reticle-cap--start"></span>' +
    '<span class="reticle-cap reticle-cap--end"></span>' +
    '<span class="reticle-ticks"></span>';

  /* One fiducial per section, placed at the section's own share of the
     document rather than at an even spacing: the scale reports the shape of
     this page, not a decorative rhythm. */
  var marks = sections.map(function (section) {
    var mark = document.createElement("span");
    mark.className = "reticle-mark";
    var label = document.createElement("span");
    label.className = "reticle-label";
    label.textContent = document.getElementById(section.getAttribute("aria-labelledby")).textContent;
    mark.appendChild(label);
    track.appendChild(mark);
    return { section: section, node: mark };
  });

  var point = document.createElement("span");
  point.className = "reticle-point";
  track.appendChild(point);

  reticle.appendChild(track);
  document.body.appendChild(reticle);

  function place() {
    var height = document.documentElement.scrollHeight;
    if (height <= 0) return;
    marks.forEach(function (mark) {
      var top = mark.section.getBoundingClientRect().top + window.scrollY;
      mark.node.style.top = ((top / height) * 100).toFixed(3) + "%";
    });
  }
  place();
  ScrollTrigger.addEventListener("refresh", place);

  gsap.fromTo(
    point,
    { top: "0%" },
    {
      top: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.4
      }
    }
  );

  marks.forEach(function (mark) {
    ScrollTrigger.create({
      trigger: mark.section,
      start: "top 60%",
      end: "bottom 40%",
      onToggle: function (self) {
        mark.node.classList.toggle("is-active", self.isActive);
      }
    });
  });

  /* Players and closing players change the document's height. Recomputing on
     that event keeps the scale honest instead of leaving it describing a page
     that is no longer this length. */
  document.addEventListener("click", function (event) {
    if (!event.target.closest || !event.target.closest(".session-play")) return;
    window.setTimeout(function () { ScrollTrigger.refresh(); }, 60);
  });
})();
