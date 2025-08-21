# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Repository: todo-list-app (React + TypeScript + Vite)

Common commands (npm)
- Install deps: npm install
- Start dev server: npm run dev
- Build production bundle: npm run build
- Preview local build: npm run preview
- Lint: npm run lint
- Type-check: npm run typecheck
- Tests:
  - Run watcher: npm test
  - Run once: npm run test:run
  - Coverage: npm run coverage
  - Run a single test file: npm run test:run -- src/__tests__/App.test.tsx
  - Example matchers from jest-dom are available via vitest.setup.ts

Architecture overview
- UI stack: React 19 + TypeScript + Vite + Tailwind v4
- Data layer (local-first): IndexedDB via Dexie
  - DB: src/db.ts defines TasksDB with tasks store and indexes (id, status, dueDate, updatedAt)
  - Repository: src/repo.ts provides CRUD operations, search/filtering, and toggling status
- App state and features: src/App.tsx
  - In-memory state of tasks with persistence via repo.ts
  - Views: all, today, upcoming, completed
  - Filters: tags, text search (title/notes/tags), sort (updated/due/priority/title)
  - Keyboard shortcuts: '/' focuses search; 'Escape' cancels editing
- Components
  - Editor modal: src/components/TaskEditor.tsx (edits title, notes, due date, priority, tags)
  - Reusable UI primitives and effects: src/components/ui/* (e.g., theme-dropdown, particle-button, border-beam)
- Styling
  - Tailwind v4 with PostCSS plugin @tailwindcss/postcss
  - Global styles in src/index.css and component-level classes
- Module resolution and aliases
  - Vite alias: @ -> src (vite.config.ts)
  - TypeScript paths: "@/*" -> "src/*" (tsconfig.app.json)

Configuration highlights
- package.json scripts
  - dev: vite
  - build: tsc -b && vite build
  - preview: vite preview
  - lint: eslint .
  - typecheck: tsc --noEmit
- Vite (vite.config.ts)
  - Plugins: @vitejs/plugin-react
  - Base: /todo-list-app/ (for GitHub Pages)
  - Alias: '@' -> src
- TypeScript
  - Project references: tsconfig.json references tsconfig.app.json and tsconfig.node.json
  - Strictness: strict true; additional checks (noUnusedLocals/Parameters, noUncheckedSideEffectImports, etc.)
  - JSX: react-jsx
  - Paths: "@/*" -> "src/*"
- ESLint (eslint.config.js)
  - Extends: @eslint/js recommended, typescript-eslint recommended
  - Plugins/configs: react-hooks (recommended-latest), react-refresh (vite)
  - Target: browser globals; ECMAScript 2020
- Tailwind/PostCSS
  - Tailwind v4 minimal config (tailwind.config.js)
  - PostCSS: @tailwindcss/postcss (postcss.config.cjs)

CI/CD
- GitHub Pages workflow: .github/workflows/deploy.yml
  - Triggers: push to main and manual workflow_dispatch
  - Node 20, npm ci, npm run build, upload dist as artifact
  - Deploys with actions/deploy-pages@v4
  - Ensure vite.config.ts base (/todo-list-app/) matches the repository name for correct routing

Practical notes
- Local data reset: use browser DevTools -> Application -> IndexedDB -> delete database 'todo_list_db'
- Import paths: prefer alias '@', e.g., import X from '@/components/...'

