# WebGPU & TSL Libraries and Tools (Three.js r180+ Ecosystem)

## 1. TSL Modules and Shader Helpers

This section covers libraries and modules that provide helper functions, pre-made shaders, or utilities for **Three.js Shading Language (TSL)** in the **WebGPU** era.

| Name | Stars | Last Updated | Description | Key Features | Link |
|------|-------|--------------|-------------|--------------|------|
| **TSL Textures** | ~210 | 2025-10 | Collection of real-time procedural textures using TSL, meant to be plugged directly into NodeMaterials. | Procedural texture generators as reusable TSL nodes; easy integration with `three/webgpu`; published on npm (`tsl-textures`). | https://github.com/boytchev/tsl-textures |
| **TSLFX** | ~90–100 | 2025-10 | Growing TSL shader/VFX toolkit (shockwaves, SDFs, utilities) for NodeMaterials. | VFX “primitives” (impact), SDF shapes, TSL-first, MIT. | https://github.com/verekia/tslfx |
| **Three.js Built‑in TSL** | core | r180+ | Official TSL API and node system shipped with Three.js. | JS-authored shader graphs, auto WGSL/GLSL, works with NodeMaterials, WebGPU-first. | https://threejs.org/docs/#manual/en/introduction/TSL |
| **TSL Editor (bhushan6)** | small | 2025-03 | Browser node editor that builds TSL materials visually. | Early, open source, exports TSL-like graphs. | https://github.com/bhushan6/tsl-editor |
| **Three.js Visual Node Editor (bandinopla)** | ~50 | 2025-03 | Visual editor to build TSL graphs and export them as JS. | Graph layout stored inside generated file; MIT. | https://github.com/bandinopla/three.js-visual-node-editor |

---

## 2. Post‑Processing (WebGPU / TSL)

| Name | Stars | Last Updated | Description | Key Features | Link |
|------|-------|--------------|-------------|--------------|------|
| **Three.js WebGPU Node Postprocessing** | core | r180+ | New post‑FX pipeline in Three that uses TSL/NodeMaterials (bloom, DOF, AO) and is WebGPU‑ready. | MRT support, runs inside `three/webgpu`, node-based, composable. | https://threejs.org/examples/?q=webgpu#webgpu_postprocessing_dof |
| **pmndrs/postprocessing** | ~2.6k | 2025-10 | Mature post‑FX library for Three (originally WebGL). WebGPU support still emerging. | Huge effect library, composer-style API, widely used. | https://github.com/pmndrs/postprocessing |
| **R3F WebGPU Post‑FX Starters** | various | 2025 | Community starters showing how to use Three’s WebGPU post‑FX in React. | Good references for wiring async WebGPU renderer + post chain. | (search GitHub: “r3f webgpu postprocessing”) |

---

## 3. Compute & GPGPU (WebGPU)

| Name | Stars | Last Updated | Description | Key Features | Link |
|------|-------|--------------|-------------|--------------|------|
| **Three.js Compute via TSL** | core | r180+ | Built‑in support for compute shaders in TSL (e.g. particles, data transforms). | `storage()` + `compute()` nodes; runs every frame; WebGPU-first. | https://threejs.org/examples/?q=webgpu#webgpu_compute_particles |
| **Roquefort (WebGPU Fluid)** | ~65 | 2025-04 | Real‑time WebGPU fluid solver; great reference for GPU pipelines. | Advection, pressure, vorticity; compute‑heavy; JS/WebGPU. | https://github.com/Bercon/roquefort |
| **WebGPU GPGPU Tutorials (Codrops / WawaSensei)** | n/a | 2025 | Tutorials that show TSL+WebGPU particles, text destruction, data‑driven FX. | Shows how to write compute in TSL and feed it into render. | (search: “codrops webgpu three tsl compute”) |

---

## 4. Scene Templates & Frameworks (JS)

| Name | Stars | Last Updated | Description | Key Features | Link |
|------|-------|--------------|-------------|--------------|------|
| **React Three Fiber (R3F)** | ~29k | 2025-10 | React renderer for Three.js; supports async WebGPU renderer and NodeMaterials. | Declarative JSX scenes; `<Canvas gl={async () => new WebGPURenderer}>`; big ecosystem. | https://github.com/pmndrs/react-three-fiber |
| **Threlte (Svelte)** | ~3k | 2025-10 | Svelte + Three with WebGPU support; NodeMaterials via Svelte components. | Reactive Svelte stores; easy bindings; WebGPU flag. | https://github.com/threlte/threlte |
| **TresJS (Vue 3)** | ~3k | 2025-10 | Vue wrapper for Three; can use WebGPU + TSL through Vue components. | Vue SFC style, Nuxt integration. | https://github.com/Tresjs/tres |
| **Bruno Simon TSL Starter** | ~70 | 2023 | Minimal Vite + Three + TSL template to experiment with NodeMaterials. | Very clean, good for learning TSL. | https://github.com/brunosimon/three.js-tsl-template |

---

## 5. Commercial / Visual Shader Tools

| Name | License / Status | Description | Notes / Features | Link |
|------|------------------|-------------|------------------|------|
| **NodeToy** | Closed (free beta) | Online visual shader editor for Three/R3F. Exports materials via `@nodetoy/three-nodetoy`. | 150+ nodes, share/fork graphs, integrates in app; GLSL‑first today. | https://nodetoy.co |
| **Polygonjs** | Core MIT, tool SaaS | Houdini‑like node editor built on Three.js, exports scenes & shaders. | WebGL‑first today; good for prototyping, can hand‑port to TSL. | https://github.com/polygonjs/polygonjs |
| **Three.js Plus** | Commercial (waitlist) | Premium library of advanced Three/WebGPU/TSL effects. | Ready‑made FX, fluids, PBRs, post‑FX. | https://www.threejs-plus.com |

---

## 6. Notes on Versions & Compatibility

- **Three.js r180+** is the right target for serious WebGPU + TSL work (NodeMaterials are WebGPU‑first there).
- **R3F v9+** supports returning a **Promise** from `<Canvas gl={...}>`, which is how you can `await renderer.init()` for WebGPU.
- **pmndrs/postprocessing** is still WebGL‑centric → prefer Three’s built‑in node/post for WebGPU right now.
- Tools like **NodeToy** output GLSL today; to use fully in WebGPU you either re‑express the shader in TSL or let Three transpile (not always 1:1).

---

## 7. References

- Three.js TSL docs: https://threejs.org/docs/#manual/en/introduction/TSL
- Three.js WebGPU examples: https://threejs.org/examples/#webgpu_
- pmndrs/postprocessing: https://github.com/pmndrs/postprocessing
- R3F: https://github.com/pmndrs/react-three-fiber
- Threlte: https://github.com/threlte/threlte
- TresJS: https://github.com/Tresjs/tres
- Roquefort WebGPU Fluid: https://github.com/Bercon/roquefort
- TSL Textures: https://github.com/boytchev/tsl-textures

