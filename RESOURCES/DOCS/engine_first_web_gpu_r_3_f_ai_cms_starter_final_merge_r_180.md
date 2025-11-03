# Engine‑First WebGPU R3F AI‑CMS Starter — **FINAL MERGE** (Three.js r180)

A production‑ready, repo‑based starter that merges everything we planned:

- **Next.js (App Router) + TypeScript**
- **Persistent R3F/Three canvas** across the site
- **WebGPU‑first with TSL**, WebGL fallback
- **Schema‑driven Admin Dashboard** (Tweakpane) for creative/dev modes
- **Content pipeline**: MDX + Contentlayer, per‑post 3D/GSAP templates
- **AI Assistants**: UX Copilot (in‑page) + Builder Agent (admin PR flow)
- **RAG**: pgvector (Supabase) adapter; easy swap to CF Vectorize
- **Search/Comments/Analytics**: Pagefind, Giscus, Cloudflare Analytics
- **$0/offline** fallback: WebLLM (browser, WebGPU)
- **CI/CD**: GitHub Actions; deploy to Vercel or Cloudflare Pages (OpenNext)
- **Guardrails**: dry‑run → diff → confirm → PR (no direct writes to `main`)

---

## 0) Quick Start

```bash
# 1) Create app + move in
npx create-next-app@latest my-site --ts --eslint --tailwind
cd my-site

# 2) Install core deps
pnpm add three @react-three/fiber @react-three/drei @react-three/postprocessing zustand gsap
pnpm add contentlayer next-contentlayer
pnpm add ai zod              # Vercel AI SDK style tools + Zod
pnpm add @mlc-ai/web-llm     # offline assistant (optional)
pnpm add tweakpane @tweakpane/plugin-essentials

# 3) Dev tools & search
pnpm add -D pagefind vitest playwright @playwright/test biome

# 4) Copy files from this doc into your repo (matching paths)
# 5) Run it
pnpm dev
```

---

## 1) File Map

```
app/
  layout.tsx
  globals.css
  page.mdx
  admin/page.tsx
  blog/[slug]/page.tsx
  api/
    ux-assistant/route.ts
    builder/route.ts
components/
  ThreeRoot.tsx
  UiOverlay.tsx
  AssistantClient.tsx
  AdminAgentPanel.tsx
lib/
  store.ts
  scenes.ts
  admin/
    schemas.ts
    schema-pane.ts
  shaders/tsl/GlowPulse.ts
  ai/
    providers.ts
    rag.ts
  agents/
    ux-tools.ts
    admin-tools.ts
    git-utils.ts
  cms/contentlayer.config.ts
  analytics.ts
scenes/
  home/Scene.tsx
  portfolio/Scene.tsx
  fluid/Scene.tsx
templates/
  registry.json
  HeroGlassWave.tsx
styles/
  tokens.json
content/
  posts/hello-world.mdx
public/
  og/.keep
  models/.keep
  textures/.keep
scripts/
  postbuild-pagefind.mts
  seed-content.mts
.docs/
  ARCH.md
  AI_AGENTS.md
  DEPLOY.md
  OPERATIONS.md
  CONTENT_MODEL.md
.github/workflows/
  quality.yml
  build.yml
  deploy.yml
.env.example
```

---

## 2) Core: Persistent Canvas + WebGPU‑first

**app/layout.tsx**
```tsx
// app/layout.tsx
import './globals.css'
import ThreeRoot from '@/components/ThreeRoot'
import { UiOverlay } from '@/components/UiOverlay'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThreeRoot />
        <div id="overlay-root">
          <UiOverlay>{children}</UiOverlay>
        </div>
      </body>
    </html>
  )
}
```

