
# Website Plan (Post‑Engine) — Outline (v0)
This doc is a placeholder to guide the site build **after** the TSL engine stabilizes.

## 1) Site Skeleton
- **Persistent WebGPU Canvas** (root): engine bootstraps once; routes overlay MDX/React UI.
- **MDX Overlays**: articles, labs, and portfolio pages with scene hooks.
- **Dual Assistants**: 
  - UX Assistant: in‑page tweaks for materials/post‑FX (binds to engine schemas).
  - Builder Agent (admin): scaffolds modules, opens PRs, populates demos.

## 2) Tech Stack
- Next.js / Nitro‑compatible routing; R3F for overlays; Zustand for state; Tweakpane panel.
- Contentlayer or Sanity for MDX/CMS (decide later); Shadcn UI kit; GSAP for scroll scenes.
- Deployment: Vercel/Netlify; Cloudflare assets; GitHub Actions for CI + visual regression.

## 3) Scene Patterns
- **Article Template**: per‑section camera cues; TAA toggle on scroll; LUT per chapter.
- **Labs Template**: live code playground (TS only) mapped to schemas; “Share config” URL.
- **Showcase Template**: hero SSR/DOF pass; device‑adaptive quality presets.

## 4) Data Contracts
- `material.schema.json`, `fxchain.schema.json`, `compute.schema.json` are the source of truth.
- Assistant only mutates JSON; UI renders controls dynamically from schema.

## 5) Roadmap (after engine v0)
- S1: Wire engine into layout, build 3 demo pages.
- S2: Add Assistant bindings; preset gallery (JSON).
- S3: CMS hookup + first 3 MDX articles (PBR, post‑FX, compute).
- S4: Performance pass, accessibility checks, SEO.

## 6) Acceptance
- No console errors; WebGPU detect with graceful fallback message.
- Lighthouse ≥ 90; First Interactive ≤ 3.5s on M1.
- Visual regression stable across 3 presets.
