# Einbürgerungstest Trainer

A web application for preparing for the German citizenship test (*Einbürgerungstest*). It provides all 300 official questions with Persian and English translations, a realistic exam simulator, and progress tracking.

## Features

- **Learn Mode** — Browse all 300 questions organized by category and subcategory, with instant answer feedback
- **Exam Mode** — Simulate the real test: 30 randomly selected questions, 60-minute timer, pass threshold of 17/30
- **Progress Tracking** — Tracks which questions you've answered correctly, stored in localStorage
- **Bookmarks** — Save questions for later review
- **Exam History** — Review past exam attempts and results
- **Bilingual UI** — Persian (default, RTL) and English

## Tech Stack

- [Next.js](https://nextjs.org/) 15 (Turbopack)
- [React](https://react.dev/) 19
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Zustand](https://zustand-demo.pmnd.rs/) — state management
- [next-intl](https://next-intl.dev/) — internationalization & routing
- [Lucide React](https://lucide.dev/) — icons
- TypeScript

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Docker](https://www.docker.com/) (optional, for containerized deployment)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/kamalireza/Einbuergerungstest
cd citizenship

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Docker

### Development (hot-reload)

Run the dev server in Docker with live code reloading — source file changes reflect instantly without rebuilding:

```bash
docker compose up dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app. After changing `package.json`, rebuild with:

```bash
docker compose up dev --build
```

### Production

```bash
docker compose up prod --build
```

Open [http://localhost:4173](http://localhost:4173) to view the app.

### Standalone (without Compose)

```bash
docker build -t einbuergerungstest .
docker run -d -p 4173:4173 einbuergerungstest
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/
│   ├── [locale]/          # Locale-based routing (fa, en)
│   │   ├── learn/         # Learn mode pages
│   │   ├── exam/          # Exam mode pages
│   │   ├── bookmarks/     # Bookmarked questions
│   │   ├── history/       # Past exam results
│   │   └── page.tsx       # Home page
│   ├── globals.css
│   └── layout.tsx         # Root layout
├── components/
│   ├── layout/            # Layout components (header, nav)
│   └── shared/            # Shared components
├── data/
│   ├── questions.json     # All 300 questions
│   └── categories.json    # Category & subcategory definitions
├── hooks/                 # Custom React hooks
├── i18n/                  # next-intl configuration & routing
├── lib/                   # Utility functions
├── messages/
│   ├── fa.json            # Persian translations
│   └── en.json            # English translations
├── stores/
│   └── user-store.ts      # Zustand store (progress, bookmarks, history)
├── types/                 # TypeScript type definitions
└── middleware.ts           # Locale detection middleware
```

## How It Works

### Question Bank

The app contains the full 300 official *Einbürgerungstest* questions, divided into three categories:

| Category | Questions | Exam Allocation |
|---|---|---|
| Politik in der Demokratie | 1–192 | 19 questions |
| Geschichte und Verantwortung | 193–281 | 9 questions |
| Mensch und Gesellschaft | 282–300 | 2 questions |

Each question includes the German original, four answer choices, the correct answer index, and Persian/English translations.

### Learn Module

Questions are grouped into categories and subcategories. Users can work through them sequentially or jump to any category. Answering a question correctly marks it as mastered.

### Exam Module

Simulates the real test by selecting 30 questions weighted by the official category allocation (19 + 9 + 2). A 60-minute countdown timer runs during the exam. Results are saved to history for later review.

### Progress & Storage

All user data — progress, bookmarks, and exam history — is persisted in the browser's localStorage via a Zustand store.

## Internationalization

The UI supports two locales:

- **Persian (`fa`)** — default, right-to-left layout
- **English (`en`)**

Locale routing is handled by `next-intl` with the locale prefix in the URL path (e.g., `/fa/learn`, `/en/exam`).
