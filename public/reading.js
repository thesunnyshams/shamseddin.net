/* Upgrades the pre-rendered reading with a live one. The page is already
   correct without this file: the SVG ships complete, and if this script never
   runs, never loads, or fails, the reader sees the honest no-data state.

   The only rule that matters here: on any failure, any timeout, or a null
   probability, DO NOTHING. Never write a fallback number into the slot where a
   real one belongs, and never present a stale value as current.

   This public endpoint is CORS-enabled and edge-cached by Bowcast. */
const ENDPOINT = "https://bowcast.app/api/likelihood?lat=48.4284&lon=-123.3656";

/* Map Bowcast's live percentage response onto the reading. Bowcast's value is
   a weighted estimate from the ensemble, not a literal count of agreeing
   members, so the label stays a percentage.

   locations[].probability is the day's peak interval, not the value at this
   moment, so the window it belongs to is carried through and named. An
   unlabelled percentage would read as a nowcast, which it is not. */
function adapt(json) {
  const location = Array.isArray(json.locations) ? json.locations[0] : null;
  const probabilityPct = location?.probability;
  const members = location?.ensembleMembers?.effectiveAtBest ??
    location?.ensembleMembers?.total;
  const window = location?.bestInterval ?? location?.bestHour;
  return {
    probabilityPct,
    members,
    window: typeof window === "string" && window ? window : null,
    fetchedAt: json.generatedAt,
    model: json.ensembleModel
  };
}

(function () {
  const fig = document.getElementById("reading");
  const label = document.getElementById("reading-label");
  if (!fig || !label || !ENDPOINT) return;

  const controller = new AbortController();
  const budget = setTimeout(() => controller.abort(), 2000);

  fetch(ENDPOINT, { signal: controller.signal, headers: { accept: "application/json" } })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
    .then((json) => {
      clearTimeout(budget);
      const d = adapt(json);
      if (
        d.probabilityPct === null ||
        d.probabilityPct === undefined ||
        !isFinite(d.probabilityPct) ||
        d.probabilityPct < 0 ||
        d.probabilityPct > 100 ||
        !Number.isFinite(d.members) ||
        d.members < 1
      ) return;

      const generatedMs = Date.parse(d.fetchedAt);
      const ageMs = Date.now() - generatedMs;
      if (!Number.isFinite(generatedMs) || ageMs > 2 * 60 * 60 * 1000 || ageMs < -5 * 60 * 1000) return;

      const members = Math.round(d.members);

      // The visual is always a 40-tick percentage scale. Member count is
      // reported separately and must not change the scale.
      fig.querySelectorAll(".reading-ticks").forEach((svg) => {
        const ticks = svg.querySelectorAll(".tick");
        const filled = Math.round((d.probabilityPct / 100) * ticks.length);
        ticks.forEach((tick, i) => {
          tick.classList.toggle("tick--on", i < filled);
        });
      });

      fig.classList.remove("reading--absent");

      const time = new Date(generatedMs);
      const stamp = !isNaN(time)
        ? String(time.getUTCHours()).padStart(2, "0") + ":" +
          String(time.getUTCMinutes()).padStart(2, "0") + " UTC"
        : String(d.fetchedAt || "");

      const value = document.createElement("span");
      value.className = "reading-value";
      value.textContent = Math.round(d.probabilityPct) + "%";
      const model = d.model === "icon_seamless" ? "ICON seamless ensemble" : String(d.model || "ensemble");
      const peak = d.window ? " at today's peak (" + d.window + ") ·" : " at today's peak ·";
      label.replaceChildren(
        value,
        document.createTextNode(
          peak + " weighted P(sunlit rain) · Victoria BC · " + model + ", " +
          members + " members · generated " + stamp
        )
      );

    })
    .catch(() => {
      clearTimeout(budget);
      /* Deliberately empty. The pre-rendered state stands. */
    });
})();
