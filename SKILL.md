---
name: interval-shamseddin-design
description: Use this project skill when changing shamseddin.net or its Interval design system.
user-invocable: true
---

# Interval: shamseddin.net

Read `README.md` and `docs/DIRECTION.md` before changing the site.

The site should feel like an instrument rather than a brochure. Its argument is AI for science and
science for humanity's good, demonstrated across fields. Provenance and uncertainty remain a working
discipline, not the headline.

## Current page model

- `index.html`: Home, including the unique CV material.
- `projects.html`: a bounded, interactive viewer for Bowcast and Black Hole Census.
- `about.html`: biography and working principles.
- GitHub remains an external navigation item.
- There is no separate `cv.html`.

## Non-negotiables

- Never show a number without its source or epistemic status.
- Rows never share a scale.
- No em dashes and no emoji.
- No cards, rounded containers, shadows, decorative gradients, backdrop blur, or sticky elements.
- Use only the two real project marks in the Projects selector. Do not add decorative icons.
- Self-host the portfolio fonts.
- Colour carries meaning or it does not appear.
- Give every page at least 120px of bottom padding.

## Motion override

On 2026-07-28 the owner explicitly overrode the earlier ban on scroll-triggered reveals.

Use `IntersectionObserver`, stagger direct children in reading order, and animate only opacity and a
small vertical transform. The content must remain visible when JavaScript is off, when the observer is
unsupported, after the safety timeout, and under `prefers-reduced-motion`. Do not add parallax,
scroll-jacking, sticky elements, or continuous scroll effects.

## Bowcast reading

The Home reading uses the public Bowcast likelihood endpoint for Victoria. Preserve the pre-rendered
no-data state and do nothing on null data, network failure, timeout, or an invalid response. The live
response uses percentage probability, a weighted ensemble estimate, so never label the ticks as a
literal count of agreeing members. `locations[].probability` is the day's peak interval, not the
value at this moment, so the label must keep naming that window (`bestInterval`).