**components/ThreeRoot.tsx**
```tsx
'use client'
import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { WebGPURenderer } from 'three/webgpu'
import { WebGLRenderer, ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import { resolveScene } from '@/lib/scenes'

function makeRenderer(canvas: HTMLCanvasElement) {
  // WebGPU first
  if (typeof navigator !== 'undefined' && (navigator as any).gpu) {
    const r = new WebGPURenderer({ canvas, antialias: true })
    ;(r as any).toneMapping = ACESFilmicToneMapping
    return r
  }
  // Fallback WebGL
  const r = new WebGLRenderer({ canvas, antialias: true })
  r.outputColorSpace = SRGBColorSpace
  r.toneMapping = ACESFilmicToneMapping
  return r
}

export default function ThreeRoot() {
  const path = usePathname()
  const Scene: any = useMemo(() => resolveScene(path || '/'), [path])

  return (
    <Canvas
      gl={(canvas) => {
        const r = makeRenderer(canvas)
        const dpr = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio : 1)
        r.setPixelRatio?.(dpr)
        // NOTE: WebGPU's renderer requires async init; do it in onCreated below
        return r as any
      }}
      onCreated={({ gl, size, invalidate }) => {
        // Call WebGPU init if available, then invalidate once ready
        if (typeof (gl as any).init === 'function') {
          ;(gl as any).init().then(() => {
            ;(gl as any).setSize?.(size.width, size.height, false)
            invalidate()
          })
        } else {
          ;(gl as any).setSize?.(size.width, size.height, false)
        }
      }}
      frameloop="demand"
      shadows>
      <Suspense fallback={null}>
        <Scene />
        <EffectComposer>
          <Bloom />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
```

**lib/scenes.ts**
```ts
import dynamic from 'next/dynamic'
const Home = dynamic(() => import('@/scenes/home/Scene'), { ssr: false })
const Portfolio = dynamic(() => import('@/scenes/portfolio/Scene'), { ssr: false })
const Fluid = dynamic(() => import('@/scenes/fluid/Scene'), { ssr: false })

const MAP: Record<string, any> = {
  '/': Home,
  '/portfolio': Portfolio,
  '/labs/fluid': Fluid,
}
export function resolveScene(path: string) { return MAP[path] ?? Home }
```

**lib/store.ts**
```ts
import { create } from 'zustand'

type Params = {
  material: { baseColor: string; metalness: number; roughness: number; emissivePulse: boolean }
  postfx: { bloom: boolean; bloomStrength: number }
  renderer: 'webgpu' | 'webgl' | 'auto'
  debugNormals: boolean
  maxFPS: number
}

export const useStore = create<{ params: Params; set: (path: string, v: any) => void }>((set, get) => ({
  params: {
    material: { baseColor: '#34d399', metalness: 0.2, roughness: 0.35, emissivePulse: true },
    postfx: { bloom: true, bloomStrength: 0.65 },
    renderer: 'auto',
    debugNormals: false,
    maxFPS: 60,
  },
  set: (path, value) => {
    const p = structuredClone(get().params)
    const keys = path.split('.')
    let o: any = p
    for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]] ?? (o[keys[i]] = {})
    o[keys.at(-1)!] = value
    set({ params: p })
  },
}))
```

**lib/shaders/tsl/GlowPulse.ts**
```ts
import { MeshStandardNodeMaterial, timerGlobal, sin, mul, add, color, float } from 'three/tsl'

export function makeGlowPulseMaterial(hex = '#34d399') {
  const mat = new MeshStandardNodeMaterial()
  const t = timerGlobal()
  const pulse = add(float(0.5), mul(float(0.5), sin(mul(t, float(2.0)))))
  mat.colorNode = color(hex)
  mat.emissiveNode = color(hex).mul(pulse)
  return mat
}
```

**scenes/home/Scene.tsx**
```tsx
'use client'
import { useMemo } from 'react'
import { makeGlowPulseMaterial } from '@/lib/shaders/tsl/GlowPulse'

export default function Scene() {
  const mat = useMemo(() => makeGlowPulseMaterial('#60a5fa'), [])
  return (
    <mesh material={mat}>
      <icosahedronGeometry args={[1.1, 5]} />
    </mesh>
  )
}
```

**scenes/fluid/Scene.tsx** (seed demo)
```tsx
'use client'
import { useMemo } from 'react'
import { useStore } from '@/lib/store'
import { makeGlowPulseMaterial } from '@/lib/shaders/tsl/GlowPulse'

export default function Scene() {
  const { params } = useStore()
  const mat = useMemo(() => makeGlowPulseMaterial(params.material.baseColor), [params.material.baseColor])
  return (
    <mesh material={mat}>
      <sphereGeometry args={[1, 64, 64]} />
    </mesh>
  )
}
```

---

## 3) Admin Dashboard (schema‑driven)

