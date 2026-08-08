# Quiz Management & Online Assessment Platform

A full-stack quiz/assessment platform with Admin and Student roles, built with Flask, PostgreSQL, and React + Vite + Tailwind CSS.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, React Router, Axios, Recharts
- **Backend:** Flask, SQLAlchemy, Flask-Migrate, Flask-JWT-Extended
- **Database:** PostgreSQL

## Project Structure
```
quiz-platform/
├── backend/
│   ├── app/
│   │   ├── models/       # SQLAlchemy models (7 tables)
│   │   ├── routes/       # Blueprints per resource
│   │   └── utils/        # Auth decorators, scoring logic, etc.
│   ├── run.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/          # Axios client
    │   ├── components/
    │   ├── context/       # Auth context (Day 2)
    │   ├── hooks/
    │   └── pages/
    │       ├── admin/
    │       └── student/
    └── package.json
```

## Local Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # fill in DATABASE_URL, SECRET_KEY, JWT_SECRET_KEY
flask db init
flask db migrate -m "initial tables"
flask db upgrade
flask run
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Backend runs on `http://localhost:5000`, frontend on `http://localhost:5173`.

## Development Schedule
See `SCHEDULE.md` for the day-by-day build plan (Aug 8 – Aug 20).

## Status
- [x] Day 1 — Project setup, models, folder structure
- [ ] Day 2 — Authentication
- [ ] Day 3 — Role-based authorization
- [ ] Day 4 — Admin dashboard + user management
- [ ] Day 5 — Quiz + category management
- [ ] Day 6 — Question management
- [ ] Day 7 — Student quiz interface
- [ ] Day 8 — Timer + submission + scoring
- [ ] Day 9 — Results + student dashboard
- [ ] Day 10 — Analytics + leaderboard + polish
