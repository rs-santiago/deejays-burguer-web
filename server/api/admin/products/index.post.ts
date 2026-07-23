// server/api/admin/products/index.post.ts
export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['ADMIN', 'SUPER_ADMIN'])
  const body = await readBody(event)

  const { name, description, price, categoryId, brandId, image, sortOrder } = body

  let finalBrandId: string | undefined

  if (user.role === 'SUPER_ADMIN') {
    finalBrandId = brandId
  } else {
    const allowedBrandIds: string[] = user.brandIds || []
    if (brandId && allowedBrandIds.includes(brandId)) {
      finalBrandId = brandId
    } else {
      finalBrandId = allowedBrandIds[0]
    }
  }

  if (!finalBrandId) {
    throw createError({ 
      statusCode: 400, 
      message: 'Brand ID é obrigatório ou você não tem permissão para esta marca.' 
    })
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      image: image || "",
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0, // <-- AQUI
      isAvailable: true,
      categoryId,
      brandId: finalBrandId
    }
  })

  return product
})