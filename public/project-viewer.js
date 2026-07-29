(function () {
  var projects = {
    bowcast: {
      name:"Bowcast",
      field:"Atmospheric physics · software",
      url:"https://bowcast.app",
      source:"https://github.com/thesunnyshams/bowcast-web",
      description:"Live worldwide rainbow forecast"
    },
    "black-hole-census": {
      name:"Black Hole Census",
      field:"Astronomy · data engineering",
      url:"https://thesunnyshams.github.io/black-hole-census/",
      source:"https://github.com/thesunnyshams/black-hole-census",
      description:"Live uncertainty-first field guide"
    }
  };

  var selectors = document.querySelectorAll("[data-project]");
  var frame = document.getElementById("project-frame");
  var shell = document.getElementById("project-frame-shell");
  var title = document.getElementById("project-viewer-title");
  var meta = document.getElementById("project-viewer-meta");
  var status = document.getElementById("project-viewer-status");
  var outbound = document.getElementById("project-viewer-link");
  var source = document.getElementById("project-viewer-source");
  var loadBudget;

  if (!selectors.length || !frame || !shell || !title || !meta || !status || !outbound || !source) return;

  function markUnavailable() {
    clearTimeout(loadBudget);
    frame.dataset.loadState = "unavailable";
    shell.classList.remove("is-switching");
    status.textContent = "Preview may be unavailable. Open the full project instead.";
  }

  function armLoadBudget() {
    clearTimeout(loadBudget);
    loadBudget = setTimeout(markUnavailable, 10000);
  }

  function selectProject(key, updateUrl) {
    var project = projects[key];
    if (!project) return;

    selectors.forEach(function (selector) {
      var selected = selector.getAttribute("data-project") === key;
      if (selected) selector.setAttribute("aria-current", "true");
      else selector.removeAttribute("aria-current");
      var state = selector.querySelector(".project-state");
      if (state) state.textContent = selected ? "Viewing" : "Select";
    });

    title.textContent = project.name;
    meta.textContent = project.field + " · " + project.description;
    status.textContent = "Loading live preview";
    outbound.href = project.url;
    outbound.textContent = "Open " + project.name;
    source.href = project.source;

    if (frame.src !== project.url && frame.src !== project.url + "/") {
      delete frame.dataset.loadState;
      shell.classList.add("is-switching");
      frame.title = project.name + " live preview";
      frame.src = project.url;
      armLoadBudget();
    } else if (frame.dataset.loadState === "received") {
      shell.classList.remove("is-switching");
      status.textContent = "Preview response received. If the frame is blank, open the full project.";
    } else if (frame.dataset.loadState === "unavailable") {
      markUnavailable();
    } else {
      armLoadBudget();
    }

    if (updateUrl && window.history && window.history.replaceState) {
      var next = new URL(window.location.href);
      next.searchParams.set("project", key);
      next.hash = "viewer";
      window.history.replaceState({}, "", next);
    }
  }

  selectors.forEach(function (selector) {
    selector.addEventListener("click", function (event) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return;
      event.preventDefault();
      selectProject(selector.getAttribute("data-project"), true);
    });
  });

  frame.addEventListener("load", function () {
    clearTimeout(loadBudget);
    frame.dataset.loadState = "received";
    shell.classList.remove("is-switching");
    status.textContent = "Preview response received. If the frame is blank, open the full project.";
  });
  frame.addEventListener("error", markUnavailable);

  var requested = new URL(window.location.href).searchParams.get("project");
  selectProject(projects[requested] ? requested : "bowcast", false);
})();
