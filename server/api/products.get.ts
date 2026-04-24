export default defineEventHandler(async (event) => {
    try {
    const products = await prisma.product.findMany({
      where: { isAvailable: true },
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