**lib/admin/schemas.ts**
```ts
import { z } from 'zod'

export const creativeSchema = z.object({
  material: z.object({
    baseColor: z.string().default('#34d399'),
    metalness: z.number().min(0).max(1).default(0.2),
    roughness: z.number().min(0).max(1).default(0.35),
    emissivePulse: z.boolean().default(true),
  }),
  postfx: z.object({
    bloom: z.boolean().default(true),
    bloomStrength: z.number().min(0).max(2).default(0.65),
  }),
})

export const devSchema = z.object({
  renderer: z.enum(['webgpu', 'webgl', 'auto']).default('auto'),
  debugNormals: z.boolean().default(false),
  maxFPS: z.number().min(15).max(240).default(60),
})

export type AdminState = z.infer<typeof creativeSchema> & z.infer<typeof devSchema>
```

**lib/admin/schema-pane.ts**
```ts
import type { Pane } from 'tweakpane'

function resolveObjectKey(root: any, dotted: string): [any, string] {
  const parts = dotted.split('.')
  const key = parts.pop()!
  const obj = parts.reduce((o, p) => (o[p] ??= {}), root)
  if (!(key in obj)) obj[key] = undefined
  return [obj, key]
}

function bindBlade(folder: any, target: any, path: string, def: any) {
  const [obj, key] = resolveObjectKey(target, path)
  if (def.type === 'boolean') folder.addBinding(obj, key)
  else if (def.type === 'number') folder.addBinding(obj, key, { min: def.minimum, max: def.maximum, step: def.multipleOf ?? 0.01 })
  else if (def.type === 'string' && (def.format === 'color' || /^#/.test(obj[key] || '')))
    folder.addBinding(obj, key, { view: 'color' })
  else folder.addBinding(obj, key)
}

export function renderPaneFromSchema(pane: Pane, state: any, jsonSchema: any, opts?: { title?: string }) {
  const folder = pane.addFolder({ title: opts?.title ?? 'Controls', expanded: true })
  const props = jsonSchema.properties ?? {}
  for (const [key, def] of Object.entries<any>(props)) {
    if (def.type === 'object') {
      const sub = folder.addFolder({ title: key })
      for (const [k, d] of Object.entries<any>(def.properties ?? {})) bindBlade(sub, state, `${key}.${k}`, d)
    } else bindBlade(folder, state, key, def)
  }
}
```

**app/admin/page.tsx**
```tsx
'use client'
import { useEffect, useRef } from 'react'
import { Pane } from 'tweakpane'
import * as Essentials from '@tweakpane/plugin-essentials'
import { useStore } from '@/lib/store'
import { creativeSchema, devSchema } from '@/lib/admin/schemas'
import { renderPaneFromSchema } from '@/lib/admin/schema-pane'

const creativeJsonSchema = {
  type: 'object',
  properties: {
    material: {
      type: 'object',
      properties: {
        baseColor: { type: 'string', format: 'color' },
        metalness: { type: 'number', minimum: 0, maximum: 1, multipleOf: 0.01 },
        roughness: { type: 'number', minimum: 0, maximum: 1, multipleOf: 0.01 },
        emissivePulse: { type: 'boolean' },
      },
    },
    postfx: {
      type: 'object',
      properties: {
        bloom: { type: 'boolean' },
        bloomStrength: { type: 'number', minimum: 0, maximum: 2, multipleOf: 0.01 },
      },
    },
  },
}

const devJsonSchema = {
  type: 'object',
  properties: {
    renderer: { type: 'string' },
    debugNormals: { type: 'boolean' },
    maxFPS: { type: 'number', minimum: 15, maximum: 240, multipleOf: 1 },
  },
}

export default function AdminPage() {
  const ref = useRef<HTMLDivElement>(null)
  const { params, set } = useStore()

  useEffect(() => {
    const pane = new Pane({ title: 'Admin', container: ref.current! })
    pane.registerPlugin(Essentials)
    pane.addBlade({ view: 'fpsgraph', label: 'fps' })

    renderPaneFromSchema(pane, params as any, creativeJsonSchema, { title: 'Creative Mode' })
    renderPaneFromSchema(pane, params as any, devJsonSchema, { title: 'Dev Mode' })

    pane.on('change', (ev: any) => {
      // Persist minimal preset
      localStorage.setItem('adminPreset', JSON.stringify(pane.exportPreset()))
    })

    const saved = localStorage.getItem('adminPreset')
    if (saved) pane.importPreset(JSON.parse(saved))

    return () => pane.dispose()
  }, [])

  return <div ref={ref} className="p-4" />
}
```

---

## 4) Content Pipeline (MDX + Contentlayer) & 3D/GSAP Templates

