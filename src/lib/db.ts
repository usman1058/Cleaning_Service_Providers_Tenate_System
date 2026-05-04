import { PrismaClient } from '@prisma/client'

export const db = new PrismaClient({
  log: ['query'],
})

if (process.env.NODE_ENV !== 'production') {
  (globalThis as any).prisma = db
}