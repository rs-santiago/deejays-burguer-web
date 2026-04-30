import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  // Garante que apenas usuários autenticados acessem
  requireRole(event, ['ADMIN', 'SUPER_ADMIN'])

  // 1. Extrai parâmetros da URL e da Query String
  const brandId = getRouterParam(event, 'id')
  const query = getQuery(event)

  const { start, end, search } = query

  if (!brandId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID da unidade não fornecido.',
    })
  }

  try {
    // 2. Monta o objeto de filtro dinamicamente
    const whereClause: any = {
      brandId: brandId,
    }

    // Filtro por Período de Data (Sincronizado com o App)
    if (start && end) {
      whereClause.createdAt = {
        gte: new Date(start as string),
        lte: new Date(end as string),
      }
    }

    // Filtro por Número do Pedido (Busca por displayId)
    if (search) {
      // Convertemos para número caso o lojista digite apenas os dígitos
      const searchNumber = parseInt(search as string)
      if (!isNaN(searchNumber)) {
        whereClause.displayId = searchNumber
      }
    }

    // 3. Busca os pedidos no banco
    const orders = await prisma.order.findMany({
      where: whereClause,
      select: {
        id: true,
        displayId: true,
        customerName: true,
        total: true,
        status: true,
        items: true, 
        createdAt: true,
        is_printed: true
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 4. Formata os dados para o Frontend (Mobile)
    return orders.map((order) => {
      // Parse seguro do JSON do carrinho
      const itemsArray = Array.isArray(order.items) 
        ? order.items 
        : (typeof order.items === 'string' ? JSON.parse(order.items) : [])

      return {
        id: order.id,
        displayId: order.displayId.toString().padStart(5, '0'),
        customerName: order.customerName,
        is_printed: order.is_printed,
        total: Number(order.total), // Garante que retorne como número
        status: order.status,
        createdAt: order.createdAt,
        itemsCount: itemsArray.length,
      }
    })

  } catch (error: any) {
    console.error('Erro ao buscar pedidos no Nuxt:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno ao carregar a lista de pedidos.',
    })
  }
})