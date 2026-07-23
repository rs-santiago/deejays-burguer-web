// server/api/admin/products/[id].patch.ts
export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['ADMIN', 'SUPER_ADMIN'])
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const product = await prisma.product.findUnique({
    where: { id }
  })

  if (!product) {
    throw createError({ statusCode: 404, message: 'Produto não encontrado.' })
  }

  if (user.role === 'ADMIN' && !user.brandIds.includes(product.brandId)) {
    throw createError({ statusCode: 403, message: 'Você não tem permissão para editar este produto.' })
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      ...body,
      price: body.price !== undefined ? parseFloat(body.price) : undefined,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined // <-- AQUI
    }
  })

  return updatedProduct
})