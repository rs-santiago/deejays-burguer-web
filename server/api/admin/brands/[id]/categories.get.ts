// server/api/admin/brands/[id]/categories.get.ts
export default defineEventHandler(async (event) => {
  requireRole(event, ['ADMIN', 'SUPER_ADMIN'])
  const brandId = getRouterParam(event, 'id')

  const categories = await prisma.category.findMany({
    where: { brandId },
    orderBy: { name: 'asc' }
  })

  return categories
})