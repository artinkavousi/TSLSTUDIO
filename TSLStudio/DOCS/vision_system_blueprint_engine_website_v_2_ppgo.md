# A Canvas‑First Engine & Website — Vision & System Blueprint (v2)

> **Mission:** Build a self‑contained, plug‑and‑play, **agent‑addressable** Web graphics engine and a **canvas‑first** website that together deliver cinematic visuals, real‑time compute, and author‑friendly ergonomics. The system must be beautiful, predictable, and long‑lived.

---

## 1. Vision — What We’re Creating

We’re crafting a **creative computing engine** and **experience layer** that merge:
- **Physically credible rendering** (PBR, layered looks, camera realism),
- **GPU‑native simulation** (particles, flow/field dynamics, growth and deformation),
- **Temporal Post‑FX** (TAA, DOF, motion blur, glare),
- **Stateful composition** (presets, snapshots, shareable recipes), and
- **Agent‑friendly controls** (natural language → safe parameter writes).

The website is the public face and instrument panel: a **persistent 3D stage** powering pages, articles, labs, showcases, and guided stories. Content never sits beside visuals—**content *drives* visuals**.

We optimize for **tasteful results by default** and **depth on demand**. Everything is modular, composable, and documented so designers, developers, and AI agents can collaborate without stepping on one another.

---

## 2. Design Tenets

1. **Canvas‑first** — The engine is always live; pages orchestrate scenes rather than embed them as afterthoughts.
2. **Expressive by default** — Gorgeous results in a minute; mastery in a month.
3. **Deterministic creativity** — Seeds, snapshots, and diffable state to reproduce or branch any look.
4. **Performance with taste** — Filmic quality without stutter; stability > raw FPS.
5. **Small, stable surface** — Predictable API/parameter names, versioned preset schema, migration notes.
6. **Agent‑addressable** — Every control is named, typed, clamped, and documented for assistants.
7. **Observability everywhere** — Time budgets, counters, warnings, and intent logs.
8. **Accessibility is a feature** — Keyboard flows, reduced‑motion modes, perceptual contrast.

---

## 3. Users & Core Experiences

- **Explorers:** Visitors who want to feel the engine—preset cycling, camera tours, story‑driven scenes.
- **Learners:** Readers following articles where paragraphs modulate the scene.
- **Creators:** Power users composing looks/sims, saving presets, exporting visuals.
- **Agents:** UX assistants and builder agents operating via safe, typed parameter bridges.

**Signature experiences**
- **One‑Click Look:** Swap full scene mood (lights, tones, Post‑FX) via preset cards.
- **Living Patterns:** Flow‑fields that grow meshes/lines guided by masks and bones.
- **Artist Camera:** A shelf of cinematic moves (rack focus, dolly, shutter play) bound to scroll or audio.
- **Story Panels:** Article sections cue scene states; readers *feel* the concept, not just read it.
- **Shareable States:** Export a visual + state bundle; open on any device and tweak.

---

## 4. System Overview (Conceptual Architecture)

**Layers** (from metal to meaning):
1. **Engine Core** — Scene graph, material/TSL‑like node graph, compute layer (buffers/textures/kernels), Post‑FX framegraph, physical camera.
2. **State Model** — Single source of truth for materials, lights, sims, and Post‑FX; serializable with schema + migrations.
3. **Preset & Snapshot Library** — Versioned recipes; A/B compare; seed control; provenance metadata.
4. **Interaction Layer** — UI panels, gizmos, spline/field editors, paintable masks; keyboard flows and accessibility.
5. **Assistant Bridge** — Intent → action mapping, typed parameter registry, clamps/guards, undo/rollback.
6. **I/O & Export** — Async asset loading (meshes/HDRIs/LUTs), still/video capture, state bundles.
7. **Observability** — Performance HUD (frame time, pass timings, VRAM), event logs, warnings, and tips.

---

## 5. Engine Capability Targets

### 5.1 Rendering & Materials
- **Layered PBR:** Base, clearcoat, sheen, anisotropy, thin‑film, transmission; triplanar and procedural nodes.
- **Lighting discipline:** HDR environment control; rig presets (product/portrait/stage); calibrated exposure pipeline.
- **Post‑FX:** TAA + resolve, cinematic bloom, chromatic offset, vignette, camera DOF with focus peaking, optional motion blur.
- **Stylization:** Ink/halftone/glitch nodes that *stack* with PBR for design‑forward looks.

### 5.2 Compute & Simulation
- **Field systems:** Noise/curl fields, vector volumes, spline forces; per‑mesh UV/vertex masking.
- **Particles:** GPU‑resident lifecycles with pooling; sort/filter/indirect draw; mesh emission and surface adhesion.
- **Growth/advection:** Surface lines; anisotropic growth guided by curvature/paint; advect textures and masks.
- **Deformation:** Simple cloth/soft tendencies; bend/twist volumes; morph capture and playback.
- **Time tools:** Sub‑stepping; deterministic seeds; timeline markers; checkpoint/restore.

