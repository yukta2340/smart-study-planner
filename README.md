# smart-study-planner

## Hassle-free Netlify deployment

This repository deploys the frontend from the `client` folder.

### 1) Deploy frontend on Netlify

- Build settings are already configured in `netlify.toml`.
- Netlify will run build in `client` and publish `client/dist`.

### 2) Frontend-only mode (no backend)

This project can run without deploying `client/server`.

- Tasks are stored in the browser using `localStorage` (per signed-in Clerk user id, or `anon`).
- Server-only features are disabled in this mode:
  - OTP login APIs
  - OCR image upload
  - Server-powered AI suggestions/chat
  - Storing FCM tokens in MongoDB / sending server push/SMS hooks

### 3) Configure frontend environment variables (Netlify)

Set these in Netlify Site settings -> Environment variables:

- `VITE_CLERK_PUBLISHABLE_KEY` (required for sign-in)
- Firebase client keys used by `client/src/utils/fcmClient.js` (optional; only needed if you want web push)

You can copy variable names from `client/.env.example`.

### 4) Optional: enable a real backend later

Deploy `client/server` separately (Render/Railway/etc.) and set backend env vars from:

- `client/server/.env.example`

Then set:

- `VITE_API_URL` = your deployed backend URL

### 5) Why the old errors happened

- `503` usually means the deployed app could not serve an API request (wrong URL or backend unavailable).
- Browser console `runtime.lastError` message-port errors are commonly from browser extensions, not app code.