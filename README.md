# Student Community Platform

Full-stack web app for students to post updates, read notices, search peers, and exchange chat requests/messages. Built with Express + MongoDB backend and React + Vite frontend.

## Features
- User auth: register/login, JWT-protected routes, profile fetch/update year and photo
- Posts: create, list, like/unlike, comment, pin flag, soft-delete field (not exposed in UI)
- Notices: admin can publish notices with optional file uploads; pinned notices surface first
- Admin tools: list/filter users by year/branch; role gate enforced server-side
- Chat: send/accept chat requests, exchange messages between accepted users
- UI: dashboards for feed, profile, edit profile, notices board, and user search

## Tech Stack
- Backend: Node.js, Express, MongoDB/Mongoose, JWT, Multer, bcrypt
- Frontend: React 18, React Router, Axios, Vite

## Project Structure
```
student-community/
├─ backend/         # Express API + Mongo models
│  ├─ routes/       # auth, posts, notices, admin, chat requests/messages
│  ├─ models/       # User, Post, Notice, ChatRequest, Message
│  ├─ middleware/   # auth JWT guard
│  └─ uploads/      # notice attachment storage
└─ frontend/        # React SPA (Vite)
   └─ src/
      ├─ pages/     # Dashboard, Profile, EditProfile, Notices, UserSearch, etc.
      └─ components/# Navbar, Card, Pagination, Post
```

## Prerequisites
- Node.js >= 18
- MongoDB instance (local or Atlas)

## Environment Variables
Create `backend/.env`:
```
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000            # optional; defaults to 5000 in code
```

## Setup & Run
1) Install deps
```
cd backend
npm install
cd ../frontend
npm install
```

2) Start dev servers (from project root in two terminals)
```
# API
cd backend
npm run dev

# Frontend (Vite defaults to 5173)
cd ../frontend
npm run dev
```

## API Quick Reference
Base URL: `http://localhost:5000/api`

- Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PUT /auth/update-year`, `PUT /auth/profile-photo`
- Posts: `POST /post` (auth), `GET /post`, `PUT /post/like/:id` (toggle), `POST /post/comment/:id`
- Notices: `POST /notice` (admin + multipart/form-data: text,isPinned,file), `GET /notice`
- Admin: `GET /admin/users`, `GET /admin/filter?year=&branch=` (admin token required)
- Chat Requests: `POST /chat-request/send`, `PUT /chat-request/accept/:id`, `GET /chat-request/`
- Messages: `POST /message/send`, `GET /message/:userId`

Auth: send `Authorization: Bearer <token>` header. Admin-only endpoints require `role` claim of `admin` in the token.

## Frontend Routes
- `/` Dashboard feed (create/like/comment posts)
- `/profile` View profile + posts
- `/profile/edit` Update academic year
- `/notices` Notice board with pinned ordering and attachments
- `/search` Admin-only user search/filter

## Development Notes
- Uploads are saved to `backend/uploads` and served via `http://localhost:5000/uploads/<filename>`
- Pagination is handled client-side; adjust page size in page components if needed
- Tokens/role/username are stored in `localStorage`; clear it to log out manually

## Scripts
- Backend: `npm start` (prod), `npm run dev` (nodemon)
- Frontend: `npm run dev`, `npm run build`, `npm run preview`

## Future Improvements
- Add logout + token refresh flow
- Protect admin-only client routes
- Wire chat UI to message endpoints
- Add validation and error toasts on the frontend
