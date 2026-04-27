import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['ADMIN', 'SUPER_ADMIN'])
  const brandId = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  // Extraímos os novos campos também
  const { name, icon, isActive, isHighlight, activeTime } = body

  if (!brandId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID da marca é necessário.'
    })
  }

  if (!name) {
    throw createError({ statusCode: 400, message: 'O nome da categoria é obrigatório.' })
  }

  // Slugify simples: "Pizzas Doces" -> "pizzas-doces"
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')

  // Descobrir a última posição para colocar a nova no fim da fila
  const lastCategory = await prisma.category.findFirst({
    where: { brandId },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true }
  })

  const nextOrder = (lastCategory?.sortOrder ?? -1) + 1

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      brandId,
      sortOrder: nextOrder,
      icon: icon || null,
      isActive: isActive ?? true, // Se não for enviado, padrão é ativo
      isHighlight: isHighlight ?? false,
      activeTime: activeTime || null
    }
  })

  return category
})