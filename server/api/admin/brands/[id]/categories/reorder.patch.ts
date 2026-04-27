import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['ADMIN', 'SUPER_ADMIN'])
  const brandId = getRouterParam(event, 'id')
  const { ids } = await readBody(event)

  if (!brandId) {
    throw createError({ statusCode: 400, message: 'ID da marca é necessário.' })
  }

  // Proteção de acesso à marca
  if (user.role === 'ADMIN' && !user.brandIds.includes(brandId)) {
    throw createError({ statusCode: 403, message: 'Acesso negado.' })
  }

  if (!ids || !Array.isArray(ids)) {
    throw createError({ statusCode: 400, message: 'Array de IDs inválido.' })
  }

  // Atualiza todos os IDs recebidos em lote na nova ordem
  const updates = ids.map((id: string, index: number) => {
    return prisma.category.update({
      where: { id },
      data: { sortOrder: index }
    })
  })

  await prisma.$transaction(updates)

  return { success: true }
})