# A Canvas‑First Engine & Website — Visual Blueprint (v3)

> **Purpose:** This is a highly visual, Markdown‑forward edition of the vision. It uses diagrams, structured layouts, and rich formatting to communicate architecture, flows, and priorities at a glance.

---

## Table of Contents
1. Overview at a Glance
2. System Map (Mermaid Architecture)
3. Intent → State Flow (Sequence)
4. Engine State Model (Class Diagram)
5. Presets & Snapshots (Lifecycle)
6. Website IA (Sitemap)
7. Page Anatomy (Wireframe Blocks)
8. Roadmap (Gantt)
9. Quality Bars (Scorecards & Gauges)
10. Risks & Mitigations (Matrix)
11. Parameter Registry (Spec Snippet)
12. North‑Star Demos (Cards)
13. Glossary Chips

---

## 1) Overview at a Glance

- **Engine:** Layered PBR • Post‑FX framegraph • GPU compute (fields/particles/growth) • Physical camera • Deterministic seeds
- **State:** Single source of truth (`EngineState`) • Versioned **Presets** • Full **Snapshots** • A/B compare • Shareable bundles
- **Assistants:** UX Assistant (NL control, safe writes) • Builder Agent (scaffold, docs, PRs)
- **Website:** Canvas‑first pages • Labs • Articles (state‑bound sections) • Gallery (live re‑open) • Playlists • Admin

> **North‑Star:** *Content drives visuals.* Scenes are reproducible, explorable, and easy to share.

---

## 2) System Map (Mermaid Architecture)

```mermaid
flowchart TB
  subgraph Web[Website]
    IA[Routes & IA\nHome • Labs • Articles • Gallery • Playlists • About • Admin]
    Overlay[Content Overlays\n(MDX, Story Bindings, Panels)]
    HUD[HUD/IO\n(Perf, Export, Share)]
  end

  subgraph Interact[Interaction Layer]
    Panels[Parameter Panels]
    Gizmos[Gizmos & Handles]
    Editors[Spline/Field/Mask Editors]
  end

  subgraph Bridge[Assistant Bridge]
    Registry[Typed Param Registry]
    Intents[Intent Map]
    Guards[Guards • Clamps • Undo]
  end

  subgraph Engine[Engine Core]
    Scene[Scene Graph]
    MatGraph[Material/TSL Node Graph]
    Compute[Compute Layer\n(buffers/textures/kernels)]
    PostFX[Post‑FX Framegraph]
    Cam[Physical Camera + Time]
  end

  subgraph State[State & Presets]
    SSOT[EngineState (SSOT)]
    Presets[Presets (versioned slices)]
    Snaps[Snapshots (full state + capture)]
  end

  subgraph IO[I/O & Export]
    Loader[Asset Loader\n(mesh/HDRI/LUT)]
    Export[Stills/Clips/State Bundles]
  end

  subgraph Obs[Observability]
    Perf[Perf HUD & Timings]
    Logs[Event Log]
    Telemetry[Telemetry (opt‑in)]
  end

  IA --> Overlay --> Panels
  Panels -->|param writes| Registry
  Gizmos --> Registry
  Editors --> Registry
  Registry --> Intents
  Intents --> Guards
  Guards --> SSOT
  SSOT <--> Scene
  SSOT <--> MatGraph
  SSOT <--> Compute
  SSOT <--> PostFX
  SSOT <--> Cam
  Loader --> Engine
  Export --> Web
  Perf --> HUD
  Logs --> HUD
  Telemetry --> HUD
```

---

## 3) Intent → State Flow (Sequence)

```mermaid
sequenceDiagram
  actor U as User
  participant UX as UX Assistant
  participant BR as Bridge (Intents + Registry)
  participant GV as Guards/Clamps/Undo
  participant ST as EngineState
  participant EG as Engine Render/Sim

  U->>UX: "Make it moodier, with peacock green highlights"
  UX->>BR: Parse → target params (tone map, key light color, material tint)
  BR->>GV: Validate types/ranges • generate diff
  GV-->>BR: Safe diff or diagnostics
  BR->>ST: Apply diff (versioned)
  ST->>EG: Notify change (render/sim update)
  EG-->>U: Visual feedback • HUD metrics
  UX-->>U: Explainer + Undo link
```

---

## 4) Engine State Model (Class Diagram)

```mermaid
classDiagram
  class EngineState {
    +Material[] materials
    +Light[] lights
    +PostFXPass[] postfx
    +SimKernel[] sim
    +Camera camera
    +number seed
    +Meta meta
  }
  class Material {
    +string id
    +Recipe recipe
    +Texture[] textures
    +string colorSpace
  }
  class Light {
    +string rigType
    +vec3 position
    +float intensity
    +float colorTemp
    +ShadowPolicy shadow
  }
  class PostFXPass {
    +string name
    +Map params
    +bool usesMotionVectors
    +bool usesHistory
  }
  class SimKernel {
    +string name
    +Dispatch dispatch
    +Bindings fieldBindings
    +number stepBudget
  }
  class Camera {
    +float iso
    +float shutter
    +float aperture
    +Target focus
    +string tonemap
  }
  class Meta { +string author +string version +Date created }

  EngineState o-- Material
  EngineState o-- Light
  EngineState o-- PostFXPass
  EngineState o-- SimKernel
  EngineState o-- Camera
  EngineState o-- Meta
```

