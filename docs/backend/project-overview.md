# Project Overview - Vessify Backend

## What is Vessify Backend?

Vessify backend is a RESTful API server built with Hono that powers the multi-tenant financial transaction management platform. It handles user authentication, organization management, and AI-powered transaction extraction from bank statements using AWS Bedrock (Claude AI).

## Core Capabilities

- **Authentication & Authorization** - Secure user registration, login, and session management
- **Multi-Tenancy** - Organization-based data isolation with role-based access control
- **AI Transaction Extraction** - Automatically parse bank statements using Claude Sonnet 4.5
- **Email Verification** - Send verification emails via AWS SES
- **Rate Limiting** - Prevent API abuse with configurable limits
- **Database Management** - PostgreSQL with Prisma ORM for type-safe queries

## API Endpoints

### Authentication APIs (`/api/auth`)

Handled by **Better Auth** library with custom configuration.

#### 1. Sign Up (Register)
```
POST /api/auth/sign-up/email
```

**Purpose:** Create a new user account

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  },
  "session": {
    "token": "session-token",
    "expiresAt": "2025-12-23T00:00:00Z"
  }
}
```

**Use Cases:**
- New user registration
- Account creation for organization owners
- Collecting user information for profile setup

**Features:**
- Password hashing with bcrypt
- Email verification email sent automatically
- Session created upon successful registration
- Validates email format and password strength

---

#### 2. Sign In (Login)
```
POST /api/auth/sign-in/email
```

**Purpose:** Authenticate existing user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": true
  },
  "session": {
    "token": "session-token",
    "expiresAt": "2025-12-23T00:00:00Z"
  }
}
```

**Use Cases:**
- User login
- Session creation
- Frontend authentication flow

**Features:**
- Verifies email and password
- Creates 7-day session
- Returns user data for profile display
- Rate limited to prevent brute force attacks

---

#### 3. Sign Out (Logout)
```
POST /api/auth/sign-out
```

**Purpose:** Invalidate user session

**Headers:**
```
Cookie: session-token
```

**Response:**
```json
{
  "success": true
}
```

**Use Cases:**
- User logout
- Session termination
- Security: logout from all devices

---

#### 4. Get Session
```
GET /api/auth/get-session
```

**Purpose:** Retrieve current user session

**Headers:**
```
Cookie: session-token
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": true
  },
  "session": {
    "token": "session-token",
    "expiresAt": "2025-12-23T00:00:00Z"
  }
}
```

**Use Cases:**
- Check if user is logged in
- Retrieve user information
- Verify session validity
- Frontend auth state management

---

#### 5. Verify Email
```
GET /api/auth/verify-email?token=verification-token
```

**Purpose:** Verify user's email address

**Query Parameters:**
- `token` - Verification token from email

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Use Cases:**
- Email verification after registration
- Confirm email ownership
- Enable full account access

---

### Organization APIs (`/api/organizations`)

All organization endpoints require authentication (valid session).

#### 1. Create Organization
```
POST /api/organizations
```

**Purpose:** Create a new organization

**Headers:**
```
Cookie: session-token
```

**Request Body:**
```json
{
  "name": "My Company",
  "slug": "my-company",
  "description": "Company description",
  "logo": "https://example.com/logo.png"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "My Company",
  "slug": "my-company",
  "description": "Company description",
  "logo": "https://example.com/logo.png",
  "createdAt": "2025-12-16T00:00:00Z",
  "members": [
    {
      "userId": "uuid",
      "role": "owner",
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "name": "John Doe"
      }
    }
  ]
}
```

**Use Cases:**
- Create new company/team workspace
- Set up multi-tenant environment
- Initialize organization for transaction management

**Features:**
- Creator automatically becomes owner
- Slug must be unique (URL-friendly identifier)
- Rate limited to 10 organizations per hour
- Supports optional logo and description

---

#### 2. Get My Organizations
```
GET /api/organizations/my-organizations
```

**Purpose:** Get all organizations the user belongs to