### 5.3 Camera & Motion
- **Physical camera:** ISO/shutter/aperture with exposure compensation; cinematic path tools (dolly/arc/rail) and rack‑focus cues.

---

## 6. State & Preset Model (Conceptual)

**EngineState** (conceptual fields):
- `materials[]` → id, recipe (layer nodes + params), textures, color spaces.
- `lights[]` → rig type, positions, color temperature, intensity, shadow policy.
- `postfx[]` → ordered passes, per‑pass parameters; motion‑vector and history‑buffer flags.
- `sim[]` → kernels, buffers, dispatch config, field bindings, step budget.
- `camera` → lens, exposure, focus target, filmic curve preset.
- `seed` → RNG seeds for reproducibility.
- `meta` → author, provenance, creation date, engine version.

**Presets** store partial `EngineState` slices + metadata. **Snapshots** store full scene + capture.

---

## 7. Assistant Bridge

- **Parameter registry:** `(namespace.path, type, range, default, tags, safety)` for every adjustable control.
- **Intent map:** Natural language → registry targets (e.g., “moody blue lighting” → `lights.key.color`, `postfx.tonemap.temperature`).
- **Guards & undo:** Type checks, clamping, semantic validation; single‑step and multi‑step rollback.
- **Explainers:** Every intent returns what changed and why, with links to docs.

---

## 8. Website Vision & Structure

### 8.1 Identity & Feel
A **studio‑grade showcase**: dark, elegant, legible. Motion is purposeful; sound is optional and subtle. The engine is always visible, never intrusive. UI floats in **glassmorphic panels** with tactile micro‑interactions and full keyboard parity.

### 8.2 Information Architecture (IA)
- **/** (Home) — Hero canvas with *One‑Click Looks*, short mission, latest labs and stories.
- **/labs** — Interactive demos categorized (materials, Post‑FX, particles, fields, growth). Each lab includes preset shelves, performance HUD, and share/export.
- **/articles** — Long‑form pieces where sections bind to scene states; inline glossary chips.
- **/gallery** — Curated stills and short clips; open any item as a live scene.
- **/playlists** — Bundles of scenes/presets for moods (e.g., “Peacock Metals,” “Starry Night”).
- **/about** — Vision, roadmap, credits, FAQs, technical notes.
- **/contact** — Collaboration and inquiries; safe upload for assets.
- **/legal** — License, privacy, attributions.
- **/admin** (guarded) — Builder tools, content drafts, preset curation, release notes.

### 8.3 Page Anatomy (Canvas‑First)
- **Persistent canvas:** Top‑node scene persists across routes; route transitions morph state rather than reload.
- **Content overlay:** Scrollable panel whose sections trigger state changes (scroll, click, or voice); reduced‑motion option.
- **Right rail (HUD):** Performance meters, camera readout, export/share; collapsible.
- **Bottom dock:** Preset bar and history/undo; searchable command palette (`/`).

### 8.4 Content Model (Conceptual)
- **Doc:** id, title, slug, authors, summary, cover preset, `sections[]`.
- **Section:** prose, media, *bindings* (state diffs + timing cues), glossary chips.
- **Lab:** id, category, base preset, parameter manifest, tutorials, export rules.
- **Preset:** id, name, description, tags, state slice, engine version, thumbnail.

### 8.5 Navigation Model
- **Mode switch** (top‑left): Viewer / Lab / Story. Mode changes UI density and guardrails.
- **Command palette:** Jump to labs, presets, and doc sections; run common intents.
- **Trail nav:** Breadcrumb over content; context‑aware back behavior (no jarring pops).

---

## 9. Quality Bars & SLOs

- **Frame time:** 60 fps target on mid‑range devices; degrade gracefully to 30 fps with adaptive resolution and LOD.
- **Jank budget:** ≤ 8 ms spikes allowed during asset swaps; TAA re‑stabilizes in < 500 ms.
- **Load:** Initial interactive in < 2.5 s on median connections; background‑hydrate presets.
- **Reliability:** No hard crashes; soft fallbacks for shader failures and missing assets.
- **A11y (Accessibility):** Keyboard‑complete flows; WCAG‑compliant contrast; reduced‑motion and captions.

---

## 10. Observability & Tooling

- **Performance HUD:** CPU/GPU frame timing, pass timings, VRAM, draw calls, buffer counts.
- **Event log:** Intents, parameter changes, warnings; exportable for bug reports.
- **Visual tests:** Golden‑image snapshots per preset; tolerance for minor TAA noise.
- **Shader linting:** Style and safety checks; static parameter‑range audits.

