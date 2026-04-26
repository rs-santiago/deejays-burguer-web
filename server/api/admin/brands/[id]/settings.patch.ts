// server/api/admin/brands/[id]/settings.patch.ts

export default defineEventHandler(async (event) => {
  // 1. Validação de Acesso
  const user = requireRole(event, ['ADMIN', 'SUPER_ADMIN'])
  const id = getRouterParam(event, 'id')
  
  // 2. Pegar os dados do corpo da requisição
  const { name, logoUrl, schedules } = await readBody(event)

  if (!id) {
    throw createError({ statusCode: 400, message: 'ID da marca é obrigatório.' })
  }

  try {
    // 3. Atualizar dados básicos da Brand
    await prisma.brand.update({
      where: { id },
      data: { 
        name, 
        logoUrl 
      }
    })

    // 4. Sincronizar Horários (Lógica: Apaga os antigos e cria os novos)
    if (schedules && Array.isArray(schedules)) {
      // Usamos uma transação para garantir que ou salva tudo ou nada
      await prisma.$transaction([
        prisma.openingHours.deleteMany({
          where: { brandId: id }
        }),
        prisma.openingHours.createMany({
          data: schedules.map((s: any) => ({
            dayOfWeek: s.dayOfWeek,
            openTime: s.openTime,
            closeTime: s.closeTime,
            closed: s.closed,
            brandId: id
          }))
        })
      ])
    }

    return { message: 'Configurações atualizadas com sucesso!' }

  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      message: 'Erro interno ao salvar configurações.'
    })
  }
})