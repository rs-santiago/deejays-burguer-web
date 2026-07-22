// server/api/orders/create.post.ts
import { PrismaClient } from '@prisma/client'
import { geocodeAddress } from '~/server/utils/geocode'

const prisma = new PrismaClient()

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { brandId, customerAddress, items, deliveryMethod, customerName, customerPhone, paymentMethod, total } = body

  if (!brandId || !items || items.length === 0) {
    throw createError({ statusCode: 400, message: 'Dados do pedido incompletos.' })
  }

  // 1. Buscar dados da loja
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { deliveryRadius: true, latitude: true, longitude: true }
  })

  if (!brand) {
    throw createError({ statusCode: 404, message: 'Loja não encontrada.' })
  }

  // 2. Validação de Raio de Entrega APENAS se for entrega
  const isDelivery = deliveryMethod === 'delivery';

  if (isDelivery) {
    if (!customerAddress) {
      throw createError({ statusCode: 400, message: 'Endereço de entrega é obrigatório.' })
    }

    // Se a loja tiver coordenadas e raio cadastrado, faz a validação
    if (brand.latitude && brand.longitude && brand.deliveryRadius) {
      const customerCoords = await geocodeAddress(customerAddress)

      if (!customerCoords) {
        throw createError({ statusCode: 400, message: 'Não foi possível localizar o endereço de entrega. Verifique se está correto.' })
      }

      const distance = getDistance(
        brand.latitude,
        brand.longitude,
        customerCoords.lat,
        customerCoords.lng
      )

      if (distance > brand.deliveryRadius) {
        throw createError({
          statusCode: 403,
          message: `Desculpe, este estabelecimento entrega apenas em um raio de ${brand.deliveryRadius} km. Você está a aproximadamente ${distance.toFixed(1)} km.`
        })
      }
    }
  }

  // 3. Salvar no Banco de Dados via Prisma (com upsert do cliente)
  const cleanPhone = customerPhone ? customerPhone.replace(/\D/g, '') : '';

  try {
    const customer = await prisma.customer.upsert({
      where: { phone: cleanPhone },
      update: { name: customerName },
      create: {
        phone: cleanPhone,
        name: customerName || 'Cliente'
      },
    })

    const newOrder = await prisma.order.create({
      data: {
        total: Number(total),
        items: items,
        brandId: brandId,
        customerPhone: customer.phone,
        customerName: customer.name,
        address: customerAddress || null,
        deliveryMethod: deliveryMethod,
        paymentMethod: paymentMethod,
      }
    })

    return { success: true, orderId: newOrder.id }
  } catch (error) {
    console.error("Erro ao salvar pedido:", error)
    throw createError({
      statusCode: 500,
      message: 'Erro interno ao processar o pedido no banco.'
    })
  }
})