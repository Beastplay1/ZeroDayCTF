# Kanban Board for ZeroDayCTF Release

## Backlog

- [ ] Add password reset functionality
- [ ] Implement OAuth login (GitHub, Google)
- [ ] Add challenge categories and filtering
- [ ] Create user roles (admin, user)
- [ ] Add challenge hints system
- [ ] Implement notifications for new challenges
- [ ] Add team functionality
- [ ] Create API documentation
- [ ] Add rate limiting to APIs
- [ ] Implement logging and monitoring
- [ ] Plan for real WAF integration (e.g., Cloudflare) in production

## To Do

- [ ] Integrate validateUsername in signup handleSubmit
- [ ] Add email validation function and integrate in signup
- [ ] Add password validation function and integrate in signup
- [ ] Update signup API to validate all fields and handle errors properly
- [ ] Implement signin functionality (handleSubmit and API)
- [ ] Add database integration (start with JSON file or SQLite)
- [ ] Implement user authentication/session management
- [ ] Make challenges dynamic (load from DB)
- [ ] Implement challenge submission and flag checking
- [ ] Update leaderboard with real data
- [ ] Implement profile page functionality
- [ ] Add admin panel for managing challenges

## In Progress

- [ ] Test all features end-to-end
- [ ] Implement fake WAF for vulnerability detection (403 response with fake message)

## Done

- [x] Create basic signup page UI
- [x] Create validateUsername function
- [x] Create basic signin page UI
- [x] Create challenges page with static data
- [x] Create leaderboard page
- [x] Create profile page
- [x] Set up Next.js project structure
- [x] Configure Tailwind CSS and styling
- [x] Integrate validateUsername in signup handleSubmit
