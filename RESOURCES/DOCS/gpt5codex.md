I'll quickly gather current best-in-class templates, libraries, and hosting options that match your engine-first R3F/WebGPU + MDX + GSAP needs, then draft a clean blueprint and a refined master prompt. Now I’ll search for up-to-date repos and implementation examples in parallel.

[5 tools called]

I gathered current best-in-class stacks, starter kits, and hosting options for an engine-first R3F/WebGPU+TSL site, then distilled them into a concise architecture, workflow, and a polished master prompt. I’ll lay this out in phases as you prefer [[memory:2408017]].

### The short answer
- Best stack: Next.js (App Router) + R3F + Three.js WebGPU/TSL-first + GSAP + MDX + Zustand + Tweakpane (schema-driven) + Contentlayer + GitHub Actions CI.
- Hosting: Vercel (easiest) or Cloudflare Pages + Workers (free, durable); domain via Cloudflare Registrar (cheapest) or Namecheap. 100% free option: Cloudflare Pages + Workers + GitHub Actions + a free `.pages.dev` subdomain (custom domain optional).
- Workflow: Persistent engine in `app/layout.tsx`; MDX overlays; schema-driven control pane; labs as self-contained single-file modules; AI assistants via OpenAI Realtime (voice) and a GitHub App-backed Builder Agent with PR guardrails.

### Architecture blueprint (engine-first, TSL/WebGPU-primary)
- Root: persistent `Canvas` with WebGPU-first renderer and WebGL fallback.
- Overlay: MDX content rendered above the canvas; scenes react to content via a global store.
- Schema-driven controls: Zod schema → Tweakpane UI → live sync to the scene via Zustand.
- Labs: one-file self-contained TSL modules, hot-swappable; compute demos isolated and portable.
- Content pipeline: MDX + Contentlayer + RSS + sitemap; article templates use GSAP transitions and R3F embeds.
- Admin: `/admin` (auth) with two agents:
  - UX Assistant: in-page chat/voice (OpenAI Realtime) to navigate, tweak scenes, play presets.
  - Builder Agent: admin-only; drafts posts/experiments, opens PRs, triggers deploy with diff/confirm.

### Recommended stack
- Framework: Next.js (App Router, RSC, edge-ready), TypeScript, pnpm.
- 3D: React Three Fiber, Drei (selectively), Three.js TSL and `three/webgpu` renderer.
- Animations: GSAP + ScrollTrigger; Lenis for smooth scroll.
- Content: MDX + Contentlayer; `next-sitemap` + `feed` for sitemap/RSS.
- State: Zustand; tiny event bus for scene/content sync.
- Controls: Tweakpane with schema-driven generator; (Leva optional).
- Auth: Auth.js (GitHub provider) or simple passkey + session for admin.
- AI: OpenAI Realtime (voice/WebRTC) for UX; GitHub App + Octokit for Builder Agent PRs.
- Testing/CI: Vitest + Playwright; ESLint + Prettier + TypeCheck; GitHub Actions.
- Hosting:
  - Easiest: Vercel free tier + vercel.com domain binding; add Cloudflare DNS in front if desired.
  - Free/control: Cloudflare Pages + Workers (ephemeral tokens, GitHub app webhooks).
  - Pure static (no serverless): GitHub Pages (works if you export static and skip Realtime; or add Cloudflare Worker for tokens).

### Project structure (Next.js + engine-first; aligned to your TSL rules)
```
apps/web/
  app/
    (engine)/layout.tsx        # Persistent canvas + overlay frame
    page.tsx                   # Home
    blog/[slug]/page.tsx       # MDX article template with scene hooks
    labs/[slug]/page.tsx       # Self-contained lab wrapper
    admin/...                  # Admin dashboard (agents, CMS)
  content/
    blog/*.mdx
    labs/*.mdx
  src/
    core/                      # runtime, store, schema, events
    domain/                    # camera rigs, input, audio
    effects/                   # postfx passes (TSL single-file modules)
    materials/                 # TSL materials
    shaders/                   # reusable TSL nodes (Fn, noise, sdf, flow)
    compute/                   # compute shaders (TSL compute)
    utils/                     # math, color, loader helpers
    examples/                  # usage samples
    tsl/                       # higher-level TSL building blocks
  public/
packages/                      # optional: extract tsl, labs, ui as shared pkgs
```

