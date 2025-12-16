import { Hono } from 'hono'
import { auth } from '../lib/auth.js'
import { rateLimit, rateLimitPresets } from '../middleware/rateLimit.js'

const authRouter = new Hono()

// Apply strict rate limiting to auth routes (5 requests per 15 minutes)
authRouter.use('/*', rateLimit({
  windowMs: rateLimitPresets.auth.windowMs,
  maxRequests: rateLimitPresets.auth.maxRequests,
  keyGenerator: (c) => {
    // Rate limit by IP for auth routes (before user is authenticated)
    const forwarded = c.req.header('x-forwarded-for')
    const realIp = c.req.header('x-real-ip')
    const ip = forwarded?.split(',')[0] || realIp || 'unknown'
    return `auth:${ip}`
  },
}))

// Better Auth handles all auth routes automatically
// Mount Better Auth handler for all /api/auth/* routes
authRouter.on(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], '/*', async (c) => {
  return await auth.handler(c.req.raw)
})

export default authRouter
