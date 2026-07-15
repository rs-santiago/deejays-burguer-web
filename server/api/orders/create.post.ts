// server/api/orders/create.post.ts
import { PrismaClient } from '@prisma/client'
import { geocodeAddress } from '~/server/utils/geocode'

const prisma = new PrismaClient()

/**
 * Função para calcular a distância entre duas coordenadas (Fórmula de Haversine)
 * @returns Distância em quilômetros (km)
 */
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Raio da Terra em km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distância em km
  return distance
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { brandId, customerAddress, items, ...customerData } = body

  if (!brandId || !customerAddress || !items || items.length === 0) {
    throw createError({ statusCode: 400, message: 'Dados do pedido incompletos.' })
  }

  // 1. Buscar dados da loja, incluindo o raio de entrega e coordenadas
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { deliveryRadius: true, latitude: true, longitude: true }
  })

  if (!brand || !brand.latitude || !brand.longitude || !brand.deliveryRadius) {
    throw createError({ statusCode: 404, message: 'Loja não encontrada ou não configurada para delivery.' })
  }

  // 2. Converter endereço do cliente em coordenadas
  const customerCoords = await geocodeAddress(customerAddress)

  if (!customerCoords) {
    throw createError({ statusCode: 400, message: 'Não foi possível localizar o endereço de entrega. Verifique se está correto.' })
  }

  // 3. Calcular a distância
  const distance = getDistance(
    brand.latitude,
    brand.longitude,
    customerCoords.lat,
    customerCoords.lng
  )

  // 4. Validar se o cliente está dentro do raio de entrega
  if (distance > brand.deliveryRadius) {
    throw createError({
      statusCode: 403, // Forbidden
      message: `Desculpe, este estabelecimento entrega apenas em um raio de ${brand.deliveryRadius} km. Você está a aproximadamente ${distance.toFixed(1)} km.`
    })
  }

  // 5. Se a distância for OK, prossiga com a criação do pedido
  // ...aqui você colocaria sua lógica para salvar o pedido no banco de dados...
  // const newOrder = await prisma.order.create({ data: { ... } })

  // Retorno de sucesso (simulado)
  return { success: true, message: 'Pedido criado com sucesso!', distance: `${distance.toFixed(1)} km` }
})