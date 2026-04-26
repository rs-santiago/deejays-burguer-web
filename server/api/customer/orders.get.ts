import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const phone = query.phone as string

  if (!phone) {
    throw createError({ statusCode: 400, statusMessage: 'Telefone é obrigatório' })
  }

  const orders = await prisma.order.findMany({
    where: { customerPhone: phone },
    include: { brand: true }, // Para saber de qual loja foi o pedido
    orderBy: { createdAt: 'desc' }
  })

  return orders
})