**Headers:**
```
Cookie: session-token
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "My Company",
    "slug": "my-company",
    "role": "owner",
    "createdAt": "2025-12-16T00:00:00Z"
  },
  {
    "id": "uuid",
    "name": "Another Org",
    "slug": "another-org",
    "role": "member",
    "createdAt": "2025-12-15T00:00:00Z"
  }
]
```

**Use Cases:**
- Display organization selector dropdown
- Show user's accessible workspaces
- Switch between organizations

---

#### 3. Get Organization by ID
```
GET /api/organizations/:id
```

**Purpose:** Get organization details

**Headers:**
```
Cookie: session-token
```

**Response:**
```json
{
  "id": "uuid",
  "name": "My Company",
  "slug": "my-company",
  "description": "Company description",
  "logo": "https://example.com/logo.png",
  "createdAt": "2025-12-16T00:00:00Z",
  "updatedAt": "2025-12-16T00:00:00Z"
}
```

**Use Cases:**
- View organization details
- Display organization information
- Edit organization settings

---

#### 4. Get Organization by Slug
```
GET /api/organizations/slug/:slug
```

**Purpose:** Get organization by unique slug

**Headers:**
```
Cookie: session-token
```

**Response:** Same as Get by ID

**Use Cases:**
- User-friendly URLs
- Public organization pages
- SEO-friendly routes

---

#### 5. Update Organization
```
PUT /api/organizations/:id
```

**Purpose:** Update organization details

**Headers:**
```
Cookie: session-token
```

**Request Body:**
```json
{
  "name": "Updated Company Name",
  "description": "New description",
  "logo": "https://example.com/new-logo.png"
}
```

**Response:** Updated organization object

**Use Cases:**
- Edit organization name
- Update branding (logo)
- Modify description

**Permissions:** Requires `admin` or `owner` role

---

#### 6. Delete Organization
```
DELETE /api/organizations/:id
```

**Purpose:** Permanently delete organization

**Headers:**
```
Cookie: session-token
```

**Response:**
```json
{
  "success": true,
  "message": "Organization deleted"
}
```

**Use Cases:**
- Remove organization and all data
- Clean up unused workspaces

**Permissions:** Requires `owner` role only

**Warning:** Deletes all transactions and members associated with the organization

---

#### 7. Get Organization Members
```
GET /api/organizations/:id/members
```

**Purpose:** List all members of an organization

**Headers:**
```
Cookie: session-token
```

**Response:**
```json
{
  "members": [
    {
      "id": "uuid",
      "role": "owner",
      "createdAt": "2025-12-16T00:00:00Z",
      "user": {
        "id": "uuid",
        "email": "owner@example.com",
        "name": "John Doe"
      }
    },
    {
      "id": "uuid",
      "role": "member",
      "createdAt": "2025-12-16T00:00:00Z",
      "user": {
        "id": "uuid",
        "email": "member@example.com",
        "name": "Jane Smith"
      }
    }
  ]
}
```

**Use Cases:**
- Display team members
- Manage organization access
- Show user roles

---

#### 8. Add Member to Organization
```
POST /api/organizations/:id/members
```

**Purpose:** Invite user to organization

**Headers:**
```
Cookie: session-token
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "role": "member"
}
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "organizationId": "uuid",
  "role": "member",
  "createdAt": "2025-12-16T00:00:00Z"
}
```

**Use Cases:**
- Add team members
- Grant organization access
- Assign roles (member, admin)

**Permissions:** Requires `admin` or `owner` role

---

#### 9. Remove Member from Organization
```
DELETE /api/organizations/:id/members/:memberId
```

**Purpose:** Remove user from organization

**Headers:**
```
Cookie: session-token
```

**Response:**
```json
{
  "success": true,
  "message": "Member removed"
}
```

**Use Cases:**
- Remove team members
- Revoke organization access
- Clean up user list

**Permissions:** Requires `admin` or `owner` role

---

