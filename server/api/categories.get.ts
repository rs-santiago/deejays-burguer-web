import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const brandId = query.brandId as string
  if (!brandId) {
    throw createError({ statusCode: 400, message: 'Brand ID is required' })
  }
  return await prisma.category.findMany({
    where: { isAvailable: true, brandId },
    orderBy: { sortOrder: 'asc' }
  })
})