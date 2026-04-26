export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])
  const user = event.context.user 
  
  let brandIds: string[] = []
  
  if (user.role === 'SUPER_ADMIN') {
    const allBrands = await prisma.brand.findMany({ select: { id: true } })
    brandIds = allBrands.map(b => b.id)
    
  } else {
    const userBrands = await prisma.userBrandAccess.findMany({
      where: { userId: user.userId },
      select: { brandId: true }
    })
    brandIds = userBrands.map(b => b.brandId)
    
  }

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