import { prisma } from '~/server/utils/prisma'
import { startOfDay, endOfDay } from 'date-fns'

export default defineEventHandler(async (event) => {
  const brandId = getRouterParam(event, 'id')
  const now = new Date()

  const [ordersToday, totalSales, topProducts] = await Promise.all([
    // Hoje
    prisma.order.findMany({
      where: { brandId, createdAt: { gte: startOfDay(now), lte: endOfDay(now) } },
      select: { total: true, status: true, items: true }
    }),
    // Geral
    prisma.order.aggregate({
      where: { brandId, status: 'DELIVERED' },
      _sum: { total: true },
      _count: { id: true }
    }),
    // TOP Produtos (Baseado nos últimos 30 dias para ter volume)
    prisma.order.findMany({
      where: { brandId, status: 'DELIVERED' },
      take: 50, // Pega os últimos 50 pedidos para análise
      select: { items: true }
    })
  ])

  // Lógica para Rankear Produtos (Processando o JSON de itens)
  const productCount: Record<string, number> = {}
  topProducts.forEach(order => {
    const items = Array.isArray(order.items) ? order.items : []
    items.forEach((item: any) => {
      productCount[item.name] = (productCount[item.name] || 0) + (item.quantity || 1)
    })
  })

  const rankedProducts = Object.entries(productCount)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)

  const revenueToday = ordersToday
    .filter(o => o.status !== 'CANCELLED')
    .reduce((acc, curr) => acc + curr.total, 0)

  return {
    today: {
      revenue: revenueToday,
      count: ordersToday.length,
      cancelled: ordersToday.filter(o => o.status === 'CANCELLED').length,
      averageTicket: ordersToday.length > 0 ? revenueToday / ordersToday.length : 0
    },
    total: {
      revenue: totalSales._sum.total || 0,
      count: totalSales._count.id || 0
    },
    topProducts: rankedProducts
  }
})