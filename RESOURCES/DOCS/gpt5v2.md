Got it. Here’s a tight compare → rank → final-pick for each category, then the recommended end-to-end pipeline for your site.

# Content: Contentlayer vs Sanity

**What they are**

* **Contentlayer** – local, file-based content (MD/MDX) with auto type-gen; great with Next App Router. ([Contentlayer][1])
* **Sanity** – hosted headless CMS + open-source React “Studio” (MIT), real-time content lake, GROQ, visual workflows. ([GitHub][2])

**Use when**

* Contentlayer: versioned docs/blog, developer-owned content, zero infra. ([Contentlayer][1])
* Sanity: non-dev editors, structured content (portfolio, case studies), roles, web previews. ([GitHub][2])

**Rank for your site**

1. **Hybrid: Contentlayer + Sanity** (best of both—MDX tech posts + CMS-managed portfolio) → **Pick this**. 2) Contentlayer-only (if it’s just you). 3) Sanity-only (if a team edits daily).

# Animation: Motion.dev / Framer / Framer Motion / GSAP

**What they are**

* **Motion (motion.dev)** – modern successor to Framer Motion; tiny, React/JS/Vue; hybrid rAF + WAAPI engine; layout/shared-element APIs. ([motion.dev][3])
* **Framer Motion** – the familiar React API; now effectively under Motion docs & packages. ([motion.dev][4])
* **GSAP** – industry workhorse for complex timelines/scroll/marketing flourishes; animates “anything”. ([GSAP][5])
* **Framer (the site builder)** – no-code site platform; not an animation lib. ([Framer][6])

**Rank & roles**

1. **Motion** for UI/state/layout transitions inside React (fast + small). ([motion.dev][3])
2. **GSAP** for hero sequences, scroll-jacking, intricate timelines. ([GSAP][5])
3. **Framer Motion** if you prefer the older naming/docs—API maps to Motion. ([motion.dev][4])
   (Framer site builder = optional for quick standalone marketing pages.)

# Visual builder (React-friendly)

* **Plasmic** – open-source visual builder that plugs into your codebase; register your own React components; great for “sections/pages” without leaving your repo. **Best fit**. ([plasmic.app][7])
* **Builder.io** – strong visual headless CMS, component-driven, but SaaS-first. ([Builder.io][8])
* **Storyblok** – headless CMS with realtime Visual Editor + React SDK. ([Storyblok][9])
* **Sanity** – Studio is open-source; visual/live preview workflows exist, but it’s not a drag-drop page builder out of the box. ([GitHub][2])
* **Webflow** – polished visual tool, but export/React integration is limited/one-way; keep for quick microsites, not your main React codebase. ([Webflow][10])

**Rank**: 1) **Plasmic**, 2) Builder.io, 3) Storyblok, 4) Sanity (with custom previews), 5) Webflow (separate site only).

# React frameworks

* **Next.js 15** – App Router + React 19 support, Turbopack dev, experimental Partial Prerendering (PPR) to blend static shell with dynamic bits. **Primary pick**. ([Next.js][11])
* **Remix / React Router “framework mode”** – server-first, progressive enhancement, nested routing; great forms/edge. ([Remix][12])
* **Astro** – content-first “islands”; superb for blogs/docs/marketing, can embed R3F islands. ([Astro Documentation][13])
* **Vite** – the fast build tool (not a fullstack framework). ([vitejs][14])

**Rank for your site**: 1) **Next 15**, 2) Astro (docs sub-site), 3) Remix (if you go all-in server-first), 4) Vite SPA.

# UI libraries

* **shadcn/ui + Radix** – copy-in components built on Radix primitives and Tailwind; full code ownership + a11y. **Best for a custom, branded system.** ([shadcn.io][15])
* **Ant Design** – massive enterprise component set & design system. ([Ant Design][16])
* **Chakra UI** – simple, accessible, fast to theme; great DX. ([Chakra UI][17])

**Rank**: 1) **shadcn/ui + Radix**, 2) AntD (if you need breadth fast), 3) Chakra (if you want simplicity).

---

# Your final, opinionated pipeline (tailored for your 3D/R3F + blog + CMS)

**Framework & runtime**

* **Next.js 15 (App Router)** with RSC. Use SSR/ISR for dynamic pages; adopt **PPR** only per-route when it measurably helps (it’s still experimental). Deploy on Vercel. ([Next.js][11])

**Content model**

