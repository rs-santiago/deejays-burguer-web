// server/api/admin/products/reorder.patch.ts
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['ADMIN', 'SUPER_ADMIN'])
  const body = await readBody(event)

  const { ids } = body // Array de IDs na nova ordem: ['id1', 'id2', 'id3']

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw createError({ statusCode: 400, message: 'Array de IDs inválido.' })
  }

  // Se for ADMIN comum, podemos opcionalmente validar se o primeiro produto pertence à marca dele
  if (user.role === 'ADMIN') {
    const firstProduct = await prisma.product.findUnique({
      where: { id: ids[0] },
      select: { brandId: true }
    })

    if (!firstProduct || !user.brandIds?.includes(firstProduct.brandId)) {
      throw createError({ statusCode: 403, message: 'Ação não permitida.' })
    }
  }

  // Atualização em transação para garantir performance
  await prisma.$transaction(
    ids.map((id: string, index: number) =>
      prisma.product.update({
        where: { id },
        data: { sortOrder: index }
      })
    )
  )

  return { message: 'Ordem dos produtos atualizada com sucesso.' }
})