import { PrismaClient } from '@prisma/client'
import { sendPushNotification } from '~/server/utils/pushNotifications'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const { 
    brandId, 
    customerName, 
    customerPhone, // Vem formatado: (21) 96622-1271
    items, 
    total, 
    address, 
    deliveryMethod, 
    paymentMethod 
  } = body

  // 1. LIMPEZA DO TELEFONE: Remove tudo que não for dígito e mantém como String
  const cleanPhone = customerPhone.replace(/\D/g, ''); 

  try {
    // 2. Upsert do Cliente usando o telefone limpo
    const customer = await prisma.customer.upsert({
      where: { phone: cleanPhone }, // Agora busca/salva apenas números
      update: { name: customerName },
      create: {
        phone: cleanPhone,
        name: customerName
      },
    })

    // 3. Cria o Pedido vinculado ao telefone limpo
    const order = await prisma.order.create({
      data: {
        total: Number(total),
        items: items, 
        brandId: brandId,
        customerPhone: customer.phone, // "21966221271"
        customerName: customer.name,
        address: address,
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
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao processar pedido no banco.',
    })
  }
})