---

## 11. Security, Privacy, Governance

- **Roles:** Visitor (read), Creator (save local/share state), Admin (publish), Agent (guarded API).
- **Data:** No PII without consent; export bundles are explicit; telemetry anonymized and opt‑in.
- **Guardrails:** Parameter‑write ACLs, rate limits, reproducible change logs (who/what/when).
- **Licensing:** Clear policy for engine, presets, and third‑party assets; attribution pipeline.

---

## 12. Documentation & Education

- **Cookbook:** Task‑centric recipes (e.g., “Make peacock‑green metallic with starry‑blue rim”).
- **Live docs:** Docs that manipulate a sandboxed scene; copyable state diffs.
- **Glossary:** Camera and rendering terms with visual mini‑demos; links from articles.

---

## 13. Roadmap (Phase Gates)

**Phase 1 — Foundations**
- Engine core boot: scene graph, PBR baseline, simple Post‑FX, seedable state, preset schema.
- Minimal labs: Materials, Lighting, Post‑FX.
- Performance HUD v1; export stills; snapshot/undo.

**Phase 2 — Compute & Patterns**
- Field systems (noise/curl/spline); particle kernel with indirect draw.
- Growth lines (surface‑aware); texture advection; masks and paint.
- Post‑FX polish (TAA/DOF/motion blur tuning); camera rigs.

**Phase 3 — Assistant Bridge & Authoring**
- Parameter registry + intent map; clamps/undo; explainers.
- Gizmos (focus picker, light aim), spline/field editors; preset curation tools.
- State bundles; short‑clip export.

**Phase 4 — Story Engine & Site**
- Articles with state bindings; playlists; gallery → live‑scene handoff.
- Accessibility pass; reduced‑motion; sound‑design hooks.
- Admin: builder tools, draft flow, release notes.

**Phase 5 — Polish & Scale**
- Adaptive quality; asset streaming; offline caches.
- Visual‑regression suite; telemetry; SEO and share metadata.
- Public launch with curated showcases and downloadable bundles.

---

## 14. Risks & Mitigations

- **Temporal stability** — *Mitigation:* TAA history discipline; velocity buffers; phase‑ordered Post‑FX.
- **Complexity creep** — *Mitigation:* Small‑surface API; freeze v1; architectural decision records (ADRs) for change control.
- **Performance variance** — *Mitigation:* Adaptive resolution/LODs; budget overlays; fallback looks.
- **Content drift** — *Mitigation:* Preset linting; design‑review rubric; visual‑regression tests.
- **Assistant miswrites** — *Mitigation:* ACLs, clamps, dry‑run diffs, undo/rollback, human‑readable diffs.

---

## 15. Success Metrics & KPIs

- **Interaction smoothness:** ≥ 95% of sessions maintain target frame time.
- **Stability:** < 0.1% hard‑error rate per session; 100% graceful fallbacks.
- **Creation velocity:** Median time to a publish‑worthy visual < 5 minutes from blank.
- **Engagement:** Average preset interactions per session; lab dwell time; share/export rate.
- **Doc efficacy:** Cookbook task success rate ≥ 90% without external help.

---

## 16. Definition of Done (Per Feature)

- Meets SLOs; passes visual and performance tests.
- Has documentation with at least one cookbook recipe.
- Exposes typed parameters in the registry; assistant intents mapped.
- Fallback path defined; telemetry emits expected counters.

---

## 17. Glossary (Select)

- **Preset** — Versioned recipe that changes a *slice* of `EngineState`.
- **Snapshot** — Full scene state + optional capture; seed included.
- **Field** — Vector function (spatial/temporal) used for forces/advection.
- **Intent** — Natural language mapped to safe parameter changes.
- **Framegraph** — Ordered render/Post‑FX passes with resource aliasing.

---

## 18. North‑Star Demos (For Launch)

1. **Peacock Alloy** — Anisotropic metal with thin‑film highlights; moody blue‑green toning; cinematic bloom.
2. **Starry Flow** — Flow‑field growth lines over a torso mesh; depth‑aware DOF; rack‑focus on line tips.
3. **Ghost Particles** — Surface‑adhering particles with curl‑noise lift; short‑clip export; seed replay.
4. **Story: Tone‑Mapping 101** — Article driving exposure/curve presets; interactive focus picker; visual glossary chips.

---

## 19. Guiding Aesthetic

Clean, filmic, and tactile. Micro‑motion that breathes rather than distracts. Color grading is decisive yet subtle. Typography is modern and generous. Interactions feel cushioned: eased, bounded, and reversible.

---

## 20. Closing

This blueprint aligns engine power, authoring ergonomics, and story craft. It is **a studio in a page**: reproducible, shareable, and resilient—made for experimentation today and expansion tomorrow.

