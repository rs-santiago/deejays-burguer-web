// server/api/admin/brands/[id]/settings.patch.ts

// Certifique-se de importar o Prisma se não estiver global
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 1. Validação de Acesso
  const user = requireRole(event, ['ADMIN', 'SUPER_ADMIN'])
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID da marca é obrigatório.' })
  }

  // 2. Pegar os dados do corpo da requisição
  const body = await readBody(event)

  // Extraímos os campos que precisam de lógica separada ou que NÃO devem ser alterados
  // O "...updateData" vai agrupar todo o resto (tagline, heroTitle, whatsapp, cores, etc.)
  const { 
    name, 
    logoUrl, 
    schedules, 
    id: _bodyId, // Impede que tentem alterar o ID via body
    slug: _slug, // Impede que tentem alterar o Slug nesta rota
    ...updateData 
  } = body

  try {
    // 3. Atualizar dados básicos da Brand + todos os campos de configuração dinâmicos
    await prisma.brand.update({
      where: { id },
      data: { 
        name, 
        logoUrl,
        ...updateData 
      }
    })

    // 4. Sincronizar Horários (Lógica mantida intacta)
    if (schedules && Array.isArray(schedules)) {
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