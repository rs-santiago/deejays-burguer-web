// server/api/admin/brands/[id]/categories.post.ts
export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['ADMIN', 'SUPER_ADMIN'])
  const brandId = getRouterParam(event, 'id')
  const { name } = await readBody(event)

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

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      brandId
    }
  })

  return category
})