# Smart Study Planner Backend

## Setup

1. Copy `.env.example` to `.env`.
2. Set `MONGO_URI`, `JWT_SECRET`, and optional `PORT`.
3. Install dependencies:
   ```bash
   npm install
   ```

## Run

```bash
npm run dev
```

## API Endpoints

- `POST /register`
- `POST /login`
- `GET /profile`
- `GET /tasks`
- `POST /add-task`
- `PUT /update-task/:id`
- `DELETE /delete-task/:id`
- `POST /generate-plan`
