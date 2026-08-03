/* Click-to-load players for the recordings.

   The page ships with no embeds and no play controls. This file adds a control
   per recording and mounts an iframe only when one is pressed, so a visitor who
   reads the page and leaves has made no request to YouTube. Closing removes the
   iframe rather than hiding it, and opening one player closes any other, so at
   most one third-party frame exists at a time.

   Without JavaScript the page is still complete: every recording keeps its
   "Open on YouTube" link, which is why the control is built here and not in the
   markup. A dead button is worse than no button. */

(function () {
  var EMBED = "https://www.youtube-nocookie.com/embed/";
  var rows = document.querySelectorAll("[data-video]");
  if (!rows.length) return;

  var open = null;

  function label(row) {
    return row.getAttribute("data-title") || "this recording";
  }

  function close(row) {
    var player = row.querySelector(".session-player");
    var button = row.querySelector(".session-play");
    if (player) {
      while (player.firstChild) player.removeChild(player.firstChild);
      player.hidden = true;
    }
    if (button) {
      button.setAttribute("aria-expanded", "false");
      button.textContent = "Play here";
      button.setAttribute("aria-label", "Play here: " + label(row));
    }
    if (open === row) open = null;
  }

  function play(row) {
    if (open && open !== row) close(open);

    var player = row.querySelector(".session-player");
    var button = row.querySelector(".session-play");
    var id = row.getAttribute("data-video");
    if (!player || !button || !id) return;

    var shell = document.createElement("div");
    shell.className = "session-frame-shell";

    var frame = document.createElement("iframe");
    frame.className = "session-frame";
    frame.title = label(row);
    /* autoplay is set because the control says "Play here": loading a paused
       player under that label would make the button lie. Nothing plays that
       the visitor did not press. */
    frame.src = EMBED + encodeURIComponent(id) +
      "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
    frame.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture; fullscreen");
    frame.setAttribute("allowfullscreen", "");
    frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");

    var note = document.createElement("p");
    note.className = "session-note";
    note.textContent = "Loaded from youtube-nocookie.com. Close the player to unload it.";

    shell.appendChild(frame);
    player.appendChild(shell);
    player.appendChild(note);
    player.hidden = false;

    button.setAttribute("aria-expanded", "true");
    button.textContent = "Close player";
    button.setAttribute("aria-label", "Close player: " + label(row));
    open = row;
  }

  Array.prototype.forEach.call(rows, function (row) {
    var actions = row.querySelector(".session-actions");
    var player = row.querySelector(".session-player");
    if (!actions || !player || !player.id) return;

    var button = document.createElement("button");
    button.type = "button";
    button.className = "session-play mark-underline";
    button.textContent = "Play here";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", player.id);
    button.setAttribute("aria-label", "Play here: " + label(row));

    var separator = document.createElement("span");
    separator.className = "session-sep";
    separator.setAttribute("aria-hidden", "true");
    separator.textContent = "·";

    actions.insertBefore(separator, actions.firstChild);
    actions.insertBefore(button, actions.firstChild);

    button.addEventListener("click", function () {
      if (open === row) close(row);
      else play(row);
    });
  });
})();
