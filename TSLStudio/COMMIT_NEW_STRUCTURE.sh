#!/bin/bash
# Script to commit and merge the NEW unified architecture

echo "🎯 Committing NEW Unified Architecture..."
echo ""

# Stage all changes
git add .

# Commit
git commit -m "feat: unified architecture - merge engine+src into packages/

BREAKING CHANGE: Project restructured into packages/ architecture

- Created packages/engine - Pure WebGPU rendering
- Created packages/tsl - Unified shader library (merged engine/fx + src/tsl)
- Created packages/studio - React application
- Eliminated 15+ duplicate files
- Updated all import paths to @engine, @tsl, @studio
- Updated tsconfig.json, vite.config.ts, index.html

Benefits:
- Zero code duplication
- Clear 3-layer architecture (Engine → TSL → Studio)
- Better organization and maintainability
- Obvious where to add new code

Migration details in MIGRATION_COMPLETE.md
Old code backed up in .legacy-backup/"

# Show status
echo ""
echo "✅ Changes committed!"
echo ""
echo "📊 Commit summary:"
git log -1 --stat

echo ""
echo "🚀 Next steps:"
echo "1. Review the commit: git show"
echo "2. Push to remote: git push origin main"
echo "3. Or merge to main: git checkout main && git merge <your-branch>"


