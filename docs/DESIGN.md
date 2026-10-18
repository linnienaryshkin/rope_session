# Rope Session — Design Document

## Problem Statement

A shibari specialist needs to conduct a pre-session interview (currently 10–15 min verbal) that establishes a portrait of the client and confirms risk awareness. The goal is to replace most of that interview with an async, personalized form — so the live conversation becomes a quick confirmation rather than a full intake.

**Constraints:**

- Zero server. No data stored anywhere. No user accounts.
- No identifiable information in the URL itself (link contains no name, date, or contact).
- Shared via an existing trusted/private channel (not email, not exposed publicly).
- One session = one link cycle. Not a persistent profile system.

---

## User Flow

```
Master opens app
  └── Configures menu: enables/disables sections and specific items
  └── Gets a shareable URL (state encoded in URL hash)
  └── Sends URL to client via private channel

Client opens URL
  └── Sees a personalized form with only what master enabled
  └── Fills out preferences, limits, health notes
  └── Clicks "Done" → gets a new URL (master's config + client's answers, both encoded)
  └── Sends that URL back to master

Master opens client's URL
  └── Sees a summary view: what they offered, what client selected, notes flagged
  └── Uses as reference going into the session
```

No login. No database. No server calls. The URL **is** the document.

---

## URL Architecture

All state lives in the URL fragment (`#`), not query params (`?`). Fragment is never sent to a server — not even in request headers. This is the core privacy mechanism.

```
https://ropesession.app/#<base64url-encoded-payload>
```

### Payload structure

Two-phase encoding:

**Phase 1 — Master link** encodes master's configuration:

```json
{
  "v": 1,
  "d": 20015,
  "mode": "master",
  "enabled": {
    "sections": ["experience", "physical", "vibe", "extras"],
    "extras": ["hair", "gag", "collar", "impact", "kiss"]
  },
  "disabled": {
    "sections": ["rope_styles"],
    "extras": ["genital"]
  }
}
```