* **Contentlayer + MDX** for engineering posts, longform docs, changelogs (type-safe, versioned). ([Contentlayer][1])
* **Sanity** for portfolio entries, case studies, home/landing slice content, media management, and editor workflows. Connect live preview to Next. ([GitHub][2])
* (Optional) **Plasmic** to let you visually compose hero/landing sections using your own React components—without breaking your code ownership. ([plasmic.app][7])

**Design system**

* **shadcn/ui + Radix + Tailwind** as the base. Start with Button/Input/Dialog/Menu from shadcn; extend tokens (CSS vars) for your brand. ([shadcn.io][15])

**Animation rules**

* **Motion** for UI/layout/shared-element transitions across the app (menus, route transitions, cards). ([motion.dev][3])
* **GSAP** for marquee hero scenes, scroll-scrub storytelling, and any multi-track timelines. ([GSAP][5])

**3D / Interactive**

* **R3F + drei** inside Next routes (dynamic import for `<Canvas>` sections). Your heavy WebGPU scenes stay isolated; marketing pages remain light (you can even mount them as Astro islands later if you split a docs site). *(Astro optional for a separate /docs subdomain.)* ([Astro Documentation][13])

**Why this wins (for you)**

* Keeps **dev-authored** technical content local (Contentlayer) while giving **non-dev** editing superpowers (Sanity). ([Contentlayer][1])
* Modern, **performant** UI animations with Motion; **cinematic** bits via GSAP. ([motion.dev][3])
* **Custom visual identity** with shadcn/Radix, not stuck in a vendor theme. ([shadcn.io][15])
* Next 15 gives you RSC + ISR today and an on-ramp to **PPR** later if needed. ([Next.js][11])

---

## Quick ranks (at a glance)

* **Content**: Hybrid (Contentlayer + Sanity) > Contentlayer-only > Sanity-only. ([Contentlayer][1])
* **Animations**: Motion > GSAP > Framer Motion (alias) > Framer (site builder). ([motion.dev][3])
* **Visual builder (React)**: Plasmic > Builder.io > Storyblok > Sanity (previews) > Webflow. ([plasmic.app][7])
* **Framework**: Next 15 > Astro (for docs) > Remix > Vite SPA. ([Next.js][11])
* **UI**: shadcn/ui + Radix > AntD > Chakra. ([shadcn.io][15])

If you want, I’ll turn this into a repo-ready checklist (folders, deps, Next config, Sanity schema starters, Contentlayer config, and a Motion + GSAP example route) you can drop into your project.

[1]: https://www.contentlayer.dev/docs/environments/nextjs-dcf8e39e?utm_source=chatgpt.com "Next.js"
[2]: https://github.com/sanity-io/sanity?utm_source=chatgpt.com "Sanity Studio – Rapidly configure content workspaces ... - GitHub"
[3]: https://motion.dev/?utm_source=chatgpt.com "Motion — JavaScript & React animation library"
[4]: https://motion.dev/docs?utm_source=chatgpt.com "Motion Documentation (prev Framer Motion)"
[5]: https://gsap.com/docs/v3/?utm_source=chatgpt.com "docsHome | GSAP | Docs & Learning"
[6]: https://www.framer.com/developers/?utm_source=chatgpt.com "Framer for Developers"
[7]: https://www.plasmic.app/?utm_source=chatgpt.com "Plasmic | Build powerful apps fast— without the limits"
[8]: https://www.builder.io/m/react?utm_source=chatgpt.com "Drag and drop page building for React"
[9]: https://www.storyblok.com/react-cms?utm_source=chatgpt.com "The Best CMS for React with a Visual Editor"
[10]: https://webflow.com/integrations/react?utm_source=chatgpt.com "Integrate React with Webflow | Quick connect guide"
[11]: https://nextjs.org/blog/next-15?utm_source=chatgpt.com "Next.js 15"
[12]: https://remix.run/blog/rsc-preview?utm_source=chatgpt.com "React Router RSC Preview"
[13]: https://docs.astro.build/en/concepts/islands/?utm_source=chatgpt.com "Islands architecture - Astro Docs"
[14]: https://vite.dev/?utm_source=chatgpt.com "Vite | Next Generation Frontend Tooling"
[15]: https://www.shadcn.io/ui?utm_source=chatgpt.com "Shadcn UI React Components"
[16]: https://ant.design/?utm_source=chatgpt.com "Ant Design - The world's second most popular React UI ..."
[17]: https://chakra-ui.com/?utm_source=chatgpt.com "Chakra UI"
