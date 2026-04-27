import { PrismaClient } from '@prisma/client'
import { sendPushNotification } from '~/server/utils/pushNotifications'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { brandId, customerName, customerPhone, items, total } = body

  try {
    // 1. Upsert do Cliente (Identifica ou cria pelo telefone)
    const customer = await prisma.customer.upsert({
      where: { phone: customerPhone },
      update: { name: customerName }, // Atualiza o nome caso ele tenha mudado
      create: {
        phone: customerPhone,
        name: customerName
      },
    })

    // 2. Cria o Pedido vinculado à Marca e ao Cliente
    const order = await prisma.order.create({
      data: {
        total: Number(total),
        items: items, // O carrinho (JSON)
        brandId: brandId,
        customerPhone: customer.phone,
      },
    })

    const adminUser = await prisma.user.findFirst({
      where: { brands: { some: { brandId: brandId } } }
    });

    if (adminUser?.pushToken) {
      await sendPushNotification(
        adminUser.pushToken,
        '🍕 Novo Pedido!',
        `O pedido #${order.displayId} acaba de chegar.`,
        { orderId: order.id }
      );
    }

    return { success: true, orderId: order.id }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao processar pedido no banco.',
    })
  }
})