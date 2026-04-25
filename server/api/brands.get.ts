export default defineEventHandler(async (event) => {
  try {
    const brand = await prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        surname: true,
        slug: true,
        tagline: true,
        heroImage: true,
        colorPrimary: true
      }
    })
    return brand;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar produtos',
    })
  }
})