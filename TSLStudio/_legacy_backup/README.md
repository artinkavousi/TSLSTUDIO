# 📦 Legacy Backup - Original TSLStudio Structure

> This folder contains the archived migration attempt from November 4, 2025

## 📋 Contents

This backup preserves:
- The proposed `packages/` architecture that was attempted
- Migration documentation
- Architectural proposals

## 🗂️ Structure

```
_legacy_backup/
├── packages/           ← The 3-layer architecture we attempted
│   ├── engine/         (WebGPU rendering core)
│   ├── tsl/            (Unified shader library)
│   └── studio/         (React application)
│
├── docs_proposals/     ← Architectural documentation
│
└── MIGRATION_COMPLETE.md
```

## ⚠️ Status

**This migration was REVERTED** - The project returned to the original structure:
- `engine/` folder (original location)
- `src/` folder (original location)

## 📝 Why Reverted?

The migration was technically successful (build passed), but was reverted to maintain the original working structure.

## 💡 Future Reference

If you want to attempt this migration again in the future:
1. Review the architectural proposals in `docs_proposals/`
2. Review `MIGRATION_COMPLETE.md` for what was accomplished
3. The `packages/` folder here shows the target structure
4. All import paths were successfully updated and working

## 🔍 What Was Attempted

### Proposed Structure
- **Layer 1 (Engine)**: Pure WebGPU rendering - no React, no app code
- **Layer 2 (TSL)**: Shader library - all materials, effects, compute unified
- **Layer 3 (Studio)**: React application - UI, routes, components

### Key Changes Made
- Merged duplicate materials from `engine/materials` + `src/tsl/materials`
- Merged duplicate post-processing from `engine/fx` + `src/tsl/post_processing`
- Consolidated compute shaders
- Updated 50+ import paths
- Created proper package exports

### Result
✅ Build successful (993 modules, 12.6s)
✅ Zero TypeScript errors
❌ Reverted by user

---

*Archived: November 4, 2025*

