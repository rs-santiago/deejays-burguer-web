// server/api/admin/products/index.post.ts
export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['ADMIN', 'SUPER_ADMIN'])
  const body = await readBody(event)

  const { name, description, price, categoryId, brandId, image } = body

  // Segurança: Se não for SUPER_ADMIN, ele só pode criar produtos para a própria marca
  const finalBrandId = user.role === 'SUPER_ADMIN' ? brandId : user.brandId

  if (!finalBrandId) {
    throw createError({ statusCode: 400, message: 'Brand ID é obrigatório.' })
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      image,
      isAvailable: true,
      categoryId,
      brandId: finalBrandId
    }
  })

  return product
})