import { prisma } from '~/server/utils/prisma'
import { startOfDay, endOfDay } from 'date-fns' // recomendo instalar date-fns

export default defineEventHandler(async (event) => {
  const brandId = getRouterParam(event, 'id')
  const now = new Date()

  const [ordersToday, totalSales] = await Promise.all([
    // Vendas de Hoje
    prisma.order.findMany({
      where: {
        brandId,
        createdAt: { gte: startOfDay(now), lte: endOfDay(now) },
        status: { not: 'CANCELLED' }
      },
      select: { total: true }
    }),
    // Faturamento Total (Histórico)
    prisma.order.aggregate({
      where: { brandId, status: 'DELIVERED' },
      _sum: { total: true },
      _count: { id: true }
    })
  ])

  const revenueToday = ordersToday.reduce((acc, curr) => acc + curr.total, 0)
  
  return {
    today: {
      revenue: revenueToday,
      count: ordersToday.length,
      averageTicket: ordersToday.length > 0 ? revenueToday / ordersToday.length : 0
    },
    total: {
      revenue: totalSales._sum.total || 0,
      count: totalSales._count.id || 0
    }
  }
})