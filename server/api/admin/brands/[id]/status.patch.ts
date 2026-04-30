import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 1. Verificação de Segurança (Exemplo simples)
  // No seu projeto real, use o context do seu middleware de auth para validar se o user é SUPER_ADMIN
  const brandId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!brandId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID da marca é obrigatório',
    })
  }

  try {
    const updatedBrand = await prisma.brand.update({
      where: { id: brandId },
      data: {
        isActive: body.isActive // Certifique-se que isActive existe no seu schema.prisma
      }
    })

    return {
      success: true,
      message: `Status da loja ${updatedBrand.name} atualizado com sucesso.`,
      brand: updatedBrand
    }
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno ao atualizar status da brand no Prisma.',
    })
  }
})