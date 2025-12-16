import { Hono } from 'hono'
import type { Context, Next } from 'hono'
import { auth } from '../lib/auth.js'
import type { Session } from '../lib/auth.js'
import { rateLimit, rateLimitPresets } from '../middleware/rateLimit.js'
import {
  parseTransactionText,
  createTransaction,
  getTransactions,
  getTransactionById,
} from '../lib/transaction.js'
import { getUserOrganizations } from '../lib/organization.js'

type Variables = {
  user: Session['user']
  session: Session
}

const transactionRouter = new Hono<{ Variables: Variables }>()

// Middleware to verify session with Better Auth
const requireAuth = async (c: Context<{ Variables: Variables }>, next: Next): Promise<Response | void> => {
  try {
    // First, try to get session from Better Auth
    let session = null
    try {
      session = await auth.api.getSession({ headers: c.req.raw.headers })
    } catch (e) {
      // Better Auth session not found, try NextAuth headers
    }
    
    // If Better Auth session exists, use it
    if (session?.user) {
      c.set('user', session.user)
      c.set('session', session)
      await next()
      return
    }

    // Otherwise, check for NextAuth proxy headers
    const userId = c.req.header('X-User-Id')
    const userEmail = c.req.header('X-User-Email')
    
    if (userId && userEmail) {
      // Create a minimal user object from the headers
      // This is for NextAuth proxy compatibility
      const proxyUser = {
        id: userId,
        email: userEmail,
        name: userEmail.split('@')[0],
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        image: null,
      } as Session['user']
      
      c.set('user', proxyUser)
      await next()
      return
    }

    // No valid authentication found
    return c.json({ error: 'Unauthorized - Please login' }, 401)
  } catch (error) {
    console.error('Auth error:', error)
    return c.json({ error: 'Unauthorized - Invalid session' }, 401)
  }
}

/**
 * POST /api/transactions/extract
 * Parse raw bank statement text and save transaction
 * Rate limited: 10 requests per minute (AI extraction is expensive)
 */
transactionRouter.post(
  '/extract',
  requireAuth,
  rateLimit({
    windowMs: rateLimitPresets.aiExtraction.windowMs,
    maxRequests: rateLimitPresets.aiExtraction.maxRequests,
    keyGenerator: (c) => {
      const user = c.get('user')
      return `ai-extract:${user?.id || 'anonymous'}`
    },
  }),
  async (c) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    const { text, organizationId } = body

    // Validate input
    if (!text || typeof text !== 'string') {
      return c.json({ error: 'Text is required and must be a string' }, 400)
    }

    if (!organizationId || typeof organizationId !== 'string') {
      return c.json({ error: 'organizationId is required' }, 400)
    }

    // Verify user has access to the organization
    const userOrgs = await getUserOrganizations(user.id)
    const hasAccess = userOrgs.some(org => org.id === organizationId)
    
    if (!hasAccess) {
      return c.json({ error: 'You do not have access to this organization' }, 403)
    }

    // Parse the transaction text (now async with Bedrock)
    const parsed = await parseTransactionText(text)

    // Save to database
    const transaction = await createTransaction({
      text,
      amount: parsed.amount,
      date: parsed.date,
      description: parsed.description,
      category: parsed.category,
      confidence: parsed.confidence,
      organizationId,
      userId: user.id,
    })

    // Return the structured data with confidence
    return c.json({
      id: transaction.id,
      text: transaction.text,
      amount: transaction.amount,
      date: transaction.date,
      description: transaction.description,
      category: transaction.category,
      confidence: transaction.confidence,
      organizationId: transaction.organizationId,
      userId: transaction.userId,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    }, 201)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error extracting transaction:', error)
    return c.json({ 
      error: 'Failed to extract transaction',
      details: errorMessage
    }, 500)
  }
})

/**
 * GET /api/transactions
 * Get transactions with cursor-based pagination
 * Enforces access control - only returns transactions for user's organizations
 */
transactionRouter.get('/', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    
    // Get query parameters
    const organizationId = c.req.query('organizationId')
    const limit = parseInt(c.req.query('limit') || '20', 10)
    const cursor = c.req.query('cursor')

    // Validate limit
    if (limit < 1 || limit > 100) {
      return c.json({ error: 'Limit must be between 1 and 100' }, 400)
    }

    // Require organizationId
    if (!organizationId) {
      return c.json({ error: 'organizationId query parameter is required' }, 400)
    }

    // Verify user has access to the organization
    const userOrgs = await getUserOrganizations(user.id)
    const hasAccess = userOrgs.some(org => org.id === organizationId)
    
    if (!hasAccess) {
      return c.json({ error: 'You do not have access to this organization' }, 403)
    }

    // Get transactions with pagination
    const result = await getTransactions({
      organizationId,
      limit,
      cursor: cursor || undefined,
    })

    return c.json({
      items: result.items,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
      count: result.items.length,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error fetching transactions:', error)
    return c.json({ 
      error: 'Failed to fetch transactions',
      details: errorMessage
    }, 500)
  }
})

/**
 * GET /api/transactions/:id
 * Get a single transaction by ID
 */
transactionRouter.get('/:id', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const id = c.req.param('id')
    const organizationId = c.req.query('organizationId')

    if (!organizationId) {
      return c.json({ error: 'organizationId query parameter is required' }, 400)
    }

    // Verify user has access to the organization
    const userOrgs = await getUserOrganizations(user.id)
    const hasAccess = userOrgs.some(org => org.id === organizationId)
    
    if (!hasAccess) {
      return c.json({ error: 'You do not have access to this organization' }, 403)
    }

    // Get transaction
    const transaction = await getTransactionById(id, organizationId)

    if (!transaction) {
      return c.json({ error: 'Transaction not found' }, 404)
    }

    return c.json(transaction)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error fetching transaction:', error)
    return c.json({ 
      error: 'Failed to fetch transaction',
      details: errorMessage
    }, 500)
  }
})

export default transactionRouter
