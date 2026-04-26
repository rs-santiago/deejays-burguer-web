// server/api/admin/products/[id].get.ts
export default defineEventHandler(async (event) => {
  requireRole(event, ['ADMIN', 'SUPER_ADMIN'])
  const id = getRouterParam(event, 'id')

  const product = await prisma.product.findUnique({
    where: { id }
  })

  if (!product) {
    throw createError({ statusCode: 404, message: 'Produto não encontrado.' })
  }

  return product
})