#### 10. Update Member Role
```
PUT /api/organizations/:id/members/:memberId/role
```

**Purpose:** Change member's role

**Headers:**
```
Cookie: session-token
```

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response:** Updated member object

**Use Cases:**
- Promote member to admin
- Change permissions
- Demote admin to member

**Permissions:** Requires `owner` role

**Roles:**
- `owner` - Full control, can delete org
- `admin` - Manage members and settings
- `member` - View and create transactions

---

### Transaction APIs (`/api/transactions`)

All transaction endpoints require authentication and organization access.

#### 1. Extract Transaction (AI-Powered)
```
POST /api/transactions/extract
```

**Purpose:** Parse bank statement text and extract transaction details using AI

**Headers:**
```
Cookie: session-token
```

**Request Body:**
```json
{
  "text": "Starbucks Coffee 12/15/2024 ₹420.00",
  "organizationId": "uuid"
}
```

**Response:**
```json
{
  "id": "uuid",
  "text": "Starbucks Coffee 12/15/2024 ₹420.00",
  "amount": 420.00,
  "date": "2024-12-15T00:00:00Z",
  "description": "Starbucks Coffee",
  "category": "Food & Dining",
  "confidence": 0.95,
  "organizationId": "uuid",
  "userId": "uuid",
  "createdAt": "2025-12-16T00:00:00Z",
  "updatedAt": "2025-12-16T00:00:00Z"
}
```

**Use Cases:**
- Extract transaction from bank statement
- Parse PDF bank statement text
- Bulk import transactions
- Automatic categorization

**Features:**
- AI-powered extraction using AWS Bedrock (Claude Sonnet 4.5)
- Supports Indian Rupee formats (₹, Rs, INR)
- Handles various date formats (DD/MM/YYYY, DD Mon YYYY)
- Automatic categorization (Food, Shopping, Transport, etc.)
- Confidence score (0-1) indicates extraction accuracy
- Falls back to regex parsing if Bedrock unavailable
- Rate limited to 10 requests per minute (AI is expensive)

**Categories:**
- Food & Dining
- Shopping
- Transportation
- Entertainment
- Utilities
- Healthcare
- Transfer
- Income
- Other

---

#### 2. Get Transactions (Paginated)
```
GET /api/transactions?organizationId=uuid&limit=20&cursor=cursor-value
```

**Purpose:** List transactions for an organization with pagination

**Headers:**
```
Cookie: session-token
```

**Query Parameters:**
- `organizationId` (required) - Organization UUID
- `limit` (optional) - Number of items (1-100, default: 20)
- `cursor` (optional) - Pagination cursor for next page

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "text": "Starbucks Coffee 12/15/2024 ₹420.00",
      "amount": 420.00,
      "date": "2024-12-15T00:00:00Z",
      "description": "Starbucks Coffee",
      "category": "Food & Dining",
      "confidence": 0.95,
      "createdAt": "2025-12-16T00:00:00Z",
      "updatedAt": "2025-12-16T00:00:00Z"
    }
  ],
  "nextCursor": "cursor-value",
  "hasMore": true,
  "count": 20
}
```

**Use Cases:**
- Display transaction list
- Implement infinite scroll
- Export transactions
- Generate reports

**Features:**
- Cursor-based pagination (more efficient than offset)
- Sorted by creation date (newest first)
- Organization-scoped (multi-tenant isolation)
- Access control enforced

---

#### 3. Get Single Transaction
```
GET /api/transactions/:id
```

**Purpose:** Get transaction details by ID

**Headers:**
```
Cookie: session-token
```

**Response:** Single transaction object

**Use Cases:**
- View transaction details
- Edit transaction
- Verify extraction accuracy

**Features:**
- Access control: only users in the organization can view
- Returns full transaction data including raw text

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

| Endpoint | Limit | Window |
|----------|-------|--------|
| Global (all endpoints) | 100 requests | 1 minute |
| AI Transaction Extraction | 10 requests | 1 minute |
| Create Organization | 10 requests | 1 hour |
| Auth Endpoints | Built-in Better Auth limits | - |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702742400
Retry-After: 45
```

