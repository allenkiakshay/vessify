import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    emailVerified: Date | null
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      emailVerified: Date | null
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name: string
    emailVerified: Date | null
  }
}
