// server/api/admin/products/index.post.ts
export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['ADMIN', 'SUPER_ADMIN'])
  const body = await readBody(event)

  const { name, description, price, categoryId, brandId, image } = body

  let finalBrandId: string | undefined

  if (user.role === 'SUPER_ADMIN') {
    // SUPER_ADMIN pode usar qualquer brandId enviado no body
    finalBrandId = brandId
  } else {
    // ADMIN comum: verifica se o brandId enviado no body está entre os brandIds do token dele,
    // ou usa o primeiro da lista caso não venha no body
    const allowedBrandIds: string[] = user.brandIds || []

    if (brandId && allowedBrandIds.includes(brandId)) {
      finalBrandId = brandId
    } else {
      finalBrandId = allowedBrandIds[0] // Pega a primeira marca vinculada
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
      isAvailable: true,
      categoryId,
      brandId: finalBrandId
    }
  })

  return product
})