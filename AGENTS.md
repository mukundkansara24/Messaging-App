# AGENTS.md — Instructions for AI Assistants

## Project Overview
- **Description:** Frontend application for the Messaging App. Provides a responsive user interface for user authentication (login/signup), searching users, managing conversations, and sending/receiving real-time messages.
- **Tech Stack:** React 19, Vite, Redux Toolkit (`@reduxjs/toolkit`, `react-redux`), React Router DOM, React Hook Form (`react-hook-form`), Tailwind CSS v4, DaisyUI, Socket.IO Client (`socket.io-client`), Axios
- **Architecture:** Component-based Single Page Application (SPA) with centralized Redux state management, custom React hooks, Axios HTTP client with authentication interceptors, and Socket.IO for real-time WebSocket communication.

---

## Development Scripts
- `npm run dev`: Start local development server with Vite
- `npm run build`: Build production assets
- `npm run lint`: Run ESLint checks
- `npm run format`: Format codebase using Prettier

---

## Code Style & Conventions

### Guiding Principle: KISS (Keep It Simple, Stupid)
- Always prefer the simplest solution that correctly solves the problem — avoid over-engineering, unnecessary abstraction layers, or premature optimization.
- Do not add configurability, generalization, or extra flexibility that isn't currently needed ("YAGNI" — You Aren't Gonna Need It).
- Prefer straightforward, readable code over clever one-liners or complex patterns.
- If a simple `if/else` or plain function does the job, don't reach for a design pattern, factory, or extra abstraction.
- Break large components/functions down, but don't fragment logic into excessive tiny pieces purely for the sake of "modularity" — clarity comes first.
- When in doubt, choose the version of the code a new contributor could understand in under a minute.

### General Rules
- Use functional React components with hooks.
- Keep components modular, small, and focused on a single responsibility.
- Use `react-hook-form` for form state management and input validations.
- Centralize shared application state (auth, active chat, etc.) in Redux slices under `src/store/`.
- Handle HTTP requests using the configured Axios instance in `src/utils/api.js`.
- Handle real-time messaging events via `src/utils/socket.js`.
- Style UI components using Tailwind CSS and DaisyUI classes.

### Naming Conventions
- **Components:** `PascalCase` with `.jsx` extension (e.g., `Login.jsx`, `MessageList.jsx`, `AuthLayout.jsx`).
- **Hooks:** `camelCase` (e.g., `useSearchAndHandleUser.js`, `listAllSender.js`) located in `src/hooks/`.
- **Redux Slices & Store:** `camelCase` with `.js` extension (e.g., `authSlice.js`, `store.js`) in `src/store/`.
- **Utilities:** `camelCase` with `.js` extension (e.g., `api.js`, `socket.js`) in `src/utils/`.
- **Variables & Functions:** `camelCase`.
- **Constants:** `UPPER_SNAKE_CASE`.

### Error Handling & API Calls
- Wrap async API calls in `try/catch` blocks and set user-friendly error messages in component state or form errors.
- Rely on the `api.js` Axios response interceptor for session/token expiration redirects (400/401 handling).

---

## Repository Structure
```
Messaging-App/
├── public/              # Static public assets
├── src/
│   ├── assets/          # Static icons & media assets (SVGs, images)
│   ├── components/      # React UI components (Login, Signup, Message, ListSender, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Redux Toolkit store configuration and slices
│   ├── utils/           # Utility modules (Axios client `api.js`, `socket.js`)
│   ├── App.jsx          # Main layout wrapper and user authentication check
│   ├── Header.jsx       # Header and navigation component
│   ├── index.css        # Global styles and Tailwind configuration
│   └── main.jsx         # Application entry point with React Router and Redux Provider setup
├── eslint.config.js     # ESLint configuration
├── package.json         # Package configuration and scripts
├── vite.config.js       # Vite configuration with proxy and plugins
└── AGENTS.md            # AI assistant instructions and guidelines
```

---

### DO:
- Follow existing component patterns and conventions.
- Use Tailwind CSS and DaisyUI classes for consistent UI styling.
- Use the shared Axios instance (`src/utils/api.js`) to maintain cookie credential handling.
- Keep socket event listeners clean and clean them up in `useEffect` return functions when applicable.

### DON'T:
- Do not introduce new external dependencies without asking first.
- Do not make changes in code without asking first.
- Do not read `.env` file unless explicitly stated.
- Do not mutate Redux state directly outside slice reducers.
