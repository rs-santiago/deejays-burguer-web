import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const { phone } = getQuery(event)

  if (!phone) return []

  return await prisma.order.findMany({
    where: { 
      customerPhone: String(phone) 
    },
    include: {
      brand: {
        select: {
          name: true,
          surname: true,
          logoUrl: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
})