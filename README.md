# SavePoint

<p align="center">
  <strong>A personal video game library and progress tracker.</strong>
  <br />
  Discover games, organize your backlog, track your progress, and make your collection your own.
  <br /><br />
  <a href="https://savepoint-app-three.vercel.app/"><strong>Open the live app →</strong></a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white" />
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ESM-f7df1e?logo=javascript&logoColor=222" />
  <img alt="Deployment" src="https://img.shields.io/badge/Deployed_on-Vercel-000?logo=vercel&logoColor=white" />
  <img alt="Game data" src="https://img.shields.io/badge/Game_data-RAWG-2f6f59" />
</p>

SavePoint is a responsive gaming tracker built with React and Vite. It combines a searchable game catalog with a personal collection, gameplay notes, completion milestones, and a customizable dark interface. Game metadata comes from RAWG through server-side API routes so the catalog API key does not need to be exposed to the browser.

## Table of contents

- [Live demo](#live-demo)
- [Features](#features)
- [Tech stack](#tech-stack)
- [How it works](#how-it-works)
- [Run locally](#run-locally)
- [Available scripts](#available-scripts)
- [Data and privacy](#data-and-privacy)
- [Project structure](#project-structure)
- [Game data attribution](#game-data-attribution)

## Live demo

**[savepoint-app-three.vercel.app](https://savepoint-app-three.vercel.app/)**

## Features

### Discover games
- Browse a live catalog powered by the RAWG video game database.
- Search by game title and explore paginated results.
- Sort results by relevance, rating, release date, or name.
- Filter by genre and platform.
- Open a game details panel for extra metadata.

### Manage your collection
- Organize games into **Playing**, **Backlog**, **Completed**, and **Wishlist**.
- Search, filter, and sort your saved games.
- Change a game's status directly from your library.
- Keep track of when a game was marked completed.
- Remove a game with a confirmation dialog.

### Track your progress
- Record personal playtime, a rating from 1 to 5, and notes for each game.
- Edit progress from the library or from the Dashboard's Currently Playing section.
- Review recent additions and recently completed games.
- See collection statistics, genre insights, and completion milestones.
- Use Backlog Roulette to pick a game from your backlog.

### Personalize and protect your data
- Choose from five themes: **Aqua Reactor**, **Crimson Arcade**, **Solar Flare**, **Midnight Violet**, and **Arctic Frost**.
- Your selected theme is remembered by the browser.
- Export your collection as a JSON backup and import a backup later.
- Import merges supported records with the existing collection instead of deleting games that are not in the backup.
- Responsive layouts adapt to desktop, tablet, and mobile screens.

## Tech stack

| Technology | Purpose |
| --- | --- |
| React 19 | UI and interactive components |
| Vite 8 | Development tooling and production build |
| JavaScript (ES modules) | Application logic |
| CSS and CSS custom properties | Responsive layout and theme palettes |
| Vercel Serverless Functions | Backend endpoints for catalog requests |
| RAWG API | Game, genre, platform, and detail metadata |
| Browser `localStorage` | Personal collection and theme persistence |

## How it works

The frontend calls SavePoint's relative `/api` endpoints. Serverless functions request data from RAWG and return only the fields needed by the app.

```text
React frontend
    |
    |  /api/games, /api/genres, /api/platforms, /api/games/:id
    v
Vercel serverless functions
    |
    |  RAWG_API_KEY stays server-side
    v
RAWG API

Browser localStorage
    └── Personal collection, progress, notes, and selected theme
```

The collection is stored locally in the current browser. It does not automatically sync between browsers or devices, which is why the JSON backup and restore feature is available.

## Run locally

SavePoint's catalog depends on Vercel serverless API routes. **Use `vercel dev` for a full local run**; the standard Vite dev server alone does not execute these API functions.

### 1. Prerequisites

- Node.js and npm
- A RAWG API key
- The Vercel CLI

### 2. Clone the repository

```bash
git clone https://github.com/KyleDomSar/SavePoint.git
cd SavePoint
npm install
```

### 3. Configure the API key

Create a `.env.local` file in the project root:

```dotenv
RAWG_API_KEY=your_rawg_api_key_here
```

Replace the placeholder with your own key. Never commit `.env.local` or put the key in frontend code. The repository's `.gitignore` excludes local environment files.

You can get a RAWG API key through the [RAWG developer page](https://rawg.io/apidocs). For the deployed app, add `RAWG_API_KEY` in the Vercel project's **Settings → Environment Variables**, then redeploy so the serverless functions receive it.

### 4. Start the app

Authenticate and link the folder to your Vercel project if prompted, then run:

```bash
npx vercel dev
```

Open the local URL printed in the terminal. Keep the terminal running while using the app.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run lint` | Check the code with ESLint |
| `npm run build` | Create the production frontend build in `dist/` |
| `npm run preview` | Preview the built frontend with Vite |

> **Note:** `npm run preview` serves the frontend build; use Vercel's local development command when you need the `/api` serverless routes.

## Data and privacy

- The collection is saved in the browser's `localStorage`; clearing site data or switching browsers may remove or hide the saved collection.
- Export a JSON backup periodically if you want an extra copy of your library and progress.
- The RAWG API key is read by server-side functions from the `RAWG_API_KEY` environment variable. Do not add secrets to committed source files.
- SavePoint does not currently provide user accounts or automatic cloud synchronization.

## Project structure

```text
.
├── api/
│   ├── games.js
│   ├── games/
│   │   └── [id].js
│   ├── genres.js
│   ├── platforms.js
│   └── lib/
│       └── rawg-client.js
├── src/
│   ├── components/       # Reusable UI, cards, dialogs, and controls
│   ├── contexts/         # Collection state and persistence
│   ├── services/         # Frontend API client
│   ├── views/            # Dashboard, Discover, Library, and Wishlist
│   ├── App.jsx
│   ├── index.css
│   └── themes.js
├── index.html
├── package.json
└── vite.config.js
```

## Game data attribution

Game metadata is provided by [RAWG](https://rawg.io/). SavePoint is an independent personal project and is not affiliated with RAWG.
