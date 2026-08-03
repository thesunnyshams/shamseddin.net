# shamseddin.net

Personal site for Shamseddin Alsheikh. Plain HTML, CSS and a small amount of progressive-enhancement
JavaScript, with no build step or dependencies.

## Structure

```
public/
  index.html    home page, including projects, education, experience and leadership
  projects.html bounded live viewer for Bowcast and Black Hole Census
  sessions.html recordings: the Global Affairs presentation and Global Lunches
  about.html    biography and working principles
  style.css     Interval design-system entry point
  theme.js      three-state system/light/dark theme control
  reading.js    live Bowcast reading with an honest no-data fallback
  motion.js     GSAP scroll reveals and the margin reticle, both with fallbacks
  sessions.js   click-to-load players, one at a time, unloaded on close
  project-viewer.js interactive project selection
  assets/       self-hosted fonts, real project marks and credential evidence
  tokens/       visual foundations and component patterns
  vendor/       GSAP and ScrollTrigger, self-hosted (see Dependencies)
vercel.json     serves public/ at the domain root, no build step
```

`docs/` holds the working briefs (`DIRECTION.md`, `audience-strategy.md`, `design-direction.md`).
It is local only: `.gitignore` keeps it out of this public repo, and the reason is in that file.

There is no framework and no generator on purpose. The site remains readable when JavaScript is
unavailable. JavaScript remembers the chosen theme, upgrades the static no-data forecast from
Bowcast's public endpoint, switches the live project preview, mounts the session players on
request, and adds optional scroll reveals and the margin reticle.

## Dependencies

One, vendored: GSAP 3.13.0 with ScrollTrigger, in `public/vendor/`. It drives the scroll reveals
and the margin reticle.

It is self-hosted rather than loaded from a CDN, for the same reason the fonts are. Browsers have
partitioned the HTTP cache by top-level site since 2020, so a CDN copy has no chance of a cache hit
and costs a fresh DNS lookup, connection and TLS handshake, while handing every visitor's IP to a
third party. Vendoring also pins the exact bytes in this repo.

Licensing: GSAP's standard licence allows use at no charge as long as end users are not charged to
access the site. The licence headers are intact in both files. Updates are manual: replace the two
files and re-check the reveals.

## Before publishing

There are currently no visible placeholder chips. Confirm that remains true with:

```bash
rg -n 'class="todo"' public
```

The IA fair's uncounted attendance and the climate plan's unpublished figures remain honest
unquantified states. The Bowcast reading retains its pre-rendered no-data state when the endpoint
fails, times out, or returns invalid data.

## Conventions

- No em dashes anywhere: use colons, commas, or parentheses.
- No emoji.
- Never publish a number you would not be comfortable being asked to screenshot.
- Date anything that can go stale, and never publish a link that does not work.
- The real Bowcast and Black Hole Census marks are the only icons.
- Scroll reveals are an explicit owner override: opacity and a small vertical transform only, with
  visible content under reduced motion, unsupported JavaScript, and the safety timeout. GSAP hides
  its targets synchronously and restores them on a requestAnimationFrame ticker, so `motion.js`
  keeps a guard that puts every element back if that ticker never runs. Do not remove it: a tab
  opened in the background has a paused ticker, and without the guard the page stays blank.
- Recordings never contact YouTube until a visitor presses play. Players load from
  `youtube-nocookie.com`, only one exists at a time, and closing one removes the iframe.

## Local preview

```bash
python3 -m http.server 4321 --directory public
```

Then open http://localhost:4321

## Deploying

Vercel, from this repo. There is no build step: `vercel.json` sets the output directory to `public`,
so the site is served exactly as it is previewed locally.

To wire the domain:

1. Import the repo in Vercel. Framework preset "Other", no build command.
2. Add both `shamseddin.net` and `www.shamseddin.net` as domains, with one redirecting to the other.
3. Edit the records **in Cloudflare, not GoDaddy**. GoDaddy is the registrar, but the domain is
   delegated to Cloudflare nameservers (`coby.ns.cloudflare.com`, `galilea.ns.cloudflare.com`), so
   the GoDaddy DNS panel is not what is being served. Replace the parking lander's A records with
   the ones Vercel gives you and set the records to DNS-only (grey cloud) rather than proxied. The
   apex currently redirects to `/lander`: that redirect or page rule has to go, or it will win over
   the new records.

Mail must not break when DNS changes: i@shamseddin.net is Google Workspace
(`MX 1 smtp.google.com`, plus a Google SPF TXT record). Leave the MX and SPF records alone. Only
the A, AAAA, CNAME and any redirect rules for the site itself should change.
