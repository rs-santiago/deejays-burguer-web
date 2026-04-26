// server/api/admin/dashboard.get.ts
export default defineEventHandler(async (event) => {
  // 1. Validamos se quem chama é SUPER_ADMIN
  requireRole(event, ['SUPER_ADMIN'])

  // 2. Buscamos métricas gerais
  const [totalBrands, totalProducts] = await Promise.all([
    prisma.brand.count(),
    prisma.product.count()
  ])

  // 3. Buscamos a lista de marcas com um resumo
  const brands = await prisma.brand.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    }
  })

  return {
    metrics: {
      totalBrands,
      totalProducts
    },
    brands
  }
})