// server/api/admin/categories/index.post.ts
export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['ADMIN', 'SUPER_ADMIN'])
  const { name, slug, brandId } = await readBody(event)

  const finalBrandId = user.role === 'SUPER_ADMIN' ? brandId : user.brandId

  if (!finalBrandId) {
    throw createError({ statusCode: 400, message: 'Brand ID necessário.' })
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug, // Ex: "hamburgueres-artesanais"
      brandId: finalBrandId
    }
  })

  return category
})