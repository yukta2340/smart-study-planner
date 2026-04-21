# smart-study-planner

## Project Structure

```text
smart-study-planner/
├── frontend/        # React/Vite frontend app
└── backend/         # Node.js/Express backend app
```

## Netlify Deployment

This repository deploys the frontend from the `frontend/` folder.
- Build settings are configured in `netlify.toml`.
- Netlify will run `npm run build` inside `frontend/` and publish `frontend/dist`.

## Local Development

From the root directory:

1. **Install all dependencies**:
   ```bash
   npm run install-all
   ```

2. **Run both frontend and backend**:
   ```bash
   npm run dev
   ```

3. **Run separately**:
   - Frontend: `npm run client`
   - Backend: `npm run server`