# AlumniConnect 

A campus alumni-student networking platform built with Node.js/Express (backend) and React (frontend). This repository contains both backend and frontend apps for managing users, workshops, mentorships, jobs, and events. It includes features like authentication (JWT), profile pictures (uploads), workshop RSVPs, and a secure OTP password-reset flow.

## Table of contents

- Project overview
- Tech stack
- Prerequisites
- Environment variables
- Setup & run (development)
- Important endpoints
- Uploads & profile pictures
- Password reset (OTP) flow
- Tests & linting
- Contributing
- Troubleshooting

## Project overview

- Backend: Express + Mongoose (MongoDB). Implements REST APIs under `/api/*`.
- Frontend: React (Create React App) with Material UI components.
- Features: user registration/login, roles (student/alumni), profile pages with picture upload, workshops and registrations, mentorship, job postings, notifications, secure OTP-based password reset.

## Tech stack

- Node.js, Express
- MongoDB (Mongoose)
- React, Material-UI
- Axios (frontend HTTP client)
- multer (file uploads)
- nodemailer (email)
- bcryptjs (password hashing)
- jsonwebtoken (JWT)

## Prerequisites

- Node.js (v14+ recommended)
- npm
- MongoDB (running instance or MongoDB Atlas)

## Environment variables

Create a `.env` file in `backend/` with the following variables (example names used in the code):

- `PORT` — backend port (default 3002)
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — JWT signing secret
- `BACKEND_URL` — (optional) public base URL for backend (used to build image URLs). Defaults to `http://localhost:${PORT}`

Email (for OTP/password reset and other emails):
- `EMAIL_HOST` — SMTP host (e.g., smtp.gmail.com)
- `EMAIL_PORT` — SMTP port (e.g., 587)
- `EMAIL_USER` — SMTP user/email
- `EMAIL_PASS` — SMTP password or app password
- `EMAIL_FROM` — email shown in "From" field
- `PLATFORM_NAME` — site name used in email templates (optional)
- `PLATFORM_LOGO_URL` — URL to a small logo shown in emails (optional)

Password reset OTP configuration (optional):
- `RESET_OTP_TTL_MINUTES` — OTP expiry in minutes (default ~10)
- `RESET_OTP_RESEND_COOLDOWN_SECONDS` — seconds between allowed resends
- `RESET_OTP_MAX_REQUESTS_PER_HOUR` — max OTP requests per email per hour
- `RESET_OTP_MAX_RESEND_PER_HOUR` — max resend requests per hour
- `RESET_OTP_MAX_VERIFY_ATTEMPTS` — max OTP verify attempts before invalidating

## Setup & run (development)

Open two terminals (one for backend, one for frontend).

Backend:

```powershell
cd 'c:\Users\akash\Downloads\AluminiConnect_btp\project12\backend'
npm install
# create a .env file with variables described above
npm run dev
```

Frontend:

```powershell
cd 'c:\Users\akash\Downloads\AluminiConnect_btp\project12\frontend'
npm install
npm start
```

The frontend is configured to call the backend at `http://localhost:3002/api` by default (see `frontend/src/utils/axiosConfig.js`). If you change backend port or host, update `axiosConfig` or set `BACKEND_URL`.

## Important endpoints (overview)

- Auth
  - POST `/api/auth/register` — register user (expects LNMIIT email format)
  - POST `/api/auth/login` — login, returns `{ token, user }`
  - POST `/api/auth/forgot-password` — trigger OTP (generic response to avoid enumeration)
  - POST `/api/auth/resend-otp` — resend OTP
  - POST `/api/auth/verify-otp` — verify OTP + set new password

- Users
  - GET `/api/users/me` — get current user (auth required)
  - GET `/api/users/profile` — get full profile for current user (auth required)
  - PUT `/api/users/profile` — update profile (auth required)
  - POST `/api/users/profile/picture` — upload profile picture (multipart/form-data; field name `profilePicture`)
  - GET `/api/users/alumni` — list alumni (auth required)

- Workshops
  - GET `/api/workshops` — list workshops
  - GET `/api/workshops/:id/registrations` — organizer-only: get registrations with populated user info
  - POST `/api/workshops` — create new workshop (auth: alumni)
  - Other workshop routes under `backend/routes/workshopRoutes.js`

- Jobs, mentorships, notifications, and other features have their own routes in `backend/routes/`.

## Uploads & profile pictures

- Backend serves uploaded files under `/uploads` (static). The upload endpoint returns a full absolute URL (`profileImage`) so the frontend can load it directly.
- Frontend components read profile image from `user.profile.profileImage` or legacy `user.profilePicture` / `user.profile.profilePicture`. Auth context tries to fetch full profile on login/startup so the UI gets the `profile` block.
- If you have existing users with relative image paths, you may want to backfill them with absolute URLs or add a small backend script to convert them.

## Password reset (OTP) flow

- The app implements a secure OTP flow with the following protections:
  - OTPs are hashed before storing in DB.
  - TTL on OTP documents (expiresAt) removes old tokens.
  - Rate limits: requests/resends per hour and cooldowns.
  - Max verify attempts — OTP invalidates after too many incorrect attempts.
  - Email templates are branded using `emailService`.

Ensure SMTP env variables are set to enable email delivery.

## Tests & linting

- There are some unit/ integration tests in the frontend (`App.test.js`) — run them with:

```powershell
cd frontend
npm test
```

- Backend does not currently include an automated test suite in this repo; consider adding tests for critical controllers (auth, uploads, workshops).

## Contributing

- Fork, create a feature branch, implement changes, run lints/tests, and open a PR.
- When changing API responses used by the frontend (e.g., login response), update both backend and frontend in the same PR where possible.

## Troubleshooting

- EADDRINUSE error on backend: make sure the configured `PORT` is free or stop the process using it.
- If images do not show after upload:
  - Inspect the response from `POST /api/users/profile/picture` — the JSON should contain `profileImage` with a full URL.
  - Check `localStorage.userData` for `profile.profileImage`.
- If password reset emails are not received: verify SMTP settings and check backend logs for nodemailer errors.

## Notes & next steps

- The app uses both `profile.profileImage` and legacy fields (`profile.profilePicture`, `profilePicture`) for backward compatibility.
- Suggested follow-ups you might want to implement:
  - Return `profile` inside the login/register response to avoid the extra profile fetch on startup.
  - Backfill existing users in DB with absolute image URLs.
  - Add production-grade rate limiting (Redis-based) for OTP and auth endpoints.

---

If you'd like, I can also:
- Add a short contribution guide (PR checklist).
- Add a small script to backfill image URLs in the DB.
- Return `profile` in the login response to make frontend startup faster.

Tell me which of those you'd like next and I'll implement it.
