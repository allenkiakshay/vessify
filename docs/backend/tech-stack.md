# Backend Tech Stack

## Core Framework

### Hono
- **Purpose:** Fast, lightweight web framework
- **Usage:**
  - HTTP server and routing
  - RESTful API endpoints
  - Middleware support (CORS, rate limiting)
  - Context-based request handling
  - Similar to Express but faster and more modern
  - Defined in `src/index.ts`

### Node.js 20
- **Purpose:** JavaScript runtime
- **Usage:**
  - Runs the backend server
  - Handles async operations
  - File system and network access

### TypeScript
- **Purpose:** Type-safe JavaScript
- **Usage:**
  - Full type safety across the codebase
  - Interface definitions for database models
  - Compile-time error checking
  - Better IDE support

## Database

### PostgreSQL
- **Purpose:** Relational database
- **Usage:**
  - Stores users, organizations, transactions
  - ACID compliance for data integrity
  - Supports complex queries and relationships
  - Handles multi-tenant data isolation

### Prisma ORM
- **Purpose:** Database toolkit and ORM
- **Usage:**
  - Type-safe database queries
  - Schema definition in `prisma/schema.prisma`
  - Automatic migrations
  - Database client generation
  - Query builder with autocomplete
  - Connection pooling with pg adapter

## Authentication

### Better Auth
- **Purpose:** Modern authentication library
- **Usage:**
  - Email/password authentication
  - Session management with database storage
  - Email verification system
  - Password hashing with bcrypt
  - 7-day session expiration
  - CSRF protection
  - Configured in `src/lib/auth.ts`

### bcryptjs
- **Purpose:** Password hashing
- **Usage:**
  - Hashes passwords before storing
  - Verifies passwords during login
  - Protects against rainbow table attacks

## AI & Cloud Services

### AWS Bedrock Runtime
- **Purpose:** AI model inference
- **Usage:**
  - Claude Sonnet 4.5 for transaction extraction
  - Parses bank statement text
  - Extracts amount, date, description, category
  - Returns confidence scores
  - Global inference profile for low latency
  - Implemented in `src/lib/bedrock.ts`

### AWS SES (Simple Email Service)
- **Purpose:** Email delivery service
- **Usage:**
  - Sends email verification links
  - Password reset emails (future)
  - Transactional email notifications
  - HTML email templates
  - Configured in `src/lib/email.ts`

## Security & Performance

### Custom Rate Limiting
- **Purpose:** Prevent API abuse
- **Usage:**
  - Global rate limit: 100 requests/minute per user
  - AI extraction: 10 requests/minute (expensive operation)
  - Organization creation: 10/hour to prevent spam
  - In-memory store (Redis recommended for production)
  - Implemented in `src/middleware/rateLimit.ts`

### CORS Middleware
- **Purpose:** Cross-origin resource sharing
- **Usage:**
  - Allows frontend to call backend APIs
  - Configured for specific frontend URL
  - Credentials enabled for cookies
  - Protects against unauthorized origins

## Testing

### Jest
- **Purpose:** Testing framework
- **Usage:**
  - Unit tests for business logic
  - Integration tests for API endpoints
  - Test coverage reporting
  - Tests in `src/**/__tests__/` folders

### ts-jest
- **Purpose:** TypeScript support for Jest
- **Usage:**
  - Runs TypeScript tests without compilation
  - Type checking in tests

## Development Tools

### nodemon
- **Purpose:** Auto-restart development server
- **Usage:**
  - Watches for file changes
  - Automatically restarts server
  - Used in `npm run dev`

### ts-node
- **Purpose:** TypeScript execution
- **Usage:**
  - Runs TypeScript files directly
  - No manual compilation needed
  - ESM module support

### esbuild
- **Purpose:** Fast bundler
- **Usage:**
  - Bundles code for production
  - Compiles TypeScript to JavaScript
  - Creates single output file

## Project Structure

```
backend/
├── src/
│   ├── index.ts           # Main server file
│   ├── lib/
│   │   ├── auth.ts        # Better Auth configuration
│   │   ├── bedrock.ts     # AWS Bedrock AI integration
│   │   ├── email.ts       # AWS SES email service
│   │   ├── db.ts          # Prisma database client
│   │   ├── organization.ts # Organization business logic
│   │   └── transaction.ts  # Transaction parsing logic
│   ├── routes/
│   │   ├── auth.ts        # Authentication endpoints
│   │   ├── organization.ts # Organization CRUD
│   │   └── transaction.ts  # Transaction endpoints
│   └── middleware/
│       └── rateLimit.ts   # Rate limiting middleware
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
└── coverage/              # Test coverage reports
```

## Key Libraries & Their Usage

### Database Layer (`lib/db.ts`)
- Prisma Client instance
- Connection pooling with pg adapter
- Accelerate extension for caching

### Auth Layer (`lib/auth.ts`)
- Better Auth instance
- Email verification flow
- Session configuration

### AI Layer (`lib/bedrock.ts`)
- Transaction text extraction
- Claude model prompting
- Confidence scoring
- Fallback to regex parsing

### Email Layer (`lib/email.ts`)
- SES client setup
- Verification email templates
- HTML email formatting

### Business Logic (`lib/organization.ts`, `lib/transaction.ts`)
- CRUD operations
- Access control checks
- Data validation
- Multi-tenant isolation

## API Routes

### Authentication (`/api/auth/*`)
- Sign up, sign in, sign out
- Email verification
- Session management
- Handled by Better Auth

### Organizations (`/api/organizations`)
- Create, read, update, delete organizations
- Manage members and roles
- Role-based access control

### Transactions (`/api/transactions`)
- Extract transaction from text (POST `/extract`)
- List transactions with pagination (GET `/`)
- Get single transaction (GET `/:id`)
- Organization-scoped queries

## How It All Works Together

1. **Server starts** → Hono app listens on port 3001
2. **Request arrives** → CORS middleware checks origin
3. **Rate limiting applied** → Prevents abuse
4. **Auth middleware** → Verifies session from Better Auth
5. **Route handler executes** → Processes business logic
6. **Database query** → Prisma fetches/updates data
7. **AI processing (if needed)** → Bedrock extracts transaction
8. **Response sent** → JSON data returned to frontend

## Why These Choices?

- **Hono** - Fastest Node.js framework, minimal overhead
- **Prisma** - Type-safe ORM with great DX
- **Better Auth** - Modern auth with fewer dependencies than Passport
- **PostgreSQL** - Reliable, scalable, supports complex queries
- **AWS Bedrock** - State-of-the-art AI without training models
- **TypeScript** - Catches bugs before they reach production
- **Jest** - Industry standard testing framework

## Production Considerations

- Replace in-memory rate limiting with **Redis**
- Use **Prisma Accelerate** for connection pooling
- Enable **AWS CloudWatch** for logging
- Set up **PM2** or **Docker** for process management
- Configure **environment-specific** DATABASE_URL
- Use **AWS IAM roles** instead of access keys in production
