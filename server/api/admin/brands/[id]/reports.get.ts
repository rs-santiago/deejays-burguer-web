import { prisma } from '~/server/utils/prisma'
import { startOfDay, endOfDay, subDays, differenceInMinutes } from 'date-fns'

export default defineEventHandler(async (event) => {
  const brandId = getRouterParam(event, 'id')
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)

  const [orders30Days, totalCustomers] = await Promise.all([
    prisma.order.findMany({
      where: { brandId, createdAt: { gte: thirtyDaysAgo }, status: 'DELIVERED' },
      select: { total: true, createdAt: true, updatedAt: true, customerPhone: true }
    }),
    prisma.customer.count() // Total de clientes na base
  ])

  // 1. Cálculo de Eficiência (Tempo Médio de Cozinha)
  const deliveryTimes = orders30Days.map(o => differenceInMinutes(new Date(o.updatedAt), new Date(o.createdAt)))
  const avgPrepTime = deliveryTimes.length > 0 
    ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length 
    : 0

  // 2. Fidelização (Clientes Recorrentes nos últimos 30 dias)
  const customerOrders: Record<string, number> = {}
  orders30Days.forEach(o => {
    customerOrders[o.customerPhone] = (customerOrders[o.customerPhone] || 0) + 1
  })
  const recurringCustomers = Object.values(customerOrders).filter(count => count > 1).length

  return {
    efficiency: {
      avgPrepTime: Math.round(avgPrepTime),
      status: avgPrepTime < 20 ? 'EXCELENTE' : avgPrepTime < 35 ? 'NORMAL' : 'LENTO'
    },
    loyalty: {
      recurringCount: recurringCustomers,
      newCount: Object.keys(customerOrders).length - recurringCustomers,
      rate: orders30Days.length > 0 ? (recurringCustomers / Object.keys(customerOrders).length) * 100 : 0
    }
  }
})