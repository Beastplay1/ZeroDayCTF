# ZeroDayCTF - Cybersecurity Competition Platform

## Overview

ZeroDayCTF is a modern cybersecurity Capture The Flag (CTF) competition platform built with Next.js 15 and deployed on Replit. The platform enables hackers to learn, compete, and evolve through various cybersecurity challenges across multiple categories including Web, Crypto, Pwn, Reverse Engineering, Forensics, Mobile, Hardware, OSINT, Red Team, Blue Team, Cloud, and more.

The platform features two types of challenges:
- **7-Day Challenges**: Battle-proven CTF challenges from real competitions with first blood bonuses
- **24-Hour Unique Challenges**: Fresh AI-generated and exclusive daily challenges with top 3 solver bonuses (1st: +500pts, 2nd: +250pts, 3rd: +50pts)

Key features include competitive ranking, streak systems, category-based progression, and a global leaderboard tracking user achievements and statistics.

**Status**: All frontend pages designed with mock data. Ready for backend integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Framework
**Decision**: Next.js 15 with App Router and React 19  
**Rationale**: Leverages the latest Next.js features including server components, improved routing, and React 19's concurrent features for optimal performance. The App Router provides better code organization and built-in layouts.

**Technology Stack**:
- TypeScript for type safety
- Tailwind CSS v4 for utility-first styling
- HeroUI component library for pre-built UI components
- Framer Motion for animations and transitions