**lib/cms/contentlayer.config.ts**
```ts
import { defineDocumentType, makeSource } from 'contentlayer/source-files'

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `posts/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    slug: { type: 'string', required: true },
    date: { type: 'date', required: true },
    tags: { type: 'list', of: { type: 'string' } },
    summary: { type: 'string' },
    cover: { type: 'string' },
    templateId: { type: 'string', required: true },
    styleId: { type: 'string', required: true },
    sceneProps: { type: 'json' },
  },
  computedFields: {
    url: { type: 'string', resolve: (p) => `/blog/${p.slug}` },
  },
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Post],
})
```

**content/posts/hello-world.mdx**
```mdx
---
title: "Hello WebGPU"
slug: hello-webgpu
date: 2025-10-12
tags: [webgpu, r3f, tsl]
summary: "First post with a live 3D header."
cover: "/og/hello-webgpu.png"
templateId: "hero.glassWave.v1"
styleId: "emerald-dark-kinetic"
sceneProps:
  shader: { hue: 155, emissivePulse: true, metalness: 0.2, roughness: 0.35 }
  fx: { bloom: true, bloomStrength: 0.65 }
---

Welcome to the future.
```

**templates/registry.json**
```json
[
  {
    "id": "hero.glassWave.v1",
    "component": "@/templates/HeroGlassWave",
    "schema": {
      "shader.hue": { "type": "number", "min": 0, "max": 360, "default": 155 },
      "shader.emissivePulse": { "type": "boolean", "default": true },
      "fx.bloom": { "type": "boolean", "default": true },
      "fx.bloomStrength": { "type": "number", "min": 0, "max": 2, "step": 0.01, "default": 0.65 }
    },
    "gsapTracks": ["introFloat", "accentPulse"]
  }
]
```

**styles/tokens.json**
```json
[
  {
    "id": "emerald-dark-kinetic",
    "tokens": {
      "colors": { "primary": "#34d399", "bg": "#0b0f12", "text": "#d1d5db" },
      "motion": { "introDuration": 2.2, "easing": "expo.out", "pulseAmp": 0.45 }
    }
  }
]
```

**templates/HeroGlassWave.tsx**
```tsx
'use client'
import { useEffect, useMemo, useRef } from 'react'
import { Mesh } from 'three'
import gsap from 'gsap'
import { MeshStandardNodeMaterial, timerGlobal, sin, float, add, mul, color } from 'three/tsl'

type Props = { tokens: any; sceneProps?: any }
export default function HeroGlassWave({ tokens, sceneProps }: Props) {
  const mesh = useRef<Mesh>(null!)
  const mat = useMemo(() => {
    const hue = sceneProps?.shader?.hue ?? 155
    const hex = `hsl(${hue} 70% 60%)`
    const m = new MeshStandardNodeMaterial()
    const t = timerGlobal()
    const pulse = add(float(0.5), mul(float(tokens.motion?.pulseAmp ?? 0.4), sin(mul(t, float(2.0)))))
    m.colorNode = color(hex)
    m.emissiveNode = (sceneProps?.shader?.emissivePulse ?? true) ? color(hex).mul(pulse) : color('#000')
    m.roughness = sceneProps?.shader?.roughness ?? 0.35
    m.metalness = sceneProps?.shader?.metalness ?? 0.2
    return m
  }, [tokens, sceneProps])

  useEffect(() => {
    gsap.fromTo(mesh.current.rotation, { x: 0.2, y: -0.3 }, { x: 0, y: 0, duration: tokens.motion?.introDuration ?? 2, ease: tokens.motion?.easing ?? 'power3.out' })
    gsap.fromTo(mesh.current.position, { z: -1 }, { z: 0, duration: 1.2, ease: 'expo.out', delay: 0.3 })
  }, [tokens])

  return (
    <mesh ref={mesh} material={mat}>
      <icosahedronGeometry args={[1.1, 5]} />
    </mesh>
  )
}
```

**app/blog/[slug]/page.tsx**
```tsx
import { allPosts } from 'contentlayer/generated'
import dynamic from 'next/dynamic'
import styles from '@/styles/tokens.json'
import registry from '@/templates/registry.json'

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = allPosts.find((p) => p.slug === params.slug)!
  const def: any = registry.find((t: any) => t.id === post.templateId)!
  const Style: any = (styles as any[]).find((s) => s.id === post.styleId)!
  const Template: any = dynamic(() => import(def.component), { ssr: false })

  return (
    <div className="prose prose-invert max-w-3xl mx-auto py-10">
      <h1>{post.title}</h1>
      <p className="opacity-75">{post.summary}</p>
      <Template tokens={Style.tokens} sceneProps={post.sceneProps} />
      <article dangerouslySetInnerHTML={{ __html: post.body.html }} />
    </div>
  )
}
```

---

## 5) UX Assistant (in‑page) & Builder Agent (admin)

**lib/ai/providers.ts**
```ts
import { createOpenAI } from 'ai'
export const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! })
```

**lib/agents/ux-tools.ts**
```ts
import { tool } from 'ai'
import { z } from 'zod'
import { headers } from 'next/headers'

