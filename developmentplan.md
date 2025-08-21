# Todo List App - Development Plan

## 1. Project Overview
A cross-platform Todo List application with local-first data, optional cloud sync, and a clean, accessible UI. Targeting a simple MVP first, then iterative enhancements.

## 2. Goals & Non-Goals
- Goals:
  - Core CRUD for tasks (create, read, update, delete)
  - Due dates, priorities, tags, and search
  - Offline support (local storage / DB)
  - Tests and basic CI
- Non-Goals (MVP):
  - Team collaboration/real-time multi-user
  - Complex project management features (Gantt, timelines)

## 3. Target Platforms & Stack (proposal)
- Option A (Web-first): React + TypeScript, Vite, Tailwind; State via Zustand/Redux; Storage IndexedDB (Dexie). Optional Electron/Tauri for desktop packaging.
- Option B (Mobile-first): React Native + TypeScript; Storage MMKV/SQLite; Sync module later.
- Backend (deferred): Serverless API (FastAPI/Node) for optional sync.

Decision: Start Web-first (Option A) for fastest iteration.

## 4. MVP Scope
- Task model: id, title, notes, status, dueDate, priority, tags, createdAt, updatedAt
- Views: Inbox (all), Today, Upcoming, Completed, Tags filter
- Actions: add/edit/delete, complete/restore, search, sort
- Persistence: IndexedDB via Dexie, migrate-safe schema v1
- UX: keyboard shortcuts, accessible components, responsive layout

## 5. Architecture
- UI: React components (atomic design)
- State: store layer with selectors, optimistic updates
- Data: repository pattern on Dexie (CRUD, migrations)
- Services: date utils, id generator, import/export JSON
- Error handling: toast + retry, background save

## 6. Data Model (initial)
Task {
  id: string
  title: string
  notes?: string
  status: 'open' | 'completed'
  dueDate?: string // ISO date
  priority: 0|1|2|3
  tags: string[]
  createdAt: string
  updatedAt: string
}

## 7. Milestones & Timeline
- M0: Bootstrap project (Vite, TS, ESLint/Prettier, Tailwind) — 0.5 day
- M1: Data layer (Dexie schema v1, repo) — 1 day
- M2: Core UI (list, item, editor modal) — 1.5 days
- M3: Filters (Today/Upcoming/Completed, tags) — 1 day
- M4: Search & sort — 0.5 day
- M5: Keyboard shortcuts & a11y pass — 0.5 day
- M6: Import/Export JSON — 0.5 day
- M7: Tests (unit for data/services, basic e2e with Playwright) — 1 day
- M8: Packaging (optional Tauri/Electron) — 1 day

## 8. Testing Strategy
- Unit: store selectors, repo functions, date utils
- Component: list rendering, editor interactions
- E2E: create/complete/edit/delete flows; persistence across reloads
- Tooling: Vitest, React Testing Library, Playwright

## 9. CI/CD
- GitHub Actions: lint, typecheck, unit tests on PR; e2e on main nightly
- Build preview with Vercel/Netlify

## 10. Risks & Mitigations
- IndexedDB quirks: use Dexie; add migrations and backups
- Data loss: periodic auto-export prompt
- Scope creep: stick to MVP; backlog nice-to-haves

## 11. Backlog (post-MVP)
- Reminders/notifications
- Recurring tasks
- Subtasks and projects
- Cloud sync (account + conflict resolution)
- Theming and widgets

## 12. Acceptance Criteria (MVP)
- User can add, edit, complete, delete tasks
- Tasks persist locally and survive reloads
- Filtering by Today/Upcoming/Completed works
- Search finds tasks by title/notes/tags
- App passes a basic a11y audit and has keyboard support
- Tests passing in CI; build preview deploys successfully

