
# TSL + WebGPU Companion (Original Examples & Notes)

**What this is:** An original companion pack that mirrors the *topics* covered in Maxime Heckel’s article
*Field Guide to TSL and WebGPU* — without copying the article’s text or code. It gives you a quick-start
with minimal examples you can adapt.

> For the article itself, please read it on the author’s site.

## Contents

- `README.md` — You are here.
- `index.html` — Simple launcher with links to the examples.
- `examples/01-tsl-gradient.html` — Basic TSL fragment node (uv → color) using Three.js Nodes.
- `examples/02-webgpu-instanced-grid.html` — Instanced boxes positioned via TSL node math and `instanceIndex` on WebGPU.

> Notes: These are intentionally small and self-contained. They target recent Three.js (r180+) and the
WebGPU renderer where applicable. If your browser lacks WebGPU, Three.js will often fall back to WebGL2
when supported, but compute shaders won’t run in WebGL2.

## Quick start (no bundler)

1) Open the individual HTML files in a modern browser (Chrome/Edge/Arc/Canary; Safari 18+ for WebGPU).
2) If you see CORS issues, run a local server (e.g., `python -m http.server 8080`) and open `http://localhost:8080`.

## Quick start (Vite / bundler)
If you prefer a bundler:
```bash
npm create vite@latest tsl-webgpu-companion -- --template vanilla
cd tsl-webgpu-companion
npm i three
# Copy the HTML from the `examples/` here and adjust import paths to your setup.
npm run dev
```

## License
This pack is © 2025 by the original author of this companion. You may use and modify freely for your own projects.
It does not include any third-party code from the referenced blog post.