export const navigate = tool(
  'navigate',
  z.object({ path: z.string() }),
  async ({ path }) => ({ ok: true, path })
)

export const setParam = tool(
  'setParam',
  z.object({ key: z.string(), value: z.any() }),
  async ({ key, value }) => ({ ok: true, key, value })
)

export const safeUiTools = { navigate, setParam }
```

**app/api/ux-assistant/route.ts**
```ts
import { openai } from '@/lib/ai/providers'
import { streamText } from 'ai'
import { safeUiTools } from '@/lib/agents/ux-tools'

export async function POST(req: Request) {
  const body = await req.json()
  return streamText({
    model: openai('gpt-4o-mini'),
    tools: safeUiTools,
    messages: body.messages ?? [],
  })
}
```

**lib/agents/git-utils.ts** (stubs)
```ts
export function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }
export async function diffPatch(path: string, next: string) {
  // Return a string diff or JSON patch; keep simple here
  return `DIFF::${path}\n${next.substring(0, 200)}...`
}
export async function openPR({ diffs, title }: { diffs: string[]; title: string }) {
  // Integrate your GitHub App here; return PR URL
  return { url: 'https://github.com/you/repo/pull/123', title }
}
```

**lib/agents/admin-tools.ts**
```ts
import { tool } from 'ai'
import { z } from 'zod'
import { readFile } from 'node:fs/promises'
import { slugify, diffPatch, openPR } from './git-utils'

export const draftPost = tool(
  'draftPost',
  z.object({ title: z.string(), brief: z.string(), tags: z.array(z.string()).optional(), templateId: z.string().default('hero.glassWave.v1'), styleId: z.string().default('emerald-dark-kinetic') }),
  async ({ title, brief, tags, templateId, styleId }) => {
    const slug = slugify(title)
    const mdxPath = `content/posts/${slug}.mdx`
    const body = `---\ntitle: "${title}"\nslug: ${slug}\ndate: ${new Date().toISOString()}\ntags: ${JSON.stringify(tags ?? [])}\nsummary: ""\ncover: "/og/${slug}.png"\ntemplateId: "${templateId}"\nstyleId: "${styleId}"\nsceneProps: {}\n---\n\n${brief}\n`
    return diffPatch(mdxPath, body)
  }
)

export const applyTemplate = tool(
  'applyTemplate',
  z.object({ slug: z.string(), sceneProps: z.record(z.any()) }),
  async ({ slug, sceneProps }) => {
    const path = `content/posts/${slug}.mdx`
    const src = '' // inject file read in real impl
    const updated = src.replace(/sceneProps:\s*{[^}]*}/, `sceneProps: ${JSON.stringify(sceneProps, null, 2)}`)
    return diffPatch(path, updated)
  }
)

export const confirmAndPR = tool(
  'confirmAndPR',
  z.object({ diffs: z.array(z.string()), title: z.string() }),
  async ({ diffs, title }) => openPR({ diffs, title })
)

export const adminTools = { draftPost, applyTemplate, confirmAndPR }
```

**app/api/builder/route.ts**
```ts
import { openai } from '@/lib/ai/providers'
import { streamText } from 'ai'
import { adminTools } from '@/lib/agents/admin-tools'

export async function POST(req: Request) {
  const body = await req.json()
  // TODO: add admin auth check here
  return streamText({ model: openai('gpt-4.1'), tools: adminTools, messages: body.messages ?? [] })
}
```

**components/AssistantClient.tsx**
```tsx
'use client'
import { useChat } from 'ai/react'

