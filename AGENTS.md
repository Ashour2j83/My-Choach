# AGENTS

## Purpose
This repository is a client-side React application built with Vite and Firebase. These instructions help AI coding agents understand the project layout, development commands, and key conventions before editing code.

## Important project information
- Framework: React 19 with Vite.
- Module type: ESM (`type: "module"` in `package.json`).
- Languages: JavaScript (`.js`, `.jsx`) and CSS.
- Firebase: uses Firebase client SDK (`firebase` package) for auth and Firestore.

## Key files and directories
- `package.json` - scripts and dependency list.
- `vite.config.js` - Vite config with `@vitejs/plugin-react`.
- `src/main.jsx` - application entry point.
- `src/App.jsx` - current main app component.
- `src/firebase/config.js` - Firebase app initialization and exports.
- `src/components/` - reusable UI components.
- `src/pages/` - page-level route components.
- `src/context/` - application state/context providers.
- `public/` - static assets served by Vite.

## Development commands
- `npm install` - install dependencies.
- `npm run dev` - start Vite development server.
- `npm run build` - produce production build.
- `npm run lint` - run ESLint across the repository.

## Conventions and guidance
- Prefer function components with React hooks.
- Keep imports ESM style (`import ... from ...`).
- Use relative paths for local modules inside `src`.
- Keep CSS in module-level or global CSS files imported from components.
- Avoid adding TypeScript unless the project is explicitly migrated.
- When modifying Firebase usage, preserve the existing v12 SDK import style.
- There are no tests configured in this repo today.

## Notes for Claude-style agents
- Focus on small, incremental edits and preserve the minimal Vite/React structure.
- Use the existing `README.md` for high-level context on the React + Vite template.
- Do not invent backend services or server-side APIs unless the repository already contains them.
- If you need more context, inspect `src/App.jsx`, `src/main.jsx`, and `src/firebase/config.js` first.
