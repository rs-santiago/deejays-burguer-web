import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  requireRole(event, ['ADMIN', 'SUPER_ADMIN'])

  const brandId = getRouterParam(event, 'id')
  const query = getQuery(event)
  const { start, end, search, type } = query

  if (!brandId) {
    throw createError({ statusCode: 400, statusMessage: 'ID da unidade não fornecido.' })
  }

  try {
    const whereClause: any = { brandId: brandId }

    if (type === 'ACTIVE') {
      whereClause.status = { in: ['PENDING', 'PREPARING', 'DISPATCHED'] }
    } else if (type === 'HISTORY') {
      whereClause.status = { in: ['DELIVERED', 'CANCELLED'] }
    }

    if (start && end) {
      whereClause.createdAt = {
        gte: new Date(start as string),
        lte: new Date(end as string),
      }
    }

    if (search) {
      const searchNumber = parseInt(search as string)
      if (!isNaN(searchNumber)) {
        whereClause.displayId = searchNumber
      }
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      select: {
        id: true,
        displayId: true,
        customerName: true,
        customerPhone: true,
        total: true,
        status: true,
        items: true, 
        createdAt: true,
        is_printed: true,
        deliveryMethod: true,
        paymentMethod: true,
        address: true,
        brand: {
          select: { name: true, logoUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    return orders.map((order) => {
      const itemsArray = Array.isArray(order.items) 
        ? order.items 
        : (typeof order.items === 'string' ? JSON.parse(order.items) : [])

      return {
        id: order.id,
        displayId: order.displayId.toString().padStart(5, '0'),
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        is_printed: order.is_printed,
        total: Number(order.total),
        status: order.status,
        createdAt: order.createdAt,
        itemsCount: itemsArray.length,
        items: itemsArray,
        mesa: order.deliveryMethod === 'MESA' && order.address ? order.address.replace('Mesa ', '') : null,
        brandName: order.brand?.name || 'Minha Loja',
        brandLogoUrl: order.brand?.logoUrl || null,
      }
    })

  } catch (error: any) {
    console.error('Erro ao buscar pedidos no Nuxt:', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro interno ao carregar a lista de pedidos.' })
  }
})