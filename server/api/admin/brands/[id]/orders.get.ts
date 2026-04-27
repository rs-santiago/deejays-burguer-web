import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  requireRole(event, ['ADMIN', 'SUPER_ADMIN'])
  // 1. Extrai o ID da marca dos parâmetros da URL
  const brandId = getRouterParam(event, 'id')

  if (!brandId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID da unidade não fornecido.',
    })
  }

  try {
    // 2. Busca os pedidos no banco
    // Filtramos pela marca e ordenamos pelos mais recentes (createdAt desc)
    const orders = await prisma.order.findMany({
      where: {
        brandId: brandId,
      },
      select: {
        id: true,
        displayId: true,
        customerName: true,
        total: true,
        status: true,
        items: true, // O campo Json com o snapshot do carrinho
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 3. Formata os dados para o Frontend (Mobile)
    // Precisamos garantir que o itemsCount seja calculado corretamente a partir do Json
    return orders.map((order) => {
      // Fazemos o parse seguro do Json caso ele venha como string ou objeto
      const itemsArray = Array.isArray(order.items) 
        ? order.items 
        : (typeof order.items === 'string' ? JSON.parse(order.items) : [])

      return {
        id: order.id,
        displayId: order.displayId.toString().padStart(5, '0'), // Formata como #0001, #0002...
        customerName: order.customerName,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        itemsCount: itemsArray.length, // Quantidade de itens únicos no carrinho
      }
    })

  } catch (error: any) {
    console.error('Erro ao buscar pedidos no Nuxt:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno ao carregar a lista de pedidos.',
      data: error.message
    })
  }
})