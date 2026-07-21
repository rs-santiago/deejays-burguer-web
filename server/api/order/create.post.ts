import { PrismaClient } from '@prisma/client'
import { sendPushNotification } from '~/server/utils/pushNotifications'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const { 
    brandId, 
    customerName, 
    customerPhone, 
    items, 
    total, 
    customerAddress, // <-- MUDOU AQUI (de address para customerAddress)
    address,          // suporte caso venha com o nome antigo
    deliveryMethod, 
    paymentMethod 
  } = body

  // Garante que pega um ou o outro
  const finalAddress = customerAddress || address || null;

  // Validação básica do brandId
  if (!brandId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'O ID da marca (brandId) não foi fornecido.'
    })
  }

  const cleanPhone = customerPhone ? customerPhone.replace(/\D/g, '') : ''; 

  try {
    const customer = await prisma.customer.upsert({
      where: { phone: cleanPhone },
      update: { name: customerName },
      create: {
        phone: cleanPhone,
        name: customerName
      },
    })

    const order = await prisma.order.create({
      data: {
        total: Number(total),
        items: items, 
        brandId: brandId,
        customerPhone: customer.phone,
        customerName: customer.name,
        address: finalAddress, // <-- Usa o endereço mapeado
        deliveryMethod: deliveryMethod,
        paymentMethod: paymentMethod,
      },
    })

    const adminUser = await prisma.user.findFirst({
      where: { brands: { some: { brandId: brandId } } }
    });

    if (adminUser?.pushToken) {
      await sendPushNotification(
        adminUser.pushToken,
        '🍕 Novo Pedido!',
        `O pedido #${order.displayId} de ${customerName} acaba de chegar.`,
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