import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { config } from 'dotenv'

// Load environment variables
config()

// Validate required environment variable
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create PostgreSQL connection pool
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

// Create Prisma Client with PostgreSQL adapter
export const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})
