export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])
  const user = event.context.user 
  
  // 🐛 LOG DE DIAGNÓSTICO 1: Quem é o usuário?
  console.log('--- DEBUG DASHBOARD ---')
  console.log(`User ID: ${user.id} | Role no Contexto: ${user.role}`)

  let brandIds: string[] = []
  
  if (user.role === 'SUPER_ADMIN') {
    const allBrands = await prisma.brand.findMany({ select: { id: true } })
    brandIds = allBrands.map(b => b.id)
    
    // 🐛 LOG DE DIAGNÓSTICO 2A: Caiu no Super Admin?
    console.log(`⚠️ ATENÇÃO: Usuário reconhecido como SUPER_ADMIN. Carregando todas as ${brandIds.length} marcas.`)
  } else {
    const userBrands = await prisma.userBrandAccess.findMany({
      where: { userId: user.id },
      select: { brandId: true }
    })
    brandIds = userBrands.map(b => b.brandId)
    
    // 🐛 LOG DE DIAGNÓSTICO 2B: Caiu no Admin comum?
    console.log(`✅ Usuário ADMIN. Marcas liberadas na tabela de acesso:`, brandIds)
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