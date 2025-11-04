# Legacy Backup

This folder contains the old TSLStudio implementation before the architecture restructuring.

## Contents

- `engine/` - Old engine folder with duplicated code
- `src/` - Old src folder with mixed concerns

## Migration Date
November 4, 2025

## Why This Was Moved

The old structure had:
- ❌ Duplicate code in `engine/` and `src/tsl/`
- ❌ Mixed concerns (app + library in `src/`)
- ❌ Confusing organization
- ❌ Inconsistent naming

## New Structure

The codebase now uses:
```
packages/
├── engine/     - Pure WebGPU rendering engine
├── tsl/        - Unified shader library
└── studio/     - React application
```

## Restoration

If you need to restore the old structure:
```bash
# Backup current packages
mv packages packages-new

# Restore old structure
mv .legacy-backup/engine ./
mv .legacy-backup/src ./

# Restore old configs (if needed)
git checkout tsconfig.json vite.config.ts index.html
```

## Deletion

After verifying the new structure works:
```bash
rm -rf .legacy-backup/
```

---

**⚠️ This backup is temporary. Delete after confirming the new architecture works correctly.**

