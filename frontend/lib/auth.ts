import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Call Better Auth backend for authentication
          if (!process.env.NEXT_PUBLIC_API_URL) {
            throw new Error('NEXT_PUBLIC_API_URL is not configured');
          }
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-in/email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            credentials: "include",
          })

          if (!res.ok) {
            return null
          }

          const data = await res.json()

          if (data.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              emailVerified: data.user.emailVerified,
            }
          }

          return null
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.emailVerified = user.emailVerified
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.emailVerified = token.emailVerified as Date | null
      }
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
