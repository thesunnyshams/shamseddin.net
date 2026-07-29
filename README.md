# shamseddin.net

Personal site for Shamseddin Alsheikh. Plain HTML, CSS and a small amount of progressive-enhancement
JavaScript, with no build step or dependencies.

## Structure

```
public/
  index.html    home page, including projects, education, experience and leadership
  projects.html bounded live viewer for Bowcast and Black Hole Census
  about.html    biography and working principles
  style.css     Interval design-system entry point
  theme.js      three-state system/light/dark theme control
  reading.js    live Bowcast reading with an honest no-data fallback
  reveal.js     reduced-motion-safe scroll reveal
  project-viewer.js interactive project selection
  assets/       self-hosted fonts, real project marks and credential evidence
  tokens/       visual foundations and component patterns
vercel.json     serves public/ at the domain root, no build step
```

`docs/` holds the working briefs (`DIRECTION.md`, `audience-strategy.md`, `design-direction.md`).
It is local only: `.gitignore` keeps it out of this public repo, and the reason is in that file.

There is no framework and no generator on purpose. The site remains readable when JavaScript is
unavailable. JavaScript remembers the chosen theme, upgrades the static no-data forecast from
Bowcast's public endpoint, switches the live project preview, and adds optional scroll reveals.

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
  visible content under reduced motion, unsupported JavaScript, and the safety timeout.

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
3. In Cloudflare, replace the parking lander records with the A and CNAME records Vercel gives you.
   The apex currently redirects to `/lander`: that page rule or redirect has to go, or it will win
   over the new records.

Mail must not break when DNS changes: i@shamseddin.net is Google Workspace
(`MX 1 smtp.google.com`, plus a Google SPF TXT record). Leave the MX and SPF records alone. Only
the A, AAAA, CNAME and any redirect rules for the site itself should change.
