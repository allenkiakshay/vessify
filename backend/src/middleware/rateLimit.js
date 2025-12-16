// In-memory store for rate limiting
// In production, use Redis for distributed rate limiting
const rateLimitStore = new Map();
/**
 * Rate limiting middleware for Hono
 * Implements a sliding window counter algorithm
 */
export function rateLimit(config) {
    const { windowMs, maxRequests, keyGenerator = (c) => {
        // Default: Use user ID if authenticated, otherwise IP address
        const userId = c.get('user')?.id;
        if (userId)
            return `user:${userId}`;
        // Try to get IP from various headers
        const forwarded = c.req.header('x-forwarded-for');
        const realIp = c.req.header('x-real-ip');
        const ip = forwarded?.split(',')[0] || realIp || 'unknown';
        return `ip:${ip}`;
    }, skipSuccessfulRequests = false, skipFailedRequests = false, } = config;
    return async (c, next) => {
        const key = keyGenerator(c);
        const now = Date.now();
        // Clean up expired entries periodically (every 100 requests)
        if (Math.random() < 0.01) {
            cleanupExpiredEntries(now);
        }
        // Get or create rate limit entry
        let entry = rateLimitStore.get(key);
        // If entry doesn't exist or has expired, create new one
        if (!entry || now > entry.resetTime) {
            entry = {
                count: 0,
                resetTime: now + windowMs,
            };
            rateLimitStore.set(key, entry);
        }
        // Check if rate limit is exceeded
        if (entry.count >= maxRequests) {
            const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
            return c.json({
                error: 'Too many requests',
                message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
                retryAfter,
            }, 429, {
                'Retry-After': retryAfter.toString(),
                'X-RateLimit-Limit': maxRequests.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': Math.ceil(entry.resetTime / 1000).toString(),
            });
        }
        // Increment counter before processing request
        if (!skipSuccessfulRequests && !skipFailedRequests) {
            entry.count++;
        }
        // Set rate limit headers
        const remaining = Math.max(0, maxRequests - entry.count);
        c.header('X-RateLimit-Limit', maxRequests.toString());
        c.header('X-RateLimit-Remaining', remaining.toString());
        c.header('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000).toString());
        // Process request
        await next();
        // Conditionally increment counter after request
        if (skipSuccessfulRequests || skipFailedRequests) {
            const status = c.res.status;
            const isSuccess = status >= 200 && status < 400;
            const isFailed = status >= 400;
            if ((!skipSuccessfulRequests || !isSuccess) &&
                (!skipFailedRequests || !isFailed)) {
                entry.count++;
            }
        }
    };
}
/**
 * Cleanup expired entries from the rate limit store
 */
function cleanupExpiredEntries(now) {
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}
/**
 * Predefined rate limit configurations
 */
export const rateLimitPresets = {
    // Strict rate limit for auth endpoints (signup, login)
    auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5, // 5 requests per 15 minutes
    },
    // Moderate rate limit for API endpoints
    api: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 60, // 60 requests per minute
    },
    // Strict rate limit for expensive operations (AI extraction)
    aiExtraction: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 10, // 10 requests per minute
    },
    // Lenient rate limit for read operations
    read: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100, // 100 requests per minute
    },
};
/**
 * Clear all rate limit entries (useful for testing)
 */
export function clearRateLimitStore() {
    rateLimitStore.clear();
}
/**
 * Get current rate limit status for a key
 */
export function getRateLimitStatus(key) {
    return rateLimitStore.get(key) || null;
}