---

## 5) Presets & Snapshots (Lifecycle)

```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Review: Lint + Visual test
  Review --> Approved: Meets SLOs
  Approved --> Library: Versioned + Tagged
  Library --> Applied: Merge slice → EngineState
  Applied --> Snapshot: Capture full state + seed + image
  Snapshot --> Library: Shareable bundle
```

---

## 6) Website IA (Sitemap)

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
  Root --> Admin[/Admin/]

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

## 7) Page Anatomy (Wireframe Blocks)

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

---

## 8) Roadmap (Gantt)

```mermaid
gantt
  title Roadmap — Phased Delivery
  dateFormat  YYYY-MM-DD
  section Foundations
  Core Engine + PBR + PostFX      :done,    p1, 2025-11-01, 2026-01-15
  Preset Schema + HUD + Stills    :active,  p2, 2026-01-16, 2026-02-15
  section Compute & Patterns
  Fields + Particles + Growth     :        p3, 2026-02-16, 2026-03-30
  Camera Rigs + TAA/DOF Polish    :        p4, 2026-03-15, 2026-04-10
  section Assist & Authoring
  Param Registry + Intents        :        p5, 2026-04-01, 2026-04-25
  Gizmos + Editors + Bundles      :        p6, 2026-04-20, 2026-05-15
  section Story & Site
  Article Bindings + Playlists    :        p7, 2026-05-01, 2026-05-25
  Gallery→Live + A11y + Admin     :        p8, 2026-05-15, 2026-06-05
  section Polish & Scale
  Adaptive + Streaming + VRT + SEO:        p9, 2026-06-01, 2026-06-25
```

> **Note:** Dates are placeholders to visualize sequencing and overlap.

---

## 9) Quality Bars (Scorecards & Gauges)

| SLO | Target | Budget/Notes |
|---|---:|---|
| Frame time | 16.7 ms (60 fps) | Graceful 33.3 ms fallback with adaptive res/LOD |
| Jank spikes | ≤ 8 ms on swaps | TAA restabilize < 500 ms |
| TTI | ≤ 2.5 s | Hydrate presets post‑interactive |
| Stability | < 0.1% hard errors | All failures soft‑fallback |
| A11y | WCAG AA | Full keyboard parity, reduced‑motion |

```mermaid
pie title KPI Focus (Indicative)
  "Smoothness" : 35
  "Reliability" : 20
  "Creation Velocity" : 20
  "Engagement" : 15
  "Doc Efficacy" : 10
```

---

## 10) Risks & Mitigations (Matrix)

| Risk | Impact | Likelihood | Mitigation |
|---|---:|---:|---|
| Temporal instability | High | Med | Strict TAA/velocity; pass ordering |
| Complexity creep | High | Med | Small‑surface API; ADRs; v1 freeze |
| Perf variance | Med | High | Adaptive res/LOD; budgets; fallbacks |
| Assistant miswrites | Med | Med | ACLs; clamps; dry‑run + undo |
| Content drift | Med | Med | Preset linting; visual regression |

---

## 11) Parameter Registry (Spec Snippet)

```json
{
  "lights.key.color": {"type": "color", "space": "srgb", "default": "#b5dfff", "tags": ["mood","key"], "acl": "public"},
  "postfx.tonemap.temperature": {"type": "float", "range": [3000, 12000], "default": 6500, "acl": "public"},
  "materials.coat.anisotropy": {"type": "float", "range": [0, 1], "default": 0.35, "acl": "creator"},
  "sim.particles.stepBudget": {"type": "int", "range": [1, 8], "default": 2, "acl": "creator"}
}
```

---

## 12) North‑Star Demos (Cards)

> **Peacock Alloy** — Anisotropic metal + thin‑film highlights; moody blue‑green grade; cinematic bloom.
>
> **Starry Flow** — Flow‑field growth lines over torso; depth‑aware DOF; rack‑focus on tips.
>
> **Ghost Particles** — Surface‑adhering particles with curl lift; short‑clip export; seed replay.
>
> **Tone‑Mapping 101** — Story that drives exposure/curve presets; interactive focus picker; glossary chips.

---

## 13) Glossary Chips

- **Preset:** Versioned recipe that changes a slice of `EngineState`.
- **Snapshot:** Full scene state + capture; seed included.
- **Field:** Spatial/temporal vector function for forces/advection.
- **Intent:** Natural‑language request mapped to safe parameter diffs.
- **Framegraph:** Ordered render/Post‑FX passes with resource aliasing.

