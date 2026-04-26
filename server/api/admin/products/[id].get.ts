// server/api/admin/products/[id].get.ts
export default defineEventHandler(async (event) => {
  // 1. Guardamos o usuário retornado pela função para usá-lo na validação
  const user = requireRole(event, ['ADMIN', 'SUPER_ADMIN'])
  const id = getRouterParam(event, 'id')

  // 2. Busca o produto
  const product = await prisma.product.findUnique({
    where: { id }
  })

  // 3. Verifica se existe
  if (!product) {
    throw createError({ statusCode: 404, message: 'Produto não encontrado.' })
  }

  // 4. Nova Segurança Multi-Tenant (Proteção contra acesso indevido):
  // Verifica se o usuário tem permissão para ver os produtos DESTA marca específica
  if (user.role !== 'SUPER_ADMIN' && !user.brandIds?.includes(product.brandId)) {
    throw createError({ statusCode: 403, message: 'Você não tem permissão para visualizar produtos desta loja.' })
  }

  return product
})