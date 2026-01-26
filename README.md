# ZeroDayCTF — Local CTF Platform (Developer Preview)

ZeroDayCTF is a small Next.js-based Capture The Flag (CTF) project scaffold designed for prototyping security challenges, practicing vulnerability detection, and teaching web security concepts.

## Purpose

- Provide a lightweight playground for building and testing CTF-style challenges.
- Demonstrate simple server- and client-side validation, including a development-only fake WAF that returns 403 for clearly malicious inputs.
- Serve as a starting point for adding challenge logic, user accounts, leaderboards, and admin tooling.

## Key features

- Next.js app using the app router and Tailwind CSS for styling.
- Signup and signin UI with client-side validation and server-side validation hooks.
- `validateUsername` contains normalization, control-character stripping, percent-decoded payload detection, and heuristics for XSS/SQL patterns. Malicious inputs return HTTP 403 (development-only fake WAF behavior).
- A fake WAF/testing switch in the signup UI (dev) to force 403 responses for testing flows.
- Static challenge and leaderboard UI to extend with dynamic data and persistence.

## Getting started (development)

1. Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

2. Open your browser at http://localhost:3000

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

- Add database persistence (SQLite or similar) and real authentication/session management.
- Implement admin panel for creating and managing challenges.
- Add unit tests for validation logic and end-to-end tests for signup/signin flows.
- Replace fake WAF with a production-grade WAF or hardened rules before deployment.

## License & notes

- This project is a learning/demo scaffold. Use and modify freely for education or prototyping.

If you want, I can add a small `403` page, unit tests for `validateUsername`, or a database-backed user store next.
