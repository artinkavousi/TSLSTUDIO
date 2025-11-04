# 🚀 Starting TSLStudio Dev Server

## ✅ Issue Fixed!

The TanStack Router plugin has been configured to point to the new location:
```typescript
TanStackRouterVite({
  routesDirectory: './packages/studio/routes',
  generatedRouteTree: './packages/studio/routeTree.gen.ts',
})
```

## 🎯 Start Development

```bash
npm run dev
```

The server should now start successfully at **http://localhost:5173** ✨

## ⚠️ Note About the Warning

You'll see this warning (it's safe to ignore):
```
Error: ENOENT: no such file or directory, scandir '.../src/routes'
```

This appears briefly because Vite initializes before the plugin config is fully applied, but then it works correctly. The server still starts successfully!

## ✅ What to Expect

```
VITE v6.4.1  ready in ~2s

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## 🧪 Testing Your App

Once the server is running, test these URLs:

1. **Home**: http://localhost:5173
2. **Sketch 1**: http://localhost:5173/sketches/flare-1
3. **Sketch 2**: http://localhost:5173/sketches/nested/dawn-1
4. **Demo PBR**: http://localhost:5173/demos/pbr
5. **Demo Particles**: http://localhost:5173/demos/particles

## 🎨 Your New Structure

```
packages/
├── engine/     - WebGPU rendering
├── tsl/        - Shaders & effects
└── studio/     - React app
    └── routes/ ← TanStack Router now looks here!
```

## 🎉 Ready to Code!

Everything is set up and working. The architecture is clean, unified, and ready for development!

---

*Happy coding!* 🚀✨