### Minimal implementation snippets
- Persistent WebGPU-first Canvas with R3F and fallback
```tsx
// src/core/EngineCanvas.tsx
'use client';
import * as THREE from 'three';
import { Canvas, type RootState } from '@react-three/fiber';
import { WebGPURenderer } from 'three/webgpu';

export function EngineCanvas({ children }: { children?: React.ReactNode }) {
  return (
    <Canvas
      gl={(canvas) => {
        try {
          // Prefer WebGPU if available
          if ((navigator as any).gpu) {
            const r = new WebGPURenderer({ canvas: canvas as HTMLCanvasElement, antialias: true, alpha: true });
            // Ensure pixel ratio/size is managed by r3f
            // Note: r3f works with any THREE renderer implementing common API
            return r as unknown as THREE.WebGLRenderer;
          }
        } catch {}
        return new THREE.WebGLRenderer({ canvas: canvas as HTMLCanvasElement, antialias: true, alpha: true });
      }}
      onCreated={(state: RootState) => {
        state.gl.setClearColor(0x000000, 0);
      }}
      frameloop="always"
      dpr={[1, 2]}
      style={{ position: 'fixed', inset: 0 }}
    >
      {children}
    </Canvas>
  );
}
```

- Root layout with overlay
```tsx
// app/layout.tsx
import './globals.css';
import { EngineCanvas } from '@/src/core/EngineCanvas';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <EngineCanvas>{/* mount shared SceneGraph here */}</EngineCanvas>
        <div id="overlay" style={{ position: 'relative' }}>{children}</div>
      </body>
    </html>
  );
}
```

- Schema-driven controls wired to Tweakpane + Zustand
```ts
// src/core/schema.ts
import { z } from 'zod';
export const SceneSchema = z.object({
  theme: z.enum(['dark','light']).default('dark'),
  bloom: z.object({ enabled: z.boolean().default(true), intensity: z.number().min(0).max(3).default(1.2) }),
  camera: z.object({ fov: z.number().min(20).max(100).default(45) }),
});
export type SceneConfig = z.infer<typeof SceneSchema>;
```

```ts
// src/core/state.ts
import { create } from 'zustand';
import type { SceneConfig } from './schema';
export const useScene = create<{ config: SceneConfig; set: (p: Partial<SceneConfig>) => void }>((set) => ({
  config: { theme: 'dark', bloom: { enabled: true, intensity: 1.2 }, camera: { fov: 45 } },
  set: (p) => set((s) => ({ config: { ...s.config, ...p } })),
}));
```

```tsx
// src/core/TweakPane.tsx
'use client';
import { useEffect, useRef } from 'react';
import { Pane } from 'tweakpane';
import { useScene } from './state';

export function TweakPane() {
  const paneRef = useRef<Pane>();
  const config = useScene((s) => s.config);
  const set = useScene((s) => s.set);

  useEffect(() => {
    const pane = new Pane({ title: 'Controls' });
    paneRef.current = pane;
    const f1 = pane.addFolder({ title: 'Bloom' });
    const b1 = f1.addBinding(config.bloom, 'enabled');
    const b2 = f1.addBinding(config.bloom, 'intensity', { min: 0, max: 3, step: 0.01 });
    const f2 = pane.addFolder({ title: 'Camera' });
    const b3 = f2.addBinding(config.camera, 'fov', { min: 20, max: 100, step: 1 });
    const unsub = [b1, b2, b3].map((b) => b.on('change', () => set({ ...config })));
    return () => { unsub.forEach((u) => u.dispose?.()); pane.dispose(); };
  }, []);
  return null;
}
```

- Contentlayer MDX + RSS/sitemap (sketch)
```ts
// contentlayer.config.ts
import { defineDocumentType, makeSource } from 'contentlayer/source-files';
export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `blog/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    summary: { type: 'string', required: true },
    tags: { type: 'list', of: { type: 'string' } },
    scenePreset: { type: 'string' },
  },
  computedFields: {
    slug: { type: 'string', resolve: (doc) => doc._raw.flattenedPath.replace(/^blog\//,'') },
  },
}));
export default makeSource({ contentDirPath: 'content', documentTypes: [Post] });
```

- CI (Vercel) minimal
```yaml
# .github/workflows/ci.yml
name: ci
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm i --frozen-lockfile
      - run: pnpm lint && pnpm typecheck && pnpm test --if-present
      - run: pnpm build
```

### Phased workflow (fast to durable) [[memory:2408017]]
- Phase 1: Next.js base, persistent engine, MDX content, GSAP transitions, RSS/sitemap, Vercel deploy, custom domain.
- Phase 2: Schema-driven Tweakpane, labs framework, initial TSL postfx/materials, WebGPU fallback solidified.
- Phase 3: UX Assistant (OpenAI Realtime voice/chat), Builder Agent (GitHub App + PR guardrails).
- Phase 4: Expand TSL/compute library and lab catalog; add admin visual builders.

### Cost/hosting options
- Cost-free: Cloudflare Pages (static) + Workers (serverless for tokens/webhooks) + free `.pages.dev` subdomain. Custom domain optional; Cloudflare DNS free.
- Low-cost: Vercel free tier + Cloudflare Registrar domain (~$9–$12/yr). Easiest DX.
- Pure static (no AI voice): GitHub Pages + Cloudflare Worker (optional) + Cloudflare DNS.

### Curated starters and resources
- React components/UI
  - react-bits: `https://github.com/DavidHDev/react-bits`
  - Flowbite-React: `https://flowbite-react.com`
  - ui-layouts (layout ideas): `https://ui-layouts.com`
  - Awesome components: `https://github.com/Correia-jpv/fucking-awesome-react-components`
  - shadcn/ui (headless patterns): `https://ui.shadcn.com`
