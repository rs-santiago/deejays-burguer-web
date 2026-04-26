// server/api/admin/categories/[id].delete.ts
export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['ADMIN', 'SUPER_ADMIN'])
  const id = getRouterParam(event, 'id')

  const category = await prisma.category.findUnique({ where: { id } })

  if (!category) {
    throw createError({ statusCode: 404, message: 'Categoria não encontrada.' })
  }

  if (user.role === 'ADMIN' && category.brandId !== user.brandId) {
    throw createError({ statusCode: 403, message: 'Acesso negado.' })
  }

  await prisma.category.delete({ where: { id } })

  return { message: 'Categoria removida.' }
})  