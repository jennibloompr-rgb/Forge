# The Forge — marketing website + CMS

The production site for **The Forge**, a curated, application-only network for UK
food & drink challenger brands and the service providers who partner with them.

Three pages, recreated pixel-faithfully from the approved design handoff, plus a
small friendly CMS so the owner can manage content without a developer, and an
email-gated partner pricing section that captures leads.

```
/          → Home ("the hall")        — self-select via two doors, zero money language
/brands    → For Brands (brand room)  — "free, by application", member carousel
/partners  → For Partners (partner room) — full story, pricing behind an email gate
```

## Stack

- **[Astro](https://astro.build)** — static-first, with the Node adapter
  (`@astrojs/node`, standalone). Pages are prerendered to static HTML; a single
  server endpoint (`/api/unlock`) handles the partner gate.
- **Astro content collections** — all CMS-editable content lives in
  `src/content/` (members, tiers, settings).
- **[Decap CMS](https://decapcms.org)** — a hosted, Git-based editing UI at
  `/admin`. No database, no server to maintain.
- No CSS framework: styling is inline per the design handoff, so the build stays
  faithful to the approved files. Shared rules (fonts, reset, pill hovers,
  reduced-motion) live in `src/layouts/Base.astro`.

## Develop

```bash
npm install
npm run dev          # http://localhost:4321
```

To edit content locally in the CMS UI, run the Decap proxy in a second terminal
(it lets `/admin` write to your working copy):

```bash
npx decap-server
# then open http://localhost:4321/admin
```

## Build

```bash
npm run build        # outputs dist/ (static pages + the /api/unlock function)
```

The build is **hybrid**: every page is static HTML except `POST /api/unlock`,
which runs as a serverless function.

## Deploy (Netlify)

The site is configured for **Netlify** (`@astrojs/netlify` adapter +
`netlify.toml`). To put it live:

1. In Netlify → **Add new site → Import an existing project**, pick this repo.
   Build settings are read from `netlify.toml` (no manual config needed).
2. Set the production branch to whichever branch you deploy from.
3. Add the **`FORGE_LEAD_WEBHOOK`** environment variable (Site config →
   Environment variables) so partner-gate leads reach you — see below.
4. Deploy. You get a live `*.netlify.app` URL immediately; add a custom domain
   when ready.

To move to Vercel/another host instead, swap the adapter in
`astro.config.mjs`.

## The partner pricing gate

Pricing is **deliberately kept out of the crawlable HTML** (an information-
architecture rule from the handoff). The Partners page ships only the locked
gate. On a valid email submit:

1. The browser POSTs the email to `/api/unlock`.
2. The endpoint validates it, **forwards the lead to the owner**, and returns
   the tier data + footnote (which therefore never appear in page source).
3. The tier cards are rendered client-side and the unlock is remembered in
   `localStorage`, so returning visitors see the tiers immediately (re-fetched
   without sending a fresh lead).

### Lead delivery

Set `FORGE_LEAD_WEBHOOK` (see `.env.example`) to a form service
(Formspree/Basin) or your own endpoint that accepts a JSON POST of
`{ email, source, page, timestamp, userAgent }`. **If unset, leads are written
to the server logs** so they are never silently lost — but wire a real endpoint
before launch so the owner receives every captured email.

## CMS — what the owner can edit

Layout and design are hard-coded; only content is editable, at `/admin`:

| Collection | Edits | Shows on |
|---|---|---|
| **Members** | brand, founder line, one-liner, location, initials, photo (optional), order, published | Brands carousel |
| **Partner tiers** | name, price, price note, features, highlight, badge, order | Partners gated section |
| **Site settings** | contact email, launch date, location, dinner host credit; dinner when/where/covers; founder bio + portrait; member criteria; pricing footnote | Footers, dinner card, "behind it", shape-of-a-member cards |

Member photos display cropped to 330×235 (`object-fit: cover`); the portrait at
4:5. Empty photo fields fall back to the designed placeholders.

The six seeded members are placeholders for the owner to replace as real members
sign (only Salt Wrights and Oochi are real). Bundled photos are low-res
screenshots — replace with originals via the CMS.

### CMS setup (one-time)

`public/admin/config.yml` uses the **Git Gateway** backend so the owner logs in
with an email invite (no GitHub account needed). After the site is on Netlify:

1. Netlify → **Identity** → enable it; set registration to **Invite only**.
2. Netlify → Identity → **Services → Git Gateway** → enable.
3. **Invite** the owner's email; they accept the link and set a password.
4. They edit at `/admin` (or `/cms`); saving commits to the repo and triggers a
   rebuild. Confirm `branch` in `config.yml` matches the deploy branch.

(To use GitHub login instead, swap the backend in `config.yml` — see Decap docs.)

## Content & data layout

```
src/content/
  members/*.json        # one file per member
  tiers/*.json          # one file per partner tier
  settings/index.json   # site / dinner / founder / criteria / pricing singletons
src/content.config.ts   # collection schemas (kept in step with admin/config.yml)
src/lib/content.ts      # helpers: getSettings / getMembers / getTiers
```

## Interactions ported from the design

- **The doors** (Home) — the signature swing-open hover (rotateY, light bloom,
  glow), keyboard-focusable.
- **Typewriter** (Home hero) — "the forge is …" word cycle with blinking caret.
- **Member marquee** (Brands) — 48s seamless loop, pauses on hover, edge fades.
- **Scroll-reveal** — site-wide; transform-only so content is visible without JS.
- All of the above respect `prefers-reduced-motion`.

## Open questions for the owner (pre-launch)

These were flagged in the handoff and still need answers:

1. **Domain** — site domain & registrar (email domain is `weforgepartnerships.com`).
2. **Form service** for gate leads — Formspree / Basin / own endpoint → set
   `FORGE_LEAD_WEBHOOK`.
3. **Partner tier numbers** — confirm prices, intro counts, the "£24k from
   November" deadline and the welcome-fee range before they go live.
4. **Analytics** — wanted? (Plausible/Fathom suit the no-fuss ethos.)

## Notes

- Canonical contact email everywhere: **hello@weforgepartnerships.com**.
- Copy is transcribed verbatim from the owner-edited designs (including the
  intentionally lowercase serif lines) — do not "improve" it.
- OG image: a simple indigo card with the lime-banded wordmark
  (`public/og-default.svg`) — confirm with owner.
- Target launch: "Live from 1 July 2026".
