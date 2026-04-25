export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const brandId = query.brandId as string
    if (!brandId) {
      throw createError({ statusCode: 400, message: 'Brand ID is required' })
    }
    const products = await prisma.product.findMany({
      where: { isAvailable: true, brandId },
      include: { category: true },
    })
    return products
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar produtos',
    })
  }
})