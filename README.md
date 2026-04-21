# 🎓 Smart Study Planner - AI-Powered Full-Stack Assistant (Advanced Version)

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

---

## 🔥 Top-Tier Upgrades (New!)

### 🔐 1. Industrial-Strength Authentication
- **JWT + Bcrypt**: Full Login/Register flow with password hashing and token-based session persistence.
- **Strict Protected Routes**: Middleware-enforced access control for all API endpoints.

### 🗄️ 2. Advanced Relational DB Design
- **Hierarchical Schema**: `User` → `Subjects` → `Topics` → `StudySessions`.
- **Referential Integrity**: Managed via Mongoose populated paths.

### 🧠 3. Smart Scheduling Engine (AI-Powered)
- **Difficulty Weights**: Topics are weighted (1-5) to adjust session length and priority.
- **Revision Cycles**: Logic that prioritizes older, unstudied topics to ensure balanced learning.

### 📈 4. Real-Time Productivity Analytics
- **Study Streaks**: Automated tracking of consecutive study days.
- **Productivity Scores**: Metrics derived from user-reported session quality.

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[React Dashboard] -->|JWT Auth| B[Express API Gateway]
    B -->|Middleware| C[Auth/Logging/Errors]
    C -->|Controllers| D[Logic Layer]
    D -->|AI Algorithm| E[Scheduling Engine]
    D -->|Mongoose| F[MongoDB Atlas]
    F -->|Relational Data| G[(User/Subject/Topic/Session)]
```

---

## 🚀 API Endpoints (RESTful)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new student |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/ai/plan` | Generate AI-weighted study plan |
| `GET` | `/api/analytics/productivity` | Get streaks and scores |

---

## 🛠️ Local Setup

1. **Install**: `npm run install-all`
2. **Configure**: Add `JWT_SECRET` and `MONGO_URI` to `backend/.env`.
3. **Run**: `npm run dev`

---

*Built with ❤️ for top-tier placement opportunities.*