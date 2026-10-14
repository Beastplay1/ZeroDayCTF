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

## Roadmap / next steps

- Add database persistence (SQLite or similar) and real authentication/session management.
- Implement admin panel for creating and managing challenges.
- Add unit tests for validation logic and end-to-end tests for signup/signin flows.
- Replace fake WAF with a production-grade WAF or hardened rules before deployment.

## License & notes

- This project is a learning/demo scaffold. Use and modify freely for education or prototyping.
