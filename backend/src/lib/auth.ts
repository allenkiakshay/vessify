import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './db.js'
import { sendVerificationEmail } from './email.js'

// Validate required environment variables
if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET environment variable is required')
}
if (!process.env.BASE_URL) {
  throw new Error('BASE_URL environment variable is required')
}
if (!process.env.FRONTEND_URL) {
  throw new Error('FRONTEND_URL environment variable is required')
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      // TODO: Implement password reset email
      console.log('Password reset URL:', url)
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      // Send frontend URL instead of backend URL
      await sendVerificationEmail(user.email, token, process.env.FRONTEND_URL!)
    },
    sendOnSignUp: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    process.env.FRONTEND_URL,
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (session will be updated if it's older than this)
  },
})

export type Session = typeof auth.$Infer.Session