- R3F/Three/TSL/WebGPU
  - React Three Fiber: `https://github.com/pmndrs/react-three-fiber`
  - Drei utilities: `https://github.com/pmndrs/drei`
  - Three.js WebGPU + TSL examples: `https://threejs.org/examples/?q=webgpu#webgpu_nodes`
  - Maxime Heckel TSL/WebGPU articles: `https://blog.maximeheckel.com` (Field Guide to TSL)
- GSAP motion
  - GSAP docs: `https://greensock.com/docs/`
  - ScrollTrigger: `https://greensock.com/scrolltrigger/`
  - Inspiration/effects: `https://madewithgsap.com/effects`
  - Lenis smooth scroll: `https://lenis.studiofreight.com/`
- Content pipeline
  - Contentlayer: `https://www.contentlayer.dev/`
  - next-sitemap: `https://github.com/iamvishnusankar/next-sitemap`
  - feed: `https://www.npmjs.com/package/feed`
- AI and automation
  - OpenAI Realtime API (WebRTC): `https://platform.openai.com/docs/guides/realtime`
  - Octokit (GitHub App): `https://github.com/octokit/octokit.js`
  - Auth.js: `https://authjs.dev/`

### Master build prompt (refined)
Use this with your Builder Agent or as a project brief.

- Role: Senior full‑stack/graphics engineer and infra architect.
- Objective: Build an engine-first personal site. Persistent R3F canvas (WebGPU/TSL-first) powers every page; MDX overlays; interactive labs; two assistants (UX chat/voice, Builder Agent). Production-ready, modular, maintainable.
- Non-negotiables:
  - Three.js TSL-first; Node-based materials and passes; avoid raw GLSL/WGSL unless necessary.
  - WebGPU primary with graceful WebGL fallback.
  - Single-file module philosophy for effects/materials/labs.
  - Schema-driven controls (Zod → Tweakpane) + Zustand state.
  - Next.js App Router; TypeScript; pnpm.
  - MDX content with Contentlayer; RSS + sitemap.
  - GSAP transitions; smooth scroll.
  - CI: lint, typecheck, test, build; deploy to Vercel or Cloudflare Pages.
  - Security: admin-only Builder Agent; PR diff/confirm guardrails; token scoping.
- Deliverables:
  - Next.js app with persistent engine in `app/layout.tsx`.
  - `src/` with `core`, `domain`, `effects`, `materials`, `shaders`, `compute`, `utils`, `examples`, `tsl`.
  - TSL modules: lighting, noise, flow fields, SDF, postfx, materials, physics helpers; each single-file, hot-swappable.
  - Labs scaffold: self-contained experiments, MDX-driven variants, embedded demos.
  - Tweakpane generator bound to Zod schema + Zustand.
  - MDX article template with R3F embeds and GSAP typography/scroll transitions.
  - UX Assistant (OpenAI Realtime voice/chat) embedded site-wide.
  - Builder Agent endpoint (GitHub App + Octokit) to draft posts, open PRs, trigger deploys; diff/confirm UI.
  - CI via GitHub Actions; RSS/sitemap; analytics (Cloudflare or Vercel).
- Constraints:
  - TSL/WebGPU-first; no monolithic global configs; ESM-only; named exports; no default exports.
  - Keep effects/materials/labs self-contained; include `dispose()` where applicable.
- Testing:
  - Vitest unit tests for utils and schema; Playwright smoke for engine mount, nav, article render, labs mount.
- Hosting:
  - Primary: Vercel (free) + custom domain; Alternative: Cloudflare Pages + Workers (free).
- Output:
  - Running repo with scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `e2e`, `generate:rss`, `generate:sitemap`.
  - Docs: README (run/deploy), ARCH (engine/content/agents), TSL patterns catalog, Labs authoring guide.

If you want, I can generate the full Next.js starter with these files and CI as proposed; since you’re in ask mode, I’ll output the files for you to copy, or we can switch to agent mode for me to scaffold it automatically.

- Built an engine-first blueprint, stack, and phased workflow.
- Included minimal code for persistent WebGPU-first R3F canvas, schema controls, Contentlayer, and CI.
- Curated resources and provided a refined master prompt you can reuse with your agents.