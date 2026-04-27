import { prisma } from '~/server/utils/prisma'
import { startOfDay, endOfDay, subDays, differenceInMinutes } from 'date-fns'

export default defineEventHandler(async (event) => {
  const brandId = getRouterParam(event, 'id')
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)

  if (!brandId) {
    throw createError({ statusCode: 400, message: 'ID da unidade é obrigatório.' })
  }

  try {
    const [ordersToday, totalStats, orders30Days] = await Promise.all([
      // 1. DADOS DE HOJE
      prisma.order.findMany({
        where: { 
          brandId, 
          createdAt: { gte: startOfDay(now), lte: endOfDay(now) } 
        },
        select: { total: true, status: true }
      }),

      // 2. ACUMULADO GERAL (Apenas entregues)
      prisma.order.aggregate({
        where: { brandId, status: 'DELIVERED' },
        _sum: { total: true },
        _count: { id: true }
      }),

      // 3. DADOS DOS ÚLTIMOS 30 DIAS (Para BI: Ranking, Eficiência e Fidelidade)
      prisma.order.findMany({
        where: { 
          brandId, 
          createdAt: { gte: thirtyDaysAgo },
          status: 'DELIVERED' 
        },
        select: { 
          total: true, 
          createdAt: true, 
          updatedAt: true, 
          customerPhone: true,
          items: true 
        }
      })
    ])

    // --- PROCESSAMENTO: HOJE ---
    const revenueToday = ordersToday
      .filter(o => o.status !== 'CANCELLED')
      .reduce((acc, curr) => acc + curr.total, 0)
    
    const cancelledToday = ordersToday.filter(o => o.status === 'CANCELLED').length

    // --- PROCESSAMENTO: RANKING (TOP 5) ---
    const productCount: Record<string, number> = {}
    orders30Days.forEach(order => {
      const items = Array.isArray(order.items) ? order.items : []
      items.forEach((item: any) => {
        const name = item.name || 'Produto Indefinido'
        productCount[name] = (productCount[name] || 0) + (item.quantity || 1)
      })
    })

    const topProducts = Object.entries(productCount)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)

    // --- PROCESSAMENTO: EFICIÊNCIA (COZINHA) ---
    const deliveryTimes = orders30Days.map(o => 
      differenceInMinutes(new Date(o.updatedAt), new Date(o.createdAt))
    )
    const avgPrepTime = deliveryTimes.length > 0 
      ? Math.round(deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length)
      : 0

    // --- PROCESSAMENTO: FIDELIDADE (RETENÇÃO) ---
    const customerOrders: Record<string, number> = {}
    orders30Days.forEach(o => {
      customerOrders[o.customerPhone] = (customerOrders[o.customerPhone] || 0) + 1
    })

    const totalUniqueCustomers = Object.keys(customerOrders).length
    const recurringCount = Object.values(customerOrders).filter(count => count > 1).length
    const newCount = totalUniqueCustomers - recurringCount
    const loyaltyRate = totalUniqueCustomers > 0 ? (recurringCount / totalUniqueCustomers) * 100 : 0

    // --- RETORNO FINAL (Exatamente o que seu App pede) ---
    return {
      today: {
        revenue: revenueToday,
        count: ordersToday.length,
        cancelled: cancelledToday,
        averageTicket: ordersToday.length > cancelledToday ? revenueToday / (ordersToday.length - cancelledToday) : 0
      },
      total: {
        revenue: totalStats._sum.total || 0,
        count: totalStats._count.id || 0
      },
      topProducts,
      efficiency: {
        avgPrepTime
      },
      loyalty: {
        rate: loyaltyRate,
        recurringCount,
        newCount
      }
    }

  } catch (error: any) {
    console.error(error)
    throw createError({ statusCode: 500, message: 'Erro ao gerar relatório.' })
  }
})