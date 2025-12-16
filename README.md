# Vessify

> AI-powered multi-tenant financial transaction management platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![Hono](https://img.shields.io/badge/Hono-4.11-orange.svg)](https://hono.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.1-2D3748.svg)](https://www.prisma.io/)

Vessify is a modern web application that uses AI to automatically extract and categorize financial transactions from raw bank statement text. Built with a multi-tenant architecture, it allows users to manage transactions across multiple organizations with role-based access control.

## 🚀 Features

- **🤖 AI-Powered Extraction** - Paste bank statement text and let Claude AI extract amount, date, description, and category automatically
- **👥 Multi-Tenant Organizations** - Create and manage multiple organizations with separate data isolation
- **🔐 Secure Authentication** - Email/password authentication with email verification and 7-day sessions
- **📊 Transaction Management** - View, filter, and export transactions with cursor-based pagination
- **🎯 Role-Based Access** - Owner, admin, and member roles with granular permissions
- **🌐 Modern Tech Stack** - Built with Next.js 16, Hono, Prisma, and AWS services
- **⚡ Rate Limiting** - Built-in API protection against abuse
- **🔒 Type Safety** - Full TypeScript coverage on both frontend and backend

## 📸 Screenshots

### Dashboard
Clean, modern interface for managing your profile and organizations.

### Transaction Extraction
Simply paste your bank statement text and let AI do the heavy lifting.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Vessify Platform                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐              ┌──────────────┐        │
│  │   Frontend   │◄────HTTP────►│   Backend    │        │
│  │  Next.js 16  │              │  Hono + Node │        │
│  │  Port: 3000  │              │  Port: 3001  │        │
│  └──────────────┘              └───────┬──────┘        │
│                                        │                │
│                              ┌─────────┴─────────┐     │
│                              │                   │     │
│                         ┌────▼────┐       ┌─────▼────┐│
│                         │PostgreSQL│       │   AWS    ││
│                         │         │       │ Bedrock  ││
│                         │ Prisma  │       │   SES    ││
│                         └─────────┘       └──────────┘│
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16 with App Router
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4
- **Authentication:** NextAuth.js (Auth.js)
- **Language:** TypeScript

### Backend
- **Framework:** Hono (fast web framework)
- **Runtime:** Node.js 20
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Better Auth
- **AI Service:** AWS Bedrock (Claude Sonnet 4.5)
- **Email Service:** AWS SES
- **Language:** TypeScript

## 📋 Prerequisites

- **Node.js** 20 or higher
- **npm** or **bun** package manager
- **PostgreSQL** database (local or cloud)
- **AWS Account** (optional, for email verification and AI features)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/allenkiakshay/vessify.git
cd vessify
```

### 2. Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database URL and AWS credentials

# Run database migrations
npm run db:migrate

# Start backend server
npm run dev
```

Backend will run on **http://localhost:3001**

### 3. Setup Frontend

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your backend URL

# Start frontend server
npm run dev
```

Frontend will run on **http://localhost:3000**

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[📖 Complete Documentation](./docs/README.md)** - Main documentation hub
- **[🎨 Frontend Setup](./docs/frontend/setup.md)** - Frontend installation guide
- **[🎨 Frontend Overview](./docs/frontend/project-overview.md)** - Features and UI walkthrough
- **[🎨 Frontend Tech Stack](./docs/frontend/tech-stack.md)** - Frontend technologies
- **[⚙️ Backend Setup](./docs/backend/setup.md)** - Backend installation guide
- **[⚙️ Backend Overview](./docs/backend/project-overview.md)** - Complete API reference
- **[⚙️ Backend Tech Stack](./docs/backend/tech-stack.md)** - Backend architecture

## 🔧 Configuration

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this
```

### Backend Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vessify

# Authentication
BETTER_AUTH_SECRET=your-secret-key-at-least-32-characters
BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# AWS (Optional)
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_SES_FROM_EMAIL=noreply@yourdomain.com

# Environment
NODE_ENV=development
```

> **Note:** AWS credentials are optional. Without them, email verification will be skipped and transaction extraction will use regex-based parsing instead of AI.

## 🎯 Key Features Explained

### Multi-Tenant Organizations

Each organization acts as a separate workspace:
- Users can create and join multiple organizations
- Data is completely isolated between organizations
- Each user has a specific role per organization (owner, admin, member)
- Role-based permissions control what users can do

### AI Transaction Extraction

Powered by AWS Bedrock (Claude Sonnet 4.5):
- Paste raw bank statement text
- AI extracts: amount, date, merchant description, and category
- Supports Indian Rupee formats (₹, Rs, INR)
- Handles various date formats (DD/MM/YYYY, DD-Mon-YYYY, etc.)
- Returns confidence score (0-1) for accuracy
- Automatic fallback to regex parsing if AI is unavailable

### Security Features

- ✅ Password hashing with bcrypt
- ✅ Email verification system
- ✅ 7-day session management
- ✅ CSRF protection
- ✅ Rate limiting on all endpoints
- ✅ CORS configuration
- ✅ SQL injection protection via Prisma
- ✅ Organization-based access control

## 📊 Project Structure

```
vessify/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx         # Landing page
│   │   ├── login/           # Login page
│   │   ├── register/        # Registration page
│   │   ├── dashboard/       # Dashboard pages
│   │   └── api/             # API routes
│   ├── components/          # React components
│   ├── lib/                 # Utility functions
│   ├── types/               # TypeScript types
│   └── middleware.ts        # Route protection
│
├── backend/                 # Hono backend API
│   ├── src/
│   │   ├── index.ts        # Main server file
│   │   ├── lib/            # Business logic
│   │   │   ├── auth.ts     # Authentication
│   │   │   ├── bedrock.ts  # AI integration
│   │   │   ├── email.ts    # Email service
│   │   │   ├── organization.ts
│   │   │   └── transaction.ts
│   │   ├── routes/         # API endpoints
│   │   │   ├── auth.ts
│   │   │   ├── organization.ts
│   │   │   └── transaction.ts
│   │   └── middleware/     # Custom middleware
│   │       └── rateLimit.ts
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Database migrations
│   └── coverage/           # Test coverage reports
│
└── docs/                    # Documentation
    ├── README.md           # Documentation hub
    ├── frontend/           # Frontend docs
    ├── backend/            # Backend docs
    └── images/             # Screenshots
```

## 🧪 Testing

### Run Backend Tests

```bash
cd backend

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### View Test Coverage

After running tests with coverage, open:
```
backend/coverage/lcov-report/index.html
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/sign-up/email` - Register new user
- `POST /api/auth/sign-in/email` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/get-session` - Get current session
- `GET /api/auth/verify-email` - Verify email address

### Organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations/my-organizations` - Get user's organizations
- `GET /api/organizations/:id` - Get organization details
- `PUT /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Delete organization
- `GET /api/organizations/:id/members` - List members
- `POST /api/organizations/:id/members` - Add member
- `DELETE /api/organizations/:id/members/:memberId` - Remove member

### Transactions
- `POST /api/transactions/extract` - Extract transaction with AI
- `GET /api/transactions` - List transactions (paginated)
- `GET /api/transactions/:id` - Get single transaction

📖 [Complete API Documentation](./docs/backend/project-overview.md#api-endpoints)

## 🚢 Deployment

### Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel
```

### Backend Deployment (Railway/Render)

1. Push code to GitHub
2. Connect repository to Railway or Render
3. Set environment variables
4. Deploy automatically on push

### Database Hosting

Recommended providers:
- **Neon** - Serverless PostgreSQL (free tier)
- **Supabase** - PostgreSQL with built-in auth (free tier)
- **Railway** - PostgreSQL with easy setup

### Production Checklist

- [ ] Set strong secrets for `BETTER_AUTH_SECRET` and `NEXTAUTH_SECRET`
- [ ] Use production database URL
- [ ] Configure AWS SES for email verification
- [ ] Enable AWS Bedrock for AI features
- [ ] Set up Redis for rate limiting (instead of in-memory)
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring and logging
- [ ] Configure database backups
- [ ] Use environment-specific URLs

## 🛠️ Development Commands

### Backend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run test         # Run tests
npm run test:coverage # Generate coverage report
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio (DB GUI)
npm run db:generate  # Generate Prisma Client
```

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🐛 Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists: `createdb vessify`
- Test connection: `psql $DATABASE_URL`

### Port Already in Use
- Backend (3001): Change port in `src/index.ts`
- Frontend (3000): Run with `PORT=3002 npm run dev`

### AWS Bedrock Not Working
- Verify IAM permissions include `bedrock:InvokeModel`
- Check AWS credentials in `.env`
- Ensure Claude model access is approved
- App will automatically fall back to regex parsing

### Email Verification Not Working
- Check AWS SES configuration
- Verify sender email is verified in AWS SES
- Check IAM permissions for SES
- Email verification can be skipped for development

## 🤝 Contributing

This is a private project. If you have access:

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes
3. Write/update tests
4. Update documentation
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📝 License

This project is private and proprietary. All rights reserved.

## 👤 Author

**Akshay Allen**
- GitHub: [@allenkiakshay](https://github.com/allenkiakshay)
- Email: allenkiakshay8322@gmail.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Hono](https://hono.dev/) - Fast web framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Better Auth](https://www.better-auth.com/) - Modern authentication
- [AWS Bedrock](https://aws.amazon.com/bedrock/) - AI model hosting
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

## 📞 Support

For issues or questions:
1. Check the [documentation](./docs/README.md)
2. Review the [API reference](./docs/backend/project-overview.md)
3. Check error logs and console output
4. Verify environment variables are set correctly

---

**Built with ❤️ using Next.js, Hono, and AWS Bedrock**

**Last Updated:** December 16, 2025
