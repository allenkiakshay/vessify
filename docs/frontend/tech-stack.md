# Frontend Tech Stack

## Core Framework

### Next.js 16
- **Purpose:** React framework for building the web application
- **Usage:**
  - Server-side rendering (SSR) for better performance
  - App Router for modern routing system
  - API routes for proxying backend requests
  - File-based routing in `app/` directory
  - Server and client components separation

### React 19
- **Purpose:** UI library for building interactive components
- **Usage:**
  - Client components for interactive features (forms, modals)
  - Hooks like `useState`, `useEffect`, `useSession`
  - Component-based architecture for reusability
  - Handles all user interactions and state management

### TypeScript
- **Purpose:** Type-safe JavaScript
- **Usage:**
  - Type definitions for all components and functions
  - Interface definitions for API responses
  - Compile-time error checking
  - Better IDE autocomplete and refactoring

## Authentication

### NextAuth.js v5 (Auth.js)
- **Purpose:** Authentication library for Next.js
- **Usage:**
  - Session management with JWT tokens
  - Credentials provider for email/password login
  - 7-day session duration
  - Automatic session refresh
  - Protected routes with middleware
  - Session hooks (`useSession`) in components

## Styling

### Tailwind CSS v4
- **Purpose:** Utility-first CSS framework
- **Usage:**
  - Responsive design with mobile-first approach
  - Custom gradients and color schemes
  - Component styling without separate CSS files
  - Hover states, focus states, and animations
  - Consistent spacing and sizing system

### PostCSS
- **Purpose:** CSS processing tool
- **Usage:**
  - Works with Tailwind CSS
  - Autoprefixer for browser compatibility
  - CSS optimization and minification

## HTTP Client

### Fetch API
- **Purpose:** Built-in browser API for HTTP requests
- **Usage:**
  - API calls to backend server
  - Handles authentication headers
  - Error handling and response parsing
  - Used in `lib/transactions.ts` and other API utilities

## Development Tools

### ESLint
- **Purpose:** Code linting and quality checks
- **Usage:**
  - Enforces code style consistency
  - Next.js specific linting rules
  - Catches common errors before runtime

### TypeScript Compiler
- **Purpose:** Type checking and compilation
- **Usage:**
  - Validates types during development
  - Generates type declarations
  - Configured via `tsconfig.json`

## Key Libraries & Their Usage

### Custom Components
- **OrganizationManager** - Create and manage organizations
- **OrganizationSelector** - Switch between user's organizations
- **TransactionForm** - Input bank statement text for AI extraction
- **TransactionsList** - Display paginated transactions
- **DashboardNavbar** - Navigation with user menu

### Middleware
- **`middleware.ts`** - Protects routes, redirects unauthenticated users

### Type Definitions
- **`types/transaction.ts`** - Transaction data structure
- **`types/next-auth.d.ts`** - Extended NextAuth types with custom user properties

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout with providers
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── api/               # API routes (proxy)
├── components/            # Reusable UI components
├── lib/                   # Utility functions and API clients
├── types/                 # TypeScript type definitions
└── middleware.ts          # Route protection
```

## How It All Works Together

1. **User visits the site** → Next.js serves the landing page
2. **User registers/logs in** → NextAuth handles authentication via backend
3. **Session is created** → JWT token stored in cookies for 7 days
4. **User accesses dashboard** → Middleware checks session, redirects if needed
5. **User creates organization** → React component calls backend API via fetch
6. **User extracts transaction** → Form sends data to backend, AI processes it
7. **UI updates** → React re-renders with new data
8. **Styling applied** → Tailwind classes make it look good

## Why These Choices?

- **Next.js** - Best React framework with built-in SSR and routing
- **TypeScript** - Catches bugs early, better developer experience
- **NextAuth** - Industry standard for Next.js authentication
- **Tailwind** - Fast styling without context switching
- **Fetch API** - Native browser API, no extra dependencies needed
