// server/api/admin/orders/[id]/status.patch.ts
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  // Validamos se o status enviado é um dos permitidos
  const allowedStatus = ['PENDING', 'PREPARING', 'DISPATCHED', 'DELIVERED', 'CANCELLED']
  
  if (!body.status || !allowedStatus.includes(body.status)) {
    throw createError({ statusCode: 400, message: 'Status inválido.' })
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: body.status }
    })

    return updatedOrder
  } catch (error) {
    throw createError({ statusCode: 500, message: 'Erro ao atualizar pedido.' })
  }
})