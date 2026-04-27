import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  requireRole(event, ['ADMIN', 'SUPER_ADMIN'])
  const brandId = getRouterParam(event, 'id')

  const categories = await prisma.category.findMany({
    where: { brandId },
    orderBy: { sortOrder: 'asc' } // <-- ORDENAÇÃO PELO NOVO CAMPO
  })

  return categories
})