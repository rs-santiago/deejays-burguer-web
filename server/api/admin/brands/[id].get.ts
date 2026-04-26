// server/api/admin/brands/[id].get.ts
export default defineEventHandler(async (event) => {
  // Garante que só ADMIN ou SUPER_ADMIN acessem
  const user = requireRole(event, ['ADMIN', 'SUPER_ADMIN'])
  const id = getRouterParam(event, 'id')

  const brand = await prisma.brand.findUnique({
    where: { id },
    include: {
      schedules: true // Importante para trazer os horários já salvos
    }
  })

  if (!brand) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Marca não encontrada'
    })
  }

  // Se for ADMIN comum, verifica se ele tem acesso a essa marca específica
  if (user.role === 'ADMIN' && !user.brandIds.includes(id)) {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
  }

  return brand
})