# Vessify Documentation

Welcome to the Vessify documentation! This guide will help you understand, set up, and work with the Vessify platform - a multi-tenant financial transaction management system powered by AI.

## 📚 Table of Contents

### Getting Started

- [Project Overview](#project-overview)
- [Quick Start Guide](#quick-start-guide)
- [Architecture](#architecture)

### Frontend Documentation

- [Frontend Setup Guide](./frontend/setup.md) - Installation and configuration
- [Frontend Project Overview](./frontend/project-overview.md) - Features, UI, and user flow
- [Frontend Tech Stack](./frontend/tech-stack.md) - Technologies and how they're used

### Backend Documentation

- [Backend Setup Guide](./backend/setup.md) - Installation and configuration
- [Backend Project Overview](./backend/project-overview.md) - API endpoints and use cases
- [Backend Tech Stack](./backend/tech-stack.md) - Technologies and architecture

---

## Project Overview

**Vessify** is a multi-tenant financial transaction management platform that uses AI to automatically extract and categorize bank transactions from raw statement text.

### Key Features

🔐 **Secure Authentication**
- Email/password registration and login
- Email verification system
- 7-day session management
- Password hashing with bcrypt

👥 **Multi-Tenant Organizations**
- Create and manage multiple organizations
- Role-based access control (owner, admin, member)
- Organization-scoped data isolation
- Member management

🤖 **AI-Powered Transaction Extraction**
- Paste bank statement text
- AI automatically extracts amount, date, description, category
- Supports Indian Rupee formats (₹, Rs, INR)
- Confidence scoring for accuracy
- Falls back to regex parsing

📊 **Transaction Management**
- View all transactions per organization
- Cursor-based pagination
- Category-based filtering
- Export capabilities

### What Makes Vessify Special?

- **No Manual Entry** - Just paste bank statement text, AI does the rest
- **Multi-Organization** - Manage personal and business finances separately
- **Secure & Scalable** - Built with production-ready technologies
- **Modern Stack** - Next.js 16, Hono, Prisma, AWS Bedrock
- **Type-Safe** - Full TypeScript coverage on frontend and backend

---

## Quick Start Guide

### Prerequisites

- Node.js 20 or higher
- PostgreSQL database
- AWS Account (optional, for email and AI features)

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

Frontend runs on **http://localhost:3000**

📖 [Complete Frontend Setup Guide](./frontend/setup.md)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database and AWS credentials
   ```

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

Backend runs on **http://localhost:3001**

📖 [Complete Backend Setup Guide](./backend/setup.md)

---

## Architecture

### System Architecture

```
┌─────────────────┐
│   Frontend      │
│   Next.js 16    │
│   Port: 3000    │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│   Backend       │
│   Hono + Node   │
│   Port: 3001    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼────┐
│ DB   │  │  AWS  │
│ Postgres  Bedrock│
└──────┘  │  SES  │
          └───────┘
```

### Tech Stack Overview

**Frontend:**
- Next.js 16 (React framework)
- NextAuth.js (Authentication)
- Tailwind CSS (Styling)
- TypeScript (Type safety)

**Backend:**
- Hono (Web framework)
- Better Auth (Authentication)
- Prisma ORM (Database)
- PostgreSQL (Database)
- AWS Bedrock (AI - Claude Sonnet 4.5)
- AWS SES (Email service)
- TypeScript (Type safety)

📖 [Frontend Tech Stack Details](./frontend/tech-stack.md)  
📖 [Backend Tech Stack Details](./backend/tech-stack.md)

---

## Key Concepts

### Multi-Tenancy

Each **Organization** acts as a separate workspace:
- Users can create/join multiple organizations
- Each organization has its own transactions
- Data is completely isolated between organizations
- Users have specific roles in each organization

**Roles:**
- **Owner** - Full control, can delete organization
- **Admin** - Manage members and settings
- **Member** - View and create transactions

### Authentication Flow

1. User registers with email/password
2. Verification email sent (if AWS SES configured)
3. User verifies email via link
4. User logs in
5. Session created with 7-day expiration
6. User accesses protected resources

### Transaction Extraction

1. User selects an organization
2. Pastes raw bank statement text
3. Backend sends text to AWS Bedrock (Claude AI)
4. AI extracts:
   - Amount (always positive)
   - Date (multiple formats supported)
   - Description (merchant name)
   - Category (Food, Shopping, etc.)
   - Confidence score (0-1)
5. Transaction saved to database
6. Frontend displays extracted data

---

## API Overview

### Base URL
```
http://localhost:3001/api
```

### Main Endpoints

**Authentication:**
- `POST /auth/sign-up/email` - Register new user
- `POST /auth/sign-in/email` - Login
- `POST /auth/sign-out` - Logout
- `GET /auth/get-session` - Get current session
- `GET /auth/verify-email` - Verify email address

**Organizations:**
- `POST /organizations` - Create organization
- `GET /organizations/my-organizations` - Get user's organizations
- `GET /organizations/:id` - Get organization details
- `PUT /organizations/:id` - Update organization
- `DELETE /organizations/:id` - Delete organization
- `GET /organizations/:id/members` - List members
- `POST /organizations/:id/members` - Add member
- `DELETE /organizations/:id/members/:memberId` - Remove member

**Transactions:**
- `POST /transactions/extract` - Extract transaction with AI
- `GET /transactions` - List transactions (paginated)
- `GET /transactions/:id` - Get single transaction

📖 [Complete API Reference](./backend/project-overview.md#api-endpoints)

---

## Environment Variables

### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/vessify
BETTER_AUTH_SECRET=your-secret-key
BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# Optional - AWS Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_SES_FROM_EMAIL=noreply@yourdomain.com
```

**Note:** AWS credentials are optional. Without them:
- Email verification will be skipped
- Transaction extraction falls back to regex parsing

---

## Project Structure

```
vessify/
├── frontend/               # Next.js frontend application
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   ├── lib/               # Utility functions
│   ├── types/             # TypeScript types
│   └── middleware.ts      # Route protection
│
├── backend/               # Hono backend API
│   ├── src/
│   │   ├── index.ts      # Main server file
│   │   ├── lib/          # Business logic
│   │   ├── routes/       # API endpoints
│   │   └── middleware/   # Custom middleware
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   └── migrations/   # Database migrations
│   └── coverage/         # Test coverage reports
│
└── docs/                 # Documentation (you are here!)
    ├── frontend/         # Frontend documentation
    ├── backend/          # Backend documentation
    └── images/           # Screenshots and diagrams
```

---

## Development Workflow

### Starting Development

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Running Tests

**Backend Tests:**
```bash
cd backend
npm run test
npm run test:coverage
```

**Database Management:**
```bash
npm run db:studio      # Open Prisma Studio
npm run db:migrate     # Run migrations
npm run db:generate    # Generate Prisma Client
```

---

## Common Tasks

### Creating a New User

1. Go to http://localhost:3000/register
2. Enter name, email, and password
3. Click "Create Account"
4. Verify email (if AWS SES configured)
5. Login at http://localhost:3000/login

### Creating an Organization

1. Login to dashboard
2. Click "Organizations" tab
3. Click "Create Organization"
4. Enter organization details
5. Click "Create"

### Extracting Transactions

1. Go to http://localhost:3000/dashboard/transactions
2. Select an organization from dropdown
3. Paste bank statement text (e.g., "Starbucks 12/15/2024 ₹420")
4. Click "Extract Transaction"
5. View extracted details with confidence score

---

## Troubleshooting

### Frontend won't start
- Check Node.js version (must be 20+)
- Verify `.env` file exists with correct values
- Ensure backend is running on port 3001
- Try: `rm -rf .next && npm install`

### Backend won't start
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Run migrations: `npm run db:migrate`
- Check port 3001 is not in use

### Database connection error
- Verify PostgreSQL is running
- Test connection: `psql DATABASE_URL`
- Check username/password in connection string
- Ensure database exists

### AWS Bedrock not working
- Verify IAM permissions include `bedrock:InvokeModel`
- Check AWS credentials in `.env`
- Ensure Claude model access is approved
- App will fall back to regex parsing

### Rate limit errors
- Default: 100 requests/minute for most endpoints
- AI extraction: 10 requests/minute
- Wait and try again
- Check `X-RateLimit-*` headers in response

---

## Production Deployment

### Recommended Services

**Frontend:**
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify

**Backend:**
- AWS ECS/Fargate
- Railway
- Render
- DigitalOcean App Platform

**Database:**
- Neon (PostgreSQL)
- Supabase
- AWS RDS
- Railway

### Production Checklist

- [ ] Set strong `BETTER_AUTH_SECRET` and `NEXTAUTH_SECRET`
- [ ] Use environment-specific `DATABASE_URL`
- [ ] Configure production `FRONTEND_URL` and `BASE_URL`
- [ ] Set up AWS SES for emails
- [ ] Enable AWS Bedrock for AI features
- [ ] Use Redis for rate limiting (not in-memory)
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up monitoring and logging
- [ ] Configure database backups
- [ ] Use IAM roles instead of access keys
- [ ] Enable Prisma Accelerate for connection pooling

---

## Contributing

This is a private project. If you have access and want to contribute:

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Update documentation
5. Submit a pull request

---

## Support

For issues or questions:
1. Check the documentation in `docs/`
2. Review test files for usage examples
3. Check error logs for debugging
4. Verify environment variables are set correctly

---

## License

Private project. All rights reserved.

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Hono Documentation](https://hono.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Last Updated:** December 16, 2025  
**Version:** 1.0.0  
**Maintainer:** Akshay Allenki
