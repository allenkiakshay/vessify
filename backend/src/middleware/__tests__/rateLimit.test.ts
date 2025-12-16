import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { rateLimit, clearRateLimitStore } from '../rateLimit.js'

describe('Rate Limiting Middleware', () => {
  beforeEach(() => {
    clearRateLimitStore()
  })

  afterEach(() => {
    clearRateLimitStore()
  })

  it('should allow requests within the limit', async () => {
    const mockContext: any = {
      req: {
        header: () => '127.0.0.1',
      },
      get: () => null,
      header: jest.fn(),
      json: jest.fn(),
      res: { status: 200 },
    }

    const mockNext = jest.fn(async () => {})

    const middleware = rateLimit({
      windowMs: 60000,
      maxRequests: 5,
    })

    // Make 5 requests - all should pass
    for (let i = 0; i < 5; i++) {
      await middleware(mockContext, mockNext as any)
    }

    expect(mockNext).toHaveBeenCalledTimes(5)
    expect(mockContext.json).not.toHaveBeenCalled()
  })

  it('should block requests exceeding the limit', async () => {
    const mockContext: any = {
      req: {
        header: () => '127.0.0.1',
      },
      get: () => null,
      header: jest.fn(),
      json: jest.fn().mockReturnValue({ error: 'Rate limit exceeded' }),
      res: { status: 429 },
    }

    const mockNext = jest.fn(async () => {})

    const middleware = rateLimit({
      windowMs: 60000,
      maxRequests: 3,
    })

    // Make 4 requests - 4th should be blocked
    for (let i = 0; i < 4; i++) {
      await middleware(mockContext, mockNext as any)
    }

    expect(mockNext).toHaveBeenCalledTimes(3)
    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Too many requests',
      }),
      429,
      expect.any(Object)
    )
  })

  it('should rate limit per user when authenticated', async () => {
    const user1Context: any = {
      req: {
        header: () => '127.0.0.1',
      },
      get: (key: string) => (key === 'user' ? { id: 'user1' } : null),
      header: jest.fn(),
      json: jest.fn(),
      res: { status: 200 },
    }

    const user2Context: any = {
      req: {
        header: () => '127.0.0.1',
      },
      get: (key: string) => (key === 'user' ? { id: 'user2' } : null),
      header: jest.fn(),
      json: jest.fn(),
      res: { status: 200 },
    }

    const mockNext = jest.fn(async () => {})

    const middleware = rateLimit({
      windowMs: 60000,
      maxRequests: 2,
    })

    // User 1 makes 2 requests
    await middleware(user1Context, mockNext as any)
    await middleware(user1Context, mockNext as any)

    // User 2 makes 2 requests - should also work (different user)
    await middleware(user2Context, mockNext as any)
    await middleware(user2Context, mockNext as any)

    expect(mockNext).toHaveBeenCalledTimes(4)
  })

  it('should set proper rate limit headers', async () => {
    const headers: Record<string, string> = {}
    const mockContext: any = {
      req: {
        header: () => '127.0.0.1',
      },
      get: () => null,
      header: (key: string, value: string) => {
        headers[key] = value
      },
      json: jest.fn(),
      res: { status: 200 },
    }

    const mockNext = jest.fn(async () => {})

    const middleware = rateLimit({
      windowMs: 60000,
      maxRequests: 10,
    })

    await middleware(mockContext, mockNext as any)

    expect(headers['X-RateLimit-Limit']).toBe('10')
    expect(headers['X-RateLimit-Remaining']).toBe('9')
    expect(headers['X-RateLimit-Reset']).toBeDefined()
  })

  it('should reset counter after window expires', async () => {
    const mockContext: any = {
      req: {
        header: () => '127.0.0.1',
      },
      get: () => null,
      header: jest.fn(),
      json: jest.fn(),
      res: { status: 200 },
    }

    const mockNext = jest.fn(async () => {})

    const middleware = rateLimit({
      windowMs: 100, // Very short window for testing
      maxRequests: 2,
    })

    // Use up the limit
    await middleware(mockContext, mockNext as any)
    await middleware(mockContext, mockNext as any)

    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, 150))

    // Should work again
    await middleware(mockContext, mockNext as any)

    expect(mockNext).toHaveBeenCalledTimes(3)
  })

  it('should use custom key generator', async () => {
    const mockContext: any = {
      req: {
        header: () => '127.0.0.1',
      },
      get: () => ({ id: 'user123' }),
      header: jest.fn(),
      json: jest.fn(),
      res: { status: 200 },
    }

    const mockNext = jest.fn(async () => {})
    const customKeyFn = jest.fn((c: any) => `custom:${c.get('user').id}`)

    const middleware = rateLimit({
      windowMs: 60000,
      maxRequests: 5,
      keyGenerator: customKeyFn as any,
    })

    await middleware(mockContext, mockNext as any)

    expect(customKeyFn).toHaveBeenCalled()
  })
})
