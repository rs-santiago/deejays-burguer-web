import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        brand: {
          select: { name: true, logoUrl: true }
        }
      }
    })

    if (!order) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Pedido não encontrado.',
      })
    }

    // Como o campo items é Json, garantimos que ele seja enviado como um Array
    const items = Array.isArray(order.items) 
      ? order.items 
      : (typeof order.items === 'string' ? JSON.parse(order.items) : [])

    return {
      ...order,
      displayId: String(order.displayId).padStart(4, '0'),
      items // Retorna os itens já tratados
    }

  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao carregar detalhes do pedido.',
      data: error.message
    })
  }
})