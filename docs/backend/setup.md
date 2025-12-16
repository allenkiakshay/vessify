# Backend Setup Guide

## Prerequisites

Before you start, make sure you have:
- **Node.js** (v20 or higher)
- **npm** package manager
- **PostgreSQL** database (local or cloud)
- **AWS Account** (optional, for email and AI features)

## Installation Steps

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Open `.env` and configure the required variables. For detailed explanations of each variable, check the `.env.example` file.

**Required Variables:**

```env
# Database - PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/vessify"

# Better Auth - Authentication configuration
BETTER_AUTH_SECRET="generate-a-random-secret-at-least-32-chars"
BASE_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"
```

**Optional Variables (for full functionality):**

```env
# AWS SES - Email verification
AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_SES_FROM_EMAIL="noreply@yourdomain.com"
```

> **Note:** Without AWS credentials, email verification won't work but the app will still function. Transaction extraction will fall back to regex parsing without Bedrock.

### 4. Setup Database

Run Prisma migrations to create database tables:

```bash
npm run db:migrate
```

This will:
- Create all necessary tables (users, organizations, transactions, etc.)
- Apply any pending migrations
- Generate Prisma Client

To view your database in a GUI:
```bash
npm run db:studio
```

### 5. Run the Development Server

```bash
npm run dev
```

The backend will start on **http://localhost:3001**

You should see:
```
Server running at http://localhost:3001
```

### 6. Verify Setup

Test the server is running:
```bash
curl http://localhost:3001
```

You should get: `Hello Hono + TypeScript 🚀`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma Client
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:push` - Push schema changes without migrations

## Database Setup Options

### Option 1: Local PostgreSQL

Install PostgreSQL locally and create a database:
```bash
createdb vessify
```

Then use this connection string:
```env
DATABASE_URL="postgresql://localhost:5432/vessify"
```

### Option 2: Cloud Database (Recommended)

Use a cloud provider like:
- **Neon** (free tier available)
- **Supabase** (free tier available)
- **Railway** (free trial)
- **AWS RDS**

Copy their provided connection string to `DATABASE_URL`.

## AWS Configuration (Optional)

### For Email Verification (SES)

1. Create an AWS account
2. Go to AWS SES console
3. Verify your sender email address
4. Create IAM user with SES permissions
5. Copy credentials to `.env`

### For AI Transaction Extraction (Bedrock)

1. Enable AWS Bedrock in your account
2. Request access to Claude models (takes 1-2 days)
3. Ensure IAM user has `bedrock:InvokeModel` permission
4. Use the same AWS credentials as SES

> **Without AWS:** The app still works! Email verification will be skipped, and transaction extraction uses regex patterns instead of AI.

## Common Issues

### Database Connection Failed
- Verify PostgreSQL is running
- Check connection string format
- Ensure database exists
- Test connection: `psql DATABASE_URL`

### Port Already in Use
The backend runs on port 3001. If occupied:
1. Change the port in `src/index.ts`
2. Update `BASE_URL` in `.env`
3. Update `NEXT_PUBLIC_API_URL` in frontend `.env`

### Prisma Migration Errors
Reset the database if needed (⚠️ destroys data):
```bash
npm run db:push
```

### AWS Bedrock Access Denied
- Check IAM permissions include `bedrock:InvokeModel`
- Verify Claude model access is approved
- The app falls back to regex parsing if Bedrock fails

## Running Tests

Run the test suite:
```bash
npm run test
```

With coverage report:
```bash
npm run test:coverage
```

Tests cover:
- Authentication flows
- Organization management
- Transaction extraction
- Rate limiting
- API endpoints

## Next Steps

After setup:
1. Start the frontend server (see frontend setup docs)
2. The backend API will be available at `http://localhost:3001`
3. All API routes are under `/api/*`
4. Check the API documentation for available endpoints

## API Health Check

Verify all systems are working:
- **Server:** GET `http://localhost:3001/`
- **Auth:** POST `http://localhost:3001/api/auth/sign-up/email`
- **Organizations:** GET `http://localhost:3001/api/organizations/my-organizations` (requires auth)
- **Transactions:** GET `http://localhost:3001/api/transactions` (requires auth)
