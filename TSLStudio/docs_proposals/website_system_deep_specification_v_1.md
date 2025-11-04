# Website System — Deep Specification (v1)

> **Scope:** The public‑facing canvas‑first website that orchestrates pages, content, and the engine. This spec covers IA, page anatomy, authoring flows, a11y, performance, governance, and release operations.

---

## 1) Experience North Star

A **studio‑grade, canvas‑first** site where *content drives visuals*. The persistent scene morphs across routes, telling stories with filmic taste and deterministic control. Visitors explore presets, labs, and stories; creators author with guardrails; assistants help both.

**Tone & Aesthetic**: clean, filmic, tactile; motion purposeful; optional subtle sound; glassmorphic panels; strong keyboard parity.

---

## 2) Information Architecture (IA)

```mermaid
flowchart LR
  Root((/)) --> Home[Home]
  Root --> Labs[/Labs/]
  Root --> Articles[/Articles/]
  Root --> Gallery[/Gallery/]
  Root --> Playlists[/Playlists/]
  Root --> About[/About/]
  Root --> Contact[/Contact/]
  Root --> Legal[/Legal/]
  Root --> Admin[/Admin (guarded)/]

  Labs --> Mat[Materials]
  Labs --> FX[Post‑FX]
  Labs --> Particles[Particles]
  Labs --> Fields[Fields]
  Labs --> Growth[Growth]

  Articles --> Story1[Story‑bound Article]
  Gallery --> Shot1[Curated Still]
  Gallery --> Clip1[Short Clip]
```

---

## 3) Page Anatomy & Shell

```
┌───────────────────────────────────────────────────────────────┐
│ Persistent Canvas (scene morphs across routes)                │
├───────────────┬───────────────────────────────────────────────┤
│ Right Rail    │ Content Overlay (sections bind to state)      │
│ • Perf HUD    │ • Headline • Body • Callouts • Glossary chips │
│ • Camera info │ • Scrollytelling triggers (scroll/voice/click)│
│ • Export      │                                               │
├───────────────┴───────────────────────────────────────────────┤
│ Bottom Dock: Preset bar • History/Undo • Command Palette (/)  │
└───────────────────────────────────────────────────────────────┘
```

**Modes**
- **Viewer** — Minimal UI; read‑only interactions; preset explore.
- **Lab** — Full parameter panels; save presets; export stills/clips.
- **Story** — Section‑bound state diffs; reduced UI; glossary chips.

---

## 4) Content Model

**Doc**: id, title, slug, authors, summary, hero preset, `sections[]`, tags, created, updated.

**Section**: prose (Markdown), media (image/video/embed), **bindings** (param diffs + timing cues), glossary chips, code blocks (optional sandboxes).

**Lab**: id, category, base preset, param manifest, tutorial steps, export rules, permalinks.

**Gallery Item**: id, preset/snapshot link, metadata, thumbnail, share card.

**Preset**: id, name, description, tags, state slice, engine version, thumbnail.

---

## 5) Interaction Patterns

- **Command Palette (`/`)** — Fuzzy search: labs, presets, docs; run common intents.
- **One‑Click Looks** — Preset cards change lighting/grade/mood at once.
- **Focus Picker** — Click to set camera focus; DOF peaking option.
- **Scrub/Undo** — Global time scrub, history ledger; keyboard undo.
- **Share/Export** — Stills/clips/state bundles; opens as live scenes.

---

## 6) Assistant Integration

- **UX Assistant**: interprets NL requests, translates to safe param diffs; presents explainer + undo; respects ACLs.
- **Builder Agent**: drafts labs/articles, proposes presets, opens change requests (with diffs & checks) in Admin.

**Intent Safety**
- Registry of named params with types/ranges/tags; clamps & domain rules; dry‑run diffs; rollback.

---

## 7) Accessibility (A11y)

- **Keyboard‑complete**: All controls reachable and operable.
- **Reduced Motion**: Prefers‑reduced‑motion alters animations/Post‑FX.
- **Contrast**: WCAG AA minimum; tested against scene light/dark extremes.
- **Captions & Descriptions**: For video/audio; ARIA labeling on controls and charts.

---

## 8) Performance & Loading

- **Budgets**: 60 fps target; 2.5 s time‑to‑interactive; ≤ 8 ms swap spikes.
- **Adaptive**: Resolution/LOD tiering; postpone heavy sims until idle.
- **Streaming**: Progressive asset loading; prefetch route‑adjacent presets.
- **Caching**: Content + assets cached with invalidation on version bump.

---

## 9) SEO & Social

- **Metadata**: Titles, descriptions, canonical URLs; language and locale.
- **Structured Data**: Article/Gallery JSON‑LD where applicable.
- **OpenGraph/Twitter**: Thumb per preset/snapshot; short links to live scenes.
- **Sitemaps/Robots**: Kept current on publish.

---

## 10) Observability

- **Core Web Vitals**: LCP, CLS, INP monitored.
- **Event Analytics**: Preset interactions, lab dwell times, exports (count only).
- **Error Tracking**: Route + state on error; anonymized; opt‑in.

---

## 11) Security & Privacy

- **Roles**: Visitor (read), Creator (save/share state local or account), Admin (publish), Agent (guarded API).
- **Uploads**: Type/size checks; sandbox; content scanning pipeline.
- **Telemetry**: Opt‑in; summarized counters; no PII.
- **Rate‑Limiting**: On expensive ops (export, clip render).

---

## 12) Admin & Authoring

**Admin (guarded)**
- Draft → review → publish workflow with visual checks.
- Preset library curation; thumbnail refresh; tag governance.
- Release notes and changelog editor.

**Authoring Tools**
- Parameter panels with **manifests** (sliders, ranges, units, tooltips).
- Spline/field editors; mask painting; camera path editor.
- Clip exporter with time ruler; seed/snapshot manager.

---

## 13) Internationalization & Units

- **Locales**: Language, number/date formats.
- **Units**: Metric by default (align with project preference); unit annotations and conversions in UI tooltips.

---

## 14) Deployment & Release Ops

- **Versioning**: Semantic versions for site & preset schema; migration checks on load.
- **Rollbacks**: Last‑known‑good bundles; switch by flag.
- **Feature Flags**: Gradual exposure of labs/features.
- **Backups**: State/preset libraries backed up with checksums.

---

## 15) Risk Register (Website)

- **Engine/site coupling** → Keep adapters thin; version gates.
- **Route jank** → Morph state, avoid full canvas rebuilds; pre‑warm.
- **SEO vs Canvas** → Rich metadata + structured data; fallbacks for static crawlers.
- **Authoring sprawl** → Manifests + presets governance; design rubric.

---

## 16) Roadmap (Website)

1. **Shell & Home** — Persistent canvas; preset bar; hero looks.
2. **Labs** — Categories; parameter manifests; export stills.
3. **Articles** — Section‑bound state diffs; glossary chips.
4. **Gallery/Playlists** — Live re‑open; share cards; permalinks.
5. **Admin** — Draft/review/publish; library governance; release notes.
6. **Polish** — A11y pass; Core Web Vitals hardening; adaptive quality.

---

## 17) Glossary (Website)

- **Content Binding** — A mapping from document section to a **state diff** applied to the engine.
- **Preset Card** — A UI tile that applies a named preset slice to the current scene.
- **Live Scene** — A gallery item reopened as an interactive scene using its snapshot/preset.
- **Mode** — Viewer/Lab/Story shell variants that alter UI density & guardrails.

