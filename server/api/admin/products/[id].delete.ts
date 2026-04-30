// server/api/admin/products/[id].delete.ts
export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['ADMIN', 'SUPER_ADMIN'])
  const id = getRouterParam(event, 'id')

  const product = await prisma.product.findUnique({
    where: { id }
  })

  if (!product) {
    throw createError({ statusCode: 404, message: 'Produto não encontrado.' })
  }

  // Mesma trava de segurança do Patch
  if (user.role === 'ADMIN' && !user.brandIds.includes(product.brandId)) {
    throw createError({ statusCode: 403, message: 'Ação não permitida.' })
  }

  await prisma.product.delete({
    where: { id }
  })

  return { message: 'Produto removido com sucesso.' }
})