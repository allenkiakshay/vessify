import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { rateLimit, rateLimitPresets } from './middleware/rateLimit.js'
import auth from './routes/auth.js'
import organizationRouter from './routes/organization.js'
import transactionRouter from './routes/transaction.js'
import { prisma } from './lib/db.js'

// Validate required environment variables
if (!process.env.FRONTEND_URL) {
  throw new Error('FRONTEND_URL environment variable is required')
}

const app = new Hono()

// Configure CORS
app.use('/*', cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Global rate limiting - 100 requests per minute per user/IP
app.use('/*', rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
}))

// Mount routes
app.route('/api/auth', auth)
app.route('/api/organizations', organizationRouter)
app.route('/api/transactions', transactionRouter)

app.get('/', (c) => {
  return c.text('Hello Hono + TypeScript 🚀')
})

app.get('/users/:id', (c) => {
  const id = c.req.param('id')
  return c.json({ userId: id })
})

serve({
  fetch: app.fetch,
  port: 3001,
})

console.log('Server running at http://localhost:3001')
