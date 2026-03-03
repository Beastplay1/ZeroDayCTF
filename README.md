# ZeroDayCTF — Local CTF Platform (Developer Preview)

ZeroDayCTF is a small Next.js-based Capture The Flag (CTF) project scaffold designed for prototyping security challenges, practicing vulnerability detection, and teaching web security concepts.

## Purpose

- Provide a lightweight playground for building and testing CTF-style challenges.
- Demonstrate simple server- and client-side validation, including a development-only fake WAF that returns 403 for clearly malicious inputs.
- Serve as a starting point for adding challenge logic, user accounts, leaderboards, and admin tooling.

## Key features

- Next.js app using the app router and Tailwind CSS for styling.
- Signup and signin UI with client-side validation and server-side validation hooks.
- Session management with signed, HTTP-only cookies after successful login.
- Navbar automatically shows `Profile` only when a user session exists.
- `/profile` now loads and displays the currently signed-in nickname.
- User persistence supports MongoDB Atlas Data API with automatic migration from legacy `data/users.json`.
- `validateUsername` contains normalization, control-character stripping, percent-decoded payload detection, and heuristics for XSS/SQL patterns. Malicious inputs return HTTP 403 (development-only fake WAF behavior).

## Getting started (development)

1. Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

2. Open your browser at http://localhost:3000

## MongoDB setup (free tier)

This project currently uses **MongoDB Atlas Data API** (not a direct `mongodb+srv://` driver connection), so having only a cluster connection string is not enough.

1. In Atlas, create a **Shared M0 (Free)** cluster (avoid M10+/Dedicated tiers).
2. Open **Data API** in Atlas and enable it for your project.
3. Create a Data API key.
4. Add the environment variables below.

> If Atlas asks for payment, verify you selected **Shared + M0 Free tier** and no paid add-ons.

## Environment variables

Create `.env.local` (optional for local file storage mode):

```bash
# Required in production: rotate this secret.
SESSION_SECRET="replace-with-a-long-random-secret"

# Optional: if set, MongoDB Atlas Data API is used as the primary user store.
MONGODB_DATA_API_URL="https://data.mongodb-api.com/app/<app-id>/endpoint/data/v1"
MONGODB_DATA_API_KEY="<atlas-data-api-key>"
MONGODB_DATA_SOURCE="Cluster0"
MONGODB_DB="zerodayctf"
```

If `MONGODB_DATA_API_URL` and `MONGODB_DATA_API_KEY` are set, the app migrates users from `data/users.json` into MongoDB on first auth/user-store access.

## Security notes

- Do **not** commit `.env.local` to git.
- If you shared your DB username/password publicly, rotate credentials immediately in Atlas.
- Keep Atlas IP allowlist as narrow as possible for development.

## Testing validation and fake WAF

- Use curl, Postman, or the UI to submit the signup form. Example curl commands:

Valid username (expect 201):

```bash
curl -i -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"elite_hacker","email":"a@a.com","password":"pass1234","confirmPassword":"pass1234","agreeToTerms":true}'
```

Encoded XSS (expect 403):

```bash
curl -i -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"%3Cscript%3Ealert(1)%3C%2Fscript%3E","email":"a@a.com","password":"p","confirmPassword":"p","agreeToTerms":true}'
```

## What this repo is not

- This is not production-ready security tooling. The fake WAF and heuristics are for development/testing only and will produce false positives.
- Do not rely on client-side validation for security — always validate and sanitize on the server and use parameterized queries for database access.

## Roadmap / next steps

- Add RBAC and route protection for profile/admin pages.
- Implement admin panel for creating and managing challenges.
- Add unit tests for validation logic and end-to-end tests for signup/signin flows.
- Add password reset and email verification workflows.

## License & notes

- This project is a learning/demo scaffold. Use and modify freely for education or prototyping.
