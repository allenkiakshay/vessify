# Frontend Setup Guide

## Prerequisites

Before you start, make sure you have:
- **Node.js** (v20 or higher)
- **npm** or **bun** package manager
- Backend server running (see backend setup docs)

## Installation Steps

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using bun (faster):
```bash
bun install
```

### 3. Setup Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Open `.env` and configure the following variables. For detailed explanations of each variable, check the `.env.example` file.

**Required Variables:**
- `NEXT_PUBLIC_API_URL` - Your backend API URL
- `NEXTAUTH_URL` - Your frontend URL
- `NEXTAUTH_SECRET` - Secret key for NextAuth sessions

**Example configuration for local development:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this
```

> **Note:** The backend must be running on port 3001 for the default setup to work.

### 4. Run the Development Server

```bash
npm run dev
```

Or with bun:
```bash
bun dev
```

The frontend will start on **http://localhost:3000**

### 5. Access the Application

Open your browser and go to:
```
http://localhost:3000
```

You should see the Vessify landing page with options to register or sign in.

## Build for Production

To create an optimized production build:

```bash
npm run build
npm run start
```

Or with bun:
```bash
bun run build
bun run start
```

## Common Issues

### Port Already in Use
If port 3000 is already occupied, you can run on a different port:
```bash
PORT=3002 npm run dev
```

### Backend Connection Issues
- Make sure the backend server is running on the port specified in `NEXT_PUBLIC_API_URL`
- Check that CORS is properly configured on the backend
- Verify the backend URL doesn't have a trailing slash

### Environment Variables Not Loading
- Restart the dev server after changing `.env` file
- Make sure variables prefixed with `NEXT_PUBLIC_` for client-side access
- Don't commit `.env` to git (only `.env.example`)

## Next Steps

After setup:
1. Register a new account at `/register`
2. Check your email for verification (if backend email is configured)
3. Login at `/login`
4. Create an organization in the dashboard
5. Start extracting transactions

For more details on features and usage, see the other documentation files.
