// server/api/admin/products/[id].patch.ts
export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['ADMIN', 'SUPER_ADMIN'])
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  // 1. Busca o produto para verificar a propriedade
  const product = await prisma.product.findUnique({
    where: { id }
  })

  if (!product) {
    throw createError({ statusCode: 404, message: 'Produto não encontrado.' })
  }

  // 2. Trava de segurança: ADMIN só edita o que é dele
  if (user.role === 'ADMIN' && product.brandId !== user.brandId) {
    throw createError({ statusCode: 403, message: 'Você não tem permissão para editar este produto.' })
  }

  // 3. Update
  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      ...body,
      // Garante que o preço seja número se ele vier no body
      price: body.price ? parseFloat(body.price) : undefined 
    }
  })

  return updatedProduct
})