**Rate Limit Exceeded Response:**
```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again in 45 seconds.",
  "retryAfter": 45
}
```

---

## Error Responses

All errors follow a consistent format:

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": "Email is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized - Please login"
}
```

### 403 Forbidden
```json
{
  "error": "You do not have access to this organization"
}
```

### 404 Not Found
```json
{
  "error": "Organization not found"
}
```

### 409 Conflict
```json
{
  "error": "Organization slug already exists"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again in 45 seconds.",
  "retryAfter": 45
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to extract transaction",
  "details": "AWS Bedrock unavailable"
}
```

---

## Authentication Flow

1. **User registers** → POST `/api/auth/sign-up/email`
2. **Email sent** → AWS SES sends verification link
3. **User verifies** → GET `/api/auth/verify-email?token=xxx`
4. **User logs in** → POST `/api/auth/sign-in/email`
5. **Session created** → Cookie with 7-day expiration
6. **Access protected routes** → Session validated on each request
7. **User logs out** → POST `/api/auth/sign-out`

---

## Multi-Tenancy Architecture

**How it works:**

1. Each **Organization** is a tenant
2. Users can belong to multiple organizations
3. Each user has a **role** in each organization (owner, admin, member)
4. All data (transactions) is scoped to organizations
5. API enforces organization-based access control

**Data Isolation:**
- Transactions belong to organizations
- Users can only access data from their organizations
- Role-based permissions control actions
- Database queries filter by organizationId

---

## Technology Highlights

- **Hono Framework** - Fast, lightweight, modern routing
- **Better Auth** - Session management, email verification
- **Prisma ORM** - Type-safe database queries
- **AWS Bedrock** - Claude AI for transaction extraction
- **AWS SES** - Transactional email delivery
- **PostgreSQL** - Relational database with ACID compliance
- **bcryptjs** - Secure password hashing
- **Rate Limiting** - Custom middleware (in-memory, upgrade to Redis for production)

---

## Security Features

✅ **Password Hashing** - bcrypt with salt  
✅ **Session Management** - 7-day expiration, database-backed  
✅ **CSRF Protection** - Built into Better Auth  
✅ **Rate Limiting** - Prevents brute force and API abuse  
✅ **CORS Configuration** - Only allows frontend origin  
✅ **Email Verification** - Confirms email ownership  
✅ **SQL Injection Protection** - Prisma parameterized queries  
✅ **Access Control** - Organization-based permissions  
✅ **Input Validation** - All endpoints validate input

---

## Production Considerations

### Recommended Upgrades:
1. **Redis** for rate limiting (distributed, shared across servers)
2. **CloudWatch** for logging and monitoring
3. **IAM Roles** instead of AWS access keys
4. **Connection Pooling** with Prisma Accelerate
5. **Load Balancer** for horizontal scaling
6. **Environment Secrets** with AWS Secrets Manager
7. **API Gateway** for additional security layer

---

## API Testing

Test endpoints using cURL or Postman:

**Example: Sign Up**
```bash
curl -X POST http://localhost:3001/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "name": "Test User"
  }'
```

**Example: Get Organizations**
```bash
curl http://localhost:3001/api/organizations/my-organizations \
  -H "Cookie: better-auth.session_token=your-session-token"
```

**Example: Extract Transaction**
```bash
curl -X POST http://localhost:3001/api/transactions/extract \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=your-session-token" \
  -d '{
    "text": "Starbucks Coffee 12/15/2024 ₹420.00",
    "organizationId": "your-org-id"
  }'
```

---

## Next Steps

- See [Setup Guide](./setup.md) for installation
- Check [Tech Stack](./tech-stack.md) for detailed architecture
- Review test files in `src/**/__tests__/` for usage examples

---

*The backend runs on port 3001 by default. All API routes are prefixed with `/api`.*
