import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['ADMIN', 'SUPER_ADMIN'])
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const category = await prisma.category.findUnique({ where: { id } })

  if (!category) {
    throw createError({ statusCode: 404, message: 'Categoria não encontrada.' })
  }

  // Proteção de acesso
  if (user.role === 'ADMIN' && !user.brandIds.includes(category.brandId)) {
    throw createError({ statusCode: 403, message: 'Acesso negado.' })
  }

  // Se o nome mudar, atualizamos o slug também
  let slug = category.slug
  if (body.name && body.name !== category.name) {
    slug = body.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
  }

  return await prisma.category.update({
    where: { id },
    data: {
      name: body.name ?? category.name,
      slug,
      icon: body.icon !== undefined ? body.icon : category.icon,
      isActive: body.isActive !== undefined ? body.isActive : category.isActive,
      isHighlight: body.isHighlight !== undefined ? body.isHighlight : category.isHighlight,
      sortOrder: body.sortOrder !== undefined ? body.sortOrder : category.sortOrder,
      activeTime: body.activeTime !== undefined ? body.activeTime : category.activeTime,
    }
  })
})