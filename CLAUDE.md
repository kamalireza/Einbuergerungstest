# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server with Turbopack (localhost:3000)
npm run build     # Production build
npm start         # Production server
npm run lint      # ESLint
```

### Docker

```bash
docker compose up dev            # Dev server with hot-reload (localhost:3000)
docker compose up dev --build    # Rebuild after package.json changes
docker compose up prod --build   # Production build (localhost:4173)
```

## Architecture

**Einbürgerungstest Trainer** — Next.js 15 app for German citizenship test preparation. 310 official questions with German/Persian/English translations.

### Routing
All pages live under `src/app/[locale]/` where locale is `fa` (Persian, RTL, default) or `en` (English). next-intl handles locale detection and routing via `src/middleware.ts`.

Routes: `/[locale]` (dashboard), `/[locale]/learn/[categoryId]/[questionId]` (study), `/[locale]/exam/active` (test), `/[locale]/exam/results/[attemptId]`, `/[locale]/bookmarks`, `/[locale]/history`.

### State Management
Single Zustand store at `src/stores/user-store.ts` persisted to localStorage. Holds bookmarks, learn progress, exam history, and locale. Use `src/hooks/use-hydration.ts` to guard localStorage access after SSR hydration.

### Data Layer
Static JSON files — `src/data/questions.json` (310 questions) and `src/data/categories.json` (category/subcategory structure). Query utilities in `src/lib/questions.ts`. Exam generation (weighted random selection: 19 Politik + 9 Geschichte + 2 Gesellschaft = 30) in `src/lib/exam-generator.ts`.

### Exam Flow
`src/hooks/use-exam.ts` manages exam state (question navigation, answer tracking, timer, submission). Results stored as exam attempts in the Zustand store.

### i18n
Translations in `src/messages/fa.json` and `src/messages/en.json`. Config in `src/i18n/`. Navigation helpers in `src/i18n/navigation.ts` — use these instead of raw Next.js Link/router for locale-aware navigation.

### Styling
Tailwind CSS 4 with custom theme in `src/app/globals.css`. Use `cn()` from `src/lib/utils.ts` for conditional class merging (clsx + tailwind-merge). Persian font (Vazirmatn) loaded from CDN.

### Path Alias
`@/*` maps to `./src/*` (configured in tsconfig.json).