### UI Component Architecture
**Decision**: HeroUI React component library with custom theming  
**Rationale**: Provides accessible, customizable components that align with the cybersecurity aesthetic. Custom color scheme includes zerogreen (#09cc26) as primary brand color with dark mode support.

**Key Components**:
- Reusable navigation bar with mobile burger menu
- Card-based layouts for challenges, leaderboard, and profile pages
- Custom typewriter effect component
- Matrix rain visual effects (single column and triangle patterns)
- Responsive grid layouts

### Styling System
**Decision**: Tailwind CSS v4 with PostCSS and custom CSS modules  
**Rationale**: Utility-first approach enables rapid UI development while custom CSS modules handle complex animations (glitch effects, gradient animations, matrix rain). Tailwind v4's new features provide better performance and developer experience.

**Custom Styles**:
- Glitch animation effects for cyberpunk aesthetic
- Gradient animations for text and backgrounds
- Matrix rain canvas animations
- Custom navbar styling with stroke effects
- Welcome section with animated gradient text

### Font Strategy
**Decision**: Next.js Font Optimization with Google Fonts  
**Rationale**: Automatic font optimization reduces layout shift and improves performance. Multiple fonts serve different purposes:
- **Geist Sans/Mono**: Default system fonts for readability
- **Orbitron**: Futuristic headings and titles
- **Koulen**: Navigation elements
- **Bungee**: Special display text
- **Roboto Mono**: Code and monospace content

### Page Structure
**Decision**: Route-based page organization using App Router  
**Rationale**: Separates concerns with dedicated routes for each major feature.

**Routes**:
- `/` - Home page with hero section and feature highlights
- `/about` - Platform overview with features and statistics
- `/challanges` - Challenge browser with category/difficulty filtering
- `/leaderboard` - Global rankings with timeframe selection
- `/profile` - User dashboard with solve history and statistics
- `/signin` - Authentication page
- `/signup` - Registration page

### Component Organization
**Decision**: Shared components in `/src/components` with feature-specific subfolders  
**Rationale**: Promotes reusability and maintainability.

**Shared Components**:
- `Navbar` - Global navigation with responsive design
- `Footer` - Site footer with branding
- `Typewriter` - Animated typing effect with configurable speed
- `Matrix/` - Canvas-based matrix rain effects
- `ScrollIndicator` - Scroll position indicator (placeholder)

### State Management
**Decision**: React useState hooks for local component state  
**Rationale**: Application complexity doesn't require global state management. Component-level state handles filtering, tabs, and form inputs effectively.

**State Usage**:
- Challenge filtering (category, difficulty)
- Leaderboard timeframe selection
- Profile tab navigation
- Form inputs (signin/signup)
- Mobile menu toggle

### Animation Strategy
**Decision**: Framer Motion for React animations, custom CSS for effects  
**Rationale**: Framer Motion integrates seamlessly with React for component animations. Custom CSS handles specialized effects like matrix rain and glitch that require precise control.

**Animation Types**:
- Page transitions and component mounting
- Gradient text animations
- Glitch effects with clip-path
- Canvas-based matrix rain simulations
- Pulse effects for interactive elements

### Layout System
**Decision**: Shared root layout with Navbar and Footer  
**Rationale**: Ensures consistent navigation and branding across all pages while allowing page-specific content in children.

**Features**:
- Dark theme by default (#0a0a0a background)
- Responsive container with flexible main content area
- HeroUI Provider wrapper for component library
- Global font variables via CSS custom properties

### Responsive Design
**Decision**: Mobile-first responsive breakpoints using Tailwind  
**Rationale**: Ensures usability across devices with progressive enhancement.

**Breakpoints**:
- Mobile: Default styles with burger menu
- Tablet (sm:): Adjusted spacing and layout
- Desktop (lg:, xl:, 2xl:): Full navigation and expanded layouts
- Custom scaling for hero section on small screens

### Theme Configuration
**Decision**: Custom Tailwind theme with dark mode support  
**Rationale**: Extends Tailwind with brand colors while maintaining dark mode compatibility.

**Custom Colors**:
- `zerogreen`: #09cc26 (primary brand color)
- `midnight`: #121063
- `tahiti`: #3ab7bf
- `bermuda`: #78dcca

### Development Environment
**Decision**: Development server on port 5000 with host 0.0.0.0  
**Rationale**: Replit requires port 5000, and 0.0.0.0 binding enables the webview to work correctly in the Replit environment.

**Scripts**:
- `dev`: `next dev -p 5000 -H 0.0.0.0` - Development server with hot reload
- `build`: `next build` - Production build (turbopack removed for compatibility)
- `start`: `next start -p 5000 -H 0.0.0.0` - Production server
- `lint`: ESLint code quality checks

**Replit Configuration**:
- Workflow: "Dev Server" running `npm run dev` on port 5000
- Automatically starts on project launch

## External Dependencies

### UI Framework
- **@heroui/react** (v2.8.5): Complete UI component library
- **@heroui/button**, **@heroui/system**, **@heroui/theme**: Individual HeroUI packages for modular imports
- Provides Cards, Buttons, Inputs, Chips, Progress bars, and Checkboxes

### Animation Library
- **framer-motion** (v12.23.24): Production-ready animation library for React
- Handles page transitions, component animations, and gesture interactions

### Styling
- **tailwindcss** (v4.1.14): Utility-first CSS framework
- **@tailwindcss/postcss** (v4.1.14): PostCSS plugin for Tailwind v4
- **postcss** (v8.5.6): CSS transformation pipeline

### Core Framework
- **next** (v15.5.6): React framework with App Router
- **react** (v19.1.0): UI library
- **react-dom** (v19.1.0): React rendering for web

### Development Tools
- **typescript** (v5): Type checking and enhanced developer experience
- **eslint** (v9): Code linting with Next.js config
- **@types/node**, **@types/react**, **@types/react-dom**: TypeScript definitions

### Font Optimization
- **next/font**: Built-in Next.js font optimization
- Google Fonts integration (Geist, Orbitron, Koulen, Bungee, Roboto Mono)

### Future Integrations
The platform is designed to support:
- **Database**: Drizzle ORM prepared for integration (mentioned in app structure)
- **Authentication**: Signin/signup pages ready for backend integration
- **Real-time Updates**: WebSocket support for live leaderboard and challenge updates
- **AI Generation**: Backend integration for 24-hour unique challenges
- **User Profiles**: Database schema for user data, solves, and statistics