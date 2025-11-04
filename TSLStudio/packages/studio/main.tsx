import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import './index.css'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

if (import.meta.env.DEV) {
  const hook = (globalThis as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
  if (hook && typeof hook.registerRenderer === 'function' && !hook.__patchedForSemver) {
    const originalRegister = hook.registerRenderer
    hook.registerRenderer = function registerRendererPatched(renderer: any, ...rest: any[]) {
      if (renderer && typeof renderer.version === 'string' && renderer.version.trim() === '') {
        renderer.version = '19.0.0'
      }
      if (rest.length > 0) {
        const packages = rest[0]?.packages ?? rest[0]
        if (packages && typeof packages === 'object') {
          const reactPkg = packages.react || packages['react-dom'] || packages.__proto__?.react
          if (reactPkg && typeof reactPkg.version === 'string' && reactPkg.version.trim() === '') {
            reactPkg.version = '19.0.0'
          }
        }
      }
      try {
        return originalRegister.call(this, renderer, ...rest)
      } catch (error) {
        if (error instanceof Error && error.message.includes('not valid semver')) {
          return undefined
        }
        throw error
      }
    }
    hook.__patchedForSemver = true
  }
}

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => {
    return (
      <div>
        <h1>404 - Not Found</h1>
        <p>The page doesn&apos;t exist</p>
      </div>
    )
  },
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
