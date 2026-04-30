// server/api/admin/orders/[id]/printed.patch.ts
import { PrismaClient } from '@prisma/client' // Assumindo que você usa Prisma no seu SaaS

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  try {
    const order = await prisma.order.update({
      where: { id: id },
      data: { is_printed: true },
    })

    return { success: true, order }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao atualizar status de impressão',
    })
  }
})