export default function AssistantClient() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({ api: '/api/ux-assistant' })
  return (
    <div className="fixed bottom-4 right-4 w-96 bg-black/60 backdrop-blur rounded-xl p-3">
      <div className="h-48 overflow-auto text-sm space-y-2">
        {messages.map(m => (<div key={m.id}><b>{m.role}:</b> {m.content}</div>))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
        <input value={input} onChange={handleInputChange} className="flex-1 bg-white/10 rounded px-2 py-1" placeholder="Ask the site…" />
        <button className="px-3 py-1 rounded bg-white/20">Send</button>
      </form>
    </div>
  )
}
```

---

## 6) RAG (optional) & Search/Comments/Analytics

**lib/ai/rag.ts** (adapter stubs)
```ts
export async function embedAndUpsert(path: string, text: string) { /* pgvector insert */ }
export async function search(query: string) { return [] }
```

**scripts/postbuild-pagefind.mts**
```ts
import { execSync } from 'node:child_process'
try { execSync('npx pagefind --site .next/static', { stdio: 'inherit' }) } catch {}
```

**lib/analytics.ts**
```ts
export function injectCFAnalytics() {
  return process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN
    ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN}"}'></script>`
    : ''
}
```

---

## 7) CI/CD (GitHub Actions)

**.github/workflows/quality.yml**
```yml
name: Quality
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm i --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm biome check .
      - run: pnpm test
```

**.github/workflows/build.yml**
```yml
name: Build
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm i --frozen-lockfile
      - run: pnpm build
```

*(Add a `deploy.yml` tailored to Vercel or Cloudflare Pages.)*

---

## 8) ENV & package scripts

**.env.example**
```
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GITHUB_APP_ID=
GITHUB_APP_INSTALLATION_ID=
GITHUB_APP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NEXTAUTH_SECRET=
NEXT_PUBLIC_GISCUS_REPO=
NEXT_PUBLIC_GISCUS_REPO_ID=
NEXT_PUBLIC_GISCUS_CATEGORY_ID=
NEXT_PUBLIC_CF_ANALYTICS_TOKEN=
```

**package.json (scripts extract)**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build && tsx scripts/postbuild-pagefind.mts",
    "start": "next start",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "lint": "biome check .",
    "format": "biome format .",
    "seed": "tsx scripts/seed-content.mts"
  }
}
```

---

## 9) Acceptance Checklist (automate with Playwright)

- **A1** Canvas persists across route changes; no WebGL/WebGPU context loss.
- **A2** `/labs/fluid` sliders (from Admin) affect scene params.
- **A3** MDX post renders + template mounts (R3F + GSAP).
- **A4** Pagefind index built; search returns seeded post.
- **A5** UX Assistant can call `navigate('/portfolio')` and `setParam('postfx.bloom', false)`.
- **A6** Builder Agent can produce a diff for a new post and (stub) open a PR.
- **A7** ENV secrets loaded; zero hard‑coded keys; build is clean.
- **A8** Optional: WebLLM fallback toggles and operates offline.

---

## 10) Deploy Notes

- **Vercel**: zero‑config; add env; push → preview → prod.
- **Cloudflare Pages (with OpenNext)**: set build to `next build`; functions/pages auto‑mapped; add Analytics token.
- **Domains**: add your registrar DNS; enforce HTTPS; set security headers.

---

## 11) Post‑Install TODOs

- Wire real GitHub App to `git-utils.ts` for PRs.
- Add auth (NextAuth/Clerk) gating `/admin` and `/api/builder`.
- Replace RAG stubs with Supabase client and nightly embed job.
- Add Giscus to `app/blog/[slug]/page.tsx` and Pagefind search UI.
- Add more templates (e.g., **MorphoGrid**), and a preset library.

---

## 12) Mermaid Diagram (flow)

```mermaid
flowchart LR
  A[User] -- chat/UI --> UX[UX Assistant]
  UX -- tools --> Z[Zustand Store]
  Z --> R3F[Persistent R3F Canvas]
  R3F --> WebGPU[WebGPU/TSL]
  subgraph Content
    MDX[MDX Posts]
    CL[Contentlayer]
    TMP[3D/GSAP Templates]
  end
  MDX --> CL --> App[Next.js]
  TMP --> App
  App --> R3F

  subgraph Admin
    AdminUI[/Admin Dashboard/]
    Builder[Builder Agent]
  end
  AdminUI -- schemas/presets --> Z
  AdminUI --> Builder
  Builder -- tools --> Repo[(Git Repo)]
  Builder -- PR --> GitHub[(GitHub)]
  GitHub --> CI[GitHub Actions]
  CI --> Deploy[Vercel/CF Pages]

  Search[Pagefind] -.-> App
  Giscus[Giscus] -.-> App
  Analytics[CF Analytics] -.-> App
```

---

**End of FINAL MERGE starter.**