`d` = days since Unix epoch. `enabled` = master turned on (client can pick). `disabled` = master explicitly greyed-out (client sees but can't select). Anything not in either list is hidden from client.

**Phase 2 — Client link** wraps the master config + client answers:

```json
{
  "v": 1,
  "d": 20015,
  "mode": "client",
  "master": { ...master config... },
  "answers": {
    "experience": { "shibari_level": 3, "suspension": false },
    "physical": { "shoulder": 4, "circulation_issues": false },
    "vibe": ["sensual", "meditative", "care"],
    "extras": ["hair", "kiss"],
    "health_notes": "mild lower back issue",
    "safeword": "pineapple",
    "aftercare": ["hug", "quiet"],
    "photos": false
  }
}
```

Compression: JSON → `pako` (zlib/deflate) → base64url. Keeps URLs short enough for messaging apps (~500–800 chars for a full response).

---

## Application Modes

The app renders differently based on `mode` in the decoded payload:

| Mode | Who sees it | What it does |
| ------ | ------------- | -------------- |
| `home` | Master, fresh load | Master configures what to offer; produces a master link |
| `form` | Client | Renders the form with only enabled fields; produces a client link |
| `summary` | Master | Read-only view of master config + client answers side by side |

No routing library needed — mode is derived from URL state on load.

---

## Tech Stack

**Framework:** SvelteKit (static adapter — output is pure static HTML/JS, deployable anywhere)

**State:** All state is URL-derived on load; Svelte stores for local interaction state. No localStorage, no cookies, no IndexedDB.

**Compression:** `pako` for deflate/inflate of the JSON payload before base64url encoding.

**Styling:** Tailwind CSS — utility classes, no runtime overhead, easy dark mode.

**Icons:** Custom SVG icon set, owned in-repo under `src/lib/icons/`. One SVG component per concept. No external icon dependency.

**Deployment:** Static hosting (Vercel, Netlify, Cloudflare Pages, or self-hosted nginx). Zero backend.

---

## Component Architecture

```
src/
├── routes/
│   └── +page.svelte          # Single route — mode-driven rendering
├── lib/
│   ├── url.ts                # encode/decode payload, URL read/write
│   ├── schema.ts             # TypeScript types for master config and client answers
│   ├── icons/                # SVG icon components (one per concept)
│   │   ├── Hair.svelte
│   │   ├── Gag.svelte
│   │   ├── Collar.svelte
│   │   └── ...
│   └── components/
│       ├── MasterConfig/
│       │   ├── SectionToggle.svelte
│       │   ├── ItemToggle.svelte
│       │   └── ShareButton.svelte
│       ├── ClientForm/
│       │   ├── Section.svelte        # Collapsible section wrapper
│       │   ├── RatingField.svelte    # 0–5 star/dot scale
│       │   ├── ToggleField.svelte    # Yes / No / Maybe
│       │   ├── MultiSelect.svelte    # Icon + label chips
│       │   ├── TextArea.svelte       # Free-text notes
│       │   └── SubmitButton.svelte
│       └── Summary/
│           ├── SectionSummary.svelte
│           ├── FlaggedItem.svelte    # Health/risk notes highlighted
│           └── CopyButton.svelte
```

---

## Form Sections & Field Mapping

Sections shown to the client are exactly those the master enabled. Always-on sections (no master toggle) are marked **[default]**.

### [default] Current State

Day-of check, always collected.

- Mood (1–5 or emoji scale)
- Sleep quality (1–5)
- Ate today (Y/N)
- Recent gym / physical exertion (Y/N)
- Substances (none / light / notable — no details required)

### [default] Health Flags

Always collected, free text.

- Anything physical I should know about today (injury, tension, sensitivity)
- Psychological — anything that might come up (optional, free text)
- Allergies relevant to touch/rope (latex, oils, jute)

### [default] Communication

Always collected.

- Safeword (text input, pre-filled with "Red/Yellow/Green" if blank)
- Non-verbal signal preference (tap count, object drop, squeeze)
- Check-in style (verbal / silent monitoring preference)

### Experience

Master-enabled. Background questions.

- Shibari experience level (0–5 scale: none → advanced)
- Suspension experience (Y/N)
- Physical practices background (multi-select: yoga, dance, acrobatics, climbing, massage)
- Past injuries from rope (Y/N + optional notes)

### Physical Readiness

Master-enabled. 1–5 self-assessment.

- Shoulder mobility, hip flexibility, knee flexibility, back flexibility
- Circulation issues baseline (Y/N)
- Position endurance (how long comfortable in a tie)
- Static vs dynamic preference (scale)

### Vibe

Master-enabled. Multi-select chips with icon + label.

- Art / Aesthetic
- Sensual
- Meditative / Anticipation
- Fun / Joy / Surprise
- Care / Trust
- Powerful / Anger
- Powerless / Surrender
- Pain / Fear
- Humiliation / Shame

### Rope Styles

Master-enabled. Shown with Japanese name + English translation + short description.

- Yuka 床 — floor work
- Tsuri 吊り — suspension
- Ichinawa 壱縄 — single rope
- Aibunawa 愛撫繩 — caress/sensual
- Semenawa 責め縄 — torment
- Shūchinawa 羞恥縄 — shame/exposure
- Kazushi 和司縛り — deconstructed

### Body Preferences

Master-enabled. Body area whitelist/blacklist.

- Chest, belly, arms, legs, hips: each is Yes / No / Ask me
- Box-tie: Y/N/soft
- Futomomo: Y/N/soft
- Marks/bruising: welcome / ok if minor / prefer none

### Extras

Master-enabled per item. Each item: icon + short English label + Y/N/Maybe.

| Internal key | Icon | Label |
| --- | --- | --- |
| `hair` | Hair.svelte | Hair |
| `gag` | Gag.svelte | Gag / Blindfold |
| `nails` | Nails.svelte | Nails / Teeth |
| `collar` | Collar.svelte | Collar / Leash |
| `impact` | Hand.svelte | Impact |
| `kiss` | Kiss.svelte | Kissing |
| `breast` | Breast.svelte | Breast |
| `genital` | Genital.svelte | Genital |

The master decides which of these appear. Client answers Y/N/Maybe. Icons are tasteful abstract SVGs — not explicit. Sensitive label copy is minimal.

### Aftercare

Master-enabled.

- Hug / physical closeness (Y/N)
- Verbal affirmation (Y/N)
- Quiet / alone time (Y/N)
- Check-in next day (Y/N)
- Debriefing: call / text / async notes

### Privacy

Master-enabled.

- Photos: No / Private only / Shareable with consent
- Emergency contact: optional free text (encrypted in URL? — see open questions)

---

## Master Configuration View

Master sees all possible sections and items. Each section has:

- On/Off toggle (entire section)
- Per-item On/Off within enabled sections

Master also sets a free-text **session note to client** (shown at top of client form — e.g. "This is our first session, feel free to skip anything you're unsure about").

Master produces the link via a "Copy link" button. No share API, no tracking.

---

## Summary View (Master reads client's response)

Layout: two-column on desktop, single-column on mobile.

- Left: what master offered
- Right: what client answered
- **Flagged** (highlighted): any health notes, hard limits, Y answers in risk areas (suspension, breath control, nerve compression), and anything marked "Maybe" that overlaps a high-risk activity
- Free-text notes from client displayed in full
- No editing in this view

---

## Resolved Decisions

1. **Emergency contact** — excluded from the URL entirely. Collected verbally before or after the form. No PII in the link.

2. **URL encoding** — start with readable JSON (easy mode). Payload includes a `v` (version) integer field so encoding strategy can change in future without breaking old links. Migrate to bitmask/compact encoding only if URL length becomes a real problem.

3. **Timestamp** — include a `d` field: days since Unix epoch (integer). Compact (5 chars), no time precision, just enough for "this form is X days old" display. No enforcement.

4. **Master's disabled vs hidden items** — master has two states per item: **hidden** (client never sees it) and **disabled** (client sees it greyed-out, understands it's not on offer today). Master chooses which. Default for a newly added item is hidden.

5. **Icons** — monochrome geometric SVG set, owned in-repo. Design principles: single-weight stroke, no fills, ~24×24 viewBox, works at any size, readable when greyed-out. Color applied via CSS `currentColor` only — easy to theme, highlight, or disable with a single class. No external icon dependency.

---

## Non-Goals

- No user accounts, sessions, or authentication
- No analytics or tracking of any kind
- No PDF export (client can screenshot/print from browser)
- No multi-session history or client profiles
- No server-side validation
- No general BDSM checklist (out of scope per WIKI.md "What This App Is Not")
