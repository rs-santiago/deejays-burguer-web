export default defineEventHandler(async (event) => {
  // 1. Validamos se quem chama é SUPER_ADMIN
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])
  const user = event.context.user // Usuário vindo do middleware de Auth
  let brandIds: string[] = []
  
  // 1. A Mágica do Super Admin
  if (user.role === 'SUPER_ADMIN') {
    // Super Admin ignora a tabela de acessos e pega todas as lojas do banco
    const allBrands = await prisma.brand.findMany({ select: { id: true } })
    brandIds = allBrands.map(b => b.id)
  } else {
    // Clientes (ADMIN) só veem o que está na tabela UserBrandAccess
    const userBrands = await prisma.userBrandAccess.findMany({
      where: { userId: user.id },
      select: { brandId: true }
    })
    brandIds = userBrands.map(b => b.brandId)
  }

  // 2. Buscar métricas filtrando por esse array de IDs
  const [totalProducts, brands] = await Promise.all([
    prisma.product.count({
      where: { brandId: { in: brandIds } }
    }),
    prisma.brand.findMany({
      where: { id: { in: brandIds } },
      include: { _count: { select: { products: true } } }
    })
  ])

  return {
    metrics: {
      totalBrands: brandIds.length,
      totalProducts
    },
    brands
  }
})