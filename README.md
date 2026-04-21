# smart-study-planner

## Netlify Deployment

This repository contains the frontend application at the root level.

### 1) Deploy on Netlify

- Build settings are configured in `netlify.toml`.
- Netlify will run `npm run build` at the root and publish the `dist` folder.

### 2) Frontend-only mode

This project runs in frontend-only mode by default:
- Tasks are stored in the browser using `localStorage`.
- AI suggestions and some other features are provided via local mock data or placeholders when a backend is not connected.

### 3) Configuration

Set these in Netlify Site settings -> Environment variables:
- `VITE_CLERK_PUBLISHABLE_KEY` (required for sign-in)
- `VITE_API_URL` (Optional: set this if you have a separate backend deployed)

### 4) Local Development

```bash
npm install
npm run dev
```