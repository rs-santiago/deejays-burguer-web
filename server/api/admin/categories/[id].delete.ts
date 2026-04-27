import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['ADMIN', 'SUPER_ADMIN'])
  const id = getRouterParam(event, 'id')

  const category = await prisma.category.findUnique({ where: { id } })

  if (!category) {
    throw createError({ statusCode: 404, message: 'Categoria não encontrada.' })
  }

  // Verifica se o ADMIN é dono da marca da categoria
  if (user.role === 'ADMIN' && !user.brandIds.includes(category.brandId)) {
    throw createError({ statusCode: 403, message: 'Acesso negado.' })
  }

  // 1. Verificar se existem produtos vinculados
  const productsCount = await prisma.product.count({
    where: { categoryId: id }
  })

  if (productsCount > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Não é possível excluir. Esta categoria possui ${productsCount} produtos vinculados, apague todos e depois exclua a categoria.`
    })
  }
  
  await prisma.category.delete({ where: { id } })

  return { message: 'Categoria removida com sucesso.' }
})